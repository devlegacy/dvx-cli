import yargs, { Argv } from 'yargs';
import { Version } from './commands/helpers/version';
import HtmlValidate from './commands/html/validate';
const version = new Version();
const minify = require('./commands/images/minify');
const toWebP = require('./commands/images/towebp');
const resize = require('./commands/images/resize');
const build = require('./commands/images/build');
const validate = require('./commands/html/validate');
const htmlValidate = new HtmlValidate();

const epilogue = `https://devexteam.com - Copyright ${new Date().getFullYear()}`;
export class DvxCLI {
  private _yargs: Argv = yargs;

  constructor() {
    this.installCommands();
    this.configure();
  }

  private installCommands() {
    this._yargs.version(version.optionKey, version.description);
    this._yargs.command(
      build.command,
      build.description,
      build.options,
      build.handler
    );
    this._yargs.command(
      minify.command,
      minify.description,
      minify.options,
      minify.handler
    );
    this._yargs.command(
      toWebP.command,
      toWebP.description,
      toWebP.options,
      toWebP.handler
    );
    this._yargs.command(
      resize.command,
      resize.description,
      resize.options,
      resize.handler
    );
    this._yargs.command(
      htmlValidate.command,
      htmlValidate.description,
      htmlValidate.options,
      htmlValidate.handler
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
