import { CommandVersion } from '@/shared/interfaces/command.interface';
import { File } from '@/shared/lib/file';
import Color from '@/shared/helpers/color';
import shell from '@/shared/lib/shell';

const pkg: Record<string, unknown> = JSON.parse(File.find('../../../package.json', __dirname).read());
class Version implements CommandVersion {
  #brand = `
  ____                      _                          ____ _     ___
 |  _ \\  _____   _______  _| |_ ___  __ _ _ __ ___    \/ ___| |   |_ _|
 | | | |\/ _ \\ \\ \/ \/ _ \\ \\\/ \/ __\/ _ \\\/ _\` | '_ \` _ \\  | |   | |    | |
 | |_| |  __\/\\ V \/  __\/>  <| ||  __\/ (_| | | | | | | | |___| |___ | |
 |____\/ \\___| \\_\/ \\___\/_\/\\_\\\\__\\___|\\__,_|_| |_| |_|  \\____|_____|___|\n`;

  get brand() {
    return Color.text.yellow(this.#brand);
  }

  get pkgVersion() {
    return Color.text.yellow(`v${pkg.version}`);
  }

  get nodeVersion() {
    return Color.text.green(shell.node().version());
  }

  get platform() {
    return shell.os();
  }

  get imageMagick() {
    return Color.text.green(shell.magick().validate());
  }

  get graphicsMagick() {
    return Color.text.green(shell.gm().validate());
  }

  get optionKey() {
    return 'version';
  }
  get version() {
    return `${this.brand}

Devexteam CLI\t: ${this.pkgVersion}
Node.js\t\t: ${this.nodeVersion}
OS\t\t: ${this.platform}
ImageMagick\t: ${this.imageMagick}
GraphicsMagick\t: ${this.graphicsMagick}
`;
  }

  get description() {
    return 'Show current version number';
  }

  get build(): [string, string, string] {
    return [this.optionKey, this.description, this.version];
  }
}

export const version = new Version().build;
export const epilogue = `https://devexteam.com - Copyright ${new Date().getFullYear()}`;
export const usage = `Devexteam CLI\nRecommend usage: $0 <cmd> [args]`;
export const scriptName = 'dvx';
