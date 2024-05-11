import type { Argv } from 'yargs'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import type { Class } from 'type-fest'

import { version, epilogue, usage, scriptName } from '#@/src/commands/version.js'
import type { YargsCommand } from './shared/yargs-command.js'
import { readModulesRecursively } from './shared/readModulesRecursively.js'
import { isConstructor } from './shared/isConstructor.js'

export class DvxCLI {
  #yargs: Argv

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

  async installCommands(path = 'commands') {
    for await (const entities of readModulesRecursively(
      new URL(path, import.meta.url),
      /\.command\.(ts|js)$/,
    )) {
      const keys = Object.keys(entities)
      for (const key of keys) {
        const entity = entities[`${key}`]
        if (!isConstructor(entity)) continue
        const command = entity as Class<YargsCommand>
        const cmd = new command() as YargsCommand
        this.#yargs.command(cmd.command, cmd.description, cmd.builder, cmd.handler.bind(command))
      }
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
