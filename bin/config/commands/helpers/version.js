const FG_YELLOW = '\x1b[33m';
const FG_GREEN = '\x1b[32m';
const BG_RESET = '\x1b[0m';
const BRIGHT = '\x1b[1m';
const os = require('os');
const { spawnSync } = require('child_process');

const getCLIDescription = () => {
  return `
${FG_YELLOW}${BRIGHT}

 ____                      _                          ____ _     ___
|  _ \\  _____   _______  _| |_ ___  __ _ _ __ ___    \/ ___| |   |_ _|
| | | |\/ _ \\ \\ \/ \/ _ \\ \\\/ \/ __\/ _ \\\/ _\` | '_ \` _ \\  | |   | |    | |
| |_| |  __\/\\ V \/  __\/>  <| ||  __\/ (_| | | | | | | | |___| |___ | |
|____\/ \\___| \\_\/ \\___\/_\/\\_\\\\__\\___|\\__,_|_| |_| |_|  \\____|_____|___|
${BG_RESET}
`;
};

const getCLIVersion = () => {
  const version = require('../../../../package.json').version;
  return `${FG_YELLOW}${BRIGHT}v${version}${BG_RESET}`;
};

const getImageMagickInfo = () => {
  const imageMagick = spawnSync('magick', ['-version']);
  return !imageMagick.error
    ? imageMagick.stdout
        .toString()
        .split('\n')
        .filter((data) => data.length > 0)
        .shift()
    : 'Download on: https://www.imagemagick.org/script/download.php';
};

const getGraphicsMagickInfo = () => {
  const graphicsMagick = spawnSync('gm', ['-version']);
  return !graphicsMagick.error
    ? graphicsMagick.stdout
        .toString()
        .split('\n')
        .filter((data) => data.length > 0)
        .shift()
    : 'Download on: http://www.graphicsmagick.org/download.html';
};

const getNodeVersion = () => {
  return `${FG_GREEN}${BRIGHT}${process.version}${BG_RESET}`;
};

const getPlatformInfo = () => {
  return `${process.platform} ${os.arch()}`;
};

module.exports = {
  option: 'version',
  description: `
${getCLIDescription()}
Devexteam CLI   : ${getCLIVersion()}
Node            : ${getNodeVersion()}
OS              : ${getPlatformInfo()}
ImageMagick     : ${getImageMagickInfo()}
GraphicsMagick  : ${getGraphicsMagickInfo()}
`,
};
