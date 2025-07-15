import { cpus } from 'node:os'
import { type URL } from 'node:url'

import { File } from '#@/src/shared/domain/file.js'
import { chunkArray } from '#@/src/shared/domain/chunkArray.js'
import { runWorker } from '#@/src/shared/domain/runWorker.js'
import { isMainThread } from 'node:worker_threads'
const tasks: Promise<void>[] = []

export async function imageResizer(
  {
    source,
    width,
    height,
    tool,
    exclude,
    command,
  }: {
    source: string
    exclude: readonly (string | number)[]
    tool: string
    width: number
    command: string
    height?: number
  },
  jobFile: URL,
) {
  if (isMainThread) {
    const src = File.find(source)
    if (!src.isDirectory()) {
      throw new Error(`Directory ${src.info.absolutePath} not found`)
    }

    const extensions = 'png,jpeg,jpg'
    const ignore = exclude.map((_) => `**/*${_}*.{${extensions}}`)
    const files = File.sync(`**/*.{${extensions}}`, {
      cwd: src.info.absolutePath,
      exclude: ignore,
    })
    const cpuCount = cpus().length - 1

    const chunkedTasks = chunkArray(files, cpuCount)
    for (const chunk of chunkedTasks) {
      tasks.push(
        runWorker(
          {
            files: chunk,
            width,
            height,
            tool,
            command,
          },
          jobFile,
        ),
      )
    }
    Promise.allSettled(tasks)
  }
}
