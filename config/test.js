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
      include: ["**/*.mp4"],
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
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
      babelrc: false,
      presets: ["es2015-rollup"],
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
