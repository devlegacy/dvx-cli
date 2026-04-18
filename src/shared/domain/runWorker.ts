import type { URL } from 'node:url'
import { Worker } from 'node:worker_threads'

import { error } from '#/src/shared/infrastructure/logger.js'

export interface WorkerResult {
  processed: number
  endTime: number
}

export const runWorker = <T = unknown>(workerData: T, filename: URL) =>
  new Promise<WorkerResult>((resolve, reject) => {
    const worker = new Worker(filename, {
      workerData,
    })
    worker
      .on('message', (data: WorkerResult) => {
        resolve(data)
      })
      .on('error', (err) => {
        error(err)
        reject(err)
      })
      .on('exit', (code) => {
        if (code !== 0) {
          const message = `Worker stopped with exit code ${code}`
          error(message)
          reject(new Error(message))
        }
      })
  })
