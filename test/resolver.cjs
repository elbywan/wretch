const path = require("path")
const srcDir = path.resolve(__dirname, "..", "src")

module.exports = (path, options) => {
  if (options.basedir.startsWith(srcDir) && path.endsWith(".js")) {
    return options.defaultResolver(path.substring(0, path.length - 3) + ".ts", options);
  }
  return options.defaultResolver(path, options);
};