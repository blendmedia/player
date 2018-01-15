// Karma configuration
module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["mocha", "chai"],
    // list of files / patterns to load in the browser
    files: [
      "test/**/*.js",
    ],
    // list of files / patterns to exclude
    exclude: [
    ],
    // preprocess matching files before serving them to the browser
    preprocessors: {
      "test/**/*.js": ["rollup"],
    },
    reporters: ["mocha"],
    rollupPreprocessor: {
      output: {
        format: "iife",
      },
      plugins: [
        require("rollup-plugin-replace")({
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        }),
        require("rollup-plugin-commonjs")({
          include: "node_modules/**",
        }),
        require("rollup-plugin-eslint")({
          exclude: [
            "node_modules/**",
            "src/styles/**",
          ],
        }),
        require("rollup-plugin-babel")({
          exclude: "node_modules/**",
          babelrc: false,
          presets: ["es2015-rollup"],
        }),
        require("rollup-plugin-node-resolve")({
          jsnext: true,
          module: true,
          main: true,
          browser: true,
          modulesOnly: false,
        }),
      ],
    },
    // web server port
    port: 9876,
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    // level of logging
    logLevel: config.LOG_WARN,
    autoWatch: true,
    // start these browsers
    browsers: [
      "ChromeHeadless",
      "FirefoxHeadless",
    ],
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  });
};
