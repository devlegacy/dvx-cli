import { getFunctionName } from './get-function-name';

const FG_BLACK: string = '\x1b[30m';
const BRIGHT: string = '\x1b[1m';
const BG_RESET: string = '\x1b[0m';
const BG_WHITE: string = `\x1b[47m${FG_BLACK}${BRIGHT}`;
const BG_GREEN: string = `\x1b[42m${FG_BLACK}${BRIGHT}`;
const BG_YELLOW: string = `\x1b[43m${FG_BLACK}${BRIGHT}`;
const BG_RED: string = `\x1b[41m${BRIGHT}`;
const BG_BLUE: string = '\x1b[44m';

interface Color {
  [key: string]: string;
}

// Note: alternative type definition COLOR: { [key: string]: string }
const COLOR: Color = {
  DEBUG: BG_WHITE,
  LOG: BG_GREEN,
  WARN: BG_YELLOW,
  ERROR: BG_RED,
  GROUP_COLLAPSED: BG_BLUE,
};

function consoleTemplate(consoleType: string = 'LOG', args: any) {
  const title: string = args.length > 1 ? args.shift() : '[dvx]:';
  const decorator: string = `${COLOR[consoleType]}%s${BG_RESET}`;
  return console.log(decorator, title, ...args);
}

/**
 * console.log variant
 * @param args - Arguments
 */
export function log(...args: any) {
  return consoleTemplate(
    getFunctionName().replace('Object.', '').toUpperCase(),
    args
  );
}

/**
 * console.warn variant
 * @param args - Arguments
 */
export function warn(...args: any) {
  return consoleTemplate('WARN', args);
}

/**
 * console.error variant
 * @param args - Arguments
 */
export function error(...args: any) {
  return consoleTemplate('ERROR', args);
}
