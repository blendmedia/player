import common from "./common";
import uglify from "rollup-plugin-uglify";
import resolve from "rollup-plugin-node-resolve";

export default [
  Object.assign({}, common, {
    output: {
      file: "dist/blend-player.js",
      format: "umd",
      name: "flex",
    },
    plugins: [
      ...common.plugins,
      resolve({
        jsnext: true,
        module: true,
        main: true,
        browser: true,
        modulesOnly: false,
      }),
      uglify(),
    ],
  }),
  Object.assign({}, common, {
    output: {
      file: "dist/blend-player.es6.js",
      format: "es",
    },
    external(id) {
      return [
        "gl-matrix",
        "detect-it",
        "babel-runtime",
        "debounce",
      ].some(prefix => id.indexOf(prefix) === 0);
    },
    plugins: [
      ...common.plugins,
    ],
  }),
];
