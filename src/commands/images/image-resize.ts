import { Argv, InferredOptionTypes } from 'yargs';
import { Command } from '@/shared/interfaces/command.interface';
import { error, log, warn } from '@/shared/helpers/console';
import { exec, exit, which } from 'shelljs';
import { extname } from 'path';
import { File } from '@/shared/lib/file';
import { Notify } from '@/shared/lib/notify';
import { sync } from 'glob';
import { writeFileSync } from 'fs-extra';
import sharp from 'sharp';

// type InferredOptionTypes<O extends { [key: string]: any }> = { [key in keyof O]: InferredOptionType<O[key]> };
// type Argx = Argv<typeof options>;
// type Op = { [Property in keyof typeof options]: Type[Property]['type'] };
// type Arg1 = { [key: string]: Options } & typeof options;

class ImageResize implements Command {
  public readonly command = 'img:resize';

  public readonly options = {
    source: {
      alias: 'src',
      describe: 'Source path of the images to resize',
      type: `string` as `string`,
      default: 'src/assets/img/dist'
    },
    width: {
      alias: 'w',
      type: `number` as `number`,
      describe: 'Set the width',
      default: 1024
    },
    height: {
      alias: 'h',
      type: `number` as `number`,
      describe: 'Set the height'
    },
    tool: {
      alias: 't',
      describe: 'Tool to use',
      type: `string` as `string`,
      default: 'mogrify',
      choices: ['mogrify', 'sharp']
    },
    exclude: {
      alias: 'e',
      describe: 'Files to exclude / ignore, separated by spaces',
      type: `array` as `array`,
      default: ['opengraph']
    }
  };

  public readonly description = 'Resize images to 1024px width';

  handler(yargs: Argv) {
    return yargs.command(this.command, this.description, this.options, async (args) => {
      console.time(this.command);
      await resize(args);
      console.timeEnd(this.command);
      Notify.info('Resize', 'End resize images task');
    });
  }
}

async function resize({ source, exclude, tool, width, height }: ResizeOptions) {
  const src = File.find(source);

  if (!src.isDirectory()) {
    error(imageResize.command, `Directory ${src.info.absolutePath} not found`);
    return;
  }

  const files = sync(`${src.info.absolutePath}/**/*.+(png|jpe?g)`, {
    nodir: true
  }).filter((file) => {
    let include = true;
    exclude.forEach((exclude: any) => {
      if (file.includes(exclude)) {
        warn('[Resize]:', `File excluded: ${file}, contains: ${exclude}`);
        include = !include;
      }
    });

    return include;
  });

  for (const file of files) {
    if (tool === 'mogrify') {
      await useMogrify(file, width, height);
    } else if (tool === 'sharp') {
      await useSharp(file, width, height);
    }
  }
}

const imageResize = new ImageResize();

type ResizeOptions = InferredOptionTypes<typeof imageResize.options>;

export { imageResize, ResizeOptions, resize };

const useMogrify = async (file: any, width: any = 1024, height: any) => {
  const mogrify = 'mogrify';
  try {
    if (!which(mogrify)) {
      throw `The command ${mogrify} does not exist.`;
    }

    const ext = extname(file).toLowerCase();
    let stdOut = '';
    const resize = height ? `-resize \"${width}x${height}\" -extent \"${width}x${height}\" ` : `-resize \"${width}>\"`;
    // console.log(resize); -path processed
    if (ext.includes('.jpg')) {
      stdOut = exec(`${mogrify} -verbose -format jpg -layers Dispose ${resize} ${file}`, {
        async: false,
        silent: true
      }).stdout;
    } else if (ext.includes('.jpeg')) {
      stdOut = exec(`${mogrify} -verbose -format jpeg -layers Dispose ${resize} ${file}`, {
        async: false,
        silent: true
      }).stdout;
    } else if (ext.includes('.png')) {
      stdOut = exec(`${mogrify} -verbose -format png ${resize} ${file}`, {
        async: false,
        silent: true
      }).stdout;
    }
    log('[Resize]:', stdOut);
  } catch (e) {
    error('[Resize - Error]:', e);
    exit(1);
  }
};

const useSharp = async (file: any, width: number | undefined = 1024, height: number | undefined) => {
  const opts = {
    width,
    height
  };

  const sharpFile = sharp(file);
  const resizeFile = sharpFile.resize({
    ...opts,
    withoutEnlargement: true
  });
  resizeFile.toBuffer(function (err, buffer) {
    writeFileSync(file, buffer);
    log('[Resize]:', file);
  });
};
