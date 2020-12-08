import { writeFileSync } from 'fs-extra';
import { sync } from 'glob';
import { extname, resolve } from 'path';
import sharp from 'sharp';
import { exec, exit, which } from 'shelljs';
import { error, log, warn } from '../../helpers/console';
import { Notify } from '../../lib/notify';

const command = 'img:resize';
// TODO: Validate notification handler when use mogrify
// dvx img:resize --exc=opengraph
module.exports = {
  command,
  description: 'Resize images to 1024px width',
  options: {
    source: {
      alias: 'src',
      describe: 'Source path of the images to resize',
      type: 'string',
      default: 'src/assets/img/dist/',
    },
    use: {
      describe: 'Tool to use',
      type: 'string',
      default: 'mogrify',
      choices: ['mogrify', 'sharp'],
    },
    width: {
      alias: 'w',
      type: 'number',
      describe: 'Set the width',
      default: 1024,
    },
    height: {
      alias: 'he',
      // TODO: Fix error with --help and -h
      type: 'number',
      describe: 'Set the height',
    },
    exclude: {
      alias: 'exc',
      describe: 'Files to exclude / ignore, separated by spaces',
      type: 'array',
      default: ['opengraph'],
    },
  },

  handler: async (args: any) => {
    console.time(command);
    const srcDir = resolve(process.cwd(), args.src);
    const width = args.width;
    const height = args.height;

    // Notify.info(  'Resize',   'Start resize images task'  );
    const files = sync(`${srcDir}/**/*.+(png|jpeg|jpg)`, { nodir: true });
    const filteredFiles = files.filter((file) => {
      let include = true;
      args.exclude.forEach((exclude: any) => {
        if (file.includes(exclude)) {
          warn('[Resize]:', `File excluded: ${file}, contains: ${exclude}`);
          include = !include;
        }
      });

      return include;
    });

    for (let file of filteredFiles) {
      if (args.use === 'mogrify') {
        await useMogrify(file, width, height);
      } else if (args.use === 'sharp') {
        await useSharp(file, width, height);
      }
    }
    Notify.info('Resize', 'End resize images task');
    console.timeEnd(command);
  },
};

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
