import assert from 'node:assert/strict'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { URL } from 'node:url'
import sharp from 'sharp'

import { imageMinifier } from '#/src/commands/images/image-minifier.js'

// Worker threads inherit execArgv, so the TS job file loads through the same
// @swc-node/register hooks that run this test
const jobFile = new URL('../../src/commands/images/imagemin-minifier.job.ts', import.meta.url)

// Multiple images per directory and multiple nesting levels: guards against
// destination paths resolving to a directory instead of a complete file path
const images = [
  'olimpicos/berlin-logo.png',
  'olimpicos/maraton-intro.jpg',
  'prueba/daft-punk.jpeg',
  'prueba/nodejs.png',
  'prueba/spinner.gif',
  'maps/nested/plano.jpg',
  'svg/logo.svg',
]

const svgStub =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" fill="#f00"/></svg>'

async function createImage(path: string) {
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

describe('imageMinifier', () => {
  const root = mkdtempSync(join(tmpdir(), 'dvx-img-minify-'))
  const source = join(root, 'src')
  const distribution = join(root, 'dist')

  before(async () => {
    for (const image of images) {
      const path = join(source, image)
      mkdirSync(dirname(path), {
        recursive: true,
      })
      if (image.endsWith('.svg')) {
        writeFileSync(path, svgStub)
        continue
      }
      await createImage(path)
    }
  })
  after(() => {
    rmSync(root, {
      recursive: true,
      force: true,
    })
  })

  it('writes every nested source image to a complete destination file path', async () => {
    await imageMinifier(
      {
        source,
        distribution,
        command: 'img:minify',
      },
      jobFile,
    )

    for (const image of images) {
      const destination = join(distribution, image)
      assert.ok(existsSync(destination), `expected <${destination}> to exist`)
      assert.ok(lstatSync(destination).isFile(), `expected <${destination}> to be a file, not a directory`)
    }
  })
})
