import { Argv, InferredOptionTypes } from 'yargs';
import { cwd } from 'process';
import { File } from '@/shared/lib/file';
import { Hint, Ruleset } from 'htmlhint/types';
import { HTMLHint } from 'htmlhint';
import { log, warn } from '@/shared/helpers/console';
import { Notify } from '@/shared/lib/notify';
import Config from '@/shared/helpers/config';
import { Command } from '@/shared/interfaces/command.interface';

const htmlhintStylish = require('htmlhint-stylish');

export type HtmlValidateOptions = InferredOptionTypes<typeof htmlValidate.options>;

class HtmlValidate implements Command {
  public readonly command = 'html:validate';
  public readonly description =
    'Validate html files with htmlhint. \nRead about rules on:\n- https://github.com/htmlhint/HTMLHint/wiki/Rules\n- https://htmlhint.com/docs/user-guide/list-rules';
  public readonly options = {
    source: {
      alias: 'src',
      describe: 'Source path of the html files.',
      type: 'string' as 'string',
      default: 'public'
    }
  };

  public handler(yargs: Argv) {
    return yargs.command(this.command, this.description, this.options, (args) => {
      console.time(this.command);

      const { source } = args;
      const files = File.sync(`${source}/**/*.+(html)`);

      if (!files.length) {
        warn(this.command, 'HTML files not found');
        process.exit(0);
      }

      /**
       * Note: Can be a factory of configs?
       */
      const htmlhintrc = File.find('.htmlhintrc');
      const ruleSet: Ruleset = htmlhintrc.isFile() ? JSON.parse(htmlhintrc.read()) : Config.HTML_RULE_SET;

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
        log(this.command, 'No html errors has found :)');
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

      Notify.info(this.command, 'Done, watch results in console');
    });
  }
}
const htmlValidate = new HtmlValidate();
export { htmlValidate };
