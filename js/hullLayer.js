define(["leaflet","js/leaflet.markercluster-src"],function(leaflet, markercluster) {

  "use strict";

  var group;

  function hullLayer(features, options) {

    group = new L.MarkerClusterGroup({
      "sColor" : options.color
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

  return hullLayer;

});
