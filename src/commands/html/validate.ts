import { sync } from 'glob';
import { HTMLHint, LintResult, RuleSet } from 'htmlhint';
import { cwd } from 'process';
import { Arguments, Options } from 'yargs';
import { error } from '../../helpers/console';
import { File } from '../../lib/file';
import { Notify } from '../../lib/notify';
const htmlhintStylish = require('htmlhint-stylish');

interface HtmlValidateOption {
  [source: string]: Options;
}

interface HtmlValidateArgument extends Arguments {
  source?: string;
  src?: string;
}

const RULE_SET: RuleSet = {
  'alt-require': true,
  'attr-lowercase': true,
  'attr-no-duplication': true,
  'attr-unsafe-chars': true,
  'attr-value-double-quotes': true,
  'attr-value-not-empty': false,
  'doctype-first': true,
  'doctype-html5': true,
  'head-script-disabled': true,
  'href-abs-or-rel': false,
  'id-class-ad-disabled': false,
  'id-class-value': 'dash',
  'id-unique': true,
  'inline-script-disabled': false,
  'inline-style-disabled': false,
  'space-tab-mixed-disabled': 'space',
  'spec-char-escape': true,
  'src-not-empty': true,
  'style-disabled': false,
  'tag-pair': true,
  'tag-self-close': false,
  'tagname-lowercase': true,
  'title-require': true,
};

export default class HtmlValidate {
  public readonly command = 'html:validate';
  public readonly description =
    'Validate html files with htmlhint. \nRead about rules on:\nhttps://github.com/htmlhint/HTMLHint/wiki/Rules\nhttps://htmlhint.com/docs/user-guide/list-rules';
  public readonly options: HtmlValidateOption = {
    source: {
      alias: 'src',
      describe: 'Source path of the html files.',
      type: 'string',
      default: 'public',
    },
  };

  handler(args: HtmlValidateArgument): void {
    Notify.info(
      'html:validate',
      'Start task',
      (err: any, response: any, metadata: any) => {
        console.log(err, response, metadata);
        const { source } = args;
        const files = sync(`${source}/**/*.+(html)`, { nodir: true });
        if (!files.length) {
          error('html:validate', 'No html files found');
          return;
        }

        const ruleFile = File.find('.htmlhintrc');
        const ruleSet = ruleFile.isFile()
          ? JSON.parse(ruleFile.read())
          : RULE_SET;
        const lintResults = files
          .map((file) => ({
            file,
            fileContent: File.find(file).read(),
          }))
          .map(({ file, fileContent }) =>
            HTMLHint.verify(fileContent, ruleSet).map(
              (lintResult: LintResult) => {
                return {
                  file,
                  error: lintResult,
                };
              }
            )
          )
          .filter((lintResult) => lintResult.length !== 0);

        for (const messages of lintResults) {
          htmlhintStylish({
            cwd: cwd(),
            htmlhint: {
              messages,
            },
          });
        }
      }
    );
  }
}
