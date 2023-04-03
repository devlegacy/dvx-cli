import { Argv, InferredOptionTypes } from 'yargs';
import { cwd } from 'process';
import { File } from '@/shared/lib/file';
import { Hint, Ruleset } from 'htmlhint/types';
import { HTMLHint } from 'htmlhint';
import { log, warn } from '@/shared/helpers/console';
import { Notify } from '@/shared/lib/notify';
import config from '@/shared/helpers/config';
import { Command } from '@/shared/interfaces/command';

const htmlhintStylish = require('htmlhint-stylish');

class HtmlValidate implements Command {
  readonly command = 'html:validate';
  readonly description =
    'Validate html files with htmlhint. \nRead about rules on:\n- https://github.com/htmlhint/HTMLHint/wiki/Rules\n- https://htmlhint.com/docs/user-guide/list-rules';
  readonly options = {
    source: {
      alias: 'src',
      describe: 'Source path of the html files.',
      type: 'string' as const,
      default: 'public'
    }
  };

  handler(yargs: Argv) {
    return yargs.command(this.command, this.description, this.options, (args) => {
      console.time(this.command);

      const { source } = args;
      const files = File.sync(`${source}/**/*.+(html)`, { absolute: true });

      if (!files.length) {
        warn(this.command, 'HTML files not found');
        process.exit(0);
      }

      /**
       * DEBT: Can it be a factory of configs?
       */
      const htmlhintrc = File.find('.htmlhintrc');
      const ruleSet: Ruleset = htmlhintrc.isFile() ? JSON.parse(htmlhintrc.read()) : config.HTML_RULE_SET;

      const lintResults = files
        .map((file) => ({
          fileContent: File.find(file).read(),
          file
        }))
        .map(({ fileContent, file }) =>
          HTMLHint.verify(fileContent, ruleSet).map((lintResult: Hint) => ({
            file,
            error: lintResult
          }))
        )
        .filter((lintResult) => lintResult.length !== 0);

      if (!lintResults.length) {
        log(this.command, 'No html errors have been found :)');
        return;
      }

      for (const messages of lintResults) {
        htmlhintStylish({
          cwd: cwd(),
          htmlhint: {
            messages
          }
        });
      }
      console.timeEnd(this.command);

      Notify.info(this.command, 'Task done, watch results in console');
    });
  }
}
const htmlValidate = new HtmlValidate();
type HtmlValidateOptions = InferredOptionTypes<typeof htmlValidate.options>;

export { htmlValidate, HtmlValidateOptions };
