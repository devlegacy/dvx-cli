import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import { extname } from 'node:path'
import { performance } from 'node:perf_hooks'
import { execSync } from 'node:child_process'

import sharp from 'sharp'

import { error, log } from '#@/src/shared/helpers/console.js'
import { exit } from 'node:process'
import { Shell } from '#@/src/shared/lib/shell.js'

const useMogrify = async (file: any, width: any = 1024, height: any) => {
  const mogrify = 'mogrify'
  try {
    if (!Shell.exists(mogrify)) {
      throw new Error(`The command ${mogrify} does not exist.`)
    }

    const ext = extname(file).toLowerCase()
    let stdOut = ''
    const resize = height
      ? `-resize \"${width}x${height}\" -extent \"${width}x${height}\" `
      : `-resize \"${width}>\"`
    // console.log(resize); -path processed
    if (ext.includes('.jpg')) {
      const command = `${mogrify} -verbose -format jpg -layers Dispose ${resize} ${file}`
      stdOut = execSync(command).toString()
    } else if (ext.includes('.jpeg')) {
      const command = `${mogrify} -verbose -format jpeg -layers Dispose ${resize} ${file}`
      stdOut = execSync(command).toString()
    } else if (ext.includes('.png')) {
      const command = `${mogrify} -verbose -format png ${resize} ${file}`
      stdOut = execSync(command).toString()
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
