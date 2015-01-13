module.exports = function setScript(options) {
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
        var parts = req.split("-");

        if (parts.length < 2) {
          return req;
        } else {
          //
          // Change dashed names to camelCase
          //
          return parts
            .map(function(part, i) {
              var partArray = part.split("/"),
                  bestPart = partArray[partArray.length-1];
              if (i > 0) {
                return bestPart.substring(0, 1).toUpperCase() + bestPart.substring(1);
              } else {
                return bestPart;
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
