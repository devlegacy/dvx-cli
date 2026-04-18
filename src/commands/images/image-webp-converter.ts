import { mkdirSync } from 'node:fs'
import { cpus } from 'node:os'
import { join, resolve } from 'node:path'
import { isMainThread } from 'node:worker_threads'

import { chunkArray } from '#/src/shared/domain/chunkArray.js'
import { log, warn } from '#/src/shared/domain/console.js'
import { File } from '#/src/shared/domain/file.js'
import { runWorker, type WorkerResult } from '#/src/shared/domain/runWorker.js'

export async function webPConverter(
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
      throw new Error(`Directory ${src.info.absolutePath} not found`)
    }
    const dist = resolve(distribution)

    const extensions = 'png,jpeg,jpg,gif'
    const files = File.sync(`**/*.{${extensions}}`, {
      cwd: src.info.absolutePath,
    }).map((path) => {
      const file = File.find(path)
      const distDir = file.info.dir.replace(src.info.absolutePath, '')
      const destination = File.find(
        distDir.startsWith('\\') || distDir.startsWith('/') ? join(dist, distDir) : resolve(dist, distDir),
      )
      if (!destination.isDirectory()) {
        warn(`[${command}]:`, `Creating directory <${destination.info.absolutePath}>`)
        mkdirSync(destination.info.absolutePath, {
          recursive: true,
        })
      }
      return {
        file: file.info,
        destination: destination.info.absolutePath,
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
    log(`[${command}]: webp done — ${processed} files in ${time.toFixed(2)}s`)
  }
}
