import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import { extname } from 'node:path'
import { performance } from 'node:perf_hooks'

import sharp from 'sharp'
import shelljs from 'shelljs'

import { error, log } from '#@/src/shared/helpers/console.js'

const { exec, exit, which } = shelljs

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
) => {
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
}
const promises = []

if (!isMainThread) {
  const startsAt = performance.now()
  const { files, width, height, tool, command } = workerData
  for (const file of files) {
    if (tool === 'mogrify') {
      promises.push(useMogrify(file, width, height))
    } else if (tool === 'sharp') {
      promises.push(useSharp(file, width, height).then(() => log(`[${command}]:`, file)))
    }
  }
  Promise.allSettled(promises).then(() => {
    parentPort?.postMessage({
      processed: files.length,
      endTime: (performance.now() - startsAt) / 1000,
    })
  })
  // .catch((e) => error(`[${command}]:`, `${e instanceof Error ? e.message : 'unknown error'}`))
}
