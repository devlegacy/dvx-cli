const { handler: minify } = require('./minify');
const { handler: towebp } = require('./towebp');
const { handler: resize } = require('./resize');

module.exports = {
  command: 'img:build',
  description: 'Process images (minify, convert to webp and resize).',
  options: {
    source: {
      alias: 'src',
      describe: 'Source path of the images without optimization.',
      type: 'string',
      default: 'src/assets/img/src',
    },
    distribution: {
      alias: 'dist',
      describe: 'Distribution path for optimized image .',
      type: 'string',
      default: 'src/assets/img/dist',
    },
    use: {
      describe: 'Tool to use',
      type: 'string',
      default: 'sharp',
      choices: ['mogrify', 'sharp'],
    },
    exclude: {
      alias: 'exc',
      describe: 'Files to exclude / ignore, separated by spaces',
      type: 'array',
      default: ['opengraph'],
    },
  },
  handler: async (args: any) => {
    const dist = args.dist;
    await minify(args);
    args.dist = 'src/assets/img/dist/webp';
    await towebp(args);
    args.src = dist;
    await resize(args);
  },
};
