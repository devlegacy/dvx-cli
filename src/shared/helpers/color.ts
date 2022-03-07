abstract class Text {
  public static yellow(text: string, bright = true) {
    return `${Color.RESET}${Color.FG_YELLOW}${Color.bright(bright)}${text}${Color.RESET}`;
  }

  public static green(text: string, bright = true) {
    return `${Color.RESET}${Color.FG_GREEN}${Color.bright(bright)}${text}${Color.RESET}`;
  }

  public static black(text: string, bright = true) {
    return `${Color.RESET}${Color.FG_BLACK}${Color.bright(bright)}${text}${Color.RESET}`;
  }
}

abstract class Background {
  public static yellow(text: string, bright = true) {
    return `${Color.RESET}${Color.BG_YELLOW}${Color.bright(bright)}${text.replace(Color.RESET, '')}${Color.RESET}`;
  }

  public static green(text: string, bright = true) {
    return `${Color.RESET}${Color.BG_GREEN}${Color.bright(bright)}${text.replace(Color.RESET, '')}${Color.RESET}`;
  }
}

export default class Color {
  public static readonly RESET = '\x1b[0m';
  public static readonly BRIGHT = '\x1b[1m';
  public static readonly FG_BLACK = '\x1b[30m';
  public static readonly FG_RED = '\x1b[31m';
  public static readonly FG_GREEN = '\x1b[32m';
  public static readonly FG_BLUE = '\x1b[34m';
  public static readonly FG_YELLOW = '\x1b[33m';
  public static readonly BG_RED = `\x1b[41m`;
  public static readonly BG_GREEN = `\x1b[42m`;
  public static readonly BG_YELLOW = `\x1b[43m`;
  public static readonly BG_BLUE = '\x1b[44m';
  public static readonly BG_WHITE = `\x1b[47m`;

  public static readonly text = Text;
  public static readonly bg = Background;

  public static bright(bright = true) {
    return `${bright ? Color.BRIGHT : ''}`;
  }
}

// console.log(Color.text.yellow('Hola'), 'mundo', Color.text.green('colors'));
// console.log(Color.text.yellow('Hola', false), 'mundo', Color.text.green('colors', false));

// console.log(Color.bg.yellow('Hola'), 'mundo', Color.bg.green('colors'));
// console.log(Color.bg.yellow('Hola'), 'mundo', Color.bg.green(Color.text.black('colors', false), false));
// console.log(Color.bg.yellow('Hola'), 'mundo', Color.bg.green(Color.text.black('colors')));
// console.log(Color.bg.yellow('Hola', false), 'mundo', Color.bg.green('colors', false));
