const util = require('util');

const FG_BLACK = '\x1b[30m';
const BRIGHT = '\x1b[1m';
const BG_RESET = '\x1b[0m';
const BG_WHITE = `\x1b[47m${FG_BLACK}${BRIGHT}`;
const BG_GREEN = `\x1b[42m${FG_BLACK}${BRIGHT}`;
const BG_YELLOW = `\x1b[43m${FG_BLACK}${BRIGHT}`;
const BG_RED = `\x1b[41m${BRIGHT}`;
const BG_BLUE = '\x1b[44m';

const COLOR = {
  debug: BG_WHITE,
  log: BG_GREEN,
  warn: BG_YELLOW,
  error: BG_RED,
  groupCollapsed: BG_BLUE,
};

const findFirstOccurrence = (string, searchElements, fromIndex = 0) => {
  let min = string.length;
  for (let i = 0; i < searchElements.length; i += 1) {
    const occ = string.indexOf(searchElements[i], fromIndex);
    if (occ !== -1 && occ < min) {
      min = occ;
    }
  }
  return min === string.length ? -1 : min;
};

const functionName = (func = null) => {
  if (func) {
    if (func.name) {
      return func.name;
    }
    const result = /^function\s+([\w\$]+)\s*\(/.exec(func.toString());
    return result ? result[1] : '';
  }
  const obj = {};
  Error.captureStackTrace(obj, functionName);
  const { stack } = obj;
  const firstCharacter = stack.indexOf('at ') + 3;
  const lastCharacter = findFirstOccurrence(
    stack,
    [' ', ':', '\n'],
    firstCharacter
  );
  return stack.slice(firstCharacter, lastCharacter);
};

const consoleTemplate = (functionName, args) => {
  let title = '[Dvx]:';
  if (args.length > 1) {
    title = args.shift();
  }
  console.log(`${COLOR[functionName]}%s${BG_RESET}`, title, ...args);
};

/**
 * Format Console.log
 * Custom format to console.log data
 * @param {*} data
 */
function flog(data) {
  console.log(util.inspect(data, { showHidden: false, depth: null }));
}

/**
 * Console.log variant
 * @param  {...any} args
 */
function log(...args) {
  consoleTemplate(functionName(), args);
}

/**
 * Console.warn variant
 * @param  {...any} args
 */
function warn(...args) {
  consoleTemplate(functionName(), args);
}

/**
 * Console.error variant
 * @param  {...any} args
 */
function error(...args) {
  consoleTemplate(functionName(), args);
}

module.exports.consoles = {
  log,
  warn,
  error,
  flog,
};
