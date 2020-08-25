import { FileInfo } from '../interfaces/file-info';
import { resolve, relative, parse, ParsedPath } from 'path';
import { statSync, existsSync, writeFileSync } from 'fs';
import os from 'os';

export class File {
  public absolutePath: string;
  public filePath: string;
  public info: FileInfo; // TODO: Make as private?

  /**
   * Create a new instance of file class
   * @param {string} filePath
   */
  constructor(filePath: string) {
    this.absolutePath = resolve(filePath);
    this.filePath = this.relativePath();
    this.info = this.parse();
  }

  /**
   * Static constructor
   * @param {string} file
   * @return {File} File;
   */
  public static find(filePath: string): File {
    return new File(filePath);
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
   * Get info about filePath
   */
  private parse(): FileInfo {
    /**
     * Read more on: https://nodejs.org/dist/latest-v10.x/docs/api/path.html#path_path_parse_path
     */
    const parsed: ParsedPath = parse(this.absolutePath);

    return {
      isDir: this.isDirectory(),
      isFile: this.isFile(),
      path: this.filePath,
      absolutePath: this.path(),
      dir: parsed.dir,
      file: parsed.base,
      name: parsed.name,
      ext: parsed.ext,
    };
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
   * Get relative path
   */
  public relativePath(): string {
    return relative(process.cwd(), this.path());
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

    body = body + os.EOL;

    writeFileSync(this.absolutePath, body);

    return this;
  }
}
