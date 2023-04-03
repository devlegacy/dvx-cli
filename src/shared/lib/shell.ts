import { spawnSync, SpawnSyncReturns } from 'child_process';
import { platform, version } from 'process';
import { arch } from 'os';

const validateCommand = (command: SpawnSyncReturns<Buffer>, errorMessage: string) => {
  return !command.error
    ? command.stdout
        .toString()
        .split('\n')
        .filter((data) => data.length > 0)
        .shift() || ''
    : errorMessage;
};

abstract class Node {
  static get version() {
    return version;
  }
}

const messages = {
  download: {
    graphicMagick: '🔽 Download on: 🔗 http://www.graphicsmagick.org/download.html',
    imageMagick: '🔽 Download on: 🔗 https://www.imagemagick.org/script/download.php'
  }
};

abstract class Shell {
  static get imageMagick() {
    const magick = spawnSync('magick', ['-version']);
    const response = validateCommand(magick, messages.download.imageMagick);
    return response;
  }

  static get graphicMagick() {
    const gm = spawnSync('gm', ['-version']);
    const response = validateCommand(gm, messages.download.graphicMagick);
    return response;
  }

  static get node() {
    return Node;
  }

  static get os() {
    return `${platform} ${arch()}`;
  }
}

export default Shell;
