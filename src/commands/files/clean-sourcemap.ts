import yargs from 'yargs';
import { sync } from 'glob';
import { File } from '../../lib/file';
import { error, log } from '../../helpers/console';
import { Notify } from '../../lib/notify';
import Config from '../../shared/helpers/config';
import CleanSourceMapArguments from '../../shared/interfaces/clean-sourcemap-arguments';

export default class CleanSourcemap {
  public static readonly command = 'files:clean-sourcemaps';
  public static readonly description =
    'Clean sourcemaps comments (/*# sourceMappingURL=foo.css.map */) in css files that can cause conflicts in compilation or packaging';
  public static readonly builder = () =>
    yargs.options({
      source: {
        alias: 'src',
        describe: 'Source path of the files',
        type: 'string',
        default: './node_modules/',
      },
      packages: {
        alias: 'pkg',
        describe: 'List of npm packages with CSS files to clean',
        type: 'array',
        default: ['bootstrap-datepicker', 'tinymce'],
      },
    });

  public static handler(args: CleanSourceMapArguments) {
    console.time(CleanSourcemap.command);
    const pkg = getPackageJson();
    console.log(args.packages);
    const packages = args.packages.map((pkg: string) => pkg.trim()); // sanitize
    const { source } = args;
    const cssSourceMapRegEx = Config.CSS_SOURCEMAP_REGEX;

    if (
      ![
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.devDependencies),
      ].some((pkg) => packages.indexOf(pkg) >= 0)
    ) {
      return error('[files:clean-sourcemaps]:', 'No dependencies found');
    }

    const directories = packages
      .map((pkg) => getDirectory(source, pkg))
      .filter((file) => file.isDirectory());

    const files = directories
      .reduce(
        (prev: Array<string>, current) =>
          prev.concat(
            sync(`${current.info.absolutePath}/**/*.+(css)`, { nodir: true })
          ),
        []
      )
      .map((file) => File.find(file));

    files.forEach((file) => {
      const data = file.read();
      const replaced = data.replace(cssSourceMapRegEx, '');
      file.write(replaced);
      log('[File]:', file.info.path);
    });
    console.timeEnd(CleanSourcemap.command);
    Notify.info(CleanSourcemap.command, 'Done, watch console results');
  }
}

const getPackageJson = () => {
  const packageJson = File.find('package.json');
  if (!packageJson.info.isFile) {
    error('[Error]: ', 'No existe el archivo package.json');
    return;
  }

  return require(packageJson.info.absolutePath);
};

const getDirectory = (source: string, pkg: string) => {
  const dir = File.find(`${source}/${pkg}/`);
  if (!dir.info.isDir) {
    error('[files:clean-sourcemaps]:', `Directory of package ${pkg} no found`);
  }
  return dir;
};

/**
 ** Notes:
 ** dvx files:clean-sourcemaps --pkg=bootstrap-datepicker datepicker
 *
 ** We can use the command:
 * find ./node_modules/tinymce/ -regex ".*\.\(css\|css\)$" -exec sed -i -E "/\/[\*]\#\s+(sourceMappingURL\=.*\.(css)\.map)\s+[\*]\//g" {}
 *
  exec(
    `find ${dir.absolutePath} -regex ".*\\.\\(css\\)$" -exec sed -i -E "s/\\/[\\*]\\#\\s+(sourceMappingURL\\=.*\\.(css)\\.map)\\s+[\\*]\\//\\/\\*\\*\\//g" {} \;`,
    (err, stdout, stderr) => {
      if (err) {
        error('[files:clear-sourcemap-comments-from-css]:', err);
      }
      log('[files:clear-sourcemap-comments-from-css]:', package);
      // log("err: ", err);
      log('stdout: ', stdout);
      log('stderr: ', stderr);
    }
  );
 */
