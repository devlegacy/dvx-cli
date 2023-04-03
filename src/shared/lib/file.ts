import { statSync, existsSync, writeFileSync, readFileSync } from 'fs-extra';
import { EOL } from 'os';
import { resolve, relative, parse } from 'path';
import { cwd } from 'process';
import { globSync } from 'glob';

export interface FileParsed {
  isDir: boolean;
  isFile: boolean;
  path: string;
  absolutePath: string;
  dir: string;
  file: string;
  name: string;
  ext: string;
}

/**
 * Inspired by: https://github.com/JeffreyWay/laravel-mix/blob/master/src/File.js
 */
export class File {
  #absolutePath: string;
  #filePath: string;
  readonly info: FileParsed;

  /**
   * Create a new instance of file class
   * @param {string} filePath - File path
   * @param {string} context - Context
   */
  constructor(filePath: string, context: string = cwd()) {
    this.#absolutePath = resolve(context, filePath);
    this.#filePath = this.relativePath();
    this.info = this.parse();
  }

  /**
   * Static constructor
   * @param {string} path - File path
   * @param {string} context - Context
   * @return {File} File
   */
  static find(path: string, context: string = cwd()): File {
    return new File(path, context);
  }

  static sync(pattern: string, opts?: { nodir?: boolean; cwd?: string; absolute?: boolean }) {
    return globSync(pattern, opts);
  }

  /**
   * Determine if the given file exists.
   *
   * @param {string} file
   */
  static exists(file: string) {
    return existsSync(file);
  }

  /**
   * Determine if the file is a directory.
   */
  isDirectory() {
    try {
      return statSync(this.#absolutePath).isDirectory();
    } catch (err) {
      return false;
    }
  }

  /**
   * Determine if the path is a file, and not a directory.
   */
  isFile() {
    try {
      return statSync(this.#absolutePath).isFile();
    } catch (err) {
      return false;
    }
  }

  /**
   * Get the absolute path to the file.
   */
  path(): string {
    return this.#absolutePath;
  }

  /**
   * Parse the file path and get info about filePath
   */
  private parse(): FileParsed {
    /**
     * Read more on: https://nodejs.org/api/path.html#pathparsepath
     */
    const { dir, base: file, name, ext } = parse(this.#absolutePath);

    return {
      isDir: this.isDirectory(),
      isFile: this.isFile(),
      path: this.#filePath,
      absolutePath: this.path(),
      dir,
      file,
      name,
      ext
    };
  }

  /**
   * Get relative path
   */
  relativePath() {
    return relative(cwd(), this.path());
  }

  /**
   * Get the base directory of the file.
   */
  base() {
    return this.info.dir;
  }

  /**
   * Get the name of the file.
   */
  name() {
    return this.info.file;
  }

  /**
   * Get the name of the file, minus the extension.
   */
  nameWithoutExtension() {
    return this.info.name;
  }

  /**
   * Get the extension of the file.
   */
  extension() {
    return this.info.ext;
  }

  /**
   * Write the given contents to the file.
   *
   * @param {string} body
   */
  write(body: object | string) {
    if (typeof body === 'object') {
      body = JSON.stringify(body, null, 4);
    }

    body = `${body}${EOL}`;

    writeFileSync(this.#absolutePath, body);

    return this;
  }

  /**
   * Read the file's contents.
   */
  read() {
    return readFileSync(this.path(), 'utf8');
  }
}
