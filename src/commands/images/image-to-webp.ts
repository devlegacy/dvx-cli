import { sync } from 'glob';
import { join, resolve } from 'path';
import sharp from 'sharp';
import { mkdir } from 'shelljs';
import { Argv, InferredOptionTypes } from 'yargs';
import { error, log, warn } from '../../shared/helpers/console';
import { File } from '../../shared/lib/file';
import { Notify } from '../../shared/lib/notify';

const command = 'img:towebp';

const options = {
  source: {
    alias: 'src',
    describe: 'Source path of the images to convert webp.',
    type: 'string' as 'string',
    default: 'src/assets/img/dist'
  },
  distribution: {
    alias: 'dist',
    describe: 'Distribution path for webp images.',
    type: 'string' as 'string',
    default: 'src/assets/img/dist/webp'
  }
};

export type ToWebPOptions = InferredOptionTypes<typeof options>;

export async function towebp({ source, distribution }: ToWebPOptions) {
  const src = File.find(source);

  if (!src.isDirectory()) {
    error(command, `Directory ${src.info.absolutePath} not found`);
    return;
  }

  const dist = resolve(distribution);
  // Notify.info('To webp', 'Start images to webp task');

  const files = sync(`${src.info.absolutePath}/**/*.+(png|jpeg|jpg|gif)`, {
    nodir: true
  }).map((fileInfo) => {
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
  });

  for (const fileInfo of files) {
    const { file, destination } = fileInfo;
    try {
      const fileName = resolve(destination.info.absolutePath, `${file.info.name}.webp`);
      const data = await sharp(file.info.absolutePath).webp({ lossless: true }).toBuffer();
      await sharp(data).toFile(fileName);
      log('[ToWebP]:', File.find(fileName).info.path);
    } catch (e) {
      error('[ToWebP]:', e);
    }
  }
}

export default (yargs: Argv) => {
  const description = 'Format/Convert images to webp';

  yargs.command(command, description, options, async (args) => {
    console.time(command);
    await towebp(args);
    console.timeEnd(command);
    Notify.info('To webp', 'End images to webp task');
  });
};
