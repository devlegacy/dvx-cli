import type { URL } from 'node:url'
import { Worker } from 'node:worker_threads'

import { error } from '#/src/shared/infrastructure/logger.js'

export interface WorkerResult {
  processed: number
  endTime: number
  bytesIn?: number
  bytesOut?: number
}

export const summarizeWorkerResults = (results: PromiseSettledResult<WorkerResult>[]) => {
  const fulfilled = results.filter((r): r is PromiseFulfilledResult<WorkerResult> => r.status === 'fulfilled')
  return {
    processed: fulfilled.reduce((sum, r) => sum + r.value.processed, 0),
    time: fulfilled.reduce((max, r) => Math.max(max, r.value.endTime), 0),
    bytesIn: fulfilled.reduce((sum, r) => sum + (r.value.bytesIn ?? 0), 0),
    bytesOut: fulfilled.reduce((sum, r) => sum + (r.value.bytesOut ?? 0), 0),
  }
}

export const runWorker = <T = unknown>(workerData: T, filename: URL) =>
  new Promise<WorkerResult>((resolve, reject) => {
    let settled = false
    const worker = new Worker(filename, {
      workerData,
    })
    worker
      .on('message', (data: WorkerResult) => {
        settled = true
        resolve(data)
      })
      .on('error', (err) => {
        settled = true
        error(err)
        reject(err)
      })
      .on('exit', (code) => {
        // A worker that dies before posting a result must settle the promise,
        // even with exit code 0, or the CLI hangs waiting on it forever
        if (settled) return
        const message = `Worker stopped with exit code ${code} before posting a result`
        error(message)
        reject(new Error(message))
      })
  })
