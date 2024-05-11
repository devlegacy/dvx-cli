import type { Argv } from 'yargs'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import { version, epilogue, usage, scriptName } from '#@/src/commands/version.js'
import { htmlValidate } from '#@/src/commands/html/html-validate.command.js'
import { imageMinify } from '#@/src/commands/images/image-minify.command.js'
import { imageToWebP } from '#@/src/commands/images/image-to-webp.command.js'
import { imageResize } from '#@/src/commands/images/image-resize.command.js'
import { imageBuilder } from '#@/src/commands/images/image-optimize.command.js'
import { cleanSourcemap } from '#@/src/commands/files/clean-sourcemap.command.js'
import type { YargsCommand } from './shared/yargs-command.js'

export class DvxCLI {
  #yargs: Argv
  #commands: YargsCommand[] = [
    cleanSourcemap,
    imageMinify,
    imageToWebP,
    imageResize,
    imageBuilder,
    htmlValidate,
  ]

  constructor(argv: string[]) {
    this.#yargs = yargs(hideBin(argv))
    this.#configureYargs()
  }

  #configureYargs() {
    this.#yargs
      .epilogue(epilogue)
      .help('help', 'Show help', false)
      .locale('en')
      .scriptName(scriptName)
      .usage(usage)
      .wrap(95)
      .version('version', 'Show current version number', version)
      .hide('version')
      .hide('help')
      .strictCommands()
  }

  async installCommands() {
    for (const command of this.#commands) {
      this.#yargs.command(
        command.command,
        command.description,
        command.builder,
        command.handler.bind(command),
      )
    }
    return this
  }

  async parse() {
    try {
      /**
       * NOTE: argv, the letter v is an abbreviation of vector, arg - vector | arg - array
       * Read more on: http://decsai.ugr.es/~jfv/ed1/c/cdrom/cap6/cap64.htm
       */
      const argv = await this.#yargs.parse() // args vector - without flags
      const argsCount = argv._.length

      if (!argsCount) this.#yargs.showHelp()
    } catch (err) {
      const help = await this.#yargs.getHelp()
      if (err instanceof Error) console.error('[error]:', `${err.message}\n${help}`)

      console.error('[error]:', `unknown error\n${help}`)
    }
  }
}
