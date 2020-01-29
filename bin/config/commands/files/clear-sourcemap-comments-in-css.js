const glob = require('glob');
const fs = require('fs');
const cmd = 'files:clear-sourcemap-comments-in-css';

module.exports = {
  cmd,
  desc:
    'Clean sourcemaps comments (/*# sourceMappingURL=foo.css.map */) in css files that can cause conflicts in compilation or packaging',
  opts: {
    source: {
      alias: 'src',
      describe: 'Source path of the files',
      type: 'string',
      default: './',
    },
    packages: {
      alias: 'pck',
      describe: 'List of npm packages with CSS files to clean',
      type: 'string',
      default: 'bootstrap-datepicker,tinymce',
    },
  },
  handler: (argv) => {
    const pkg = getPackageJson();
    const packageToRemoveComments = argv.packages.split(',');
    const regExToReplace = /\/[\*]\#\s+(sourceMappingURL\=.*\.(css)\.map)\s+[\*]\//g;

    packageToRemoveComments.forEach((package) => {
      const dir = validations(package.trim(), pkg);
      const files = glob.sync(`${dir.absolutePath}/**/*.+(css)`, {
        nodir: true,
      });
      files.forEach((file) => {
        fs.readFile(file, 'utf8', (err, data) => {
          if (err) {
            return error('[Error reading file]:', err);
          }
          const replace = data.replace(regExToReplace, '');
          fs.writeFile(file, replace, 'utf8', (err) => {
            if (err) {
              return error('[Error writing file]:', err);
            }
            log('[File]:', file);
          });
        });
      });
    });
  },
};

const getPackageJson = () => {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = File.find(packageJsonPath);
  if (!packageJson.info.isFile) {
    return error('[Error]: ', 'No existe el archivo package.json');
    // process.exit(1);
  }

  return require(packageJson.info.absolutePath);
};

const validations = (package, pkg) => {
  if (!(package in pkg.dependencies || package in pkg.devDependencies)) {
    return error(
      '[files:clear-sourcemap-comments-from-css]:',
      'No se encuentra el paquete en las dependencias de package.json'
    );
  }

  const dir = File.find(`${process.cwd()}/node_modules/${package}/`);
  if (!dir.info.isDir) {
    return error(
      '[files:clear-sourcemap-comments-from-css]:',
      'No es posible localizar el directorio'
    );
    // process.exit(1);
  }

  return dir;
};

/**
 * Notes:
 * We can use the command:
 * * find ./node_modules/tinymce/ -regex ".*\.\(css\|css\)$" -exec sed -i -E "/\/[\*]\#\s+(sourceMappingURL\=.*\.(css)\.map)\s+[\*]\//g" {}
 */

/**
 *
 exec(`find ${dir.absolutePath} -regex ".*\\.\\(css\\)$" -exec sed -i -E "s/\\/[\\*]\\#\\s+(sourceMappingURL\\=.*\\.(css)\\.map)\\s+[\\*]\\//\\/\\*\\*\\//g" {} \;`,
              (err, stdout, stderr) => {
                if (err) { error('[files:clear-sourcemap-comments-from-css]:', err); }
                log('[files:clear-sourcemap-comments-from-css]:', package);
                // log("err: ", err);
                log("stdout: ", stdout);
                log("stderr: ", stderr);

              });
 */
