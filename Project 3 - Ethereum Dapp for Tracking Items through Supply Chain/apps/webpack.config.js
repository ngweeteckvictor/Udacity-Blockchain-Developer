const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: "./src/js/app.js",
  output: {
    filename: "js/app.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin([{ from: "./src/index.html", to: "index.html" }]),
    new CopyWebpackPlugin([{ from: "./src/style.css", to: "style.css" }]),
    new CopyWebpackPlugin([{ from: "./src/js/truffle-contract.js", to: "js/truffle-contract.js" }]),
  ],
  devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
};
