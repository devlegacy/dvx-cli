import { exit } from 'node:process'
import { URL } from 'node:url'

import { type Argv } from 'yargs'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import { type YargsCommand } from '#/src/shared/infrastructure/yargs-command.js'
import { version, epilogue, usage, scriptName } from '#/src/shared/domain/cli-metadata.js'
import { readModulesRecursively } from '#/src/shared/domain/readModulesRecursively.js'
import { isConstructor } from '#/src/shared/domain/isConstructor.js'
import { error } from '#/src/shared/domain/console.js'

export class DvxCLI {
  #yargs: Argv

  constructor(argv: string[]) {
    this.#yargs = yargs(hideBin(argv))
    this.#configure()
  }

  #configure() {
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

  #onError(command: string, err: unknown) {
    error(`[${command}]:`, err instanceof Error ? err.message : 'unknown error')
    exit(0)
  }

  async #installCommands(path = 'commands') {
    const parentUrl = new URL(path, import.meta.url)
    const mask = /\.command\.(ts|js)$/
    for await (const entities of readModulesRecursively(parentUrl, mask)) {
      const keys = Object.keys(entities)
      for (const key of keys) {
        const entity = entities[`${key}`]
        if (!isConstructor<YargsCommand>(entity)) continue
        const cmd = new entity()
        this.#yargs.command(cmd.command, cmd.description, cmd.builder, cmd.handler.bind(cmd))
      }
    }

    return this
  }

  async parse() {
    try {
      await this.#installCommands()
      /**
       * DOC: argv, the letter v is an abbreviation of vector, arg - vector | arg - array
       * Read more on: http://decsai.ugr.es/~jfv/ed1/c/cdrom/cap6/cap64.htm
       */
      const argv = await this.#yargs.parse() // args vector - without flags
      const argsCount = argv._.length

      if (!argsCount) this.#yargs.showHelp()
    } catch (err) {
      const help = await this.#yargs.getHelp()
      if (err instanceof Error) return console.error('[error]:', `${err.message}\n${help}`)

      console.error('[error]:', `unknown error\n${help}`)
    }
  }
}
