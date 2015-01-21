define(["leaflet"],function() {

  "use strict";

  var marker;

  function pointLayer(features, map) {

    return L.layerGroup(features.map(function(feature) {
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

  return pointLayer;

});
