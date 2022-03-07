import { writeFileSync } from 'fs-extra';
import { sync } from 'glob';
import { extname, resolve } from 'path';
import sharp from 'sharp';
import { exec, exit, which } from 'shelljs';
import {
  ArgumentsCamelCase,
  Argv,
  InferredOptionType,
  InferredOptionTypeInner,
  InferredOptionTypes,
  Options,
  RequiredOptionType
} from 'yargs';
import { error, log, warn } from '../../shared/helpers/console';
import { File } from '../../shared/lib/file';
import { Notify } from '../../shared/lib/notify';

const command = 'img:resize';

const options = {
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

// type InferredOptionTypes<O extends { [key: string]: any }> = { [key in keyof O]: InferredOptionType<O[key]> };
// type Argx = Argv<typeof options>;
// type Op = { [Property in keyof typeof options]: Type[Property]['type'] };
// type Arg1 = { [key: string]: Options } & typeof options;

export type ResizeOptions = InferredOptionTypes<typeof options>;

export async function resize({ source, exclude, tool, width, height }: ResizeOptions) {
  const src = File.find(source);

  if (!src.isDirectory()) {
    error(command, `Directory ${src.info.absolutePath} not found`);
    return;
  }

  const files = sync(`${src.info.absolutePath}/**/*.+(png|jpeg|jpg)`, {
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

export default (yargs: Argv) => {
  const description = 'Resize images to 1024px width';

  return yargs.command(command, description, options, async (args) => {
    console.time(command);
    await resize(args);
    console.timeEnd(command);
    Notify.info('Resize', 'End resize images task');
  });
};

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

const useSharp = async (file: any, width: any = 1024, height: any) => {
  let opts = {};
  // TODO: read what is the default height for sharp
  if (height) {
    opts = {
      width,
      height
    };
  } else {
    opts = {
      width
    };
  }
  const sharpFile = await sharp(file);
  const resizeFile = await sharpFile.resize({
    ...opts,
    withoutEnlargement: true
  });
  await resizeFile.toBuffer(function (err, buffer) {
    writeFileSync(file, buffer);
    log('[Resize]:', file);
  });
};
