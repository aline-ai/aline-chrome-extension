const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
var ZipPlugin = require("zip-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new ZipPlugin({
      path: "../dist",
      filename: "aline-0.0.0.2.zip",
      pathPrefix: ".",
    }),
  ],
});
