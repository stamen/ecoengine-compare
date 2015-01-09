module.exports = function script(options) {

  if (!options.data.pageScripts) {
    options.data.pageScripts = [];
    options.data.pageRequire = [];
  }

  options.data.pageScripts.push(options.fn(this));

  if (options.hash.require && options.hash.require.length) {
    options.data.pageRequire = options.data.pageRequire.concat(options.hash.require.split(","));
  }

};
