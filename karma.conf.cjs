module.exports = function (config) {
  config.set({
    files: [
      'dist/bundle/wretch.all.min.js',
      'test/browser/*.spec.js'
    ],
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      // require('karma-safari-launcher'),
      require('karma-safarinative-launcher'),
    ],
    reporters: ['progress'],
    port: 9877,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless', 'FirefoxHeadless', 'SafariNative'],
    autoWatch: false,
    concurrency: 1
  })
}
