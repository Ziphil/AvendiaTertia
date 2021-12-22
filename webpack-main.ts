//

import path from "path";
import WebpackShellPlugin from "webpack-shell-plugin-next";
import externals from "webpack-node-externals";


let config = {
  entry: {
    index: ["./generator/index.ts"]
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
        use: {
          loader: "source-map-loader"
        }
      },
      {
        test: /\.html$/,
        use: {
          loader: "raw-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".html"],
    alias: {
      "~": path.resolve(__dirname),
    }
  },
  cache: true
};

export default config;