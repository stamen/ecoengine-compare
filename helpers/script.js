module.exports = function script(options) {
  "use strict";

  options.data = options.data || {};
  options.hash = options.hash || {};
  options.data.pageScripts = options.data.pageScripts || [];
  options.data.pageRequire = options.data.pageRequire || [];

  options.data.pageScripts.push(options.fn(this));

  if (options.hash.require && options.hash.require.split) {
    options.data.pageRequire = options.data.pageRequire.concat(options.hash.require.split(","));
  }
};
