import assert from 'node:assert/strict'
import { afterEach, before, describe, it } from 'node:test'
import { resolve, normalize } from 'node:path'
import { cwd } from 'node:process'
import { mkdirSync } from 'node:fs'

import { File } from '#@/src/shared/lib/file.js'
import { emptyDirSync } from '#@/src/shared/utils.js'

const stubsDir = resolve(`${cwd()}/tests`, 'stubs')

describe('File', () => {
  before(() => {
    mkdirSync(stubsDir, { recursive: true })
  })
  afterEach(() => {
    emptyDirSync(stubsDir)
  })
  describe('Related to validations', () => {
    it('should returns if a file does not exists', () => {
      const file = resolve(stubsDir, 'file.js')
      assert.strictEqual(File.exists(file), false)
    })
    it('should returns if a file exists', () => {
      const file = resolve(stubsDir, 'file.js')
      new File(file).write('foobar')
      assert.strictEqual(File.exists(file), true)
    })
    it('should returns if the current file path is a directory', () => {
      const result = new File(resolve(stubsDir)).isDirectory()
      assert.strictEqual(result, true)
    })
    it('should returns if the current file path is not a directory', () => {
      const result = new File('path/to/file.js').isDirectory()
      assert.strictEqual(result, false)
    })
    it('should returns if a the curren file path is a file', () => {
      const file = resolve(stubsDir, 'file.js')
      new File(file).write('foobar')
      const result: boolean = new File(file).isFile()
      assert.strictEqual(result, true)
    })
    it('should returns if a the curren file path is not a file', () => {
      assert.strictEqual(new File('path/to').isFile(), false)
    })
  })
  describe('Related to path', () => {
    it('should returns the absolute path of the file', () => {
      const file = resolve(stubsDir, 'file.js')
      assert.strictEqual(file, new File(file).path())
    })
    it('should returns the relative path to the file', () => {
      const filePath = 'path/to/file.js'
      const newFilePath = '../path/to/file.js'
      const file = new File(filePath)
      const newFile = new File(newFilePath)
      assert.strictEqual(normalize(filePath), file.relativePath())
      assert.strictEqual(normalize(newFilePath), newFile.relativePath())
    })
    it('should knows the base directory path for the file', () => {
      const file = new File('path/to/file.js')
      const result = file.base()
      assert.strictEqual(result, resolve('path/to'))
    })
  })
  describe('Related to filename', () => {
    it('should returns file name', () => {
      const file = new File('path/to/file.js')
      const result = file.name() || ''
      const expected = 'file.js'
      assert.strictEqual(result, expected)
    })
    it('should returns the file name without the extension', () => {
      const file = new File('path/to/file.js')
      const result = file.nameWithoutExtension() || ''
      const expected = 'file'
      assert.strictEqual(result, expected)
    })
    it('should returns the extension of the file', () => {
      const file = new File('path/to/file.js')
      const result = file.extension() || ''
      const expected = '.js'
      assert.strictEqual(result, expected)
    })
  })
  it('should has a static constructor', () => {
    const file = File.find('path/to/file.js')
    const result = file instanceof File
    assert.strictEqual(result, true)
  })
})
