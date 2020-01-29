const HTMLHint = require('htmlhint').default;
const htmlhintStylish = require('htmlhint-stylish');
const glob = require('glob');
const fs = require('fs');

module.exports = {
  cmd: 'html:validate',
  desc: 'Validate html files with htmlhint.',
  opts: {
    source: {
      alias: 'src',
      describe: 'Source path of the html files.',
      type: 'string',
      default: 'public',
    },
  },
  handler: (argv) => {
    const srcDir = argv.source;
    const files = glob.sync(`${srcDir}/**/*.+(html)`, { nodir: true });
    if (files.length) {
      for (let file of files) {
        let html = fs.readFileSync(file, 'utf8');
        // https://github.com/htmlhint/HTMLHint/wiki/Rules
        const messages = HTMLHint.verify(html, {
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
        }).map((errMsg) => {
          errMsg.file = file;
          errMsg.error = errMsg;
          return errMsg;
        });

        // path.relative(file.cwd, errMsg.file),
        htmlhintStylish({
          cwd: process.cwd(),
          htmlhint: {
            messages: messages,
          },
        });
      }
    }
  },
};

/**
 * Notes
 * Gulp code:
 */
// gulp
//   .src(`${srcDir}/**/*.html`)
//   .pipe($.htmlhint(
//   ))
//   .pipe($.htmlhint.reporter());
// console.log(htmlhint);
