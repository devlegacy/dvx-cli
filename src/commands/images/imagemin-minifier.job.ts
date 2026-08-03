import { performance } from 'node:perf_hooks'
import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import imagemin, { type Plugin } from 'imagemin'
import imageminGiflossy from 'imagemin-giflossy'
import imageminGifsicle from 'imagemin-gifsicle'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminSvgo from 'imagemin-svgo'
import imageminZopfli from 'imagemin-zopfli'

import { log } from '#/src/shared/domain/console.js'

const QUALITY_PRESETS = {
  high: {
    jpeg: 90,
    png: [
      0.7,
      0.9,
    ],
    webp: 85,
  },
  medium: {
    jpeg: 80,
    png: [
      0.65,
      0.85,
    ] as [
      number,
      number,
    ], // [0.6, 0.8]
    webp: 80,
  },
  low: {
    jpeg: 70,
    png: [
      0.5,
      0.7,
    ],
    webp: 75,
  },
}

const jpgPlugins = [
  imageminJpegtran({
    progressive: true,
  }),
  imageminMozjpeg({
    quality: QUALITY_PRESETS.medium.jpeg, // 80-85 min // 90 High quality
    progressive: true, // Already handled by jpegtran, but mozjpeg does it better
    arithmetic: false, // Keep false for better compatibility
    dct: 'int', // Use integer DCT for better quality
    quantTable: 3, // Use quality-based quantization table
  }),
]
type ImageMinPlugins = keyof typeof imageminPlugins
const imageminPlugins = {
  '.png': [
    imageminPngquant({
      speed: 1,
      quality: QUALITY_PRESETS.medium.png, // 98 // lossy settings
      strip: true, // remove metadata
      dithering: 1, // floyd-steinberg dithering for better gradients
    }),
    imageminZopfli({
      more: true,
      iterations: 15, // More iterations for better compression
    }),
  ],
  '.gif': [
    imageminGiflossy({
      optimizationLevel: 3,
      optimize: 3, //keep-empty: Preserve empty transparent frames
      lossy: 2,
      colors: 256, // Limit color palette
      interlaced: false, // Usually better for web
    }) as Plugin,
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
        // {
        //   name: 'removeViewBox',
        //   active: false,
        // },
        // {
        //   name: 'cleanupIds',
        //   // @ts-expect-error
        //   active: false,
        // },
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
const promises: Promise<void>[] = []
if (!isMainThread) {
  const startsAt = performance.now()
  const { files, command } = workerData as {
    files: {
      source: string
      destination: string
      ext: string
    }[]
    command: string
  }
  for (const file of files) {
    const { source, destination, ext } = file
    const plugins = imageminPlugins[ext as ImageMinPlugins] as readonly Plugin[]

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
          // NOTE: Extra process, evaluate
          // File.find(images[0].sourcePath).info.path
          // File.find(images[0].destinationPath).info.path
          log(`[${command}]:`, '\n[source]\t:', images[0]!.sourcePath, '\n[destination]\t:', images[0]!.destinationPath)
          //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
        })
        .catch((e) => {
          log(`[${command}]:`, `${e instanceof Error ? e.message : 'unknown error'}`)
        }),
    )
  }
  Promise.allSettled(promises).then((data) => {
    parentPort?.postMessage({
      processed: files.length,
      endTime: (performance.now() - startsAt) / 1000,
    })
  })
  // .catch((e) => {
  //   error(`[${command}]:`, `${e instanceof Error ? e.message : 'unknown error'}`)
  // })
}

// LDFLAGS="-L/usr/local/lib" CPPFLAGS="-I/usr/local/include" pnpm rebuild mozjpeg // is not working
