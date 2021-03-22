import { sync } from 'glob';
import { join, resolve } from 'path';
import sharp from 'sharp';
import { mkdir } from 'shelljs';
import yargs from 'yargs';
import { error, log, warn } from '../../helpers/console';
import { File } from '../../lib/file';
import { Notify } from '../../lib/notify';
import ImageMinifyArguments from '../../shared/interfaces/image-minify-arguments';

export default class ImageToWebP {
  public static readonly command = 'img:towebp';
  public static readonly description = 'Format/Convert images to webp';
  public static readonly builder = () =>
    yargs.options({
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
    });
  public static async handler(args: ImageMinifyArguments) {
    console.time(ImageToWebP.command);
    const source = File.find(args.source);

    if (!source.isDirectory()) {
      error(
        ImageToWebP.command,
        `Directory ${source.info.absolutePath} not found`
      );
      return;
    }

    const dist = resolve(args.distribution);
    // Notify.info('To webp', 'Start images to webp task');

    const files = sync(`${source.info.absolutePath}/**/*.+(png|jpeg|jpg|gif)`, {
      nodir: true,
    }).map((fileInfo) => {
      const file = File.find(fileInfo);
      const distDir = file.info.dir.replace(source.info.absolutePath, '');
      const destination = File.find(
        distDir.startsWith('\\') || distDir.startsWith('/')
          ? join(dist, distDir)
          : resolve(dist, distDir)
      );
      if (!destination.isDirectory()) {
        warn('[ToWebP]:', `Creating dir, ${destination.info.absolutePath}`);
        mkdir('-p', destination.info.absolutePath);
      }
      return {
        file,
        destination,
      };
    });

    for (const fileInfo of files) {
      const { file, destination } = fileInfo;
      try {
        const fileName = resolve(
          destination.info.absolutePath,
          `${file.info.name}.webp`
        );
        const data = await sharp(file.info.absolutePath)
          .webp({ lossless: true })
          .toBuffer();
        await sharp(data).toFile(fileName);
        log('[ToWebP]:', File.find(fileName).info.path);
      } catch (e) {
        error('[ToWebP]:', e);
      }
    }

    console.timeEnd(ImageToWebP.command);
    Notify.info('To webp', 'End images to webp task');
  }
}
