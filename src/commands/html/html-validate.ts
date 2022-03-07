import { sync } from 'glob';
import { HTMLHint } from 'htmlhint';

import { cwd } from 'process';
import { Argv } from 'yargs';
import { error, log } from '../../shared/helpers/console';
import { File } from '../../shared/lib/file';
import { Notify } from '../../shared/lib/notify';
import Config from '../../shared/helpers/config';
import { Hint, Ruleset } from 'htmlhint/types';

const htmlhintStylish = require('htmlhint-stylish');

export default (yargs: Argv) => {
  const command = 'html:validate';
  const description =
    'Validate html files with htmlhint. \nRead about rules on:\n- https://github.com/htmlhint/HTMLHint/wiki/Rules\n- https://htmlhint.com/docs/user-guide/list-rules';

  return yargs.command(
    command,
    description,
    {
      source: {
        alias: 'src',
        describe: 'Source path of the html files.',
        type: 'string',
        default: 'public'
      }
    },
    (args) => {
      console.time(command);

      const { source } = args;
      const files = sync(`${source}/**/*.+(html)`, { nodir: true });

      if (!files.length) {
        error(command, 'HTML files not found');
        return;
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
          HTMLHint.verify(fileContent, ruleSet).map((lintResult: Hint) => {
            return {
              file,
              error: lintResult
            };
          })
        )
        .filter((lintResult) => lintResult.length !== 0);

      if (!lintResults.length) {
        log(command, 'No html errors has found :)');
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
      console.timeEnd(command);

      Notify.info(command, 'Done, watch console results');
    }
  );
};
