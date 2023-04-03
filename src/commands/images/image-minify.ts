import { join, resolve } from 'path';
import { error, success, warn } from '@/shared/helpers/console';
import { File } from '@/shared/lib/file';
import { Notify } from '@/shared/lib/notify';

import imageminPngquant from 'imagemin-pngquant';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminZopfli from 'imagemin-zopfli';
import { Argv, InferredOptionTypes, Options } from 'yargs';
import { Command } from '@/shared/interfaces/command';
import { exit } from 'process';
const imageminGiflossy = require('imagemin-giflossy');

class ImageMinify implements Command {
  readonly command = 'img:minify';

  readonly options = {
    source: {
      alias: 'src',
      describe: 'Source path without optimization.',
      type: 'string' as const,
      default: 'src/assets/img/src'
    },
    distribution: {
      alias: 'dist',
      describe: 'Distribution path for optimized images.',
      type: 'string' as const,
      default: 'src/assets/img/dist'
    }
  };

  readonly description = 'Minify images';

  handler(yargs: Argv) {
    yargs.command(this.command, this.description, this.options, async (args) => {
      console.time(this.command);
      await minify(args);
      console.timeEnd(this.command);
      Notify.info('Minify', 'Minify images task has ended');
    });
  }
}

async function minify({ source, distribution }: MinifyOptions) {
  const { default: imagemin } = await import('imagemin');
  const { default: imageminMozjpeg } = await import('imagemin-mozjpeg');
  const { default: imageminSvgo } = await import('imagemin-svgo');

  const src = File.find(source);
  if (!src.isDirectory()) {
    error(imageMinify.command, `\nDirectory ${src.info.absolutePath} not found`);
    exit(0);
  }

  warn(imageMinify.command, 'Search in:', src.info.absolutePath);

  const dist = File.find(distribution);
  warn(imageMinify.command, 'Result in:', dist.info.absolutePath);

  // Notify.info('Minify', 'Start minify image task');

  const files = File.sync('**/*.{png,jpeg,jpg,gif,svg}', { cwd: src.info.absolutePath, absolute: true }).map((file) => {
    // [input]: /dvx-demo-project/src/assets/img/src/webpack/webpack.png
    // [output]: /webpack/webpack.png
    const distDir = File.find(file).info.dir.replace(src.info.absolutePath, '');
    // [input]: /webpack/webpack.png
    // [output]: /dvx-demo-project/src/assets/img/dist/webpack
    const destination =
      distDir.startsWith('\\') || distDir.startsWith('/')
        ? join(dist.info.absolutePath, distDir)
        : resolve(dist.info.absolutePath, distDir);
    return {
      file,
      destination
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
            quality: [0.6, 0.8] //98 //lossy settings
          }),
          imageminZopfli({
            more: true
          }),
          imageminGiflossy({
            optimizationLevel: 3,
            optimize: 3, //keep-empty: Preserve empty transparent frames
            lossy: 2
          }),
          imageminSvgo({
            plugins: [
              {
                name: 'preset-default',
                active: true
              },
              {
                name: 'removeViewBox',
                active: true
              },
              {
                name: 'cleanupIDs',
                active: false
              }
            ]
          }),
          imageminJpegtran({
            progressive: true
          }),
          imageminMozjpeg({
            quality: 90
          })
        ]
      });
      // Note: Extra process, evaluate
      // File.find(images[0].sourcePath).info.path
      // File.find(images[0].destinationPath).info.path
      success(imageMinify.command, '\n[from]\t:', images[0].sourcePath, '\n[to]\t:', images[0].destinationPath);
      //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
    } catch (e) {
      error(imageMinify.command, `${file}\n${e}`);
    }
  }
}

const imageMinify = new ImageMinify();

type MinifyOptions = InferredOptionTypes<typeof imageMinify.options>;

export { imageMinify, MinifyOptions, minify };
