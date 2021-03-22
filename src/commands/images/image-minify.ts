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
import yargs from 'yargs';
import ImageMinifyArguments from '../../shared/interfaces/image-minify-arguments';
const imageminZopfli = require('imagemin-zopfli');
const imageminGiflossy = require('imagemin-giflossy');

export default class ImageMinify {
  public static readonly command = 'img:minify';
  public static readonly description = 'Minify images';
  public static readonly builder = () =>
    yargs.options({
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
    });

  public static async handler(args: ImageMinifyArguments) {
    console.time(ImageMinify.command);
    const source = File.find(args.source);
    if (!source.isDirectory()) {
      error(
        ImageMinify.command,
        `Directory ${source.info.absolutePath} not found`
      );
      return;
    }

    const dist = File.find(args.distribution);
    // Notify.info('Minify', 'Start minify image task');

    const files = sync(
      `${source.info.absolutePath}/**/*.+(png|jpeg|jpg|gif|svg)`,
      {
        nodir: true,
      }
    ).map((file) => {
      const distDir = File.find(file).info.dir.replace(
        source.info.absolutePath,
        ''
      );
      const destination =
        distDir.startsWith('\\') || distDir.startsWith('/')
          ? join(dist.info.absolutePath, distDir)
          : resolve(dist.info.absolutePath, distDir);

      return {
        file,
        destination,
      };
    });

    for (const fileInfo of files) {
      const { file, destination } = fileInfo;
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
        log(
          '[Minify]:',
          ' from:',
          File.find(images[0].sourcePath).info.path,
          ', to:',
          File.find(images[0].destinationPath).info.path
        );
        //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
      } catch (e) {
        error('[Minify]: ', `${file}\n${e}`);
      }
    }

    console.timeEnd(ImageMinify.command);
    Notify.info('Minify', 'End minify image task');
  }
}
