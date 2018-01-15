import babel from "rollup-plugin-babel";
import eslint from "rollup-plugin-eslint";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import replace from "rollup-plugin-replace";

export default {
  input: "src/main.js",
  output: {
    file: "dist/blend-player.js",
    format: "umd",
  },
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
    resolve({
      jsnext: true,
      module: true,
      main: true,
      browser: true,
      modulesOnly: false,
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
  ],
};
