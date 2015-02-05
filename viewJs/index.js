"use strict";

function IndexController() {

  var that   = this,
      layers = {},
      baseLayer, baseLayerAdded;

  function initMap() {

    // create a map in the "map" div, set the view to a given place and zoom
    that.map = L.map("map", {
      "minZoom" : 2
    }).setView([37.5333, -77.4667], 7);

    //
    // Add base-layer
    //
    baseLayer = L.tileLayer("http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
      attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"
    });

    //
    // Control base-layer visibility
    //
    that.on("showLayer", function() {
      console.log("show layer");
      document.querySelector("#map-instruction").style.opacity = 0;
    });

    that.on("hideLayer", function() {
      console.log("hide layer");
    });

  }

  function buildLayer(id, list, uri, pages) {

    console.log("Args",arguments);

    layers[list][id] = STMN.hullLayer(pages, {
      color : "red"
    });

    layers[list][id].addTo(that.map);
  }

  function showLayer(id, list, uri) {

    //
    // Add an object to the layer cache for
    // this list if it does not already exist
    //
    if (typeof layers[list] !== "object") {
      layers[list] = {};
    }

    if (typeof baseLayerAdded !== "boolean") {
      baseLayer.addTo(that.map);
      baseLayerAdded = true;
    }

    return (new STMN.EcoengineClient).requestRecursive(uri,
    function(pages) { //Done

      if (typeof layers[list][id] === "object") {
        that.map.removeLayer(layers[list][id]);
        delete layers[list][id];
      }

      buildLayer(id, list, uri, pages);

      that.map.fitBounds(layers[list][id].getBounds());

      that.fire("showLayer");
    },
    function(pages) { //Progress

      if (typeof layers[list][id] === "object") {
        that.map.removeLayer(layers[list][id]);
        delete layers[list][id];
      }

      buildLayer(id, list, uri, pages);

      that.map.fitBounds(layers[list][id].getBounds());

      that.fire("showLayer");
    });

  }

  function hideLayer(id, list) {

    if (typeof layers[list] === "object" && typeof layers[list][id] === "object") {
      that.map.removeLayer(layers[list][id]);

      that.fire("hideLayer");

      return true;
    } else {
      return false;
    }

  }

  //
  // Public interface
  //
  that.showLayer = showLayer;
  that.hideLayer = hideLayer;

  //
  // Init
  //
  initMap();

  //
  // Console log some helpful test queries
  //
  //console.log("Here are some helpful test queries:");
  //console.log("https://dev-ecoengine.berkeley.edu/api/observations/?format=geojson&selected_facets=genus_exact%3A%22tamias%22&q=&min_date=1900-01-01&max_date=1930-12-30&page_size=2000");
  //console.log("https://dev-ecoengine.berkeley.edu/api/observations/?format=geojson&selected_facets=genus_exact%3A%22tamias%22&q=&min_date=1930-12-30&max_date=1950-12-30&page_size=2000");
  //console.log("https://dev-ecoengine.berkeley.edu/api/observations/?format=geojson&selected_facets=genus_exact%3A%22tamias%22&q=&min_date=1950-12-30&max_date=1970-12-30&page_size=2000");

  return that;

}

var index = new (STPX.samesies.extend(IndexController))();

var LayerMenu = new STMN.LayerMenu();

LayerMenu.on("layerAdded", function (e) {
  index.showLayer(
    e.caller.id,
    e.caller.list,
    e.caller.uri
  );
});
