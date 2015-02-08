"use strict";

function IndexController() {

  var that   = this,
      layers = {},
      dropZoneLayers = {
        "pointlayer": function(pages) {
          var hex = new L.HexbinLayer({
                  radius : 1,
                  opacity: 1
              }).addTo(that.map);
          hex.data(pages.filter(function(p){return (typeof p.geometry === "object" && p.geometry !== null)}).map(function(p) {return p.geometry.coordinates;}));
          return hex;
        },
        "hulllayer": STMN.hullLayer,
        "hexlayer": function(pages) {
          var hex = new L.HexbinLayer().addTo(that.map);
          hex.data(pages.filter(function(p){return (typeof p.geometry === "object" && p.geometry !== null)}).map(function(p) {return p.geometry.coordinates;}));
          return hex;
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

    that.utils.append(layerNode, "<div id=\"floatingCirclesG\" class=\"loading\"><div class=\"f_circleG\" id=\"frotateG_01\"></div><div class=\"f_circleG\" id=\"frotateG_02\"></div><div class=\"f_circleG\" id=\"frotateG_03\"></div><div class=\"f_circleG\" id=\"frotateG_04\"></div><div class=\"f_circleG\" id=\"frotateG_05\"></div><div class=\"f_circleG\" id=\"frotateG_06\"></div><div class=\"f_circleG\" id=\"frotateG_07\"></div><div class=\"f_circleG\" id=\"frotateG_08\"></div></div>");
  }

  function hideMenuItemLoadState(layer) {
    var layerNode   = layerMenu.getLayerNode(layer),
        loadingNode = layerNode.querySelector(".loading");

    if (loadingNode) {
      loadingNode.parentNode.removeChild(loadingNode);
    }
  }

  function initLayerMenu() {
    var layerMinNode    = document.querySelector("#legend-layer-menu-min"),
        layerPanelClose = document.querySelector("#legend-layer-menu .close-button");

    layerMenu = new STMN.LegendLayerMenu("#legend-layer-menu");

    //
    // when a layer is added, put it on the map
    //
    layerMenu.on("layerAdded", function (e) {

      var layer = e.caller;

      showMenuItemLoadState(layer);
      that.showLayer(layer, function() {
        hideMenuItemLoadState(layer);
      }); //Passing a layer object

    });

    //
    // In mobile view there is a button to open the layermenu
    // this opens it
    //
    layerMinNode.addEventListener("click", function(e) {

      if (!layerMenu.rootNode.classList.contains("open")) {
        layerMenu.rootNode.classList.add("open");
      } else {
        layerMenu.rootNode.classList.remove("open");
      }

    }, false);

    //
    // In mobile view there is a button to open the layermenu
    // this closes it
    //
    layerPanelClose.addEventListener("click", function(e) {

      layerMenu.rootNode.classList.remove("open");

    }, false);

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
