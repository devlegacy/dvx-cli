import { spawnSync, SpawnSyncReturns } from 'child_process';
import { platform, version } from 'process';
import { arch } from 'os';

const validate = (command: SpawnSyncReturns<string>, errorMessage: string) => {
  return !command.error
    ? command.stdout
        .toString()
        .split('\n')
        .filter((data) => data.length > 0)
        .shift() || ''
    : errorMessage;
};

class Magick {
  private downloadInfo =
    'Download on https://www.imagemagick.org/script/download.php';
  validate(): string {
    const magick = spawnSync('magick', ['-version']);
    return validate(magick, this.downloadInfo);
  }
}

class GraphicMagick {
  private downloadInfo =
    'Download on http://www.graphicsmagick.org/download.html';
  validate(): string {
    const gm = spawnSync('gm', ['-version']);
    return validate(gm, this.downloadInfo);
  }
}

class Node {
  version() {
    return version;
  }
}

class Shell {
  magick() {
    return new Magick();
  }

  gm() {
    return new GraphicMagick();
  }

  node() {
    return new Node();
  }

  os() {
    return `${platform} ${arch()}`;
  }
}

const shell = new Shell();
export default shell;
