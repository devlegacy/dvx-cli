import { closeSync, openSync, readSync, statSync } from 'node:fs'
import { isMainThread, workerData } from 'node:worker_threads'
import imagemin, { type Plugin } from 'imagemin'
import imageminGifsicle from 'imagemin-gifsicle'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminSvgo from 'imagemin-svgo'
import imageminZopfli from 'imagemin-zopfli'
import { formatSizeDelta } from '#/src/shared/domain/formatBytes.js'
import { QUALITY_PRESETS, type Quality, type QualityPreset } from '#/src/shared/domain/quality-presets.js'
import { serveQueue } from '#/src/shared/domain/workerQueue.js'
import { log } from '#/src/shared/infrastructure/logger.js'

// imagemin's plugins can hand back the input unchanged when it is not a valid image, so check the
// file's signature first and report a corrupt input as a failure instead of a successful no-op
const hasValidSignature = (path: string, ext: string) => {
  const buffer = Buffer.alloc(4096)
  const fd = openSync(path, 'r')
  let head: Buffer
  try {
    head = buffer.subarray(0, readSync(fd, buffer, 0, buffer.length, 0))
  } finally {
    closeSync(fd)
  }
  if (ext === '.png')
    return head.subarray(0, 8).equals(
      Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
      ]),
    )
  if (ext === '.jpg' || ext === '.jpeg') return head[0] === 0xff && head[1] === 0xd8
  if (ext === '.gif') return head.subarray(0, 4).toString('latin1') === 'GIF8'
  if (ext === '.svg') return head.toString('utf8').includes('<svg')
  return true
}

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

export interface MinifyFile {
  source: string
  destination: string
  ext: string
}

if (!isMainThread) {
  const { command, quality = 'medium' } = workerData as {
    command: string
    quality?: Quality
  }
  const imageminPlugins = buildPlugins(QUALITY_PRESETS[quality])

  serveQueue<MinifyFile>(async ({ source, destination, ext }) => {
    if (!hasValidSignature(source, ext)) throw new Error(`not a valid ${ext} file: ${source}`)
    const plugins = imageminPlugins[ext as keyof typeof imageminPlugins] as readonly Plugin[]
    const [image] = await imagemin(
      [
        source,
      ],
      {
        destination,
        plugins,
      },
    )
    // imagemin resolves with no output instead of throwing for some inputs: that is still a failure
    if (!image) throw new Error(`no output for ${source}`)
    const sourceSize = statSync(source).size
    const destinationSize = image.data.length
    log(`[${command}]:`, image.destinationPath, formatSizeDelta(sourceSize, destinationSize))
    return {
      bytesIn: sourceSize,
      bytesOut: destinationSize,
    }
  })
}
