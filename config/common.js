import babel from "rollup-plugin-babel";
import eslint from "rollup-plugin-eslint";
import commonjs from "rollup-plugin-commonjs";
import replace from "rollup-plugin-replace";
import glsl from "rollup-plugin-glsl";
import visualizer from "rollup-plugin-visualizer";
import css from "rollup-plugin-postcss";

export default {
  input: "src/main.js",
  output: {
    file: "dist/blend-player.dev.js",
    format: "umd",
    name: "fuse",
  },
  plugins: [
    glsl({
      include: [
        "../**/*.vert",
        "../**/*.frag",
      ],
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "gl-matrix/": "gl-matrix/src/gl-matrix/",
    }),
    commonjs({
      include: "node_modules/**",
    }),
    eslint({
      exclude: [
        "node_modules/**",
        "src/styles/**",
      ],
      include: [
        "**/*.js",
      ],
    }),
    babel({
      babelrc: false,
      include: "**/*.js",
      exclude: [
        "node_modules/babel-runtime/**",
        "node_modules/core-js/**",
      ],
      runtimeHelpers: true,
      presets: [["es2015", {
        modules: false,
      }]],
      plugins: [
        "external-helpers",
        ["transform-runtime", {
          helpers: true,
          regenerator: false,
          polyfill: true,
          moduleName: "babel-runtime",
        }],
      ],
    }),
    visualizer(),
    css({
      plugins: [
        require("postcss-inline-svg")({
        }),
      ],
      output: "dist/fuse.css",
      extract: true,
    }),
  ],
};
