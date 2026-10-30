import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const cli = fileURLToPath(new URL('../../bin/index.js', import.meta.url))
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8')) as {
  version: string
}

const roots: string[] = []

function tempDir() {
  const dir = mkdtempSync(join(tmpdir(), 'dvx-cli-'))
  roots.push(dir)
  return dir
}

function dvx(cwd: string, args: string[]) {
  const { FORCE_COLOR: _ignored, ...base } = process.env
  const env = {
    ...base,
    NO_COLOR: '1',
  }
  const result = spawnSync(
    process.execPath,
    [
      cli,
      ...args,
    ],
    {
      cwd,
      encoding: 'utf8',
      env,
    },
  )
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    output: result.stdout + result.stderr,
  }
}

describe('cli (built bin/index.js)', () => {
  before(() => {
    if (!existsSync(cli)) throw new Error(`<${cli}> is missing: run pnpm run build first`)
  })
  after(() => {
    for (const root of roots)
      rmSync(root, {
        recursive: true,
        force: true,
      })
  })

  it('--help lists every command', () => {
    const { status, output } = dvx(tempDir(), [
      '--help',
    ])
    assert.equal(status, 0)
    for (const name of [
      'img:minify',
      'img:towebp',
      'img:resize',
      'img:optimize',
      'html:validate',
      'files:clean-sourcemaps',
    ]) {
      assert.ok(output.includes(name), `--help should list ${name}`)
    }
  })

  it('--version prints the package version', () => {
    const { status, output } = dvx(tempDir(), [
      '--version',
    ])
    assert.equal(status, 0)
    assert.ok(output.includes('Devexteam CLI'), output)
    assert.ok(output.includes(pkg.version), `expected version ${pkg.version} in: ${output}`)
  })

  it('html:validate accepts a valid document', () => {
    const cwd = tempDir()
    const dir = join(cwd, 'html')
    mkdirSync(dir)
    writeFileSync(
      join(dir, 'index.html'),
      '<!DOCTYPE html>\n<html lang="en">\n<head>\n<title>Ok</title>\n</head>\n<body>\n<p>hi</p>\n</body>\n</html>\n',
    )
    const { status, output } = dvx(cwd, [
      'html:validate',
      '--source',
      dir,
    ])
    assert.equal(status, 0, output)
    assert.ok(output.includes('No html errors'), output)
  })

  it('html:validate reports the violated rules for an invalid document (exit code stays 0)', () => {
    const cwd = tempDir()
    const dir = join(cwd, 'html')
    mkdirSync(dir)
    writeFileSync(join(dir, 'bad.html'), '<html><head><title>x</title></head><body><img src="a.png"></body></html>\n')
    const { status, output } = dvx(cwd, [
      'html:validate',
      '--source',
      dir,
    ])
    assert.equal(status, 0, output)
    assert.match(output, /Doctype must be declared|alt attribute must be present/)
  })

  it('files:clean-sourcemaps strips sourceMappingURL comments', () => {
    const cwd = tempDir()
    const css = join(cwd, 'node_modules', 'foo', 'style.css')
    mkdirSync(join(cwd, 'node_modules', 'foo'), {
      recursive: true,
    })
    writeFileSync(
      join(cwd, 'package.json'),
      JSON.stringify({
        devDependencies: {
          foo: '1.0.0',
        },
      }),
    )
    writeFileSync(css, 'a{color:red}\n/*# sourceMappingURL=style.css.map */\n')
    const { status, output } = dvx(cwd, [
      'files:clean-sourcemaps',
      '--source',
      join(cwd, 'node_modules'),
      '--packages',
      'foo',
    ])
    assert.equal(status, 0, output)
    assert.ok(!readFileSync(css, 'utf8').includes('sourceMappingURL'))
  })

  it('img:minify with an empty source has nothing to do', () => {
    const cwd = tempDir()
    const src = join(cwd, 'empty')
    mkdirSync(src)
    const { status, output } = dvx(cwd, [
      'img:minify',
      '--source',
      src,
      '--distribution',
      join(cwd, 'out'),
    ])
    assert.equal(status, 0, output)
    assert.ok(output.includes('nothing to do'), output)
  })
})
