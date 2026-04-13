#!/usr/bin/env node

import { argv } from 'node:process'

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import { version, epilogue, usage, scriptName } from '#/src/shared/domain/cli-metadata.js'

const cli = yargs(hideBin(argv))

// configure yargs
cli
  .epilogue(epilogue)
  .commandDir('./commands', {
    include: /.command\.js$/,
    extensions: ['js'],
    recurse: true,
  })
  .help('help', 'Show help', false)
  .locale('en')
  .scriptName(scriptName)
  .usage(usage)
  .wrap(95)
  .version('version', 'Show current version number', version)
  .hide('version')
  .hide('help')
  .strictCommands()

/**
 * DOC: argv, the letter v is an abbreviation of vector, arg - vector | arg - array
 * Read more on: http://decsai.ugr.es/~jfv/ed1/c/cdrom/cap6/cap64.htm
 */
const args = await cli.parse() // args vector - without flags
const argsCount = args._.length

if (!argsCount) cli.showHelp()
