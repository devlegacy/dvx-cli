import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import { resolve } from 'node:path'
import { performance } from 'node:perf_hooks'

import sharp from 'sharp'

import {
  //  error,
  log,
} from '#@/src/shared/domain/console.js'

const promises = []
if (!isMainThread) {
  const startsAt = performance.now()
  const { files, command } = workerData
  for (const fileInfo of files) {
    const { file, destination } = fileInfo

    const fileName = resolve(destination, `${file.name}.webp`)
    promises.push(
      sharp(file.absolutePath)
        .webp({
          quality: 85, // Good balance of quality/size (75-85 recommended)
          effort: 4, // Compression effort (0-6, higher = better compression)
          lossless: false, // Use lossy compression for smaller files
          nearLossless: false, // Optional: true for better quality at cost of size
          smartSubsample: true, // Better chroma subsampling

          preset: 'default',
          alphaQuality: 80, // for images with transparency
        })
        .toFile(fileName)
        .then(() => log(`[${command}]:`, fileName)),
    )
  }
  Promise.allSettled(promises).then(() => {
    parentPort?.postMessage({
      processed: files.length,
      endTime: (performance.now() - startsAt) / 1000,
    })
  })
  // .catch((e) => error(`[${command}]:`, `${e instanceof Error ? e.message : 'unknown error'}`))
}
