import { Argv, InferredOptionTypes } from 'yargs';
import { minify, MinifyOptions } from './image-minify';
import { resize, ResizeOptions } from './image-resize';
import { towebp, ToWebPOptions } from './image-to-webp';

const command = 'img:build';
const options = {
  source: {
    alias: 'src',
    describe: 'Source path of the images without optimization.',
    type: 'string' as 'string',
    default: 'src/assets/img/src'
  },
  distribution: {
    alias: 'dist',
    describe: 'Distribution path for optimized image .',
    type: 'string' as 'string',
    default: 'src/assets/img/dist'
  },
  width: {
    alias: 'w',
    type: 'number' as 'number',
    describe: 'Set the width',
    default: 1024
  },
  height: {
    alias: 'h',
    type: 'number' as 'number',
    describe: 'Set the height'
  },
  tool: {
    alias: 't',
    describe: 'Tool to use',
    type: 'string' as 'string',
    default: 'mogrify',
    choices: ['mogrify', 'sharp']
  },
  exclude: {
    alias: 'e',
    describe: 'Files to exclude / ignore, separated by spaces',
    type: 'array' as 'array',
    default: ['opengraph']
  }
};

export type BuildOptions = InferredOptionTypes<typeof options>;
export default (yargs: Argv) => {
  const description = 'Process images (minify, convert to webp and resize).';

  return yargs.command(command, description, options, async (args) => {
    const dist = args.distribution;
    await minify(args);
    args.distribution = 'src/assets/img/dist/webp';
    await towebp(args);
    args.source = dist;
    await resize(args);
  });
};
