import { ColorInterface } from '../shared/interfaces/color.interface';

const FG_BLACK = '\x1b[30m';
const BRIGHT = '\x1b[1m';
const BG_RESET = '\x1b[0m';
const BG_WHITE = `\x1b[47m${FG_BLACK}${BRIGHT}`;
const BG_GREEN = `\x1b[42m${FG_BLACK}${BRIGHT}`;
const BG_YELLOW = `\x1b[43m${FG_BLACK}${BRIGHT}`;
const BG_RED = `\x1b[41m${BRIGHT}`;
const BG_BLUE = '\x1b[44m';

const COLORS: ColorInterface = {
  debug: BG_WHITE,
  log: BG_GREEN,
  warn: BG_YELLOW,
  error: BG_RED,
  group_collapsed: BG_BLUE,
};

enum CONSOLE {
  log = 'log',
  warn = 'warn',
  error = 'error',
}

function template(type: CONSOLE = CONSOLE.log, args: any) {
  const color = COLORS[type];
  const decorator = `${color}%s${BG_RESET}`;
  const title = args.length > 1 ? args.shift() : '[dvx]:';
  console[type](decorator, title, ...args);
}

export function log(...args: any) {
  // const type = getFunctionName().replace('Object.', '');
  template(CONSOLE.log, args);
}

export function warn(...args: any) {
  template(CONSOLE.warn, args);
}

export function error(...args: any) {
  template(CONSOLE.error, args);
}
