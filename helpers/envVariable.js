module.exports = function envVariable(options) {
  "use strict";

  return process.env[options.hash.var];
};
