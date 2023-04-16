// Create a webpack.js that maps the following files:
//   ./src/content.ts -> ./extension/content.js
//   ./src/background.ts -> ./extension/background.js
//   ./src/manifest.json ->  ./extension/manifest.json

const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  devtool: false,
  entry: {
    content: "./src/content.tsx",
    background: "./src/background.ts",
  },
  output: {
    path: path.resolve(__dirname, "../extension"),
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
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // "style-loader",
          "to-string-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require("dart-sass"),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "./src/manifest.json" }],
    }),
  ],
};
