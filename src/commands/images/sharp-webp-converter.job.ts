import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { isMainThread, parentPort, workerData } from 'node:worker_threads'

import sharp from 'sharp'

import { log } from '#/src/shared/domain/console.js'
import { formatSizeDelta } from '#/src/shared/domain/formatBytes.js'
import { QUALITY_PRESETS, type Quality } from '#/src/shared/domain/quality-presets.js'

if (!isMainThread) {
  const startsAt = performance.now()
  const {
    files,
    command,
    quality = 'medium',
  } = workerData as {
    files: {
      file: {
        name: string
        absolutePath: string
      }
      destination: string
    }[]
    command: string
    quality?: Quality
  }
  const preset = QUALITY_PRESETS[quality]
  const promises: Promise<void>[] = []
  let bytesIn = 0
  let bytesOut = 0
  for (const fileInfo of files) {
    const { file, destination } = fileInfo

    const fileName = resolve(destination, `${file.name}.webp`)
    promises.push(
      sharp(file.absolutePath)
        .webp({
          quality: preset.webp,
          effort: 4, // Compression effort (0-6, higher = better compression)
          lossless: false, // Use lossy compression for smaller files
          nearLossless: false, // Optional: true for better quality at cost of size
          smartSubsample: true, // Better chroma subsampling

          preset: 'default',
          alphaQuality: 80, // for images with transparency
        })
        .toFile(fileName)
        .then((info) => {
          const sourceSize = statSync(file.absolutePath).size
          bytesIn += sourceSize
          bytesOut += info.size
          log(`[${command}]:`, fileName, formatSizeDelta(sourceSize, info.size))
        }),
    )
  }
  Promise.allSettled(promises).then(() => {
    parentPort?.postMessage({
      processed: files.length,
      endTime: (performance.now() - startsAt) / 1000,
      bytesIn,
      bytesOut,
    })
  })
}
