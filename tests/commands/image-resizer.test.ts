import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, beforeEach, describe, it } from 'node:test'
import { URL } from 'node:url'
import sharp from 'sharp'

import { imageResizer } from '#/src/commands/images/image-resizer.js'

// Worker threads inherit execArgv, so the TS job file loads through the same
// @swc-node/register hooks that run this test
const jobFile = new URL('../../src/commands/images/image-resizer.job.ts', import.meta.url)

async function createImage(path: string, width: number, height: number) {
  const image = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: {
        r: 0,
        g: 128,
        b: 255,
      },
    },
  })
  await (path.endsWith('.png') ? image.png() : image.jpeg()).toFile(path)
}

async function widthOf(path: string) {
  const { width } = await sharp(path).metadata()
  return width
}

describe('imageResizer', () => {
  const roots: string[] = []
  let source = ''

  beforeEach(async () => {
    source = mkdtempSync(join(tmpdir(), 'dvx-img-resize-'))
    roots.push(source)
    await createImage(join(source, 'big.jpg'), 2000, 1000)
    await createImage(join(source, 'small.png'), 500, 300)
    await createImage(join(source, 'banner-opengraph.png'), 2000, 1000)
  })
  after(() => {
    for (const root of roots)
      rmSync(root, {
        recursive: true,
        force: true,
      })
  })

  it('shrinks large images, skips small and excluded ones', async () => {
    await imageResizer(
      {
        source,
        width: 1024,
        tool: 'sharp',
        exclude: [
          'opengraph',
        ],
        command: 'img:resize',
      },
      jobFile,
    )

    assert.equal(await widthOf(join(source, 'big.jpg')), 1024)
    assert.equal(await widthOf(join(source, 'small.png')), 500)
    assert.equal(await widthOf(join(source, 'banner-opengraph.png')), 2000)
  })

  it('fits inside width and height bounds', async () => {
    await imageResizer(
      {
        source,
        width: 800,
        height: 300,
        tool: 'sharp',
        exclude: [
          'opengraph',
        ],
        command: 'img:resize',
      },
      jobFile,
    )

    const { width, height } = await sharp(join(source, 'big.jpg')).metadata()
    assert.ok(width !== undefined && width <= 800, `width ${width} exceeds 800`)
    assert.ok(height !== undefined && height <= 300, `height ${height} exceeds 300`)
  })
})
