import { appendFileSync, existsSync, writeFileSync } from 'node:fs'
import { isMainThread } from 'node:worker_threads'

import { serveQueue } from '#/src/shared/domain/workerQueue.js'

interface StubItem {
  name: string
  bytes: number
  // ok: succeed · throw: handler error · exit: worker dies every time · exit-once: dies only while `marker` is missing
  behavior: 'ok' | 'throw' | 'exit' | 'exit-once'
  marker?: string
  // When set, the item's name is appended here, so tests can observe the processing order
  log?: string
}

if (!isMainThread) {
  serveQueue<StubItem>(async (item) => {
    if (item.log) appendFileSync(item.log, `${item.name}\n`)
    if (item.behavior === 'throw') throw new Error(`boom ${item.name}`)
    if (item.behavior === 'exit') process.exit(1)
    if (item.behavior === 'exit-once' && item.marker && !existsSync(item.marker)) {
      writeFileSync(item.marker, '')
      process.exit(1)
    }
    return { bytesIn: item.bytes, bytesOut: Math.floor(item.bytes / 2) }
  }, 'stub')
}
