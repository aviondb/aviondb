"use strict"

const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/core/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ]
  },
  output: {
    libraryTarget: "var",
    library: "AvionDB",
    filename: "./aviondb.min.js"
  },
  target: "web",
  devtool: "none",
  externals: {
    fs: "{}",
    mkdirp: "{}"
  },
  node: {
    console: false,
    Buffer: true,
    mkdirp: "empty"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": JSON.stringify(process.env.NODE_ENV)
      }
    })
  ],
  resolve: {
    extensions: [".ts", ".js"],
    modules: [
      "node_modules",
      path.resolve(__dirname, "./node_modules")
    ],
    alias: {
      leveldown: "level-js"
    }
  },
  resolveLoader: {
    extensions: [".ts", ".js"],
    modules: [
      "node_modules",
      path.resolve(__dirname, "./node_modules")
    ],
    moduleExtensions: ["-loader"]
  }
};