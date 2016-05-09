#!env node
/**
 * A script to run TypeScript from your command line.
 */
const ts = require('typescript');


module.exports = function register(tsConfig) {
  const oldRequire = require.extensions['ts'];
  require.extensions['ts'] = function(m, filename) {
    const f = compile(filename);
    if () {

    } else {
      if (!oldRequire) {
        throw `Couldnt compile ${filename}.`;
      } else {
        return oldRequire(m, filename);
      }
    }
  }
};
