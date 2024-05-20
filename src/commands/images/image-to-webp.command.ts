import { isMainThread } from 'node:worker_threads'
import { join, resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import { cpus } from 'node:os'

import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'

import { warn } from '#@/src/shared/helpers/console.js'
import { File } from '#@/src/shared/lib/file.js'
import { Notify } from '#@/src/shared/lib/notify.js'
import { YargsCommand } from '#@/src/shared/yargs-command.js'
import { chunkArray } from '#@/src/shared/chunkArray.js'
import { runWorker } from '#@/src/shared/runWorker.js'

const command = 'img:towebp'
const tasks: Promise<void>[] = []

export class ImageToWebP extends YargsCommand {
  readonly command = command

  readonly builder = this.options({
    source: {
      alias: 'src',
      describe: 'Source path of the images to convert webp.',
      type: 'string',
      default: 'src/assets/img/dist',
    },
    distribution: {
      alias: 'dist',
      describe: 'Distribution path for webp images.',
      type: 'string',
      default: 'src/assets/img/dist/webp',
    },
  } as const)

  readonly description = 'Format/Convert images to webp'

  async handler(args: ArgumentsCamelCase<InferredOptionTypes<typeof this.builder>>) {
    console.time(this.command)
    await towebp(args)
    console.timeEnd(this.command)
    Notify.info('To webp', 'End images to webp task')
  }
}

export async function towebp({ source, distribution }: { source: string; distribution: string }) {
  if (isMainThread) {
    const src = File.find(source)
    if (!src.isDirectory()) {
      throw new Error(`Directory ${src.info.absolutePath} not found`)
    }
    const dist = resolve(distribution)

    const extensions = 'png,jpeg,jpg,gif'
    const files = File.sync(`**/*.{${extensions}}`, {
      absolute: true,
      cwd: src.info.absolutePath,
    }).map((path) => {
      const file = File.find(path)
      const distDir = file.info.dir.replace(src.info.absolutePath, '')
      const destination = File.find(
        distDir.startsWith('\\') || distDir.startsWith('/')
          ? join(dist, distDir)
          : resolve(dist, distDir),
      )
      if (!destination.isDirectory()) {
        warn(`[${command}]:`, `Creating directory <${destination.info.absolutePath}>`)
        mkdirSync(destination.info.absolutePath, { recursive: true })
      }
      return {
        file: file.info,
        destination: destination.info.absolutePath,
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
          new URL('./to-webp.job.js', import.meta.url),
        ),
      )
    }
    await Promise.all(tasks)
  }
}
