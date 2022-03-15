import { Argv, InferredOptionTypes } from 'yargs';
import { Command } from '@/shared/interfaces/command.interface';
import { error, log } from '../../shared/helpers/console';
import { File } from '../../shared/lib/file';
import { Notify } from '../../shared/lib/notify';
import { sync } from 'glob';
import Config from '../../shared/helpers/config';

class CleanSourcemap implements Command {
  public readonly command = 'files:clean-sourcemaps';
  public readonly description =
    'Clean sourcemaps comments (/*# sourceMappingURL=foo.css.map */) in css files that can cause conflicts in compilation or packaging';
  public readonly options = {
    source: {
      alias: 'src',
      describe: 'Source path of the files',
      type: 'string' as 'string',
      default: './node_modules/'
    },
    packages: {
      alias: 'pkg',
      describe: 'List of npm packages with CSS files to clean',
      type: 'array' as 'array',
      default: ['bootstrap-datepicker', 'tinymce']
    }
  };

  public handler(yargs: Argv) {
    return yargs.command(this.command, this.description, this.options, (args) => {
      console.time(this.command);

      const pkg = getPackageJson();
      console.log(args.packages);

      const packages = args.packages.map((pkg: string) => pkg.trim()); // sanitize
      const { source } = args;
      const cssSourceMapRegEx = Config.CSS_SOURCEMAP_REGEX;

      if (
        ![...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)].some(
          (pkg) => packages.indexOf(pkg) >= 0
        )
      ) {
        return error('[files:clean-sourcemaps]:', 'Dependencies not found');
      }

      const directories = packages.map((pkg) => getDirectory(source, pkg)).filter((file) => file.isDirectory());

      const files = directories
        .reduce(
          (prev: Array<string>, current) =>
            prev.concat(sync(`${current.info.absolutePath}/**/*.+(css)`, { nodir: true })),
          []
        )
        .map((file) => File.find(file));

      files.forEach((file) => {
        const data = file.read();
        const replaced = data.replace(cssSourceMapRegEx, '');
        file.write(replaced);
        log('[File]:', file.info.path);
      });
      console.timeEnd(this.command);
      Notify.info(this.command, 'Done, watch console results');
    });
  }
}

const getPackageJson = () => {
  const packageJson = File.find('package.json');
  if (!packageJson.info.isFile) {
    error('[Error]: ', 'No existe el archivo package.json');
    return;
  }

  return JSON.parse(packageJson.read());
};

const getDirectory = (source: string, pkg: string): File => {
  const dir = File.find(`${source}/${pkg}/`);
  if (!dir.info.isDir) {
    error('[files:clean-sourcemaps]:', `Directory of package ${pkg} no found`);
  }
  return dir;
};

const cleanSourcemap = new CleanSourcemap();
type CleanSourcemapOptions = InferredOptionTypes<typeof cleanSourcemap.options>;

export { cleanSourcemap, CleanSourcemapOptions };
