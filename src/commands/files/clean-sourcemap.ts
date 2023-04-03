import { Argv, InferredOptionTypes } from 'yargs';
import { error, log } from '@/shared/helpers/console';
import { File } from '@/shared/lib/file';
import { Notify } from '@/shared/lib/notify';
import config from '@/shared/helpers/config';
import { Command } from '@/shared/interfaces/command';

class CleanSourcemap implements Command {
  readonly command = 'files:clean-sourcemaps';
  readonly description =
    'Clean sourcemaps comments (/*# sourceMappingURL=foo.css.map */) in css files that can cause conflicts in compilation or packaging process.';
  readonly options = {
    source: {
      alias: 'src',
      describe: 'Source path of the files.',
      type: 'string' as const,
      default: './node_modules/'
    },
    packages: {
      alias: 'pkg',
      describe: 'List of npm packages with CSS files to clean.',
      type: 'array' as const,
      default: ['bootstrap-datepicker', 'tinymce']
    }
  };

  handler(yargs: Argv) {
    const command = yargs.command(this.command, this.description, this.options, (args) => {
      console.time(this.command);

      const pkg = getPackageJson();

      const packages = args.packages.map((pkg: string) => pkg.trim()); // sanitize
      const { source } = args;

      if (
        ![...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)].some(
          (pkg) => packages.indexOf(pkg) >= 0
        )
      ) {
        return error('[files:clean-sourcemaps]:', 'Dependencies not found');
      }

      const directories = packages.map((pkg) => getDirectory(source, pkg)).filter((file) => file.isDirectory());
      const files = directories.reduce(
        (files: File[], { info: { absolutePath } }) =>
          files.concat(
            ...File.sync('**/*.css', { nodir: true, cwd: absolutePath, absolute: true }).map((file) =>
              File.find(file)
            )
          ),
        []
      );

      const regexp = config.CSS_SOURCEMAP_REGEX;
      files.forEach((file) => {
        const data = file.read();
        const replaced = data.replace(regexp, '');
        file.write(replaced);
        log('[File]:', file.info.path);
      });
      console.timeEnd(this.command);
      Notify.done(this.command, 'Task done, watch console results');
    });

    return command;
  }
}

const getPackageJson = (): { devDependencies: Record<string, string>[]; dependencies: Record<string, string>[] } => {
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
    return;
  }
  return dir;
};

const cleanSourcemap = new CleanSourcemap();
type CleanSourcemapOptions = InferredOptionTypes<typeof cleanSourcemap.options>;

export { cleanSourcemap, CleanSourcemapOptions };
