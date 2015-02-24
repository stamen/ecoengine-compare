"use strict";

function IndexController() {

  var that           = this,
      layers         = {},
      layerDataCache = {},
      rasterCache    = {},
      layerFactories = {
        "pointlayer": function (pages, layer) {
          var hex = new L.HexbinLayer({
                  radiusRange : [1,1],
                  radius: 1,
                  opacity: 1,
                  colorRange: [layer.color, layer.color]
              }).addTo(that.map);
          hex.data(pages.filter(function(p){return (typeof p.geometry === "object" && p.geometry !== null)}).map(function(p) {return p.geometry.coordinates;}));

          var hexGroup = L.featureGroup([hex]).addTo(that.map);

          return hexGroup;
        },
        "hulllayer": function (features, layer) {
          var group = new L.MarkerClusterGroup({
            "polygonOptions" : {
              "color"  : layer.color,
              "stroke" : false,
              "opacity" : 0.7
            }
          });

          features.forEach(function(feature) {
            if (feature.geometry) {
              group.addLayer(L.marker([
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0]
                ],{
                  "icon" : L.divIcon({className: "point-feature-icon point-feature-icon-" + layer.color})
                }));
              }
          });

          return group;
        },
        "hexlayer": function (pages, layer) {
          var hex = new L.HexbinLayer({
                  radiusRange : [1,document.querySelector("#hexagon-radius").value],
                  radius: document.querySelector("#hexagon-radius").value,
                  opacity: 1,
                  colorRange: [layer.color, layer.color]
              }).addTo(that.map);

          hex.hexMouseOver(function(d) {
            // console.log(d);
          });
          hex.hexMouseOut(function(d) {
            // hide data table
          });
          hex.hexClick(function(hexdata) {
            var data = hexdata.map(function(p) {
              var ret = p.d.properties;
              ret.long = p.d.geometry.coordinates[0];
              ret.lat = p.d.geometry.coordinates[1];
              return ret;
            });

            var w = window.open('', 'wnd');
            w.document.body.innerHTML = "<pre>" + d3.csv.format(data) + "</pre>";
            // export data
          });

          hex.data(pages.filter(function(p){return (typeof p.geometry === "object" && p.geometry !== null)}).map(function(p) {
            p[0] = p.geometry.coordinates[0];
            p[1] = p.geometry.coordinates[1];
            return p;
          }));

          var hexGroup = L.featureGroup([hex]).addTo(that.map);

          hexGroup.__sHexLayer = true;

          return hexGroup;
        },
        "raster" : function (pages, layer) {
          rasterLayers.push(L.tileLayer(layer.uri, {
            transparent: true,
            unloadInvisibleTiles: true
          }));

          rasterLayers[rasterLayers.length-1].addTo(that.map);

          return rasterLayers[rasterLayers.length-1];
        }
      },
      rasterLayers = [],
      layerMenu, shareButtonElement;

  //
  // Convenience methods for browsers
  //
  that.utils = STPX.browsersugar.mix({});

  function initMap() {

    // create a map in the "map" div, set the view to a given place and zoom
    that.map = L.map("map", {
      "minZoom" : 2,
      "maxZoom" : 17,
      "scrollWheelZoom" : false
    }).setView([37.5333, -77.4667], 2);

    window.STMN.map = that.map;
    window.STMN.layers = layers;

    (new L.Hash(that.map));

    //
    // Add base-layer
    //
    rasterLayers.push(L.tileLayer("http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
      attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"
    }))
    rasterLayers[rasterLayers.length-1].addTo(that.map);

    rasterCache["baselayer"] = "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png";
    layers["baselayer"] = rasterLayers[rasterLayers.length-1];

    that.layerMenu.on("orderChanged", function(e) {

      updateDisplayOrder(e.caller.order);

      e.caller.order.forEach(function(layerItem) {
        showLayer(layerItem);
      });
    });

    that.layerMenu.on("color-change", function(e) {

      //
      // Color change handler for point and hexagon layers
      //
      if (e.caller.list === "pointlayer" || e.caller.list === "hexlayer") {
        layers[e.caller.id].getLayers()[0].colorScale().range([e.caller.color, e.caller.color]);
        layers[e.caller.id].getLayers()[0]._redraw();
      }

      //
      // Color change handler for Convex Hull layers
      //
      if (e.caller.list === "hulllayer") {

        layers[e.caller.id]._featureGroup.getLayers().forEach(function(layer) {

          var innerMarker;

          if (layer._icon) {
            innerMarker = layer._icon.querySelector(".innerMarker");

            if (innerMarker) {
              innerMarker.style.backgroundColor = e.caller.color;
            }
          }

          if (layer._group) { //A layer group
            layer._group.getLayers().forEach(function(subLayer) {

              if (subLayer._path) { //a polygon
                subLayer.setStyle({
                  "color" : e.caller.color
                });
              }

            });
          }
        });
      }

    });

    //
    // Hexagon radius slider
    //
    document.querySelector("#hexagon-radius").addEventListener("change", function(e) {
      that.map.eachLayer(function(layer) {

        if (layer.__sHexLayer === true) {
          layer.getLayers()[0].options.radius = +e.target.value;
          layer.getLayers()[0].options.radiusRange = [1, +e.target.value];
          var data = layer._data;
          layer.getLayers()[0].initialize(layer.options);
          layer.getLayers()[0].data(data);
      }

      });
    });

  }

  function updateDisplayOrder(order) {

    order.forEach(function(layer) {

      if (layers[layer.id] && layers[layer.id].bringToBack) {
        layers[layer.id].bringToBack();
      }

    });
  }

  function showMenuItemLoadState(layer) {

    var layerNode = layerMenu.getLayerNode(layer);

    layerNode.classList.add("progress");

    that.utils.append(layerNode, "<div id=\"floatingCirclesG\" class=\"loading\"><div class=\"f_circleG\" id=\"frotateG_01\"></div><div class=\"f_circleG\" id=\"frotateG_02\"></div><div class=\"f_circleG\" id=\"frotateG_03\"></div><div class=\"f_circleG\" id=\"frotateG_04\"></div><div class=\"f_circleG\" id=\"frotateG_05\"></div><div class=\"f_circleG\" id=\"frotateG_06\"></div><div class=\"f_circleG\" id=\"frotateG_07\"></div><div class=\"f_circleG\" id=\"frotateG_08\"></div></div>");
  }

  function hideMenuItemLoadState(layer) {
    var layerNode   = layerMenu.getLayerNode(layer),
        loadingNode = layerNode.querySelector(".loading");

    layerNode.classList.remove("progress");

    if (loadingNode) {
      loadingNode.parentNode.removeChild(loadingNode);
    }
  }

  function clearLayers() {

    that.map.eachLayer(function(layer) {

      //
      // Clear everything but rasters
      //
      if (typeof layer.getTileUrl !== "function") {
        that.map.removeLayer(layer);
      }

    });

    layers = {};
  }

  function initLayerMenu() {
    var layerMinNode         = document.querySelector("#legend-layer-menu-min"),
        layerPanelClose      = document.querySelector("#legend-layer-menu .close-button"),
        uriSegmentRegEx      = /"uri":"([^"]+)"/,
        menuStateStringParts = [],
        startingMenuState;

    //
    // The menu state taken from the URL might be corrupted. Lets try to make it
    // an object and set it as null if it fails
    //

    try {
      startingMenuState = JSON.parse(decodeURIComponent(LZString.decompressFromBase64(that.statefulQueryString.get("state"))));
    } catch (err) {
      startingMenuState = null;
    }

    layerMenu = new STMN.LegendLayerMenu("#legend-layer-menu", {
      "menuState" : startingMenuState
    });
    that.layerMenu = layerMenu;

    //
    // Add layers to the map if there are any
    //
    startingMenuState = layerMenu.getMenuState(); //This has more data attached to it after being passed through the constructor

    if (startingMenuState) {
      startingMenuState.forEach(function(layer) {
        showMenuItemLoadState(layer);
        that.showLayer(layer, function() {
          hideMenuItemLoadState(layer);
        }); //Passing a layer object
      });
    }

    //
    // when a layer is added, put it on the map
    //
    layerMenu.on("layerAdded", function (e) {

      var layer     = e.caller,
          menuState = layerMenu.getMenuState();

      showMenuItemLoadState(layer);
      that.showLayer(layer, function() {
        hideMenuItemLoadState(layer);
      }); //Passing a layer object

      menuState = menuState.map(function(layer) {

        delete layer.id;
        delete layer.element;

        layer.uri = layer.uri.replace(/%22/g,"'");

        return layer;

      });

      that.statefulQueryString.set("state", encodeURIComponent(LZString.compressToBase64(JSON.stringify(menuState))));

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

  function initStatefulQuerystring() {

    that.statefulQueryString = new STMN.StatefulQueryString();

  }

  function initShareButton() {

    shareButtonElement = layerMenu.rootNode.querySelector(".ecoengine-compare .share-button");

    if (shareButtonElement) {

      shareButtonElement.addEventListener("click", function() {

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.open("POST","https://www.googleapis.com/urlshortener/v1/url",true);
        xmlhttp.setRequestHeader("Content-type","application/json");

        xmlhttp.onreadystatechange = function() {

          if (xmlhttp.readyState==4 && xmlhttp.status==200) {

            swal({
              "title"              : "Here is your share link",
              "text"               : (JSON.parse(xmlhttp.responseText)).id,
              "confirmButtonText"  : "All done",
              "confirmButtonColor" : "rgb(103,171,236)",
              "closeOnConfirm"     : true,
              "customClass"        : "modal-share"
            });

            setTimeout(function() {

              var sweetAlert = document.querySelector(".sweet-alert");

              if (sweetAlert) {
                sweetAlert.removeAttribute("tabIndex");
              }

            }, 100);

          } else {

            swal("Here's the thing", "We were not able to create a short URL. Please check your connection and try again in a few minutes.", "error");

          }
        };

        xmlhttp.send("{\"longUrl\": \"" + location.href + "\"}");

      }, false);

    }

  }

  function buildLayer(layerObject, pages) {

    //
    // Don't proceed if this is a cached raster
    //
    if (!layerObject.list === "raster" || (!rasterCache[layerObject.id] || rasterCache[layerObject.id] !== layerObject.uri)) {

      //
      // Cache this raster layer
      //
      if (layerObject.list === "raster") {
        rasterCache[layerObject.id] = layerObject.uri;
      }

      if (typeof layers[layerObject.id] === "object" && layerObject.list !== "raster") {
         that.map.removeLayer(layers[layerObject.id]);
         delete layers[layerObject.id];
       }

      layers[layerObject.id] = layerFactories[layerObject.list](pages, layerObject);

      that.map.addLayer(layers[layerObject.id]);

    }
  }

  function showLayer(layerObject, callback) {

    //
    // At this time we will only fetch a layer once per page load
    // for that reason we can assume that if we have data for a layer
    // we can use it. One could force an update by deleting the
    // cache entry for a layer
    //

    if (layerDataCache[layerObject.id] || layerObject.list === "raster") {

      buildLayer(layerObject, layerDataCache[layerObject.id]);

    } else {

      return (new STMN.EcoengineClient).requestRecursive(layerObject.uri.replace(/'/g,'"'),
      function(pages) { //Done

        layerDataCache[layerObject.id] = pages;
        buildLayer(layerObject, pages);

        that.fire("showLayer");

        if (typeof callback === "function") {
          callback();
        }
      },
      function(pages) { //Progress

        buildLayer(layerObject, pages);

        that.fire("showLayerProgress");
      });

    }

  }

  function hideLayer(id, list) {

    that.map.removeLayer(layers[id]);

    that.fire("showLayer", {
      layer : layers[id]
    });

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
  initStatefulQuerystring();
  initLayerMenu();
  initMap();
  initShareButton();

  return that;

}

(new (STPX.samesies.extend(IndexController))());
