import { mkdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { isMainThread } from 'node:worker_threads'
import { File } from '#/src/shared/domain/file.js'
import { formatSizeDelta } from '#/src/shared/domain/formatBytes.js'
import { type Quality } from '#/src/shared/domain/quality-presets.js'
import { sharpThreadsFor, workerCountFor } from '#/src/shared/domain/workerCount.js'
import { runQueue } from '#/src/shared/domain/workerQueue.js'
import { error, log, warn } from '#/src/shared/infrastructure/logger.js'
import { type WebpFile } from './sharp-webp-converter.job.js'

export async function webPConverter(
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
      } satisfies WebpFile
    })

    const startedAt = performance.now()
    try {
      const workerCount = workerCountFor(files.length)
      const { processed, bytesIn, bytesOut, failed, lost } = await runQueue<WebpFile>(files, {
        label: command,
        logger: {
          log,
          error,
        },
        workerCount,
        jobFile,
        workerData: {
          command,
          quality,
          sharpThreads: sharpThreadsFor(workerCount),
        },
        sizeOf: ({ file }) => statSync(file.absolutePath).size,
      })
      const time = (performance.now() - startedAt) / 1000
      const sizes = bytesIn > 0 ? `, ${formatSizeDelta(bytesIn, bytesOut)}` : ''
      log(
        `[${command}]: webp done — ${processed} files${failed + lost > 0 ? `, ${failed + lost} failed` : ''}${sizes} in ${time.toFixed(2)}s`,
      )
      if (failed + lost > 0) process.exitCode = 1
    } catch (e) {
      error(`[${command}]: webp failed — ${e instanceof Error ? e.message : 'unknown error'}`)
    }
  }
}
