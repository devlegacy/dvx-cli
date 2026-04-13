import { URL } from 'node:url'

import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'

// import { Notify } from '#/src/shared/lib/notify.js'
import { imageResizer } from './image-resizer.js'

export const command = 'img:resize'
export const builder = {
  source: {
    alias: 'src',
    describe: 'Source directory containing images to resize',
    type: 'string',
    default: 'src/assets/img/dist',
  },
  width: {
    alias: 'w',
    type: 'number',
    describe: 'Target width in pixels for resized images',
    default: 1024,
  },
  height: {
    alias: 'h',
    type: 'number',
    describe:
      'Target height in pixels for resized images (optional, maintains aspect ratio if not set)',
  },
  tool: {
    alias: 't',
    describe: 'Image processing tool to use for resizing',
    type: 'string',
    default: 'sharp',
    choices: ['sharp', 'mogrify'],
  },
  exclude: {
    alias: 'e',
    describe: 'File patterns to exclude from resizing (space-separated)',
    type: 'array',
    default: ['opengraph'],
  },
} as const
export const description = 'Resize images to specified dimensions while maintaining aspect ratio'
export const handler = async (args: ArgumentsCamelCase<InferredOptionTypes<typeof builder>>) => {
  // console.time(this.command)
  imageResizer(
    {
      ...args,
      command,
    },
    new URL('./image-resizer.job.js', import.meta.url),
  )
  // console.timeEnd(this.command)
  // Notify.info('Resize', 'End resize images task')
}
