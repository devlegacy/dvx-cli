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
import { Command } from './shared/interfaces/command.interface';

export default class DvxCLI {
  #yargs: Argv;
  #commands: Array<Command> = [imageMinify, imageToWebP, imageResize, imageBuilder, htmlValidate, cleanSourcemap];

  constructor() {
    this.#yargs = yargs(hideBin(process.argv));
    this.setConfig();
    this.installAllCommands();
    this.setValidation();
  }

  private setConfig() {
    this.#yargs
      .epilogue(epilogue)
      .help('help', 'Show help', false)
      .locale('en')
      .scriptName(scriptName)
      .usage(usage)
      .wrap(95)
      .version(...version)
      .hide('version')
      .hide('help')
      .strictCommands();
  }

  get args() {
    return this.#yargs;
  }

  private installAllCommands() {
    this.#yargs;
    for (const command of this.#commands) {
      // Attach to yargs
      command.handler(this.#yargs);
    }
  }

  private async setValidation(): Promise<void> {
    try {
      // argv from vector arg - vector or arg - array
      // http://decsai.ugr.es/~jfv/ed1/c/cdrom/cap6/cap64.htm
      const argv = await this.args.parse(); // args vector - without flags
      const argsCount = argv._.length;
      // const commands: Array<string> = argv.commands && Array.isArray(argv.commands) ? argv.commands : [];
      // || commands.includes(String(argv._[0]))
      if (!argsCount) {
        this.args.showHelp();
      }
    } catch (err) {
      if (err instanceof Error) {
        console.warn('[error]:', `${err.message}\n ${await this.args.getHelp()}`);
      }
    }
  }
}
