import type { ArgumentsCamelCase, Argv, InferredOptionTypes } from 'yargs'

import { minify } from './image-minify.command.js'
import { resize } from './image-resize.command.js'
import { towebp } from './image-to-webp.command.js'
import { YargsCommand } from '#@/src/shared/yargs-command.js'

class ImageOptimize extends YargsCommand {
  readonly command = 'img:optimize'
  readonly builder = this.options({
    source: {
      alias: 'src',
      describe: 'Source path of the images without optimization.',
      type: 'string',
      default: 'src/assets/img/src',
    },
    distribution: {
      alias: 'dist',
      describe: 'Distribution path for optimized image .',
      type: 'string',
      default: 'src/assets/img/dist',
    },
    width: {
      alias: 'w',
      type: 'number',
      describe: 'Set the width',
      default: 1024,
    },
    height: {
      alias: 'h',
      type: 'number',
      describe: 'Set the height',
    },
    tool: {
      alias: 't',
      describe: 'Tool to use',
      type: 'string',
      default: 'sharp',
      choices: ['sharp', 'mogrify'],
    },
    exclude: {
      alias: 'e',
      describe: 'Files to exclude / ignore, separated by spaces',
      type: 'array',
      default: ['opengraph'],
    },
  } as const)

  readonly description = 'Process images (minify, convert to webp and resize).'

  async handler(args: ArgumentsCamelCase<InferredOptionTypes<typeof this.builder>>) {
    const dist = args.distribution
    await minify(args)
    // @ts-ignore
    args.distribution = 'src/assets/img/dist/webp'
    await towebp(args)
    // @ts-ignore
    args.source = dist
    // @ts-ignore
    await resize(args)
  }
}
const imageBuilder = new ImageOptimize()

export { imageBuilder }
