import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))

const script = `import('#/src/shared/infrastructure/logger.js').then(({ log, warn, error }) => {
  log('[x]: hello')
  warn('[x]: careful')
  error('[x]: boom')
})`

function run(env: Record<string, string>) {
  const cleanEnv = {
    ...process.env,
  }
  for (const key of [
    'NO_COLOR',
    'FORCE_COLOR',
    'DVX_LOG_FORMAT',
    'DVX_LOG_LEVEL',
  ])
    delete cleanEnv[key]
  const result = spawnSync(
    process.execPath,
    [
      '--disable-warning=DEP0205',
      '--import',
      '@swc-node/register/esm-register',
      '-e',
      script,
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...cleanEnv,
        ...env,
      },
    },
  )
  if (result.status !== 0) throw new Error(`child failed: ${result.stderr}`)
  return result
}

describe('logger', () => {
  it('writes info to stdout and warn/error to stderr in text mode', () => {
    const { stdout, stderr } = run({
      NO_COLOR: '1',
    })
    assert.equal(stdout, '[x]: hello\n')
    assert.match(stderr, /WARN \[x\]: careful/)
    assert.match(stderr, /ERROR \[x\]: boom/)
  })

  it('emits JSON lines with msg and numeric level when DVX_LOG_FORMAT=json', () => {
    const { stdout } = run({
      NO_COLOR: '1',
      DVX_LOG_FORMAT: 'json',
    })
    const lines = stdout.trim().split('\n')
    assert.ok(lines.length > 0)
    for (const line of lines) {
      const entry = JSON.parse(line) as {
        msg: unknown
        level: unknown
      }
      assert.equal(typeof entry.msg, 'string')
      assert.equal(typeof entry.level, 'number')
    }
  })

  it('suppresses info when DVX_LOG_LEVEL=warn', () => {
    const { stdout, stderr } = run({
      NO_COLOR: '1',
      DVX_LOG_LEVEL: 'warn',
    })
    assert.equal(stdout, '')
    assert.match(stderr, /WARN \[x\]: careful/)
  })
})
