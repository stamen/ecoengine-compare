(function() {
  "use strict";

  var marker;

  function pointLayer(features, map) {

    features.length = 5000;

    return L.featureGroup(features.map(function(feature) {
      if (feature.geometry) {
        marker = L.marker([
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0]
          ],{
            "icon" : L.divIcon({className: "point-feature-icon"})
          });

          return marker;
        } else {
          return null;
        }
      }).filter(function(f) {return (f);}));

  }

  //
  // Make available to STMN namespace
  //
  if (typeof window.STMN !== "object") {
    window.STMN = {};
  }

  window.STMN.pointLayer = pointLayer;

  //
  // Make available to CommonJS
  //
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = STMN.pointLayer;

  // Make available to AMD module
  } else if (typeof define === "function" && define.amd) {
    define(STMN.pointLayer);
  }
}());
