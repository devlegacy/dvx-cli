const { resolve } = require('path');
const { statSync } = require('fs');

class File {
  /**
   * Create a new instance of file class
   * @param {string} filePath
   */
  constructor(filePath) {
    this.absolutePath = resolve(filePath);
    this.filePath = this.relativePath();
    this.info = this.parse();
  }

  /**
   * Static constructor
   * @param {string} file
   * @return {object} File;
   */
  static find(filePath) {
    return new File(filePath);
  }

  /**
   * Get the absolute path to the file.
   */
  path() {
    return this.absolutePath;
  }

  /**
   * Get relative path
   */
  relativePath() {
    return path.relative(process.cwd(), this.path());
  }

  /**
   *
   */
  isFile() {
    try {
      return statSync(this.absolutePath).isFile();
    } catch (err) {
      return false;
    }
  }

  /**
   *
   */
  isDir() {
    try {
      return statSync(this.absolutePath).isDirectory();
    } catch (err) {
      return false;
    }
  }
  /**
   * Get info about filePath
   */
  parse() {
    /**
     * Read more on: https://nodejs.org/dist/latest-v10.x/docs/api/path.html#path_path_parse_path
     */
    const parsed = path.parse(this.absolutePath);

    return {
      path: this.filePath,
      absolutePath: this.path(),
      isFile: this.isFile(),
      isDir: this.isDir(),
      dir: parsed.dir || undefined,
      base: parsed.base || undefined,
      ext: parsed.ext || undefined,
      name: parsed.name || undefined,
    };
  }
}

module.exports = File;
