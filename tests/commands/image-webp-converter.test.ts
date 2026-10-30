import assert from 'node:assert/strict'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { URL } from 'node:url'
import sharp from 'sharp'

import { webPConverter } from '#/src/commands/images/image-webp-converter.js'

const jobFile = new URL('../../src/commands/images/sharp-webp-converter.job.ts', import.meta.url)

const images = [
  'a/one.png',
  'a/b/two.jpg',
  'three.gif',
]

function createImage(path: string) {
  const image = sharp({
    create: {
      width: 8,
      height: 8,
      channels: 3,
      background: {
        r: 255,
        g: 0,
        b: 0,
      },
    },
  })
  if (path.endsWith('.png')) return image.png().toFile(path)
  if (path.endsWith('.gif')) return image.gif().toFile(path)
  return image.jpeg().toFile(path)
}

describe('webPConverter', () => {
  const root = mkdtempSync(join(tmpdir(), 'dvx-img-webp-'))
  const source = join(root, 'src')
  const distribution = join(root, 'dist')

  before(async () => {
    await Promise.all(
      images.map((image) => {
        const path = join(source, image)
        mkdirSync(dirname(path), {
          recursive: true,
        })
        return createImage(path)
      }),
    )
  })
  after(() => {
    rmSync(root, {
      recursive: true,
      force: true,
    })
  })

  it('converts nested images to .webp keeping the directory structure', async () => {
    await webPConverter(
      {
        source,
        distribution,
        command: 'img:towebp',
      },
      jobFile,
    )

    for (const expected of [
      'a/one.webp',
      'a/b/two.webp',
      'three.webp',
    ]) {
      const destination = join(distribution, expected)
      assert.ok(existsSync(destination), `expected <${destination}> to exist`)
      assert.ok(lstatSync(destination).isFile(), `expected <${destination}> to be a file`)
    }
    const { format } = await sharp(join(distribution, 'a/one.webp')).metadata()
    assert.equal(format, 'webp')
  })
})
