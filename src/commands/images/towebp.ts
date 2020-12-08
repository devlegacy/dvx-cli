import { sync } from 'glob';
import { join, resolve } from 'path';
import sharp from 'sharp';
import { mkdir } from 'shelljs';
import { error, log, warn } from '../../helpers/console';
import { File } from '../../lib/file';
import { Notify } from '../../lib/notify';

const command = 'img:towebp';

module.exports = {
  command,
  description: 'Format/Convert images to webp',
  options: {
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
  handler: async (args: any) => {
    console.time(command);
    const srcDir = File.find(args.src);
    if (srcDir.isDirectory()) {
      const distDir = resolve(args.dist);
      // Notify.info('To webp', 'Start images to webp task');

      const files = sync(
        `${srcDir.info.absolutePath}/**/*.+(png|jpeg|jpg|gif)`,
        {
          nodir: true,
        }
      );

      for (const file of files) {
        const currentFile = File.find(file).info;
        const exactDist = currentFile.dir.replace(srcDir.info.absolutePath, '');
        const destination = File.find(
          exactDist.startsWith('\\') || exactDist.startsWith('/')
            ? join(distDir, exactDist)
            : resolve(distDir, exactDist)
        );
        if (!destination.isDirectory()) {
          warn('[ToWebP]:', `Creating dir, ${destination.info.absolutePath}`);
          mkdir('-p', destination.info.absolutePath);
        }
        try {
          const fileName = resolve(
            destination.info.absolutePath,
            `${currentFile.name}.webp`
          );
          const data = await sharp(file).webp({ lossless: true }).toBuffer();
          await sharp(data).toFile(fileName);
          log('[ToWebP]:', fileName);
        } catch (e) {
          error('[ToWebP]:', e);
        }
      }
      Notify.info('To webp', 'End images to webp task');
    }
    console.timeEnd(command);
  },
};
