import { sync } from 'glob';
import { HTMLHint, LintResult, RuleSet } from 'htmlhint';
import { cwd } from 'process';
import yargs, { Arguments, Argv, Options } from 'yargs';
import { error, log } from '../../helpers/console';
import { File } from '../../lib/file';
import { Notify } from '../../lib/notify';
import Config from '../../shared/helpers/config';
import HtmlValidateArguments from '../../shared/interfaces/html-validate-arguments';

const htmlhintStylish = require('htmlhint-stylish');

export default class HtmlValidate {
  public static readonly command = 'html:validate';
  public static readonly description =
    'Validate html files with htmlhint. \nRead about rules on:\n\thttps://github.com/htmlhint/HTMLHint/wiki/Rules\nhttps://htmlhint.com/docs/user-guide/list-rules';
  public static readonly builder = () =>
    yargs.option({
      source: {
        alias: 'src',
        describe: 'Source path of the html files.',
        type: 'string',
        default: 'public',
      },
    });
  public static async handler(args: HtmlValidateArguments) {
    console.time(HtmlValidate.command);

    const { source } = args;
    const files = sync(`${source}/**/*.+(html)`, { nodir: true });

    if (!files.length) {
      error(HtmlValidate.command, 'No html files has found');
      return;
    }

    /**
     * Note: Can be a factory of configs?
     */
    const ruleFile = File.find('.htmlhintrc');
    const ruleSet: RuleSet = ruleFile.isFile()
      ? JSON.parse(ruleFile.read())
      : Config.HTML_RULE_SET;

    const lintResults = files
      .map((file) => ({
        file,
        fileContent: File.find(file).read(),
      }))
      .map(({ file, fileContent }) =>
        HTMLHint.verify(fileContent, ruleSet).map((lintResult: LintResult) => {
          return {
            file,
            error: lintResult,
          };
        })
      )
      .filter((lintResult) => lintResult.length !== 0);

    if (!lintResults.length) {
      log(HtmlValidate.command, 'No html errors has found :)');
      return;
    }

    for (const messages of lintResults) {
      htmlhintStylish({
        cwd: cwd(),
        htmlhint: {
          messages,
        },
      });
    }
    console.timeEnd(HtmlValidate.command);
    Notify.info(HtmlValidate.command, 'Done, watch console results');
  }
}
