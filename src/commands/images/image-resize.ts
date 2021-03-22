import { writeFileSync } from 'fs-extra';
import { sync } from 'glob';
import { extname, resolve } from 'path';
import sharp from 'sharp';
import { exec, exit, which } from 'shelljs';
import yargs from 'yargs';
import { error, log, warn } from '../../helpers/console';
import { File } from '../../lib/file';
import { Notify } from '../../lib/notify';
import ImageResizeArguments from '../../shared/interfaces/image-resize-arguments';

export default class ImageResize {
  public static readonly command = 'img:resize';
  public static readonly description = 'Resize images to 1024px width';
  public static readonly builder = () =>
    yargs.options({
      source: {
        alias: 'src',
        describe: 'Source path of the images to resize',
        type: 'string',
        default: 'src/assets/img/dist',
      },
      width: {
        alias: 'w',
        type: 'number',
        describe: 'Set the width',
        default: 1024,
      },
      height: {
        alias: 'h',
        type: 'number',
        describe: 'Set the height',
      },
      tool: {
        describe: 'Tool to use',
        type: 'string',
        default: 'mogrify',
        choices: ['mogrify', 'sharp'],
      },
      exclude: {
        alias: 'exc',
        describe: 'Files to exclude / ignore, separated by spaces',
        type: 'array',
        default: ['opengraph'],
      },
    });

  public static async handler(args: ImageResizeArguments) {
    console.time(ImageResize.command);

    const source = File.find(args.source);
    const { height, width } = args;

    if (!source.isDirectory()) {
      error(
        ImageResize.command,
        `Directory ${source.info.absolutePath} not found`
      );
      return;
    }

    const files = sync(`${source.info.absolutePath}/**/*.+(png|jpeg|jpg)`, {
      nodir: true,
    }).filter((file) => {
      let include = true;
      args.exclude.forEach((exclude: any) => {
        if (file.includes(exclude)) {
          warn('[Resize]:', `File excluded: ${file}, contains: ${exclude}`);
          include = !include;
        }
      });

      return include;
    });

    for (const file of files) {
      if (args.tool === 'mogrify') {
        await useMogrify(file, width, height);
      } else if (args.tool === 'sharp') {
        await useSharp(file, width, height);
      }
    }

    console.timeEnd(ImageResize.command);
    Notify.info('Resize', 'End resize images task');
  }
}

const useMogrify = async (file: any, width: any = 1024, height: any) => {
  const mogrify = 'mogrify';
  try {
    if (!which(mogrify)) {
      throw `The command ${mogrify} does not exist.`;
    }

    const ext = extname(file).toLowerCase();
    let stdOut = '';
    const resize = height
      ? `-resize \"${width}x${height}\" -extent \"${width}x${height}\" `
      : `-resize \"${width}>\"`;
    // console.log(resize); -path processed
    if (ext.includes('.jpg')) {
      stdOut = exec(
        `${mogrify} -verbose -format jpg -layers Dispose ${resize} ${file}`,
        { async: false, silent: true }
      ).stdout;
    } else if (ext.includes('.jpeg')) {
      stdOut = exec(
        `${mogrify} -verbose -format jpeg -layers Dispose ${resize} ${file}`,
        { async: false, silent: true }
      ).stdout;
    } else if (ext.includes('.png')) {
      stdOut = exec(`${mogrify} -verbose -format png ${resize} ${file}`, {
        async: false,
        silent: true,
      }).stdout;
    }
    log('[Resize]:', stdOut);
  } catch (e) {
    error('[Resize - Error]:', e);
    exit(1);
  }
};

const useSharp = async (file: any, width: any = 1024, height: any) => {
  let opts = {};
  // TODO: read what is the default height for sharp
  if (height) {
    opts = {
      width,
      height,
    };
  } else {
    opts = {
      width,
    };
  }
  const sharpFile = await sharp(file);
  const resizeFile = await sharpFile.resize({
    ...opts,
    withoutEnlargement: true,
  });
  await resizeFile.toBuffer(function (err, buffer) {
    writeFileSync(file, buffer);
    log('[Resize]:', file);
  });
};
