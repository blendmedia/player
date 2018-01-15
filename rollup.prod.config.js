import common from "./rollup.common.config";
import uglify from "rollup-plugin-uglify";

export default [
  Object.assign({}, common, {
    output: {
      file: "dist/blend-player.js",
      format: "umd",
      name: "blendPlayer",
    },
    plugins: [
      ...common.plugins,
      uglify(),
    ],
  }),
  Object.assign({}, common, {
    output: {
      file: "dist/blend-player.es6.js",
      format: "es",
    },
  }),
];
