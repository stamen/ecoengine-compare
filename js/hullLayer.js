(function () {
  "use strict";

  var group;

  function hullLayer(features, options) {

    group = new L.MarkerClusterGroup({
      "sColor" : options.color,
      spiderfyDistanceMultiplier: 0
    });

    features.forEach(function(feature) {
      if (feature.geometry) {
        group.addLayer(L.marker([
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0]
          ],{
            "icon" : L.divIcon({className: "point-feature-icon point-feature-icon-" + options.color})
          }));
        }
    });

    return group;

  }

  //
  // Make available to STMN namespace
  //
  if (typeof window.STMN !== "object") {
    window.STMN = {};
  }

  window.STMN.hullLayer = hullLayer;

  //
  // Make available to CommonJS
  //
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = STMN.hullLayer;

  // Make available to AMD module
  } else if (typeof define === "function" && define.amd) {
    define(STMN.hullLayer);
  }
}());
