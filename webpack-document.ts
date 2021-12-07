//

import {
  Configuration
} from "webpack";


let config = {
  mode: "none",
  target: "node",
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
  }
} as Configuration;

export default config;