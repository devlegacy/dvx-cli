import Color from '../../helpers/color';
import shell from '../../lib/shell';
const pkg = require('../../../package.json');

export class Version {
  private _brand = `
  ____                      _                          ____ _     ___
 |  _ \\  _____   _______  _| |_ ___  __ _ _ __ ___    \/ ___| |   |_ _|
 | | | |\/ _ \\ \\ \/ \/ _ \\ \\\/ \/ __\/ _ \\\/ _\` | '_ \` _ \\  | |   | |    | |
 | |_| |  __\/\\ V \/  __\/>  <| ||  __\/ (_| | | | | | | | |___| |___ | |
 |____\/ \\___| \\_\/ \\___\/_\/\\_\\\\__\\___|\\__,_|_| |_| |_|  \\____|_____|___|\n`;

  get brand() {
    return Color.yellow(this._brand);
  }

  get version() {
    return Color.yellow(`v${pkg.version}`);
  }

  get nodeVersion() {
    return Color.green(shell.node().version());
  }

  get platform() {
    return shell.os();
  }

  get imageMagick() {
    return Color.green(shell.magick().validate());
  }

  get graphicsMagick() {
    return Color.green(shell.gm().validate());
  }

  get optionKey() {
    return 'version';
  }

  get description() {
    return `${this.brand}
Devexteam CLI\t: ${this.version}
Node.js\t\t: ${this.nodeVersion}
OS\t\t: ${this.platform}
ImageMagick\t: ${this.imageMagick}
GraphicsMagick\t: ${this.graphicsMagick}
`;
  }
}
