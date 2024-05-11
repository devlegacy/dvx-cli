import { cwd, uptime, exit } from 'node:process'

import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'
import { HTMLHint } from 'htmlhint'
import htmlhintStylish from 'htmlhint-stylish'

import { File } from '#@/src/shared/lib/file.js'
import { log, warn } from '#@/src/shared/helpers/console.js'
import { Notify } from '#@/src/shared/lib/notify.js'
import config from '#@/src/shared/helpers/config.js'
import { YargsCommand } from '#@/src/shared/yargs-command.js'

type Ruleset = (typeof HTMLHint)['defaultRuleset']
type Hint = ReturnType<(typeof HTMLHint)['verify']>[number]

class HtmlValidate extends YargsCommand {
  readonly command = 'html:validate'
  readonly description =
    'Validate html files with htmlhint. \nRead about rules on:\n- https://github.com/htmlhint/HTMLHint/wiki/Rules\n- https://htmlhint.com/docs/user-guide/list-rules'
  readonly builder = this.options({
    source: {
      alias: 'src',
      describe: 'Source path of the html files.',
      type: 'string',
      default: 'public',
    },
  } as const)

  constructor() {
    super()
  }

  handler(args: ArgumentsCamelCase<InferredOptionTypes<typeof this.builder>>) {
    const commandStartedAt = uptime()

    const { source } = args
    const files = File.sync(`${source}/**/*.+(html)`, { absolute: true })

    if (!files.length) {
      warn(this.command, 'HTML files not found')
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
      log(this.command, 'No html errors have been found :)')
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

    log(this.command, `${commandElapsedTime.toFixed(3)}s`)
    Notify.info(this.command, 'Task done, watch results in console')
  }
}
const htmlValidate = new HtmlValidate()
export { htmlValidate }
