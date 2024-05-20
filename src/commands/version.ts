import { styleText } from 'node:util'
import process from 'node:process'
import { arch } from 'node:os'

import Shell from '#@/src/shared/lib/shell.js'
import pkg from '#@/package.json' with { type: 'json' }

const brand = `
  ____                      _                          ____ _     ___
 |  _ \\  _____   _______  _| |_ ___  __ _ _ __ ___    \/ ___| |   |_ _|
 | | | |\/ _ \\ \\ \/ \/ _ \\ \\\/ \/ __\/ _ \\\/ _\` | '_ \` _ \\  | |   | |    | |
 | |_| |  __\/\\ V \/  __\/>  <| ||  __\/ (_| | | | | | | | |___| |___ | |
 |____\/ \\___| \\_\/ \\___\/_\/\\_\\\\__\\___|\\__,_|_| |_| |_|  \\____|_____|___|\n`

export const version = `${styleText('yellowBright', brand)}
Devexteam CLI\t: ${styleText('yellowBright', `v${pkg.version || ''}`)}
Node.js\t\t: ${styleText('greenBright', `${process.version} ⬢`)}
OS\t\t: ${process.platform} ${arch()}
ImageMagick\t: ${styleText('greenBright', Shell.imageMagick)}
GraphicsMagick\t: ${styleText('greenBright', Shell.graphicMagick)}
`

export const epilogue = `https://devexteam.com - © Copyright ${new Date().getFullYear()}`
export const usage = `Devexteam CLI\nRecommend usage: $0 <cmd> [args]`
export const scriptName = 'dvx'
