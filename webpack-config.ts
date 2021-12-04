//

import path from "path";
import WebpackShellPlugin from "webpack-shell-plugin-next";
import externals from "webpack-node-externals";


let config = {
  entry: {
    index: ["./converter/index.ts"]
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  devtool: "inline-source-map",
  mode: "development",
  target: "node",
  externals: [externals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.js$/,
        enforce: "pre",
        loader: "source-map-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  cache: true
};

export default config;