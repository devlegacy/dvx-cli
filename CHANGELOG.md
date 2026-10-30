# Changelog

## [4.1.0](https://github.com/devlegacy/dvx-cli/compare/v4.0.0...v4.1.0) (2026-10-30)


### Features

* assign release PR to repo owner automatically ([8826924](https://github.com/devlegacy/dvx-cli/commit/8826924dad66881ba9f732a4d0de34861e4368d2))

## [4.0.0](https://github.com/devlegacy/dvx-cli/compare/v3.0.2...v4.0.0) (2026-10-30)


### ⚠ BREAKING CHANGES

* Node.js >= 24 and pnpm >= 12 are required (3.x ran on Node 22). Compared with 3.0.2 the commands also behave differently:
    - WebP output is lossy and follows the --quality preset (3.x was lossless).
    - JPEG is encoded by mozjpeg only, with the preset quality (3.x ran jpegtran + mozjpeg at 90); the default preset medium uses 80.
    - PNG quality follows the preset (3.x used a fixed 0.6-0.8 range).
    - GIF is optimized losslessly with gifsicle (3.x used lossy giflossy).
    - SVG keeps the viewBox and removes width/height (3.x removed the viewBox).
    - img:minify skips sources whose optimized copy is newer, and img:resize skips images that already fit.
    - Image commands exit with code 1 when any file fails (3.x always exited 0).
    - Log output changed: warnings and errors go to stderr; DVX_LOG_FORMAT=json, DVX_LOG_LEVEL, NO_COLOR and FORCE_COLOR control the format.
* requires Node >=24; per-file log format changed.

### Features

* improve code base ([#36](https://github.com/devlegacy/dvx-cli/issues/36)) ([1d61756](https://github.com/devlegacy/dvx-cli/commit/1d61756177527431991562d2018083d43be5191d))
* require Node.js 24 and pnpm 12 ([ca6fd40](https://github.com/devlegacy/dvx-cli/commit/ca6fd40bddae5e0cac3917654940f01c58b75de4))
* update pnpm workspace configuration and audit settings ([2dd6c75](https://github.com/devlegacy/dvx-cli/commit/2dd6c75ad71863cc9888a28ac7eb062b277fe98d))


### Bug Fixes

* correct Console import in console.ts ([758feb3](https://github.com/devlegacy/dvx-cli/commit/758feb325188df5e5dfd34da892d6ef3be4a61e5))
* modify release-please configuration to exclude component in tag ([2dd6c75](https://github.com/devlegacy/dvx-cli/commit/2dd6c75ad71863cc9888a28ac7eb062b277fe98d))
* update type definitions for htmlhint-stylish module ([2dd6c75](https://github.com/devlegacy/dvx-cli/commit/2dd6c75ad71863cc9888a28ac7eb062b277fe98d))

## [3.0.2](https://github.com/devlegacy/dvx-cli/compare/dvx-cli@v3.0.1...dvx-cli@v3.0.2) (2024-08-04)


### Bug Fixes

* **release:** update package.json files section ([#33](https://github.com/devlegacy/dvx-cli/issues/33)) ([1578cca](https://github.com/devlegacy/dvx-cli/commit/1578cca24fd7311b8935e03392f9fad7bd391e7b))

## [3.0.1](https://github.com/devlegacy/dvx-cli/compare/dvx-cli@v3.0.0...dvx-cli@v3.0.1) (2024-08-04)


### Bug Fixes

* **release:** ci ([#31](https://github.com/devlegacy/dvx-cli/issues/31)) ([ca88a40](https://github.com/devlegacy/dvx-cli/commit/ca88a4078ec03c919600ada9ddf27a344db81b30))

## [3.0.0](https://github.com/devlegacy/dvx-cli/compare/dvx-cli-v2.0.4...dvx-cli@v3.0.0) (2024-08-03)


### Features

* **github:** add ci ([#28](https://github.com/devlegacy/dvx-cli/issues/28)) ([e58c057](https://github.com/devlegacy/dvx-cli/commit/e58c05719fb2a51e1dffc1d2370446fdb56ab033))


### Bug Fixes

* audit npm packages ([3dce836](https://github.com/devlegacy/dvx-cli/commit/3dce836b9c5ac07778e6254c5bf4c76dc99d23e7))
* Docs, Package ([51a4613](https://github.com/devlegacy/dvx-cli/commit/51a461380d3880c8ee4b8f4dc4cc8152ec2f62dc))
* package publish config ([1f13be7](https://github.com/devlegacy/dvx-cli/commit/1f13be761a7257f3b2473878386894aa58bc8a63))
* package publish config ([2e347c9](https://github.com/devlegacy/dvx-cli/commit/2e347c9c53e3174d952bfce7fd621bf374bd336d))
* tslib dependencie ([999df4f](https://github.com/devlegacy/dvx-cli/commit/999df4fa9b531132a917c2cc45046fc1fff6bc66))


### Miscellaneous Chores

* release 3.0.0 ([49f87eb](https://github.com/devlegacy/dvx-cli/commit/49f87eb137f7533be106a3ec4ad45c6da116fef2))
