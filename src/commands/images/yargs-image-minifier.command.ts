import { URL } from 'node:url'
import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'
import { imageMinifier } from './image-minifier.js'

export const command = 'img:minify'
export const builder = {
  source: {
    alias: 'src',
    describe: 'Source directory containing unoptimized images (png, jpeg, jpg, gif, svg)',
    type: 'string',
    default: 'src/assets/img/src',
  },
  distribution: {
    alias: 'dist',
    describe: 'Output directory where minified and optimized images will be saved',
    type: 'string',
    default: 'src/assets/img/dist',
  },
  quality: {
    alias: 'q',
    describe: 'Compression quality preset',
    type: 'string',
    default: 'medium',
    choices: [
      'high',
      'medium',
      'low',
    ],
  },
} as const
export const description = 'Minify and optimize images for better web performance and smaller file sizes'

export const handler = (args: ArgumentsCamelCase<InferredOptionTypes<typeof builder>>) => {
  return imageMinifier(
    {
      ...args,
      command,
    },
    new URL('./imagemin-minifier.job.js', import.meta.url),
  )
}
