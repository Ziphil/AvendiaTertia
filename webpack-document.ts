//

import {
  Configuration,
  ProvidePlugin
} from "webpack";


let config = {
  mode: "none",
  target: "web",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            configFile: "tsconfig-document.json",
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "url": require.resolve("url"),
      "process": require.resolve("process/browser"),
      "zlib": require.resolve("browserify-zlib"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util"),
      "buffer": require.resolve("buffer"),
      "asset": require.resolve("assert"),
    }
  },
  plugins: [
    new ProvidePlugin({process: "process/browser"})
  ]
} as Configuration;

export default config;