import { ColorInterface } from '../shared/interfaces/color.interface';
import Color from './color';

const COLORS: ColorInterface = {
  debug: Color.BG_WHITE,
  log: Color.BG_GREEN,
  warn: Color.BG_YELLOW,
  error: Color.BG_RED,
  group_collapsed: Color.BG_BLUE,
};

enum CONSOLE {
  log = 'log',
  warn = 'warn',
  error = 'error',
}

function template(type: CONSOLE = CONSOLE.log, args: any) {
  const color = COLORS[type];
  const decorator = `${color}%s${Color.BG_RESET}`;
  const title = args.length > 1 ? args.shift() : '[dvx]:';
  console[type](decorator, title, ...args);
}

export function log(...args: any) {
  template(CONSOLE.log, args);
}

export function warn(...args: any) {
  template(CONSOLE.warn, args);
}

export function error(...args: any) {
  template(CONSOLE.error, args);
}
