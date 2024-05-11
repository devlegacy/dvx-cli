import type { HTMLHint } from 'htmlhint'

type Ruleset = (typeof HTMLHint)['defaultRuleset']

export default class config {
  static readonly HTML_RULE_SET: Ruleset = {
    'alt-require': true,
    'attr-lowercase': true,
    'attr-no-duplication': true,
    'attr-unsafe-chars': true,
    'attr-value-double-quotes': true,
    'attr-value-not-empty': false,
    'doctype-first': true,
    'doctype-html5': true,
    'head-script-disabled': true,
    'href-abs-or-rel': 'rel',
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
  }

  static readonly CSS_SOURCEMAP_REGEX = /\/[\*]\#\s+(sourceMappingURL\=.*\.(css)\.map)\s+[\*]\//g
}
