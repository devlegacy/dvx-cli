import { Console } from 'node:console'

import Color from './color.js'

export const CONSOLE_COLOR = {
  debug: Color.BG_WHITE,
  log: `${Color.BG_GREEN}`,
  success: Color.BG_GREEN,
  warn: `${Color.BG_YELLOW}${Color.FG_BLACK}`,
  error: `${Color.BG_RED}${Color.FG_BLACK}`,
  groupCollapsed: Color.BG_BLUE,
  info: `${Color.BG_BLUE}${Color.FG_BLACK}`,
}

const CONSOLE_EMOJI: {
  [key: string]: string
} = {
  info: ' ℹ ', //`${Color.FG_BLUE} ℹ ${Color.RESET}`, \u2139
  log: ' ✔ ', //`${Color.FG_GREEN} ✔ ${Color.RESET}`, \u2714
  warn: ' ⚠ ', //`${Color.FG_YELLOW} ⚠ ${Color.RESET}`, \u26A0
  error: ' ☠ ', //`${Color.FG_RED} ☠ ${Color.RESET}` \u2620
}

type ConsoleType = 'log' | 'info' | 'warn' | 'error'

function template(type: ConsoleType = 'log', args: unknown[]) {
  const color = CONSOLE_COLOR[type]
  const decorator = `${color}%s${Color.RESET}`
  const title = args.length > 1 ? args.shift() : `${CONSOLE_EMOJI[type]}`

  global.console[type](decorator, title, ...args, CONSOLE_EMOJI[type])
}

function logger(...args: unknown[]) {
  template('info', args)
}

function successLogger(...args: unknown[]) {
  template('log', args)
}

function warning(...args: unknown[]) {
  template('warn', args)
}

function danger(...args: unknown[]) {
  template('error', args)
}

const Log = new Console({
  stdout: process.stdout,
  stderr: process.stderr,
})

Log.constructor.prototype.logger = logger
Log.constructor.prototype.success = successLogger
Log.constructor.prototype.warning = warning
Log.constructor.prototype.danger = danger

export const log = Log.logger
export const warn = Log.warning
export const error = Log.danger
export const { success } = Log

export default Log

declare module 'node:console' {
  export interface Console {
    logger: (...args: unknown[]) => void
    warning: (...args: unknown[]) => void
    danger: (...args: unknown[]) => void
    success: (...args: unknown[]) => void
  }
}
