const glob = require('glob');
const { dirname, resolve, basename, extname } = require('path');
const path = require('path');
const sharp = require('sharp');
const shell = require('shelljs');
const cmd = 'img:towebp';

module.exports = {
  cmd,
  desc: 'Format/Convert images to webp',
  opts: {
    source: {
      alias: 'src',
      describe: 'Source path of the images to convert webp.',
      type: 'string',
      default: 'src/assets/img/dist',
    },
    distribution: {
      alias: 'dist',
      describe: 'Distribution path for webp images.',
      type: 'string',
      default: 'src/assets/img/dist/webp',
    },
  },
  handler: async (argv) => {
    console.time(cmd);
    const srcDir = File.find(path.resolve(process.cwd(), argv.src));
    if (srcDir.isDir()) {
      const distDir = path.resolve(process.cwd(), argv.dist);
      Notify.info({ title: 'To webp', message: 'Start images to webp task' });

      const files = glob.sync(
        `${srcDir.absolutePath}/**/*.+(png|jpeg|jpg|gif)`,
        {
          nodir: true,
        }
      );

      for (let file of files) {
        const currentFile = File.find(file).parse();
        const exactDist = currentFile.dir.replace(srcDir.absolutePath, '');
        const destination = File.find(
          exactDist.startsWith('\\') || exactDist.startsWith('/')
            ? path.join(distDir, exactDist)
            : path.resolve(distDir, exactDist)
        );

        if (!destination.isDir()) {
          warn('[ToWebP]:', `Creating dir, ${destination.info.absolutePath}`);
          shell.mkdir('-p', destination.info.absolutePath);
        }

        try {
          const fileName = resolve(
            destination.info.absolutePath,
            `${currentFile.name}.webp`
          );

          const data = await sharp(file)
            .webp({ lossless: true })
            .toBuffer();
          await sharp(data).toFile(fileName);

          log('[ToWebP]:', fileName);
        } catch (e) {
          error('[ToWebP]:', e);
        }
      }
      Notify.info({ title: 'To webp', message: 'End images to webp task' });
    }
    console.timeEnd(cmd);
  },
};
