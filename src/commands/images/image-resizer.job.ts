import { execSync } from 'node:child_process'
import { extname } from 'node:path'
import { exit } from 'node:process'
import { isMainThread, workerData } from 'node:worker_threads'

import sharp from 'sharp'
import { Shell } from '#/src/shared/domain/shell.js'
import { serveQueue } from '#/src/shared/domain/workerQueue.js'
import { error, log } from '#/src/shared/infrastructure/logger.js'

const useMogrify = async (file: string, width: number = 1024, height: number | undefined, command: string) => {
  const mogrify = 'mogrify'
  try {
    if (!Shell.exists(mogrify)) {
      throw new Error(`The command ${mogrify} does not exist.`)
    }

    const ext = extname(file).toLowerCase()
    let stdOut = ''
    const resize = height ? `-resize "${width}x${height}" -extent "${width}x${height}" ` : `-resize "${width}>"`
    if (ext.includes('.jpg')) {
      stdOut = execSync(`${mogrify} -verbose -format jpg -layers Dispose ${resize} ${file}`).toString()
    } else if (ext.includes('.jpeg')) {
      stdOut = execSync(`${mogrify} -verbose -format jpeg -layers Dispose ${resize} ${file}`).toString()
    } else if (ext.includes('.png')) {
      stdOut = execSync(`${mogrify} -verbose -format png ${resize} ${file}`).toString()
    }
    log(`[${command}]:`, stdOut)
  } catch (e) {
    error(`[${command}]:`, e)
    exit(1)
  }
}

const useSharp = async (
  file: string,
  width: number | undefined = 1024,
  height: number | undefined,
  command: string,
) => {
  const { width: w, height: h } = await sharp(file).metadata()
  const fitsWidth = (w ?? 0) <= (width ?? Infinity)
  const fitsHeight = !height || (h ?? 0) <= height
  if (fitsWidth && fitsHeight) return

  return sharp(file)
    .resize({
      width,
      height,
      withoutEnlargement: true,
      fit: sharp.fit.inside,
    })
    .sharpen()
    .toBuffer()
    .then((data) => sharp(data).toFile(file))
    .then(() => log(`[${command}]:`, file))
}

if (!isMainThread) {
  const { width, height, tool, command, sharpThreads } = workerData as {
    width: number
    height?: number
    tool: string
    command: string
    sharpThreads: number
  }
  sharp.concurrency(sharpThreads)
  const resizer = tool === 'mogrify' ? useMogrify : useSharp
  serveQueue<string>((file) => resizer(file, width, height, command), command)
}
