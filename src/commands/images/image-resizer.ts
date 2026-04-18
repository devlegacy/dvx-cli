import { cpus } from 'node:os'
import type { URL } from 'node:url'
import { isMainThread } from 'node:worker_threads'
import { chunkArray } from '#/src/shared/domain/chunkArray.js'
import { log } from '#/src/shared/domain/console.js'
import { File } from '#/src/shared/domain/file.js'
import { runWorker, type WorkerResult } from '#/src/shared/domain/runWorker.js'

export async function imageResizer(
  {
    source,
    width,
    height,
    tool,
    exclude,
    command,
  }: {
    source: string
    exclude: readonly (string | number)[]
    tool: string
    width: number
    command: string
    height?: number
  },
  jobFile: URL,
) {
  if (isMainThread) {
    const src = File.find(source)
    if (!src.isDirectory()) {
      throw new Error(`Directory ${src.info.absolutePath} not found`)
    }

    const extensions = 'png,jpeg,jpg'
    const ignore = exclude.map((_) => `**/*${_}*.{${extensions}}`)
    const files = File.sync(`**/*.{${extensions}}`, {
      cwd: src.info.absolutePath,
      exclude: ignore,
    })
    const cpuCount = cpus().length - 1
    const tasks: Promise<WorkerResult>[] = []

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
          jobFile,
        ),
      )
    }
    const results = await Promise.allSettled(tasks)
    const fulfilled = results.filter((r): r is PromiseFulfilledResult<WorkerResult> => r.status === 'fulfilled')
    const processed = fulfilled.reduce((sum, r) => sum + r.value.processed, 0)
    const time = fulfilled.reduce((max, r) => Math.max(max, r.value.endTime), 0)
    log(`[${command}]: resize done — ${processed} files in ${time.toFixed(2)}s`)
  }
}
