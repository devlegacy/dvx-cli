import { cpus } from 'node:os'
import { join, resolve } from 'node:path'
import type { URL } from 'node:url'
import { isMainThread } from 'node:worker_threads'
import { chunkArray } from '#/src/shared/domain/chunkArray.js'
import { log } from '#/src/shared/domain/console.js'
import { File } from '#/src/shared/domain/file.js'
import { runWorker, type WorkerResult } from '#/src/shared/domain/runWorker.js'

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

    log(`[${command}]: Processing images
      Source:       ${src.info.absolutePath}
      Distribution: ${dist.info.absolutePath}`)

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
    const tasks: Promise<WorkerResult>[] = []

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
    const results = await Promise.allSettled(tasks)
    const fulfilled = results.filter((r): r is PromiseFulfilledResult<WorkerResult> => r.status === 'fulfilled')
    const processed = fulfilled.reduce((sum, r) => sum + r.value.processed, 0)
    const time = fulfilled.reduce((max, r) => Math.max(max, r.value.endTime), 0)
    log(`[${command}]: minify done — ${processed} files in ${time.toFixed(2)}s`)
  }
}
