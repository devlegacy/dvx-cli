import { join, resolve } from 'path';
import { sync } from 'glob';
import { error, success } from '../../shared/helpers/console';
import { File } from '../../shared/lib/file';
import { Notify } from '../../shared/lib/notify';

import imageminPngquant from 'imagemin-pngquant';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminZopfli from 'imagemin-zopfli';
import { Argv, InferredOptionTypes } from 'yargs';
const imageminGiflossy = require('imagemin-giflossy');

const command = 'img:minify';

const options = {
  source: {
    alias: 'src',
    describe: 'Image source path without optimization.',
    type: 'string' as 'string',
    default: 'src/assets/img/src'
  },
  distribution: {
    alias: 'dist',
    describe: 'Distribution path for optimized images.',
    type: 'string' as 'string',
    default: 'src/assets/img/dist'
  }
};

export type MinifyOptions = InferredOptionTypes<typeof options>;

export async function minify({ source, distribution }: MinifyOptions) {
  const { default: imagemin } = await import('imagemin');
  const { default: imageminMozjpeg } = await import('imagemin-mozjpeg');
  const { default: imageminSvgo } = await import('imagemin-svgo');

  const src = File.find(source);
  if (!src.isDirectory()) {
    error(command, `\nDirectory ${src.info.absolutePath} not found`);

    return;
  }

  const dist = File.find(distribution);
  // Notify.info('Minify', 'Start minify image task');

  const files = sync(`${src.info.absolutePath}/**/*.+(png|jpeg|jpg|gif|svg)`, {
    nodir: true
  }).map((file) => {
    const distDir = File.find(file).info.dir.replace(src.info.absolutePath, '');
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
      success(
        command,
        '\n[from]\t:',
        File.find(images[0].sourcePath).info.path,
        '\n[to]\t:',
        File.find(images[0].destinationPath).info.path
      );
      //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
    } catch (e) {
      error('[Minify]: ', `${file}\n${e}`);
    }
  }
}

export default (yargs: Argv) => {
  const description = 'Minify images';

  yargs.command(command, description, options, async (args) => {
    console.time(command);
    await minify(args);
    console.timeEnd(command);
    Notify.info('Minify', 'End minify image task');
  });
};