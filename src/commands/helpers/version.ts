import { spawnSync } from 'child_process';
import { arch } from 'os';
import { platform, version } from 'process';
import { File } from '../../lib/file';

const FG_YELLOW = '\x1b[33m';
const FG_GREEN = '\x1b[32m';
const BG_RESET = '\x1b[0m';
const BRIGHT = '\x1b[1m';

export class Version {
  get cliDescription() {
    return `
${FG_YELLOW}${BRIGHT}
 ____                      _                          ____ _     ___
|  _ \\  _____   _______  _| |_ ___  __ _ _ __ ___    \/ ___| |   |_ _|
| | | |\/ _ \\ \\ \/ \/ _ \\ \\\/ \/ __\/ _ \\\/ _\` | '_ \` _ \\  | |   | |    | |
| |_| |  __\/\\ V \/  __\/>  <| ||  __\/ (_| | | | | | | | |___| |___ | |
|____\/ \\___| \\_\/ \\___\/_\/\\_\\\\__\\___|\\__,_|_| |_| |_|  \\____|_____|___|
${BG_RESET}
    `;
  }
  get cliVersion() {
    const version = require(File.find('../../../package.json', __dirname).info
      .absolutePath).version;
    return `${FG_YELLOW}${BRIGHT}v${version}${BG_RESET}`;
  }

  get currentLocalNodeVersion() {
    return `${FG_GREEN}${BRIGHT}${version}${BG_RESET}`;
  }

  get currentLocalPlatformInfo() {
    return `${platform} ${arch()}`;
  }

  get currentLocalImageMagickInfo() {
    const imageMagick = spawnSync('magick', ['-version']);
    return !imageMagick.error
      ? imageMagick.stdout
          .toString()
          .split('\n')
          .filter((data: any) => data.length > 0)
          .shift()
      : 'Download on https://www.imagemagick.org/script/download.php';
  }
  get currentLocalGraphicsMagickInfo() {
    const graphicsMagick = spawnSync('gm', ['-version']);
    return !graphicsMagick.error
      ? graphicsMagick.stdout
          .toString()
          .split('\n')
          .filter((data: any) => data.length > 0)
          .shift()
      : 'Download on http://www.graphicsmagick.org/download.html';
  }

  get optionKey() {
    return 'version';
  }

  get description() {
    return `
${this.cliDescription}
Devexteam CLI   : ${this.cliVersion}
Node            : ${this.currentLocalNodeVersion}
OS              : ${this.currentLocalPlatformInfo}
ImageMagick     : ${this.currentLocalImageMagickInfo}
GraphicsMagick  : ${this.currentLocalGraphicsMagickInfo}
`;
  }
}
