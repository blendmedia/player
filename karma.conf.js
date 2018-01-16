// Karma configuration
module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["mocha", "chai", "chai-as-promised", "sinon"],
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
    junitReporter: {
      outputDir: process.env.JUNIT_REPORT_PATH,
      outputFile: process.env.JUNIT_REPORT_NAME,
      useBrowserName: false,
    },
    rollupPreprocessor: require("./config/test.js"),
    // web server port
    port: 9876,
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    // level of logging
    logLevel: config.LOG_WARN,
    autoWatch: true,
    // start these browsers
    browsers: [
      "MyChromeHeadless",
      "MyFirefoxHeadless",
    ],

    customLaunchers: {
      "MyChromeHeadless": {
        base: "Chrome",
        flags: [
          "--headless",
          "--remote-debugging-port=9222",
        ],
      },
      "MyFirefoxHeadless": {
        base: "Firefox",
      },
    },
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  });
};
