// webpack/webpack.common.js
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    popup: path.resolve(__dirname, '../src/popup/index.tsx'),
    options: path.resolve(__dirname, '../src/options/index.tsx'),
    content: path.resolve(__dirname, '../src/content/index.tsx'),
    background: path.resolve(__dirname, '../src/background/index.ts'),
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                declaration: false,
                declarationMap: false,
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@shared': path.resolve(__dirname, '../src/shared'),
      '@popup': path.resolve(__dirname, '../src/popup'),
      '@content': path.resolve(__dirname, '../src/content'),
      '@background': path.resolve(__dirname, '../src/background'),
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'src/assets/icons', to: 'icons' },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/popup/popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/options/options.html'),
      filename: 'options.html',
      chunks: ['options'],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
};