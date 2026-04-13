import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'

import { imageMinifier } from './image-minifier.js'
import { imageResizer } from './image-resizer.js'
import { webPConverter } from './image-webp-converter.js'

export const command = 'img:optimize'
export const builder = {
  source: {
    alias: 'src',
    describe: 'Source directory containing unoptimized images to process',
    type: 'string',
    default: 'src/assets/img/src',
  },
  distribution: {
    alias: 'dist',
    describe: 'Output directory for optimized images',
    type: 'string',
    default: 'src/assets/img/dist',
  },
  width: {
    alias: 'w',
    type: 'number',
    describe: 'Target width for resized images in pixels',
    default: 1024,
  },
  height: {
    alias: 'h',
    type: 'number',
    describe: 'Target height for resized images in pixels (optional)',
  },
  tool: {
    alias: 't',
    describe: 'Image processing tool to use for resizing operations',
    type: 'string',
    default: 'sharp',
    choices: ['sharp', 'mogrify'],
  },
  exclude: {
    alias: 'e',
    describe: 'File patterns to exclude from processing (space-separated)',
    type: 'array',
    default: ['opengraph'],
  },
} as const

export const description =
  'Comprehensive image optimization: minify, resize, and convert to WebP format'

export const handler = async (args: ArgumentsCamelCase<InferredOptionTypes<typeof builder>>) => {
  const dist = args.distribution
  await imageMinifier(
    {
      ...args,
      command,
    },
    new URL('./imagemin-minifier.job.js', import.meta.url),
  )
  // @ts-ignore
  args.distribution = 'src/assets/img/dist/webp'
  await imageResizer(
    {
      ...args,
      command,
    },
    new URL('./image-resizer.job.js', import.meta.url),
  )

  // @ts-ignore
  args.source = dist
  // @ts-ignore
  await webPConverter(
    {
      ...args,
      command,
    },
    new URL('./sharp-webp-converter.job.js', import.meta.url),
  )
}
