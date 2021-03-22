import yargs, { Argv, Arguments, Options, InferredOptionTypes } from 'yargs';
import { Version } from './commands/helpers/version';
import HtmlValidate from './commands/html/html-validate';
import ImageMinify from './commands/images/image-minify';
import ImageToWebP from './commands/images/image-to-web-p';
import CleanSourcemap from './commands/files/clean-sourcemap';
import ImageResize from './commands/images/image-resize';
const version = new Version();

const epilogue = `https://devexteam.com - Copyright ${new Date().getFullYear()}`;
export class DvxCLI {
  private _yargs = yargs;

  constructor() {
    this.installCommands();
    this.configure();
  }

  private installCommands() {
    this._yargs
      .version(version.optionKey, version.description)
      // this._yargs.command(
      //   build.command,
      //   build.description,
      //   build.builder,
      //   build.handler
      // );
      .command(
        ImageMinify.command,
        ImageMinify.description,
        ImageMinify.builder,
        ImageMinify.handler
      )
      .command(
        ImageToWebP.command,
        ImageToWebP.description,
        ImageToWebP.builder,
        ImageToWebP.handler
      )
      .command(
        ImageResize.command,
        ImageResize.description,
        ImageResize.builder,
        ImageResize.handler
      )
      .command(
        HtmlValidate.command,
        HtmlValidate.description,
        HtmlValidate.builder,
        HtmlValidate.handler
      )
      .command(
        CleanSourcemap.command,
        CleanSourcemap.description,
        CleanSourcemap.builder,
        CleanSourcemap.handler
      );
  }

  private configure() {
    this._yargs
      .scriptName('dvx')
      .usage('Devexteam CLI')
      .usage('$0 <cmd> [args]')
      .epilogue(epilogue)
      .wrap(95)
      .locale('en')
      .alias('distribution', 'd')
      .alias('source', 's')
      .help()
      .hide('version')
      .hide('help')
      // .alias('help', 'h')
      .alias('version', 'v');
  }

  get yargs() {
    return this._yargs;
  }
}
