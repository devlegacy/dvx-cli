const { resolve } = require('path');

module.exports = (env, { mode } = argv) => ({
  entry: { index: './src/index.ts' },
  context: __dirname,
  mode,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: resolve(__dirname, './bin/'),
  },
  target: 'node',
  externals: {
    cliui: 'commonjs2 cliui',
    y18n: 'commonjs2 y18n',
    'yargs-parser': 'commonjs2 yargs-parser',
  },
});
