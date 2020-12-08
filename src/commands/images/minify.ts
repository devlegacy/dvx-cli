import { join, resolve } from 'path';
import { sync } from 'glob';
import { error, log } from '../../helpers/console';
import { File } from '../../lib/file';
import { Notify } from '../../lib/notify';

import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminSvgo from 'imagemin-svgo';
import imageminJpegtran from 'imagemin-jpegtran';
const imageminZopfli = require('imagemin-zopfli');
const imageminGiflossy = require('imagemin-giflossy');

const command = 'img:minify';

module.exports = {
  command,
  description: 'Minify images',
  options: {
    source: {
      alias: 'src',
      describe: 'Source path of the images without optimization.',
      type: 'string',
      default: 'src/assets/img/src',
    },
    distribution: {
      alias: 'dist',
      describe: 'Distribution path optimized images.',
      type: 'string',
      default: 'src/assets/img/dist',
    },
  },
  handler: async (args: any) => {
    console.log(args);
    console.time(command);
    const srcDir = File.find(args.src);
    if (srcDir.isDirectory()) {
      const distDir = File.find(args.dist);
      // Notify.info('Minify', 'Start minify image task');
      const files = sync(
        `${srcDir.info.absolutePath}/**/*.+(png|jpeg|jpg|gif|svg)`,
        {
          nodir: true,
        }
      );
      for (let file of files) {
        const exactDist = File.find(file).info.dir.replace(
          srcDir.info.absolutePath,
          ''
        );

        const destination =
          exactDist.startsWith('\\') || exactDist.startsWith('/')
            ? join(distDir.info.absolutePath, exactDist)
            : resolve(distDir.info.absolutePath, exactDist);

        try {
          const images = await imagemin([file], {
            destination,
            plugins: [
              imageminPngquant({
                speed: 1,
                quality: [0.6, 0.8], //98 //lossy settings
              }),
              imageminZopfli({
                more: true,
              }),
              imageminGiflossy({
                optimizationLevel: 3,
                optimize: 3, //keep-empty: Preserve empty transparent frames
                lossy: 2,
              }),
              imageminSvgo({
                plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
              }),
              imageminJpegtran({
                progressive: true,
              }),
              imageminMozjpeg({
                quality: 90,
              }),
            ],
          });
          log('[Minify]:', images[0].sourcePath);
          //       //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
        } catch (e) {
          error('[Minify]: ', `${file}\n${e}`);
        }
      }
    }
    console.timeEnd(command);
    Notify.info('Minify', 'End minify image task');
  },
};
