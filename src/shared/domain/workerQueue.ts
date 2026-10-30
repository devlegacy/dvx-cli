import type { URL } from 'node:url'
import { parentPort, Worker } from 'node:worker_threads'

import { error, log } from '#/src/shared/infrastructure/logger.js'

export interface QueueStats {
  bytesIn?: number
  bytesOut?: number
}

export interface QueueResult {
  processed: number
  failed: number
  lost: number
  bytesIn: number
  bytesOut: number
}

export interface QueueOptions<T> {
  label: string
  workerCount: number
  jobFile: URL
  workerData?: object
  // Items that were in flight when a worker died are retried until this many attempts
  maxAttempts?: number
  // When set, the largest items are handed out first
  sizeOf?: (item: T) => number
}

type QueueRequest<T> = { type: 'item'; item: T } | { type: 'stop' }
type QueueReply = { type: 'idle'; failed?: boolean } & QueueStats

interface Entry<T> {
  item: T
  attempts: number
}

// Main thread: hands items to idle workers one at a time, so a worker that finishes early
// keeps taking work instead of waiting on a fixed chunk
export const runQueue = <T>(items: T[], options: QueueOptions<T>) =>
  new Promise<QueueResult>((succeed, fail) => {
    const { label, workerCount, jobFile, workerData, maxAttempts = 2, sizeOf } = options
    const ordered = sizeOf ? [...items].sort((a, b) => sizeOf(b) - sizeOf(a)) : items
    const queue: Entry<T>[] = ordered.map((item) => ({ item, attempts: 0 }))
    const result: QueueResult = { processed: 0, failed: 0, lost: 0, bytesIn: 0, bytesOut: 0 }

    const idle: Worker[] = []
    const inflight = new Map<Worker, Entry<T>>()
    const workers: Worker[] = []
    const finished = new Set<Worker>()

    const settle = () => {
      if (finished.size < workers.length) return
      const left = queue.length + inflight.size
      if (left > 0) fail(new Error(`all workers stopped with ${left} items left`))
      else succeed(result)
    }
    const finish = (worker: Worker) => {
      if (finished.has(worker)) return
      finished.add(worker)
      settle()
    }
    // Hand work to idle workers; once nothing is queued or running, release them
    const pump = () => {
      while (queue.length > 0 && idle.length > 0) {
        const worker = idle.shift() as Worker
        const entry = queue.shift() as Entry<T>
        entry.attempts++
        inflight.set(worker, entry)
        worker.postMessage({ type: 'item', item: entry.item } satisfies QueueRequest<T>)
      }
      if (queue.length === 0 && inflight.size === 0) {
        for (const worker of idle.splice(0)) worker.postMessage({ type: 'stop' } satisfies QueueRequest<T>)
      }
    }
    // A worker that exits (crash, error or process.exit) takes its item with it: retry it elsewhere
    const release = (worker: Worker) => {
      const entry = inflight.get(worker)
      if (!entry) return
      inflight.delete(worker)
      if (entry.attempts < maxAttempts) {
        queue.unshift(entry)
        log(`[${label}]:`, `retrying an item after a worker failed (attempt ${entry.attempts + 1}/${maxAttempts})`)
      } else {
        result.lost++
        error(`[${label}]:`, 'an item was lost after repeated worker failures')
      }
    }

    // Replacements are bounded: every item can cost at most maxAttempts crashes, plus the initial pool.
    // Without this bound, a job that dies on startup would respawn forever.
    let replacementsLeft = items.length * maxAttempts + workerCount

    const spawn = () => {
      const worker = new Worker(jobFile, { workerData })
      workers.push(worker)
      worker.on('message', (reply: QueueReply) => {
        if (inflight.delete(worker)) {
          if (reply.failed) result.failed++
          else result.processed++
        }
        result.bytesIn += reply.bytesIn ?? 0
        result.bytesOut += reply.bytesOut ?? 0
        idle.push(worker)
        pump()
      })
      worker.on('error', (err: Error) => {
        log(`[${label}]:`, `worker failed: ${err.message}`)
        onDeath(worker)
      })
      worker.on('exit', () => onDeath(worker))
    }
    // A dead worker's item goes back to the queue; if work is still waiting, a replacement takes its place
    // (spawned before finish(), so settle() doesn't see a pool with no live workers yet)
    const onDeath = (worker: Worker) => {
      if (finished.has(worker)) return
      release(worker)
      if (queue.length > 0 && replacementsLeft > 0) {
        replacementsLeft--
        spawn()
      }
      finish(worker)
      pump()
    }

    for (let i = 0; i < workerCount; i++) spawn()
  })

// Worker thread: processes one item per request and reports back when it is idle again
// Errors thrown by the handler are logged under `label` and reported as failed items
export const serveQueue = <T>(handler: (item: T) => Promise<QueueStats | void>, label: string) => {
  parentPort?.on('message', async (request: QueueRequest<T>) => {
    if (request.type === 'stop') {
      parentPort?.close()
      return
    }
    let reply: QueueReply = { type: 'idle' }
    try {
      const stats = (await handler(request.item)) as QueueStats | undefined
      reply = { type: 'idle', bytesIn: stats?.bytesIn, bytesOut: stats?.bytesOut }
    } catch (e) {
      reply = { type: 'idle', failed: true }
      error(`[${label}]:`, e instanceof Error ? e.message : e)
    }
    parentPort?.postMessage(reply)
  })
  parentPort?.postMessage({ type: 'idle' } satisfies QueueReply)
}
