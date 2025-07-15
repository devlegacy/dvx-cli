import { join, resolve } from 'node:path'
import { cpus } from 'node:os'
import { isMainThread } from 'node:worker_threads'
import { type URL } from 'node:url'

import { warn } from '#@/src/shared/domain/console.js'
import { File } from '#@/src/shared/domain/file.js'
import { chunkArray } from '#@/src/shared/domain/chunkArray.js'
import { runWorker } from '#@/src/shared/domain/runWorker.js'

const tasks: Promise<void>[] = []

export async function imageMinifier(
  {
    source,
    distribution,
    command,
  }: {
    source: string
    distribution: string
    command: string
  },
  jobFile: URL,
) {
  if (isMainThread) {
    const src = File.find(source)
    if (!src.isDirectory()) {
      throw new Error(`Directory <${src.info.absolutePath}> not found`)
    }
    const dist = File.find(distribution)

    warn(`[${command}]:`, 'source:', src.info.absolutePath)
    warn(`[${command}]:`, 'distribution:', dist.info.absolutePath)

    const extensions = 'png,jpeg,jpg,gif,svg'
    const files = File.sync(`**/*.{${extensions}}`, {
      cwd: src.info.absolutePath,
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
        ext: file.info.ext.toLowerCase(),
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
          jobFile,
        ),
      )
    }
    Promise.allSettled(tasks)
  }
}
