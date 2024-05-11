import { join, resolve } from 'node:path'

import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'
import sharp from 'sharp'

import { error, log, warn } from '#@/src/shared/helpers/console.js'
import { File } from '#@/src/shared/lib/file.js'
import shelljs from 'shelljs'
import { Notify } from '#@/src/shared/lib/notify.js'
import { YargsCommand } from '#@/src/shared/yargs-command.js'

const { mkdir } = shelljs

class ImageToWebP extends YargsCommand {
  readonly command = 'img:towebp'

  readonly builder = this.options({
    source: {
      alias: 'src',
      describe: 'Source path of the images to convert webp.',
      type: 'string',
      default: 'src/assets/img/dist',
    },
    distribution: {
      alias: 'dist',
      describe: 'Distribution path for webp images.',
      type: 'string',
      default: 'src/assets/img/dist/webp',
    },
  } as const)

  readonly description = 'Format/Convert images to webp'

  async handler(args: ArgumentsCamelCase<InferredOptionTypes<typeof this.builder>>) {
    console.time(this.command)
    await towebp(args)
    console.timeEnd(this.command)
    Notify.info('To webp', 'End images to webp task')
  }
}

async function towebp({ source, distribution }: { source: string; distribution: string }) {
  const src = File.find(source)

  if (!src.isDirectory()) {
    error(imageToWebP.command, `Directory ${src.info.absolutePath} not found`)
    return
  }

  const dist = resolve(distribution)
  // Notify.info('To webp', 'Start images to webp task');

  const files = File.sync('**/*.{png,jpeg,jpg,gif}', {
    nodir: true,
    absolute: true,
    cwd: src.info.absolutePath,
  }).map((fileInfo) => {
    const file = File.find(fileInfo)
    const distDir = file.info.dir.replace(src.info.absolutePath, '')
    const destination = File.find(
      distDir.startsWith('\\') || distDir.startsWith('/')
        ? join(dist, distDir)
        : resolve(dist, distDir),
    )
    if (!destination.isDirectory()) {
      warn('[ToWebP]:', `Creating dir, ${destination.info.absolutePath}`)
      mkdir('-p', destination.info.absolutePath)
    }
    return {
      file,
      destination,
    }
  })

  for (const fileInfo of files) {
    const { file, destination } = fileInfo
    try {
      const fileName = resolve(destination.info.absolutePath, `${file.info.name}.webp`)
      const data = await sharp(file.info.absolutePath).webp({ lossless: true }).toBuffer()
      await sharp(data).toFile(fileName)
      log('[ToWebP]:', fileName)
    } catch (e) {
      error('[ToWebP]:', e)
    }
  }
}

const imageToWebP = new ImageToWebP()

export { imageToWebP, towebp }
