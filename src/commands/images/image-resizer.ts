import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import type { URL } from 'node:url'
import { isMainThread } from 'node:worker_threads'
import { File } from '#/src/shared/domain/file.js'
import { sharpThreadsFor, workerCountFor } from '#/src/shared/domain/workerCount.js'
import { runQueue } from '#/src/shared/domain/workerQueue.js'
import { error, log } from '#/src/shared/infrastructure/logger.js'

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
    if (files.length === 0) {
      log(`[${command}]: resize done — nothing to do`)
      return
    }

    const startedAt = performance.now()
    try {
      const workerCount = workerCountFor(files.length)
      const { processed, failed, lost } = await runQueue<string>(files, {
        label: command,
        workerCount,
        jobFile,
        workerData: {
          width,
          height,
          tool,
          command,
          sharpThreads: sharpThreadsFor(workerCount),
        },
        sizeOf: (file) => statSync(resolve(src.info.absolutePath, file)).size,
      })
      const time = (performance.now() - startedAt) / 1000
      log(
        `[${command}]: resize done — ${processed} files${failed + lost > 0 ? `, ${failed + lost} failed` : ''} in ${time.toFixed(2)}s`,
      )
      if (failed + lost > 0) process.exitCode = 1
    } catch (e) {
      error(`[${command}]: resize failed — ${e instanceof Error ? e.message : 'unknown error'}`)
    }
  }
}
