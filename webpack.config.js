const webpack = require('webpack');
const path = require('path');

const APP_DIR = path.resolve(__dirname, 'src');
const BUILD_DIR = path.resolve(__dirname, 'public');
const NODE_ENV = process.env.NODE_ENV;

const config = {
  entry: `${APP_DIR}/index.js`,
  output: {
    path: BUILD_DIR,
    filename: 'assets/js/bundle.js',
  },
  resolve: {
    extensions: [".wasm", ".ts", ".tsx", ".mjs", ".cjs", ".js", ".json"],
    modules: [APP_DIR, 'node_modules'],
    alias: {
      // https://github.com/webpack/webpack/issues/4666
      constants: `${APP_DIR}/constants`,
    },
  },
  devtool: 'source-map',
  module: {
    rules: [{
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /(node_modules)/
      }, {
        test: [/\.vert$/, /\.frag$/, /\.glsl$/],
        use: ['raw-loader']
      }, {
        test: /\.(png|jpe?g|gif)$/i,
        use: ['file-loader']
      }
    ]
  },
  devServer: {
    contentBase: BUILD_DIR,
    port: 8080,
    stats: 'minimal',
  },
};

module.exports = config;
