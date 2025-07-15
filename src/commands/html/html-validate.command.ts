import { cwd, uptime, exit } from 'node:process'

import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'
import { HTMLHint } from 'htmlhint'
import htmlhintStylish from 'htmlhint-stylish'

import { File } from '#@/src/shared/domain/file.js'
import { log, warn } from '#@/src/shared/domain/console.js'
import config from '#@/src/shared/infrastructure/config.js'

type Ruleset = (typeof HTMLHint)['defaultRuleset']
type Hint = ReturnType<(typeof HTMLHint)['verify']>[number]

export const command = 'html:validate'
export const builder = {
  source: {
    alias: 'src',
    describe: 'Directory containing HTML files to validate',
    type: 'string',
    default: 'public',
  },
} as const
export const description =
  'Validate HTML files for syntax errors and best practices using HTMLHint. \nRead about rules on:\n- https://github.com/htmlhint/HTMLHint/wiki/Rules\n- https://htmlhint.com/docs/user-guide/list-rules'

export const handler = (args: ArgumentsCamelCase<InferredOptionTypes<typeof builder>>) => {
  const commandStartedAt = uptime()

  const { source } = args
  const files = File.sync(`${source}/**/*.+(html)`)

  if (!files.length) {
    warn(command, 'HTML files not found')
    exit(0)
  }

  /**
   * DEBT: Can it be a factory of configs?
   */
  const htmlhintrc = File.find('.htmlhintrc')
  const ruleSet: Ruleset = htmlhintrc.isFile()
    ? JSON.parse(htmlhintrc.read())
    : config.HTML_RULE_SET

  const lintResults = files
    .map((file) => ({
      fileContent: File.find(file).read(),
      file,
    }))
    .map(({ fileContent, file }) =>
      HTMLHint.verify(fileContent, ruleSet).map((lintResult: Hint) => ({
        file,
        error: lintResult,
      })),
    )
    .filter((lintResult) => lintResult.length !== 0)

  if (!lintResults.length) {
    log(command, 'No html errors have been found :)')
    return
  }

  for (const messages of lintResults) {
    htmlhintStylish({
      cwd: cwd(),
      htmlhint: {
        messages,
      },
    })
  }

  const commandFinishedAt = uptime()
  const commandElapsedTime = commandFinishedAt - commandStartedAt

  log(command, `${commandElapsedTime.toFixed(3)}s`)
}
