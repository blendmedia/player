const replace    = require("rollup-plugin-replace");
const commonjs   = require("rollup-plugin-commonjs");
const eslint     = require("rollup-plugin-eslint");
const babel      = require("rollup-plugin-babel");
const resolve    = require("rollup-plugin-node-resolve");
const fileAsBlob = require("rollup-plugin-file-as-blob");
const glsl       = require("rollup-plugin-glsl");

module.exports = {
  output: {
    format: "iife",
  },
  plugins: [
    glsl({
      include: [
        "../**.vert",
        "../**.frag",
      ],
    }),
    fileAsBlob({
      include: [
        "**/*.mp4",
        "**/*.webm",
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
      exclude: "node_modules/**",
      include: ["**/*.js"],
      babelrc: false,
      presets: [["es2015", {
        modules: false,
      }]],
    }),
    resolve({
      jsnext: true,
      module: true,
      main: true,
      browser: true,
      modulesOnly: false,
    }),
  ],
};
