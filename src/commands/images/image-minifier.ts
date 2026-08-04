import { cpus } from 'node:os'
import { join, resolve } from 'node:path'
import type { URL } from 'node:url'
import { isMainThread } from 'node:worker_threads'
import { chunkArray } from '#/src/shared/domain/chunkArray.js'
import { log } from '#/src/shared/domain/console.js'
import { File } from '#/src/shared/domain/file.js'
import { formatSizeDelta } from '#/src/shared/domain/formatBytes.js'
import type { Quality } from '#/src/shared/domain/quality-presets.js'
import { runWorker, summarizeWorkerResults, type WorkerResult } from '#/src/shared/domain/runWorker.js'

export async function imageMinifier(
  {
    source,
    distribution,
    command,
    quality,
  }: {
    source: string
    distribution: string
    command: string
    quality?: Quality
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
            quality,
          },
          jobFile,
        ),
      )
    }
    const results = await Promise.allSettled(tasks)
    const { processed, time, bytesIn, bytesOut } = summarizeWorkerResults(results)
    const sizes = bytesIn > 0 ? `, ${formatSizeDelta(bytesIn, bytesOut)}` : ''
    log(`[${command}]: minify done — ${processed} files${sizes} in ${time.toFixed(2)}s`)
  }
}
