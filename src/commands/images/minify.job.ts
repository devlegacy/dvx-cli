import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import { performance } from 'node:perf_hooks'

import imageminPngquant from 'imagemin-pngquant'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminZopfli from 'imagemin-zopfli'
import imagemin, { type Plugin } from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminGiflossy from 'imagemin-giflossy'

import imageminSvgo from '#@/src/shared/imagemin-svgo.js'
import {
  // error,
  log,
  //  success
} from '#@/src/shared/helpers/console.js'

const jpgPlugins = [
  imageminJpegtran({
    progressive: true,
  }),
  imageminMozjpeg({
    quality: 90,
  }),
]
const imageminPlugins = {
  '.png': [
    imageminPngquant({
      speed: 1,
      quality: [0.6, 0.8], //98 //lossy settings
    }),
    imageminZopfli({
      more: true,
    }),
  ],
  '.gif': [
    imageminGiflossy({
      optimizationLevel: 3,
      optimize: 3, //keep-empty: Preserve empty transparent frames
      lossy: 2,
    }),
  ],
  '.svg': [
    imageminSvgo({
      plugins: [
        {
          name: 'preset-default',
        },
        {
          name: 'removeViewBox',
          // @ts-ignore
          active: true,
        },
        {
          name: 'cleanupIds',
          // @ts-ignore
          active: false,
        },
        {
          name: 'sortAttrs',
          params: {
            xmlnsOrder: 'alphabetical',
          },
        },
      ],
    }),
  ],
  '.jpg': jpgPlugins,
  '.jpeg': jpgPlugins,
}
const promises = []
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
    const plugins = imageminPlugins[ext as keyof typeof imageminPlugins] as readonly Plugin[]
    promises.push(
      imagemin([source], {
        destination,
        plugins,
      }).then((images) => {
        // Note: Extra process, evaluate
        // File.find(images[0].sourcePath).info.path
        // File.find(images[0].destinationPath).info.path
        log(
          `[${command}]:`,
          '\n[from]\t:',
          images[0]!.sourcePath,
          '\n[to]\t:',
          images[0]!.destinationPath,
        )
        //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
      }),
    )
  }
  Promise.allSettled(promises).then(() => {
    parentPort?.postMessage({
      processed: files.length,
      endTime: (performance.now() - startsAt) / 1000,
    })
  })
  // .catch((e) => {
  //   error(`[${command}]:`, `${e instanceof Error ? e.message : 'unknown error'}`)
  // })
}
