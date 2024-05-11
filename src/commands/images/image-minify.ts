import { join, resolve } from 'node:path'
import { exit } from 'node:process'

import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'
import imageminPngquant from 'imagemin-pngquant'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminZopfli from 'imagemin-zopfli'
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminGiflossy from 'imagemin-giflossy'

import imageminSvgo from '#@/src/shared/imagemin-svgo.js'
import { error, success, warn } from '#@/src/shared/helpers/console.js'
import { File } from '#@/src/shared/lib/file.js'
import { Notify } from '#@/src/shared/lib/notify.js'
import { YargsCommand } from '#@/src/shared/yargs-command.js'

class ImageMinify extends YargsCommand {
  readonly command = 'img:minify'

  readonly builder = this.options({
    source: {
      alias: 'src',
      describe: 'Source path without optimization.',
      type: 'string',
      default: 'src/assets/img/src',
    },
    distribution: {
      alias: 'dist',
      describe: 'Distribution path for optimized images.',
      type: 'string',
      default: 'src/assets/img/dist',
    },
  } as const)

  readonly description = 'Minify images'

  async handler(args: ArgumentsCamelCase<InferredOptionTypes<typeof this.builder>>) {
    console.time(this.command)
    await minify(args)
    console.timeEnd(this.command)
    Notify.info('Minify', 'Minify images task has ended')
  }
}

async function minify({ source, distribution }: { source: string; distribution: string }) {
  const src = File.find(source)
  if (!src.isDirectory()) {
    error(imageMinify.command, `\nDirectory ${src.info.absolutePath} not found`)
    exit(0)
  }

  warn(imageMinify.command, 'Search in:', src.info.absolutePath)
  const dist = File.find(distribution)
  warn(imageMinify.command, 'Result in:', dist.info.absolutePath)

  // Notify.info('Minify', 'Start minify image task');

  const files = File.sync('**/*.{png,jpeg,jpg,gif,svg}', {
    cwd: src.info.absolutePath,
    absolute: true,
  }).map((filePath) => {
    const file = File.find(filePath)
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
      file: filePath,
      destination,
      ext: file.info.ext.toLocaleLowerCase(),
    }
  })

  for (const fileInfo of files) {
    const { file, destination, ext } = fileInfo
    const plugins = [
      ...(['.png'].includes(ext)
        ? [
            imageminPngquant({
              speed: 1,
              quality: [0.6, 0.8], //98 //lossy settings
            }),
            imageminZopfli({
              more: true,
            }),
          ]
        : []),
      ...(['.gif'].includes(ext)
        ? [
            imageminGiflossy({
              optimizationLevel: 3,
              optimize: 3, //keep-empty: Preserve empty transparent frames
              lossy: 2,
            }),
          ]
        : []),
      ...(['.svg'].includes(ext)
        ? [
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
          ]
        : []),
      ...(['.jpg', '.jpeg'].includes(ext)
        ? [
            imageminJpegtran({
              progressive: true,
            }),
            imageminMozjpeg({
              quality: 90,
            }),
          ]
        : []),
    ]

    try {
      const images = await imagemin([file], {
        destination,
        plugins,
      })
      // Note: Extra process, evaluate
      // File.find(images[0].sourcePath).info.path
      // File.find(images[0].destinationPath).info.path
      success(
        imageMinify.command,
        '\n[from]\t:',
        images[0]!.sourcePath,
        '\n[to]\t:',
        images[0]!.destinationPath,
      )
      //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
    } catch (e) {
      error(imageMinify.command, `${file}\n${e}`)
    }
  }
}

const imageMinify = new ImageMinify()

export { imageMinify, minify }
