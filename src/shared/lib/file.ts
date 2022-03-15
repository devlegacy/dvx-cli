import { FileInfoInterface } from '../interfaces/file-info.interface';
import { statSync, existsSync, writeFileSync, readFileSync } from 'fs-extra';
import { EOL } from 'os';
import { resolve, relative, parse } from 'path';
import { cwd } from 'process';
import { sync } from 'glob';

/**
 * * Inspired in: https://github.com/JeffreyWay/laravel-mix/blob/master/src/File.js
 */
export class File {
  private absolutePath: string;
  private filePath: string;
  public info: FileInfoInterface;

  /**
   * Create a new instance of file class
   * @param {string} filePath - File path
   * @param {string} context - Context
   */
  constructor(filePath: string, context: string = cwd()) {
    this.absolutePath = resolve(context, filePath);
    this.filePath = this.relativePath();
    this.info = this.parse();
  }

  /**
   * Static constructor
   * @param {string} file - File path
   * @param {string} context - Context
   * @return {File} File
   */
  public static find(filePath: string, context: string = cwd()): File {
    return new File(filePath, context);
  }

  public static sync(pattern: string) {
    return sync(pattern, { nodir: true });
  }

  /**
   * Determine if the given file exists.
   *
   * @param {string} file
   */
  public static exists(file: string): boolean {
    return existsSync(file);
  }

  /**
   * Determine if the file is a directory.
   */
  public isDirectory() {
    try {
      return statSync(this.absolutePath).isDirectory();
    } catch (err) {
      return false;
    }
  }

  /**
   * Determine if the path is a file, and not a directory.
   */
  public isFile() {
    try {
      return statSync(this.absolutePath).isFile();
    } catch (err) {
      return false;
    }
  }

  /**
   * Get the absolute path to the file.
   */
  public path(): string {
    return this.absolutePath;
  }

  /**
   * Parse the file path and get info about filePath
   */
  private parse(): FileInfoInterface {
    /**
     * Read more on: https://nodejs.org/dist/latest-v10.x/docs/api/path.html#path_path_parse_path
     */
    const parsed = parse(this.absolutePath);

    return {
      isDir: this.isDirectory(),
      isFile: this.isFile(),
      path: this.filePath,
      absolutePath: this.path(),
      dir: parsed.dir,
      file: parsed.base,
      name: parsed.name,
      ext: parsed.ext
    };
  }

  /**
   * Get relative path
   */
  public relativePath(): string {
    return relative(cwd(), this.path());
  }

  /**
   * Get the base directory of the file.
   */
  public base(): string | null {
    return this.info.dir;
  }

  /**
   * Get the name of the file.
   */
  public name(): string | null {
    return this.info.file;
  }

  /**
   * Get the name of the file, minus the extension.
   */
  public nameWithoutExtension(): string | null {
    return this.info.name;
  }

  /**
   * Get the extension of the file.
   */
  public extension(): string | null {
    return this.info.ext;
  }

  /**
   * Write the given contents to the file.
   *
   * @param {string} body
   */
  public write(body: object | string): File {
    if (typeof body === 'object') {
      body = JSON.stringify(body, null, 4);
    }

    body = body + EOL;

    writeFileSync(this.absolutePath, body);

    return this;
  }

  /**
   * Read the file's contents.
   */
  read() {
    return readFileSync(this.path(), 'utf8');
  }
}
