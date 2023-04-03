import { Argv, InferredOptionTypes } from 'yargs';
import { Command } from '@/shared/interfaces/command';
import { error, log, warn } from '@/shared/helpers/console';
import { File } from '@/shared/lib/file';
import { join, resolve } from 'path';
import { mkdir } from 'shelljs';
import { Notify } from '@/shared/lib/notify';
import sharp from 'sharp';

class ImageToWebP implements Command {
  readonly command = 'img:towebp';

  readonly options = {
    source: {
      alias: 'src',
      describe: 'Source path of the images to convert webp.',
      type: 'string' as const,
      default: 'src/assets/img/dist'
    },
    distribution: {
      alias: 'dist',
      describe: 'Distribution path for webp images.',
      type: 'string' as const,
      default: 'src/assets/img/dist/webp'
    }
  };

  readonly description = 'Format/Convert images to webp';

  handler(yargs: Argv) {
    yargs.command(this.command, this.description, this.options, async (args) => {
      console.time(this.command);
      await towebp(args);
      console.timeEnd(this.command);
      Notify.info('To webp', 'End images to webp task');
    });
  }
}

async function towebp({ source, distribution }: ToWebPOptions) {
  const src = File.find(source);

  if (!src.isDirectory()) {
    error(imageToWebP.command, `Directory ${src.info.absolutePath} not found`);
    return;
  }

  const dist = resolve(distribution);
  // Notify.info('To webp', 'Start images to webp task');

  const files = File.sync('**/*.{png,jpeg,jpg,gif}', { nodir: true, absolute: true, cwd: src.info.absolutePath }).map(
    (fileInfo) => {
      const file = File.find(fileInfo);
      const distDir = file.info.dir.replace(src.info.absolutePath, '');
      const destination = File.find(
        distDir.startsWith('\\') || distDir.startsWith('/') ? join(dist, distDir) : resolve(dist, distDir)
      );
      if (!destination.isDirectory()) {
        warn('[ToWebP]:', `Creating dir, ${destination.info.absolutePath}`);
        mkdir('-p', destination.info.absolutePath);
      }
      return {
        file,
        destination
      };
    }
  );

  for (const fileInfo of files) {
    const { file, destination } = fileInfo;
    try {
      const fileName = resolve(destination.info.absolutePath, `${file.info.name}.webp`);
      const data = await sharp(file.info.absolutePath).webp({ lossless: true }).toBuffer();
      await sharp(data).toFile(fileName);
      log('[ToWebP]:', fileName);
    } catch (e) {
      error('[ToWebP]:', e);
    }
  }
}

const imageToWebP = new ImageToWebP();
type ToWebPOptions = InferredOptionTypes<typeof imageToWebP.options>;

export { imageToWebP, ToWebPOptions, towebp };
