const Text = {
  yellow(text: string, bright = true) {
    return `${Color.RESET}${Color.FG_YELLOW}${Color.bright(bright)}${text}${Color.RESET}`
  },

  green(text: string, bright = true) {
    return `${Color.RESET}${Color.FG_GREEN}${Color.bright(bright)}${text}${Color.RESET}`
  },

  black(text: string, bright = true) {
    return `${Color.RESET}${Color.FG_BLACK}${Color.bright(bright)}${text}${Color.RESET}`
  },
}

const Background = {
  yellow(text: string, bright = true) {
    return `${Color.RESET}${Color.BG_YELLOW}${Color.bright(bright)}${text.replace(Color.RESET, '')}${Color.RESET}`
  },

  green(text: string, bright = true) {
    return `${Color.RESET}${Color.BG_GREEN}${Color.bright(bright)}${text.replace(Color.RESET, '')}${Color.RESET}`
  },
}

const Color = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  FG_BLACK: '\x1b[30m',
  FG_RED: '\x1b[31m',
  FG_GREEN: '\x1b[32m',
  FG_BLUE: '\x1b[34m',
  FG_YELLOW: '\x1b[33m',
  BG_RED: `\x1b[41m`,
  BG_GREEN: `\x1b[42m`,
  BG_YELLOW: `\x1b[43m`,
  BG_BLUE: '\x1b[44m',
  BG_WHITE: `\x1b[47m`,

  text: Text,
  background: Background,

  bright(bright = true) {
    return `${bright ? Color.BRIGHT : ''}`
  },
} as const

export default Color

// console.log(Color.text.yellow('Hola'), 'mundo', Color.text.green('colors'));
// console.log(Color.text.yellow('Hola', false), 'mundo', Color.text.green('colors', false));

// console.log(Color.bg.yellow('Hola'), 'mundo', Color.bg.green('colors'));
// console.log(Color.bg.yellow('Hola'), 'mundo', Color.bg.green(Color.text.black('colors', false), false));
// console.log(Color.bg.yellow('Hola'), 'mundo', Color.bg.green(Color.text.black('colors')));
// console.log(Color.bg.yellow('Hola', false), 'mundo', Color.bg.green('colors', false));
