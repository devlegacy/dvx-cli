import { statSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import imagemin, { type Plugin } from 'imagemin'
import imageminGifsicle from 'imagemin-gifsicle'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminSvgo from 'imagemin-svgo'
import imageminZopfli from 'imagemin-zopfli'

import { log } from '#/src/shared/domain/console.js'
import { formatSizeDelta } from '#/src/shared/domain/formatBytes.js'
import { QUALITY_PRESETS, type Quality, type QualityPreset } from '#/src/shared/domain/quality-presets.js'

const buildPlugins = (preset: QualityPreset) => {
  const jpgPlugins = [
    // mozjpeg alone: running jpegtran first only added a redundant re-encode
    imageminMozjpeg({
      quality: preset.jpeg,
      progressive: true,
      arithmetic: false, // Keep false for better compatibility
      dct: 'int', // Use integer DCT for better quality
      quantTable: 3, // Use quality-based quantization table
    }),
  ]
  return {
    '.png': [
      imageminPngquant({
        speed: 1,
        quality: preset.png, // lossy settings
        strip: true, // remove metadata
        dithering: 1, // floyd-steinberg dithering for better gradients
      }),
      imageminZopfli({
        more: true,
        iterations: preset.zopfliIterations,
      }),
    ],
    '.gif': [
      // imagemin-giflossy: abandoned wrapper of the giflossy fork; its lossy flag was merged
      // upstream into gifsicle 1.92+, so the maintained imagemin-gifsicle is preferred
      imageminGifsicle({
        optimizationLevel: 3,
        colors: 256, // Limit color palette
        interlaced: false, // Usually better for web
      }),
    ],
    '.svg': [
      // @ts-expect-error plugins is not well typed
      imageminSvgo({
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                // removeViewBox: false, // Not part of preset-default in current SVGO version — configured below
                cleanupIds: false, // Keep IDs for external references
              },
            },
          },
          {
            name: 'removeViewBox',
            active: false, // Keep viewBox for responsive SVGs
          },
          {
            name: 'removeXMLProcInst',
            active: true,
          },
          {
            name: 'removeDimensions',
            active: true, // Remove width/height, keep viewBox
          },
          {
            name: 'sortAttrs',
            params: {
              xmlnsOrder: 'alphabetical',
            },
          },
        ],
      }) as Plugin,
    ],
    '.jpg': jpgPlugins,
    '.jpeg': jpgPlugins,
  }
}

if (!isMainThread) {
  const startsAt = performance.now()
  const {
    files,
    command,
    quality = 'medium',
  } = workerData as {
    files: {
      source: string
      destination: string
      ext: string
    }[]
    command: string
    quality?: Quality
  }
  const imageminPlugins = buildPlugins(QUALITY_PRESETS[quality])
  const promises: Promise<void>[] = []
  let bytesIn = 0
  let bytesOut = 0
  for (const file of files) {
    const { source, destination, ext } = file
    const plugins = imageminPlugins[ext as keyof typeof imageminPlugins] as readonly Plugin[]

    promises.push(
      imagemin(
        [
          source,
        ],
        {
          destination,
          plugins,
        },
      )
        .then((images) => {
          const image = images[0]
          if (!image) return
          const sourceSize = statSync(source).size
          const destinationSize = image.data.length
          bytesIn += sourceSize
          bytesOut += destinationSize
          log(`[${command}]:`, image.destinationPath, formatSizeDelta(sourceSize, destinationSize))
        })
        .catch((e) => {
          log(`[${command}]:`, `${e instanceof Error ? e.message : 'unknown error'}`)
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

// LDFLAGS="-L/usr/local/lib" CPPFLAGS="-I/usr/local/include" pnpm rebuild mozjpeg // is not working
