const shell = require('shelljs');
const glob = require('glob');
const { extname, resolve } = require('path');
const sharp = require('sharp');
const fs = require('fs');
const cmd = 'img:resize';
// TODO: Validate notification handler when use mogrify
// dvx img:resize --exc=opengraph
module.exports = {
  cmd,
  desc: 'Resize images to 1024px width',
  opts: {
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
  handler: async (argv) => {
    console.time(cmd);
    const srcDir = resolve(process.cwd(), argv.src);
    const width = argv.width;
    const height = argv.height;

    Notify.info({ title: 'Resize', message: 'Start resize images task' });
    const files = glob.sync(`${srcDir}/**/*.+(png|jpeg|jpg)`, { nodir: true });
    const filteredFiles = files.filter((file) => {
      let include = true;
      argv.exclude.forEach((exclude) => {
        if (file.includes(exclude)) {
          warn('[Resize]:', `File excluded: ${file}, contains: ${exclude}`);
          include = !include;
        }
      });

      return include;
    });

    for (let file of filteredFiles) {
      if (argv.use === 'mogrify') {
        await useMogrify(file, width, height);
      } else if (argv.use === 'sharp') {
        await useSharp(file, width, height);
      }
    }
    Notify.info({ title: 'Resize', message: 'End resize images task' });
    console.timeEnd(cmd);
  },
};

const useMogrify = async (file, width = 1024, height) => {
  const mogrify = 'mogrify';
  try {
    if (!shell.which(mogrify)) {
      throw `The command ${mogrify} does not exist.`;
    }

    const ext = extname(file).toLowerCase();
    let stdOut = '';
    const resize = height
      ? `-resize \"${width}x${height}\" -extent \"${width}x${height}\" `
      : `-resize \"${width}>\"`;
    // console.log(resize); -path processed
    if (ext.includes('.jpg')) {
      stdOut = shell.exec(
        `${mogrify} -verbose -format jpg -layers Dispose ${resize} ${file}`,
        { async: false, silent: true }
      ).stdout;
    } else if (ext.includes('.jpeg')) {
      stdOut = shell.exec(
        `${mogrify} -verbose -format jpeg -layers Dispose ${resize} ${file}`,
        { async: false, silent: true }
      ).stdout;
    } else if (ext.includes('.png')) {
      stdOut = shell.exec(`${mogrify} -verbose -format png ${resize} ${file}`, {
        async: false,
        silent: true,
      }).stdout;
    }
    log('[Resize]:', stdOut);
  } catch (e) {
    error('[Resize - Error]:', e);
    shell.exit(1);
  }
};

const useSharp = async (file, width = 1024, height) => {
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
  await sharp(file)
    .resize({
      ...opts,
      withoutEnlargement: true,
    })
    .toBuffer(function (err, buffer) {
      fs.writeFileSync(file, buffer);
      log('[Resize]:', file);
    });
};
