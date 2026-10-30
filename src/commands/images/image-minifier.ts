import { statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import type { URL } from 'node:url'
import { isMainThread } from 'node:worker_threads'
import { File } from '#/src/shared/domain/file.js'
import { formatSizeDelta } from '#/src/shared/domain/formatBytes.js'
import type { Quality } from '#/src/shared/domain/quality-presets.js'
import { workerCountFor } from '#/src/shared/domain/workerCount.js'
import { runQueue } from '#/src/shared/domain/workerQueue.js'
import { error, log } from '#/src/shared/infrastructure/logger.js'
import type { MinifyFile } from './imagemin-minifier.job.js'

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
    // Skip sources whose optimized copy is already newer, so re-runs only touch changed images
    const isUpToDate = (source: string, destination: string) => {
      try {
        return statSync(destination).mtimeMs >= statSync(source).mtimeMs
      } catch {
        return false
      }
    }
    const pending = files.filter(
      ({ source, destination }) =>
        !isUpToDate(resolve(src.info.absolutePath, source), resolve(destination, basename(source))),
    )
    const skipped = files.length - pending.length
    if (skipped > 0) log(`[${command}]: ${skipped} up to date, skipped`)
    if (pending.length === 0) {
      log(`[${command}]: minify done — nothing to do`)
      return
    }

    const startedAt = performance.now()
    try {
      const { processed, bytesIn, bytesOut, failed, lost } = await runQueue<MinifyFile>(pending, {
        label: command,
        workerCount: workerCountFor(pending.length),
        jobFile,
        workerData: {
          command,
          quality,
        },
        // Largest files first: they are the slowest, so starting them early keeps the last worker from straggling
        sizeOf: (file) => statSync(resolve(src.info.absolutePath, file.source)).size,
      })
      const time = (performance.now() - startedAt) / 1000
      const sizes = bytesIn > 0 ? `, ${formatSizeDelta(bytesIn, bytesOut)}` : ''
      log(
        `[${command}]: minify done — ${processed} files${failed + lost > 0 ? `, ${failed + lost} failed` : ''}${sizes} in ${time.toFixed(2)}s`,
      )
      if (failed + lost > 0) process.exitCode = 1
    } catch (e) {
      error(`[${command}]: minify failed — ${e instanceof Error ? e.message : 'unknown error'}`)
    }
  }
}
