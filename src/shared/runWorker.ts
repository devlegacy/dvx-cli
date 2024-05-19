import { type URL } from 'node:url'
import { Worker } from 'node:worker_threads'

export const runWorker = (workerData: any, filename: URL) =>
  new Promise((resolve: (value?: void) => void, reject) => {
    const worker = new Worker(filename, {
      workerData,
    })
    worker
      .on('message', (message) => {
        console.log(message)
        resolve()
      })
      .on('error', (err) => {
        console.error('error', err)
        reject(err)
      })
      .on('exit', (code) => {
        if (code !== 0) {
          const message = `Worker stopped with exit code ${code}`
          console.error(message)
          reject(new Error(message))
        }
      })
  })
