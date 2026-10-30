import { Writable } from 'node:stream'
import { format } from 'node:util'
import pino from 'pino'

// Human-readable single line by default; DVX_LOG_FORMAT=json emits one JSON object per line
// (for pipes, CI or log shippers). DVX_LOG_LEVEL sets the threshold (default: info).
const json = process.env.DVX_LOG_FORMAT === 'json'
const level = process.env.DVX_LOG_LEVEL ?? 'info'

const options: pino.LoggerOptions = {
  level,
  base: null,
}

// Plain messages for info; only warnings and errors carry a label, so routine output stays quiet
// Worker threads have no TTY of their own, so the main thread passes its color decision down through the
// environment (workers inherit it); NO_COLOR turns it off
if (process.stdout.isTTY && !process.env.NO_COLOR) process.env.FORCE_COLOR ??= '1'
const color = !process.env.NO_COLOR && Boolean(process.stdout.isTTY || process.env.FORCE_COLOR)
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
    process.stdout.write(`${prefix}${highlight(entry.msg)}\n`)
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
export const success = log
export const warn = (...args: unknown[]) => logger.warn(text(args))
export const error = (...args: unknown[]) => logger.error(text(args))
