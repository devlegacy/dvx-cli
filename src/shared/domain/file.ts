import {
  type GlobOptions,
  existsSync,
  writeFileSync,
  readFileSync,
  lstatSync,
  globSync,
  Stats,
} from 'node:fs'
import { EOL } from 'node:os'
import { resolve, relative, parse } from 'node:path'
import { cwd } from 'node:process'

export interface FileParsed {
  isDir: boolean
  isFile: boolean
  path: string
  absolutePath: string
  dir: string
  file: string
  name: string
  ext: string
}

/**
 * Inspired by Laravel Mix
 * @see [Laravel Mix](https://github.com/JeffreyWay/laravel-mix/blob/master/src/File.js)
 */
export class File {
  #absolutePath: string
  #filePath: string
  // Cache the result of `lstatSync` or `statSync` for performance
  #stats?: Stats

  readonly info: FileParsed

  /**
   * Create a new instance of file class
   * @param {string} filePath - file path
   * @param {string} context - context
   */
  constructor(filePath: string, context: string = cwd()) {
    this.#absolutePath = resolve(context, filePath)
    this.#filePath = this.relativePath()
    this.#stats = lstatSync(this.#absolutePath, { throwIfNoEntry: false })
    this.info = this.parse()
  }

  /**
   * Static constructor
   * @publicApi
   * @param {string} path - file path
   * @param {string} context - context
   * @return {File} File
   */
  static find(path: string, context: string = cwd()): File {
    return new File(path, context)
  }

  // absolute?: boolean; ignore?: string[]
  static sync(pattern: string, opts?: GlobOptions) {
    const context = typeof opts?.cwd === 'string' ? opts.cwd : cwd()
    // Glob plain paths and resolve them against the search cwd: Bun's fs.glob
    // does not support the withFileTypes option
    const files = (globSync(pattern, { ...opts, withFileTypes: false }) as string[]).map((path) =>
      resolve(context, path),
    )

    return files
  }

  /**
   * Determine if the given file exists.
   *
   * @param {string} file
   */
  static exists(file: string) {
    return existsSync(file)
  }

  /**
   * Format a size value into a human-readable string with appropriate suffix (T, B, M, k)
   *
   * @param {number | null | undefined} size - The size value to format (e.g., file size in bytes)
   * @return {string} Human-readable size string with suffix or 'N/A' for null/undefined
   * @example
   * File.compact(1500000) // Returns "1.5M"
   * File.compact(2500)    // Returns "2.5k"
   * File.compact(null)    // Returns "N/A"
   */
  static sizeCompact(size: number | null | undefined): string {
    if (size === null || size === undefined) return 'N/A'

    if (size >= 1e12) return `${(size / 1e12).toFixed(2).replace(/\.00$/, '')}T`
    if (size >= 1e9) return `${(size / 1e9).toFixed(2).replace(/\.00$/, '')}B`
    if (size >= 1e6) return `${(size / 1e6).toFixed(2).replace(/\.00$/, '')}M`
    if (size >= 1e3) return `${(size / 1e3).toFixed(2).replace(/\.00$/, '')}k`

    return size.toString()
  }

  /**
   * Determine if the file is a directory.
   */
  isDirectory() {
    // try {
    //   return lstatSync(this.#absolutePath).isDirectory()
    // } catch (err) {
    //   return false
    // }
    return this.#stats ? this.#stats.isDirectory() : false
  }

  /**
   * Determine if the path is a file, and not a directory.
   */
  isFile() {
    // try {
    //   return statSync(this.#absolutePath).isFile()
    // } catch (err) {
    //   return false
    // }
    return this.#stats ? this.#stats.isFile() : false
  }

  /**
   * Get the absolute path to the file.
   */
  path(): string {
    return this.#absolutePath
  }

  /**
   * Parse the file path and get info about filePath
   */
  private parse(): FileParsed {
    /**
     * Read more on: https://nodejs.org/api/path.html#pathparsepath
     */
    const { dir, base: file, name, ext } = parse(this.#absolutePath)
    const isDir = this.isDirectory()
    const isFile = this.isFile()
    const path = this.#filePath
    const absolutePath = this.#absolutePath

    const info = {
      isDir,
      isFile,
      path,
      absolutePath,
      dir,
      file,
      name,
      ext,
    }

    return info
  }

  /**
   * Get relative path
   */
  relativePath() {
    return relative(cwd(), this.path())
  }

  /**
   * Get the base directory of the file.
   */
  base() {
    return this.info.dir
  }

  /**
   * Get the name of the file.
   */
  name() {
    return this.info.file
  }

  /**
   * Get the name of the file, minus the extension.
   */
  nameWithoutExtension() {
    return this.info.name
  }

  /**
   * Get the extension of the file.
   */
  extension() {
    return this.info.ext
  }

  /**
   * Write the given contents to the file.
   *
   * @param {string} body
   */
  write(body: object | string) {
    if (typeof body === 'object') {
      body = JSON.stringify(body, null, 4)
    }

    body = `${body}${EOL}`

    writeFileSync(this.#absolutePath, body)

    return this
  }

  /**
   * Read the file's contents.
   */
  read() {
    return readFileSync(this.path(), 'utf8')
  }
}
