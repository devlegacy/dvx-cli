import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { isMainThread, workerData } from 'node:worker_threads'

import sharp from 'sharp'
import { formatSizeDelta } from '#/src/shared/domain/formatBytes.js'
import { QUALITY_PRESETS, type Quality } from '#/src/shared/domain/quality-presets.js'
import { serveQueue } from '#/src/shared/domain/workerQueue.js'
import { log } from '#/src/shared/infrastructure/logger.js'

export interface WebpFile {
  file: {
    name: string
    absolutePath: string
  }
  destination: string
}

if (!isMainThread) {
  const {
    command,
    quality = 'medium',
    sharpThreads,
  } = workerData as {
    command: string
    quality?: Quality
    sharpThreads: number
  }
  sharp.concurrency(sharpThreads)
  const preset = QUALITY_PRESETS[quality]

  serveQueue<WebpFile>(async ({ file, destination }) => {
    const fileName = resolve(destination, `${file.name}.webp`)
    const info = await sharp(file.absolutePath)
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
    const sourceSize = statSync(file.absolutePath).size
    log(`[${command}]:`, fileName, formatSizeDelta(sourceSize, info.size))
    return {
      bytesIn: sourceSize,
      bytesOut: info.size,
    }
  })
}
