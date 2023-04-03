import { Argv, InferredOptionTypes } from 'yargs';
import { Command } from '@/shared/interfaces/command';
import { minify } from './image-minify';
import { resize } from './image-resize';
import { towebp } from './image-to-webp';

class ImageBuilder implements Command {
  readonly command = 'img:build';
  readonly options = {
    source: {
      alias: 'src',
      describe: 'Source path of the images without optimization.',
      type: 'string' as const,
      default: 'src/assets/img/src'
    },
    distribution: {
      alias: 'dist',
      describe: 'Distribution path for optimized image .',
      type: 'string' as const,
      default: 'src/assets/img/dist'
    },
    width: {
      alias: 'w',
      type: 'number' as const,
      describe: 'Set the width',
      default: 1024
    },
    height: {
      alias: 'h',
      type: 'number' as const,
      describe: 'Set the height'
    },
    tool: {
      alias: 't',
      describe: 'Tool to use',
      type: 'string' as const,
      default: 'sharp',
      choices: ['sharp', 'mogrify']
    },
    exclude: {
      alias: 'e',
      describe: 'Files to exclude / ignore, separated by spaces',
      type: 'array' as const,
      default: ['opengraph']
    }
  };

  readonly description = 'Process images (minify, convert to webp and resize).';

  handler(yargs: Argv) {
    return yargs.command(this.command, this.description, this.options, async (args) => {
      const dist = args.distribution;
      await minify(args);
      args.distribution = 'src/assets/img/dist/webp';
      await towebp(args);
      args.source = dist;
      await resize(args);
    });
  }
}
const imageBuilder = new ImageBuilder();
type BuildOptions = InferredOptionTypes<typeof imageBuilder.options>;

export { imageBuilder, BuildOptions };
