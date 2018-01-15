const replace  = require("rollup-plugin-replace");
const commonjs = require("rollup-plugin-commonjs");
const eslint   = require("rollup-plugin-eslint");
const babel    = require("rollup-plugin-babel");
const resolve  = require("rollup-plugin-node-resolve");

module.exports = {
  output: {
    format: "iife",
  },
  plugins: [
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
