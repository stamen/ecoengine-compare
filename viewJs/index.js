"use strict";

function IndexController() {

  var that   = this,
      layers = {},
      dropZoneLayers = {
        "dropzone1": function(pages) {

        },
        "dropzone2": STMN.hullLayer,
        "dropzone3": function(pages) {
          return new HexbinLayer();
        }
      },
      baseLayer, baseLayerAdded, layerMenu;

  //
  // Convenience methods for browsers
  //
  that.utils = STPX.browsersugar.mix({});

  function initMap() {

    // create a map in the "map" div, set the view to a given place and zoom
    that.map = L.map("map", {
      "minZoom" : 2,
      "scrollWheelZoom" : false
    }).setView([37.5333, -77.4667], 2);

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

  function showMenuItemLoadState(layer) {

    var layerNode = layerMenu.getLayerNode(layer);

    that.utils.append(layerNode, "<img class=\"loading\" src=\"https://i0.wp.com/cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/fancybox_loading.gif\">");
  }

  function hideMenuItemLoadState(layer) {
    var layerNode   = layerMenu.getLayerNode(layer),
        loadingNode = layerNode.querySelector(".loading");

    if (loadingNode) {
      loadingNode.parentNode.removeChild(loadingNode);
    }
  }

  function initLayerMenu() {
    layerMenu = new STMN.LegendLayerMenu("#legend-layer-menu");

    layerMenu.on("layerAdded", function (e) {

      var layer = e.caller;

      showMenuItemLoadState(layer);
      that.showLayer(layer, function() {
        hideMenuItemLoadState(layer);
      }); //Passing a layer object

    });
  }

  function buildLayer(layerObject, pages) {

    layers[layerObject.list][layerObject.id] = dropZoneLayers[layerObject.list](pages, {
      color : "red"
    });

    that.map.addLayer(layers[layerObject.list][layerObject.id]);
  }

  function showLayer(layerObject, callback) {

    //
    // Add an object to the layer cache for
    // this list if it does not already exist
    //
    if (typeof layers[layerObject.list] !== "object") {
      layers[layerObject.list] = {};
    }

    if (typeof baseLayerAdded !== "boolean") {
      baseLayer.addTo(that.map);
      baseLayerAdded = true;
    }

    return (new STMN.EcoengineClient).requestRecursive(layerObject.uri,
    function(pages) { //Done

      if (typeof layers[layerObject.list][layerObject.id] === "object") {
        that.map.removeLayer(layers[layerObject.list][layerObject.id]);
        delete layers[layerObject.list][layerObject.id];
      }

      buildLayer(layerObject, pages);

      that.map.fitWorld();

      that.fire("showLayer");

      if (typeof callback === "function") {
        callback();
      }
    },
    function(pages) { //Progress

      if (typeof layers[layerObject.list][layerObject.id] === "object") {
        that.map.removeLayer(layers[layerObject.list][layerObject.id]);
        delete layers[layerObject.list][layerObject.id];
      }

      buildLayer(layerObject, pages);

      that.map.fitWorld();

      that.fire("showLayerProgress");
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
  that.showMenuItemLoadState = showMenuItemLoadState;
  that.hideMenuItemLoadState = hideMenuItemLoadState;

  //
  // Init
  //
  initMap();
  initLayerMenu();

  return that;

}

(new (STPX.samesies.extend(IndexController))());
