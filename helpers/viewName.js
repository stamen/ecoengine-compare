module.exports = function replace(options) {
  "use strict";

  var filepathArray = this.file.history[0].split("/");

  return filepathArray[filepathArray.length-1].split(".")[0];
};
