export default abstract class Color {
  public static readonly BRIGHT = '\x1b[1m';
  public static readonly FG_BLACK = '\x1b[30m';
  public static readonly FG_GREEN = '\x1b[32m';
  public static readonly FG_YELLOW = '\x1b[33m';
  public static readonly BG_RESET = '\x1b[0m';
  public static readonly BG_RED = `\x1b[41m${Color.BRIGHT}`;
  public static readonly BG_GREEN = `\x1b[42m${Color.FG_BLACK}${Color.BRIGHT}`;
  public static readonly BG_YELLOW = `\x1b[43m${Color.FG_BLACK}${Color.BRIGHT}`;
  public static readonly BG_BLUE = '\x1b[44m';
  public static readonly BG_WHITE = `\x1b[47m${Color.FG_BLACK}${Color.BRIGHT}`;

  public static yellow(text: string) {
    return `${Color.FG_YELLOW}${Color.BRIGHT}${text}${Color.BG_RESET}`;
  }

  public static green(text: string) {
    return `${Color.FG_GREEN}${Color.BRIGHT}${text}${Color.BG_RESET}`;
  }
}
