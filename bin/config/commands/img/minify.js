const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminZopfli = require('imagemin-zopfli');
const imageminGiflossy = require('imagemin-giflossy');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminSvgo = require('imagemin-svgo');
const imageminJpegtran = require('imagemin-jpegtran');
const glob = require('glob');
const path = require('path');
const cmd = 'img:minify';

module.exports = {
  cmd,
  desc: 'Minify images',
  opts: {
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
  handler: async (argv) => {
    console.time(cmd);
    const srcDir = File.find(path.resolve(process.cwd(), argv.src));
    if (srcDir.isDir()) {
      const distDir = path.resolve(process.cwd(), argv.dist);
      Notify.info({ title: 'Minify', message: 'Start minify image task' });

      const files = glob.sync(
        `${srcDir.absolutePath}/**/*.+(png|jpeg|jpg|gif|svg)`,
        {
          nodir: true,
        }
      );

      for (let file of files) {
        const exactDist = File.find(file)
          .parse()
          .dir.replace(srcDir.absolutePath, '');
        const destination =
          exactDist.startsWith('\\') || exactDist.startsWith('/')
            ? path.join(distDir, exactDist)
            : path.resolve(distDir, exactDist);

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
          log('[Minify]:', images[0].path || images[0].sourcePath);
          //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
        } catch (e) {
          error('[Minify]: ', `${file}\n${e}`);
        }
      }
      Notify.info({ title: 'Minify', message: 'End minify image task' });
    }
    console.timeEnd(cmd);
  },
};
