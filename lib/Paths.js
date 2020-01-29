class Paths {
  /**
   * Create a new Paths instance
   */
  constructor() {
    this.rootExecPath = process.cwd();
    this.rootPath = path.resolve('../');
  }
}

module.exports = Paths;
