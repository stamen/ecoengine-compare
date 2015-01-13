module.exports = function writeScript(options) {
  "use strict";

  options.data = options.data || {};
  options.data.pageRequire = options.data.pageRequire || [];
  options.data.pageScripts = options.data.pageScripts || [];

  return [
    "<script>",
    "require([",
    options.data.pageRequire
      .map(function(req) {
        return "\"" + req + "\"";
      })
      .join(","),
    "], function(",
    options.data.pageRequire
      .map(function(req) {
        var parts = req.split("/")[req.split("/").length-1].split("-");

        if (parts.length < 2) {
          return parts[0];
        } else {
          //
          // Change dashed names to camelCase
          //
          return parts
            .map(function(part, i) {
              if (i > 0) {
                return part.substring(0, 1).toUpperCase() + part.substring(1);
              } else {
                return part;
              }
            })
            .join("").replace(/css!/,"css");
        }

      })
      .join(","),
    ") {",
    options.data.pageScripts.join("\n"),
    "});",
    "</script>"
  ].join("\n");

};
