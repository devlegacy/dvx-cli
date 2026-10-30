import { Writable } from 'node:stream'
import { format } from 'node:util'
import pino from 'pino'

// Human-readable single line by default; DVX_LOG_FORMAT=json emits one JSON object per line
// (for pipes, CI or log shippers). DVX_LOG_LEVEL sets the threshold (default: info).
// An unknown level falls back to info, because pino throws on it at import time.
const json = process.env.DVX_LOG_FORMAT === 'json'
const requested = process.env.DVX_LOG_LEVEL
const level: pino.LevelWithSilent =
  requested && (requested === 'silent' || Object.hasOwn(pino.levels.values, requested))
    ? (requested as pino.LevelWithSilent)
    : 'info'

const options: pino.LoggerOptions = {
  level,
  base: null,
}

// Plain messages for info; only warnings and errors carry a label, so routine output stays quiet
// Worker threads have no TTY of their own, so the main thread passes its color decision down through the
// environment (workers inherit it); NO_COLOR turns it off
if (process.stdout.isTTY && !process.env.NO_COLOR) process.env.FORCE_COLOR ??= '1'
// FORCE_COLOR=0 means off (any other non-empty value means on)
const forced = process.env.FORCE_COLOR
const color = !process.env.NO_COLOR && forced !== '0' && Boolean(process.stdout.isTTY || forced)
const LABELS: Record<number, string> = {
  40: 'WARN',
  50: 'ERROR',
}
const PAINT: Record<number, string> = {
  40: '\x1b[33m',
  50: '\x1b[31m',
}
// Three segments, three colors: the [command] tag, the file path, and the size change (green when it shrinks)
const paint = (code: string, text: string) => (color ? `\x1b[${code}m${text}\x1b[0m` : text)
const highlight = (msg: string) =>
  msg
    .replace(/^\[[^\]]+\]:/, (tag) => paint('36', tag))
    .replace(/(\S+\.(?:png|jpe?g|gif|svg|webp))(?=\s|$)/i, (path) => paint('1', path))
    .replace(/\(([+\u2212-]\d+%)\)/, (_, change: string) => paint(change.startsWith('+') ? '31' : '32', `(${change})`))

const textStream = new Writable({
  write(chunk, _encoding, done) {
    const entry = JSON.parse(chunk.toString()) as {
      level: number
      msg: string
    }
    const label = LABELS[entry.level]
    const prefix = label ? `${color ? PAINT[entry.level] : ''}${label}${color ? '\x1b[0m' : ''} ` : ''
    // Warnings and errors go to stderr so stdout stays clean for pipes
    const target = entry.level >= 40 ? process.stderr : process.stdout
    target.write(`${prefix}${highlight(entry.msg)}\n`)
    done()
  },
})

export const logger = json ? pino.pino(options) : pino.pino(options, textStream)

// One line per event: errors are logged by their message (a stack per file would bury the summary),
// absolute paths under the working directory are shown relative to it, and line breaks become separators
const text = (args: unknown[]) =>
  format(...args.map((arg) => (arg instanceof Error ? arg.message : arg)))
    .split(`${process.cwd()}/`)
    .join('')
    .replace(/\s*\n\s*/g, ' · ')

export const log = (...args: unknown[]) => logger.info(text(args))
export const warn = (...args: unknown[]) => logger.warn(text(args))
export const error = (...args: unknown[]) => logger.error(text(args))
