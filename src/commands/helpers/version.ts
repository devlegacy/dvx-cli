import Color from '@/shared/helpers/color';
import Shell from '@/shared/lib/shell';
import pkg from '../../../package.json';

const brand = `
  ____                      _                          ____ _     ___
 |  _ \\  _____   _______  _| |_ ___  __ _ _ __ ___    \/ ___| |   |_ _|
 | | | |\/ _ \\ \\ \/ \/ _ \\ \\\/ \/ __\/ _ \\\/ _\` | '_ \` _ \\  | |   | |    | |
 | |_| |  __\/\\ V \/  __\/>  <| ||  __\/ (_| | | | | | | | |___| |___ | |
 |____\/ \\___| \\_\/ \\___\/_\/\\_\\\\__\\___|\\__,_|_| |_| |_|  \\____|_____|___|\n`;

const styledBrand = Color.text.yellow(brand);
const styledVersion = Color.text.yellow(`v${pkg.version || ''}`);
const styledNode = Color.text.green(`${Shell.node.version} ⬢`);
const styledImageMagick = Color.text.green(Shell.imageMagick);
const styledGraphicsMagick = Color.text.green(Shell.graphicMagick);

export const version = `${styledBrand}
Devexteam CLI\t: ${styledVersion}
Node.js\t\t: ${styledNode}
OS\t\t: ${Shell.os}
ImageMagick\t: ${styledImageMagick}
GraphicsMagick\t: ${styledGraphicsMagick}
`;

export const epilogue = `https://devexteam.com - © Copyright ${new Date().getFullYear()}`;
export const usage = `Devexteam CLI\nRecommend usage: $0 <cmd> [args]`;
export const scriptName = 'dvx';
