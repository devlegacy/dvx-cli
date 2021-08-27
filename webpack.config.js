const { resolve } = require('path');
const { sync } = require('glob');

const entry = sync('./src/**/*.ts', {
  cwd: __dirname,
  nodir: true,
  cache: true,
}).reduce((entries, file) => {
  entries[file.replace('src/', '').replace(/\.ts$/, '')] = file;
  return entries;
}, {});

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = (env, { mode } = argv) => ({
  optimization: {
    minimize: true,
  },
  entry,
  context: __dirname,
  mode,
  module: {
    rules: [
      {
        test: resolve(__dirname, 'src/index.ts'),
        loader: 'string-replace-loader',
        options: {
          search: '#!/usr/bin/env node',
          replace: '',
        },
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.build.json',
              transpileOnly: true,
              happyPackMode: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  externals: [nodeExternals()],
  resolve: {
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.build.json' })],
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: resolve(__dirname, './bin/'),
    pathinfo: false,
  },
  target: 'node',
});
