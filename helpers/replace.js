module.exports = function replace(options) {
  "use strict";

  return options
    .fn(this)
    .split(options.hash.item)
    .join(options.hash.with);
};
