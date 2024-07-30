import { join, resolve } from 'node:path'
import { cpus } from 'node:os'
import { isMainThread } from 'node:worker_threads'
import { URL } from 'node:url'

import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'

import { warn } from '#@/src/shared/helpers/console.js'
import { File } from '#@/src/shared/lib/file.js'
// import { Notify } from '#@/src/shared/lib/notify.js'
import { YargsCommand } from '#@/src/shared/yargs-command.js'
import { chunkArray } from '#@/src/shared/chunkArray.js'
import { runWorker } from '#@/src/shared/runWorker.js'

const command = 'img:minify'
const tasks: Promise<void>[] = []
export class ImageMinify extends YargsCommand {
  readonly command = command

  readonly builder = this.options({
    source: {
      alias: 'src',
      describe: 'Source path without optimization.',
      type: 'string',
      default: 'src/assets/img/src',
    },
    distribution: {
      alias: 'dist',
      describe: 'Distribution path for optimized images.',
      type: 'string',
      default: 'src/assets/img/dist',
    },
  } as const)

  readonly description = 'Minify images'

  async handler(args: ArgumentsCamelCase<InferredOptionTypes<typeof this.builder>>) {
    // console.time(this.command)
    minify(args)
    // console.timeEnd(this.command)
    // Notify.info('Minify', 'Minify images task has ended')
  }
}

export async function minify({ source, distribution }: { source: string; distribution: string }) {
  if (isMainThread) {
    const src = File.find(source)
    if (!src.isDirectory()) {
      throw new Error(`Directory ${src.info.absolutePath} not found`)
    }
    const dist = File.find(distribution)

    warn(`[${command}]:`, 'search in:', src.info.absolutePath)
    warn(`[${command}]:`, 'result in:', dist.info.absolutePath)

    const extensions = 'png,jpeg,jpg,gif,svg'
    const files = File.sync(`**/*.{${extensions}}`, {
      cwd: src.info.absolutePath,
      absolute: true,
    }).map((path) => {
      const file = File.find(path)
      // [input]: /dvx-demo-project/src/assets/img/src/webpack/webpack.png
      // [output]: /webpack/webpack.png
      const distDir = file.info.dir.replace(src.info.absolutePath, '')
      // [input]: /webpack/webpack.png
      // [output]: /dvx-demo-project/src/assets/img/dist/webpack
      const destination =
        distDir.startsWith('\\') || distDir.startsWith('/')
          ? join(dist.info.absolutePath, distDir)
          : resolve(dist.info.absolutePath, distDir)
      return {
        source: path,
        destination,
        ext: file.info.ext.toLocaleLowerCase(),
      }
    })
    const cpuCount = cpus().length - 1

    const chunkedTasks = chunkArray(files, cpuCount)
    for (const chunk of chunkedTasks) {
      tasks.push(
        runWorker(
          {
            files: chunk,
            command,
          },
          new URL('./minify.job.js', import.meta.url),
        ),
      )
    }
    Promise.allSettled(tasks)
  }
}
