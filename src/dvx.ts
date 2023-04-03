import yargs from 'yargs/yargs';
import { version, epilogue, usage, scriptName } from './commands/helpers/version';
import { htmlValidate } from './commands/html/html-validate';
import { imageMinify } from './commands/images/image-minify';
import { imageToWebP } from './commands/images/image-to-webp';
import { cleanSourcemap } from './commands/files/clean-sourcemap';
import { imageResize } from './commands/images/image-resize';
import { imageBuilder } from './commands/images/build';
import { hideBin } from 'yargs/helpers';
import { Argv } from 'yargs';
import { Command } from './shared/interfaces/command';

export class DvxCLI {
  #yargs: Argv;
  #commands: Command[] = [
    imageMinify,
    imageToWebP,
    imageResize,
    imageBuilder,
    htmlValidate,
    cleanSourcemap
  ];

  constructor(argv: string[]) {
    this.#yargs = yargs(hideBin(argv));
    this.configureYargs();
    this.bindCommands();
    this.parse();
  }

  private configureYargs() {
    this.#yargs
      .epilogue(epilogue)
      .help('help', 'Show help', false)
      .locale('en')
      .scriptName(scriptName)
      .usage(usage)
      .wrap(95)
      .version('version', 'Show current version number', version)
      .hide('version')
      .hide('help')
      .strictCommands();
  }

  get args() {
    return this.#yargs;
  }

  private bindCommands() {
    for (const command of this.#commands) {
      command.handler(this.#yargs);
    }
  }

  private async parse() {
    try {
      /**
       * NOTE: argv, the letter v is an abbreviation of vector, arg - vector | arg - array
       * Read more on: http://decsai.ugr.es/~jfv/ed1/c/cdrom/cap6/cap64.htm
       */
      const argv = await this.#yargs.parse(); // args vector - without flags
      const argsCount = argv._.length;

      // const commands: Array<string> = argv.commands && Array.isArray(argv.commands) ? argv.commands : [];
      // || commands.includes(String(argv._[0]))

      if (!argsCount) this.args.showHelp();
    } catch (err) {
      if (err instanceof Error) console.error('[error]:', `${err.message}\n ${this.args.getHelp()}`);

      console.error('[error]:', `unknown error\n ${this.args.getHelp()}`);
    }
  }
}
