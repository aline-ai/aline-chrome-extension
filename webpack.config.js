// Create a webpack.js that maps the following files:
//   ./src/content.ts -> ./extension/content.js
//   ./src/background.ts -> ./extension/background.js
//   ./src/manifest.json ->  ./extension/manifest.json

const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// const ExtReloader  = require('webpack-ext-reloader');

module.exports = {
  watch: true,
  devtool: false,
  entry: {
    content: "./src/content.tsx",
    background: "./src/background.ts",
  },
  output: {
    path: path.resolve(__dirname, "extension"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    // new ExtReloader({
    //   manifest: path.resolve(__dirname, "./src/manifest.json"),
    //   entries: {
    //     contentScript: 'content',
    //     background: 'background'
    //   }
    // }),
    new CopyWebpackPlugin({
      patterns: [{ from: "./src/manifest.json" }],
    }),
  ],
  watch: true,
};
