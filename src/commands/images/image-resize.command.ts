import { cpus } from 'node:os'

import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'

import { File } from '#@/src/shared/lib/file.js'
// import { Notify } from '#@/src/shared/lib/notify.js'
import { YargsCommand } from '#@/src/shared/yargs-command.js'
import { chunkArray } from '#@/src/shared/chunkArray.js'
import { runWorker } from '#@/src/shared/runWorker.js'
import { isMainThread } from 'node:worker_threads'

const command = 'img:resize'
const tasks: Promise<void>[] = []

export class ImageResize extends YargsCommand {
  readonly command = command

  readonly builder = this.options({
    source: {
      alias: 'src',
      describe: 'Source path of the images to resize',
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

  readonly description = 'Resize images, fixes to 1024px width'

  constructor() {
    super()
  }

  async handler(args: ArgumentsCamelCase<InferredOptionTypes<typeof this.builder>>) {
    // console.time(this.command)
    resize(args)
    // console.timeEnd(this.command)
    // Notify.info('Resize', 'End resize images task')
  }
}

export async function resize({
  source,
  width,
  height,
  tool,
  exclude,
}: {
  source: string
  exclude: readonly (string | number)[]
  tool: string
  width: number
  height?: number
}) {
  if (isMainThread) {
    const src = File.find(source)
    if (!src.isDirectory()) {
      throw new Error(`Directory ${src.info.absolutePath} not found`)
    }

    const extensions = 'png,jpeg,jpg'
    const ignore = exclude.map((_) => `**/*${_}*.{${extensions}}`)
    const files = File.sync(`**/*.{${extensions}}`, {
      cwd: src.info.absolutePath,
      absolute: true,
      ignore,
    })
    const cpuCount = cpus().length - 1

    const chunkedTasks = chunkArray(files, cpuCount)
    for (const chunk of chunkedTasks) {
      tasks.push(
        runWorker(
          {
            files: chunk,
            width,
            height,
            tool,
            command,
          },
          new URL('./resize.job.js', import.meta.url),
        ),
      )
    }
    Promise.allSettled(tasks)
  }
}
