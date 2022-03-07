import { ConsoleColorInterface } from '../interfaces/console-color.interface';
import Color from './color';

export const CONSOLE_COLOR: ConsoleColorInterface = {
  debug: Color.BG_WHITE,
  log: `${Color.BG_GREEN}`,
  success: Color.BG_GREEN,
  warn: `${Color.BG_YELLOW}${Color.FG_BLACK}`,
  error: `${Color.BG_RED}${Color.FG_BLACK}`,
  group_collapsed: Color.BG_BLUE,
  info: `${Color.BG_BLUE}${Color.FG_BLACK}`
};

const CONSOLE_EMOJI: { [key: string]: string } = {
  info: ' ℹ ', //`${Color.FG_BLUE} ℹ ${Color.RESET}`, \u2139
  log: ' ✔ ', //`${Color.FG_GREEN} ✔ ${Color.RESET}`, \u2714
  warn: ' ⚠ ', //`${Color.FG_YELLOW} ⚠ ${Color.RESET}`, \u26A0
  error: ' ☠ ' //`${Color.FG_RED} ☠ ${Color.RESET}` \u2620
};

type CONSOLE_TYPE = 'log' | 'info' | 'warn' | 'error';

function template(type: CONSOLE_TYPE = 'log', args: any) {
  const color = CONSOLE_COLOR[type];
  const decorator = `${color}%s${Color.RESET}`;
  const title = args.length > 1 ? args.shift() : `${CONSOLE_EMOJI[type]}`;

  global.console[type](decorator, title, ...args, CONSOLE_EMOJI[type]);
}

function logger(...args: any) {
  template('info', args);
}

function successLogger(...args: any) {
  template('log', args);
}

function warning(...args: any) {
  template('warn', args);
}

function danger(...args: any) {
  template('error', args);
}

const Log = new console.Console({
  stdout: process.stdout,
  stderr: process.stderr
});

Log.constructor.prototype.logger = logger;
Log.constructor.prototype.success = successLogger;
Log.constructor.prototype.warning = warning;
Log.constructor.prototype.danger = danger;

export const log = Log.logger;
export const warn = Log.warning;
export const error = Log.danger;
export const success = Log.success;

export default Log;

declare module 'node:console' {
  export interface Console {
    logger: (...args: any) => void;
    warning: (...args: any) => void;
    danger: (...args: any) => void;
    success: (...args: any) => void;
  }
}
