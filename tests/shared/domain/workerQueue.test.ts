import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { URL } from 'node:url'

import { runQueue } from '#/src/shared/domain/workerQueue.js'
import * as infrastructureLogger from '#/src/shared/infrastructure/logger.js'

interface StubItem {
  name: string
  bytes: number
  behavior: 'ok' | 'throw' | 'exit' | 'exit-once'
  marker?: string
  log?: string
}

const jobFile = new URL('../../fixtures/queue-worker.job.ts', import.meta.url)
const crashingJobFile = new URL('../../fixtures/queue-crash.job.ts', import.meta.url)
const root = mkdtempSync(join(tmpdir(), 'dvx-queue-'))

const item = (name: string, overrides: Partial<StubItem> = {}): StubItem => ({
  name,
  bytes: 100,
  behavior: 'ok',
  ...overrides,
})

const run = (
  items: StubItem[],
  options: {
    workerCount?: number
    maxAttempts?: number
    sizeOf?: (i: StubItem) => number
  } = {},
) =>
  runQueue<StubItem>(items, {
    label: 'test',
    logger: infrastructureLogger,
    workerCount: options.workerCount ?? 2,
    jobFile,
    maxAttempts: options.maxAttempts,
    sizeOf: options.sizeOf,
  })

describe('runQueue', () => {
  it('processes every item and sums the sizes reported by the handler', async () => {
    const result = await run([
      item('a', {
        bytes: 100,
      }),
      item('b', {
        bytes: 300,
      }),
      item('c', {
        bytes: 50,
      }),
    ])

    assert.deepEqual(result, {
      processed: 3,
      failed: 0,
      lost: 0,
      bytesIn: 450,
      bytesOut: 225,
    })
  })

  it('resolves with zero totals when there is nothing to do', async () => {
    const result = await run([])

    assert.deepEqual(result, {
      processed: 0,
      failed: 0,
      lost: 0,
      bytesIn: 0,
      bytesOut: 0,
    })
  })

  it('counts a handler that throws as failed and keeps going', async () => {
    const result = await run([
      item('a'),
      item('b', {
        behavior: 'throw',
      }),
      item('c'),
    ])

    assert.deepEqual(result, {
      processed: 2,
      failed: 1,
      lost: 0,
      bytesIn: 200,
      bytesOut: 100,
    })
  })

  it('retries an item whose worker exits, and completes it on another worker', async () => {
    const marker = join(root, 'exit-once.marker')
    const result = await run([
      item('crashy', {
        behavior: 'exit-once',
        marker,
      }),
      item('ok'),
    ])

    assert.equal(result.processed, 2)
    assert.equal(result.failed, 0)
    assert.equal(result.lost, 0)
  })

  it('gives up on an item after maxAttempts worker crashes and reports it as lost', async () => {
    const result = await run(
      [
        item('poison', {
          behavior: 'exit',
        }),
        item('ok'),
      ],
      {
        maxAttempts: 2,
      },
    )

    assert.equal(result.processed, 1)
    assert.equal(result.lost, 1)
  })

  it('replaces a dead worker so the items queued behind a poison item still run', async () => {
    const result = await run(
      [
        item('poison', {
          behavior: 'exit',
        }),
        item('ok'),
      ],
      {
        workerCount: 1,
        maxAttempts: 2,
      },
    )

    assert.equal(result.processed, 1)
    assert.equal(result.lost, 1)
  })

  it('gives up instead of respawning forever when workers die on startup', async () => {
    await assert.rejects(
      runQueue(
        [
          item('a'),
        ],
        {
          label: 'test',
          logger: infrastructureLogger,
          workerCount: 1,
          jobFile: crashingJobFile,
          maxAttempts: 2,
        },
      ),
      {
        message: /all workers stopped with 1 items left/,
      },
    )
  })

  it('hands out the largest items first when sizeOf is given', async () => {
    const log = join(root, 'order.log')
    const items = [
      item('small', {
        bytes: 10,
        log,
      }),
      item('huge', {
        bytes: 1000,
        log,
      }),
      item('medium', {
        bytes: 500,
        log,
      }),
    ]

    await run(items, {
      workerCount: 1,
      sizeOf: (i) => i.bytes,
    })

    assert.equal(readFileSync(log, 'utf8'), 'huge\nmedium\nsmall\n')
  })
})
