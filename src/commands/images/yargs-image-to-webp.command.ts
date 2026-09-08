import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'

// import { Notify } from '#/src/shared/lib/notify.js'
import { webPConverter } from './image-webp-converter.js'

export const command = 'img:towebp'
export const builder = {
  source: {
    alias: 'src',
    describe: 'Source directory containing images to convert to WebP format',
    type: 'string',
    default: 'src/assets/img/dist',
  },
  distribution: {
    alias: 'dist',
    describe: 'Output directory where converted WebP images will be saved',
    type: 'string',
    default: 'src/assets/img/dist/webp',
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
export const description = 'Convert images to WebP format for better web performance and smaller file sizes'
export const handler = async (args: ArgumentsCamelCase<InferredOptionTypes<typeof builder>>) => {
  await webPConverter(
    {
      ...args,
      command,
    },
    new URL('./sharp-webp-converter.job.js', import.meta.url),
  )
}
