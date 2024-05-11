import { extname } from 'node:path'
import { writeFileSync } from 'node:fs'

import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'
import shelljs from 'shelljs'
import sharp from 'sharp'

import { error, log, warn } from '#@/src/shared/helpers/console.js'
import { File } from '#@/src/shared/lib/file.js'
import { Notify } from '#@/src/shared/lib/notify.js'
import { YargsCommand } from '#@/src/shared/yargs-command.js'

const { exec, exit, which } = shelljs

class ImageResize extends YargsCommand {
  readonly command = 'img:resize'

  readonly builder = this.options({
    source: {
      alias: 'src',
      describe: 'Source path of the images to resize',
      type: 'string',
      default: 'src/assets/img/dist',
    },
    width: {
      alias: 'w',
      type: 'number',
      describe: 'Set the width',
      default: 1024,
    },
    height: {
      alias: 'h',
      type: 'number',
      describe: 'Set the height',
    },
    tool: {
      alias: 't',
      describe: 'Tool to use',
      type: 'string',
      default: 'sharp',
      choices: ['sharp', 'mogrify'],
    },
    exclude: {
      alias: 'e',
      describe: 'Files to exclude / ignore, separated by spaces',
      type: 'array',
      default: ['opengraph'],
    },
  } as const)

  readonly description = 'Resize images, fixes to 1024px width'

  constructor() {
    super()
  }

  async handler(args: ArgumentsCamelCase<InferredOptionTypes<typeof this.builder>>) {
    console.time(this.command)
    // @ts-ignore
    await resize(args)
    console.timeEnd(this.command)
    Notify.info('Resize', 'End resize images task')
  }
}

async function resize({
  source,
  width,
  height,
  tool,
  exclude,
}: {
  source: string
  exclude: string[]
  tool: string
  width: number
  height?: number
}) {
  const src = File.find(source)

  if (!src.isDirectory()) {
    error(imageResize.command, `Directory ${src.info.absolutePath} not found`)
    exit(0)
  }

  const files = File.sync('**/*.{png,jpe?g}', {
    cwd: src.info.absolutePath,
    absolute: true,
  }).filter((file) => {
    let include = true
    for (const patter of exclude) {
      if (file.includes(patter.toString())) {
        warn('[Resize]:', `File excluded: ${file}, contains: ${exclude}`)
        include = !include
        break
      }
    }

    return include
  })

  for (const file of files) {
    if (tool === 'mogrify') {
      await useMogrify(file, width, height)
    } else if (tool === 'sharp') {
      await useSharp(file, width, height, src)
    }
  }
}
const useMogrify = async (file: any, width: any = 1024, height: any) => {
  const mogrify = 'mogrify'
  try {
    if (!which(mogrify)) {
      throw new Error(`The command ${mogrify} does not exist.`)
    }

    const ext = extname(file).toLowerCase()
    let stdOut = ''
    const resize = height
      ? `-resize \"${width}x${height}\" -extent \"${width}x${height}\" `
      : `-resize \"${width}>\"`
    // console.log(resize); -path processed
    if (ext.includes('.jpg')) {
      stdOut = exec(`${mogrify} -verbose -format jpg -layers Dispose ${resize} ${file}`, {
        async: false,
        silent: true,
      }).stdout
    } else if (ext.includes('.jpeg')) {
      stdOut = exec(`${mogrify} -verbose -format jpeg -layers Dispose ${resize} ${file}`, {
        async: false,
        silent: true,
      }).stdout
    } else if (ext.includes('.png')) {
      stdOut = exec(`${mogrify} -verbose -format png ${resize} ${file}`, {
        async: false,
        silent: true,
      }).stdout
    }
    log('[Resize]:', stdOut)
  } catch (e) {
    error('[Resize - Error]:', e)
    exit(1)
  }
}

const useSharp = async (
  file: string,
  width: number | undefined = 1024,
  height: number | undefined,
  src: File,
) => {
  const opts = {
    width,
    height,
  }

  const sharpFile = sharp(file)
  const resizeFile = sharpFile.resize({
    ...opts,
    withoutEnlargement: true,
  })
  resizeFile.toBuffer(function (err, buffer) {
    writeFileSync(file, buffer)
    log('[Resize]:', file)
  })
}

const imageResize = new ImageResize()

export { imageResize, resize }
