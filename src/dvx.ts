import yargs from 'yargs/yargs';
import { version, epilogue, usage, scriptName } from './commands/helpers/version';
import HtmlValidate from './commands/html/html-validate';
import ImageMinify from './commands/images/image-minify';
import ImageToWebP from './commands/images/image-to-webp';
import CleanSourcemap from './commands/files/clean-sourcemap';
import ImageResize from './commands/images/image-resize';
import ImageBuilder from './commands/images/build';
import { hideBin } from 'yargs/helpers';
import { Argv } from 'yargs';

export default class DvxCLI {
  private _yargs;
  private commands: Array<(yargs: Argv) => void> = [
    ImageBuilder,
    ImageMinify,
    ImageToWebP,
    ImageResize,
    HtmlValidate,
    CleanSourcemap
  ];

  constructor() {
    this._yargs = yargs(hideBin(process.argv));
    this.config();
    this.installCommands();
    this.validations();
  }

  private config() {
    this._yargs
      // .alias('distribution', 'd')
      // .alias('source', 's')
      // .alias('version', 'v')
      .epilogue(epilogue)
      .help('help', 'Show help', false)
      .locale('en')
      .scriptName(scriptName)
      .usage(usage)
      .wrap(95)
      .version(...version)
      .hide('version')
      .hide('help');
  }

  get yargs() {
    return this._yargs;
  }

  private installCommands() {
    this._yargs;
    // .config({
    // commands: [
    //     ImageMinify.command,
    //     ImageToWebP.command,
    //     ImageResize.command
    // HtmlValidate.command
    // CleanSourcemap.command,
    //   ]
    // })

    for (const command of this.commands) {
      command(this._yargs);
    }
  }

  private async validations(): Promise<void> {
    const argv = await this.yargs.argv;

    console.log(argv, argv.commands, argv._[0]);

    if (!argv._.length || (argv.commands && !(argv.commands as Array<string>).includes(argv._[0] as string))) {
      this.yargs.showHelp();
    }
  }
}
