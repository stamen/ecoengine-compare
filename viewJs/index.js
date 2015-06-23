"use strict";

function IndexController() {

  var that             = this,
      recordLimit      = 50000,
      layers           = {},
      layerDataCache   = {},
      rasterCache      = {},
      layerObjectCache = {},
      requests         = {},
      layerFactories   = {
        "pointlayer": function (pages, layer) {
          var hex = new L.HexbinLayer({
                  radiusRange : [4,4],
                  radius: 2,
                  opacity: 1,
                  colorRange: [layer.color, layer.color]
              }).addTo(that.map);
          hex.data(pages.filter(function(p){return (typeof p.geometry === "object" && p.geometry !== null)}).map(function(p) {return p.geometry.coordinates;}));

          var hexGroup = L.featureGroup([hex]).addTo(that.map);

          return hexGroup;
        },
        "hulllayer": function (features, layer) {
          var group = new L.MarkerClusterGroup({
            "maxClusterRadius" : 80,
            "polygonOptions" : {
              "color"  : layer.color,
              "stroke" : false,
              "opacity" : 0.7
            }
          }),
          dots;

          features.forEach(function(feature) {
            if (feature.geometry) {
              group.addLayer(L.circleMarker([
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0]
                ],{
                  "fillColor"   : layer.color,
                  "fillOpacity" : 0.5,
                  "stroke"      : false
                }));
              }
          });

          return group;
        },
        "hexlayer": function (pages, layer) {
          var hexRadius = +document.querySelector("#hexagon-radius").value;
          var hex = new L.HexbinLayer({
                  radiusRange : [Math.max(1,Math.sqrt(hexRadius)-1),hexRadius],
                  radius: hexRadius,
                  opacity: 1,
                  colorRange: [layer.color, layer.color]
              }).addTo(that.map);

          hex.hexMouseOver(function(d) {
            var combined = combine(d);
            that.popup = L.popup({
                closeButton: false
              })
              .setLatLng(that.map.layerPointToLatLng([d.x,d.y]))
              .setContent("" + combined.length + " Observations<br/><span style='color: #999;font-size: 0.8em;'>Click to export</span>")
              .openOn(that.map);
          });

          hex.hexMouseOut(function(d) {
            d3.selectAll(".leaflet-popup").style("display", "none");
          });

          hex.hexClick(function(d) {
            var w = window.open('', 'wnd');
            w.document.body.innerHTML = "<pre>" + d3.csv.format(combine(d)) + "</pre>";
          });

          hex.data(pages.filter(function(p){return (typeof p.geometry === "object" && p.geometry !== null)}).map(function(p) {
            p[0] = p.geometry.coordinates[0];
            p[1] = p.geometry.coordinates[1];
            return p;
          }));

          var hexGroup = L.featureGroup([hex]).addTo(that.map);

          function combine(d) {
            var i = d.i;
            var j = d.j;

            var combined = [];

            that.map.eachLayer(function(layer) {
              if (layer.__sHexLayer === true) {
                var hexdata = layer.getLayers()[0].hexagons.filter(function(d) {
                  return (d.i == i && d.j == j);
                }).data();
                combined = combined.concat(hexdata[0]);
              }
            });

            var data = combined.filter(function(p) {
              // why is this necessary?
              return !!p;
            }).map(function(p) {
              var ret = p.d.properties;
              ret.long = p.d.geometry.coordinates[0];
              ret.lat = p.d.geometry.coordinates[1];
              return ret;
            });

            return data;
          };

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
      startingMenuState = {},
      layerMenu, shareButtonElement, ecoEngineClient;

  //
  // Convenience methods for browsers
  //
  that.utils = STPX.browsersugar.mix({});

  //
  // Initialize leaflet and related plugins
  //
  function initMap() {

    var selectNode;

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
    rasterLayers.push(L.tileLayer(document.querySelector("#layer-select").value, {
      attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"
    }))
    rasterLayers[rasterLayers.length-1].addTo(that.map);

    rasterCache["baselayer"] = document.querySelector("#layer-select").value;
    layers["baselayer"] = document.querySelector("#layer-select").value;

    //
    // Set up map state
    //
    if (startingMenuState.d) {
      for (var i in startingMenuState.d) {
        if (startingMenuState.d.hasOwnProperty(i) && startingMenuState.d[i].length) {
          selectNode = document.querySelector("#" + i);

          if (selectNode) {
            buildLayer({
              "list" : "raster",
              "id"   : selectNode.getAttribute("data-id"),
              "uri"  : startingMenuState.d[i]
            });
          }
        }
      }
    }

    that.layerMenu.on("orderChanged", function(e) {

      //
      // Each layer might need to redraw
      //
      e.caller.order.forEach(function(layerItem) {
        layerObjectCache[layerItem.id] = layerItem;
        showLayer(layerItem);
      });

      that.on("showLayer", function() {

        updateDisplayOrder(that.layerMenu.getLayerOrder());

      });

      //
      // Restack
      //
      updateDisplayOrder(e.caller.order);

      updateURLState();
    });

    that.layerMenu.on("layerRemoved", function(e) {

      that.map.removeLayer(layers[e.caller]);
      delete layers[e.caller];
      delete layerDataCache[e.caller];
      delete layerObjectCache[e.caller];

      updateURLState();

    });

    that.layerMenu.on("color-change", function(e) {

      layerObjectCache[e.caller.id] = e.caller;

      //
      // Color change handler for point and hexagon layers
      //
      if (e.caller.list === "pointlayer" || e.caller.list === "hexlayer") {
        layers[e.caller.id].getLayers()[0].options.colorRange = [e.caller.color, e.caller.color];
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

              if (subLayer._path || subLayer._radius) { //a polygon

                subLayer.setStyle({
                  "color" : e.caller.color,
                  "fillColor" : e.caller.color
                });
              }

            });
          }
        });
      }

      that.utils.debounce(updateURLState, 10000)();

    });

    //
    // Hexagon radius slider
    //
    document.querySelector("#hexagon-radius").addEventListener("change", function(e) {
      document.querySelector("label[for=hexagon-radius]").innerHTML = "Radius " + document.querySelector("#hexagon-radius").value + "px";
      that.map.eachLayer(function(layer) {

        if (layer.__sHexLayer === true) {
          layer.getLayers()[0].options.radius = +e.target.value;
          layer.getLayers()[0].options.radiusRange = [Math.max(1,Math.sqrt(+e.target.value)-1), +e.target.value];
          var data = layer.getLayers()[0]._data;
          layer.getLayers()[0].initialize(layer.options);
          layer.getLayers()[0].data(data);
        }

      });

      updateURLState();
    });

    document.querySelector("label[for=hexagon-radius]").innerHTML = "Radius " + document.querySelector("#hexagon-radius").value + "px";

  }

  //
  // Restack leaflet layers to match the
  // legend layer menu order
  //
  function updateDisplayOrder(order) {

    order.forEach(function(layer, i) {

      if (layers[layer.id] && layers[layer.id].setZIndex) {
        layers[layer.id].setZIndex(i+1);
      }

    });
  }

  //
  // Turn the loading state of layer menu
  // on
  //
  function showMenuItemLoadState(layer) {

    var layerNode = layerMenu.getLayerNode(layer);

    layerNode.classList.add("progress");

    that.utils.append(layerNode, "<div class=\"loaderwrapper\"><div id=\"floatingCirclesG\" class=\"loading\"><div class=\"f_circleG\" id=\"frotateG_01\"></div><div class=\"f_circleG\" id=\"frotateG_02\"></div><div class=\"f_circleG\" id=\"frotateG_03\"></div><div class=\"f_circleG\" id=\"frotateG_04\"></div><div class=\"f_circleG\" id=\"frotateG_05\"></div><div class=\"f_circleG\" id=\"frotateG_06\"></div><div class=\"f_circleG\" id=\"frotateG_07\"></div><div class=\"f_circleG\" id=\"frotateG_08\"></div></div></div>");
  }

  //
  // Turn the loading state of layer menu
  // off
  //
  function hideMenuItemLoadState(layer) {
    var layerNode   = layerMenu.getLayerNode(layer),
        loadingNode = layerNode.querySelector(".loaderwrapper");

    layerNode.classList.remove("progress");

    if (loadingNode) {
      loadingNode.parentNode.removeChild(loadingNode);
    }
  }

  //
  // Clear all data layers
  //
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

  //
  // Update the state saved to the URL
  //
  function updateURLState() {
    var menuState = layerMenu.getMenuState(),
        fullState = {};

    menuState = menuState.map(function(layer) {

      delete layer.element;

      layer.uri = layer.uri.replace(/%22/g,"'");

      return layer;

    });

    fullState["m"] = menuState; //Data layers
    fullState["d"] = layerMenu.getDropdownState(); //Raster layers
    fullState["r"] = document.querySelector("#hexagon-radius").value; //Radius slider

    that.statefulQueryString.set("state", encodeURIComponent(LZString.compressToBase64(JSON.stringify(fullState))));
  }

  //
  // The following methods take a layer config
  //
  function _buildLayer(layerObject) {

    var menuState = layerMenu.getMenuState();

    showMenuItemLoadState(layerObject);
    that.showLayer(layerObject, function() {
      hideMenuItemLoadState(layerObject);
    }); //Passing a layer object

    updateURLState();
  }

  function buildLayer(layerObject, pages) {

    if (!layerObjectCache[layerObject.id]) {
      layerObjectCache[layerObject.id] = layerObject;
    }

    if (layerObjectCache[layerObject.id] && pages || layerObjectCache[layerObject.id].list === "raster") {

      //
      // Don't proceed if this is a cached raster
      //
      if (!layerObjectCache[layerObject.id].list === "raster" || (!rasterCache[layerObject.id] || rasterCache[layerObject.id] !== layerObject.uri)) {

        //
        // Cache this raster layer
        //
        if (layerObjectCache[layerObject.id].list === "raster") {
          rasterCache[layerObject.id] = layerObjectCache[layerObject.id].uri;
        }

        //
        // Clear out data layers
        //
        if (layers[layerObject.id]) {
          that.map.removeLayer(layers[layerObject.id]);
          delete layers[layerObject.id];
        }

        if (!layers[layerObject.id]) {

          layers[layerObject.id]               = layerFactories[layerObjectCache[layerObject.id].list](pages, layerObjectCache[layerObject.id]);
          layers[layerObject.id].__sOriginURI  = layerObjectCache[layerObject.id].uri;
          layers[layerObject.id].__sOriginList = layerObjectCache[layerObject.id].list;

          that.map.addLayer(layers[layerObject.id]);
        }

      }

    }

  }

  //
  // Set up the legend layer menu and associated events
  //
  function initLayerMenu() {
    var layerMinNode         = document.querySelector("#legend-layer-menu-min"),
        layerPanelClose      = document.querySelector("#legend-layer-menu .close-button"),
        uriSegmentRegEx      = /"uri":"([^"]+)"/,
        menuStateStringParts = [];

    //
    // The menu state taken from the URL might be corrupted. Lets try to make it
    // an object and set it as null if it fails
    //

    try {
      startingMenuState = JSON.parse(decodeURIComponent(LZString.decompressFromBase64(that.statefulQueryString.get("state"))));
    } catch (err) {
      //Really nothing to do. It's no big deal if this doesn't work
    }

    layerMenu = new STMN.LegendLayerMenu("#legend-layer-menu", {
      "menuState" : startingMenuState.m,
      "dropdownState" : startingMenuState.d
    });
    that.layerMenu = layerMenu;

    //
    // Set up hex radius
    //
    if (startingMenuState.r) {
      document.querySelector("#hexagon-radius").value = startingMenuState.r;
    }

    //
    // Add layers to the map if there are any
    //
    if (startingMenuState && !startingMenuState.m) {
      startingMenuState.m = layerMenu.getMenuState(); //This has more data attached to it after being passed through the constructor
    }

    if (startingMenuState.m) {
      startingMenuState.m.forEach(function(layer) {
        showMenuItemLoadState(layer);
        that.showLayer(layer, function() {
          hideMenuItemLoadState(layer);
        }); //Passing a layer object
      });
    }

    layerMenu.on("layerUpdated", function (e) {

      //
      // If the URI has changed, update the layer
      //
      if (e.caller.updatedProperties.indexOf("uri") > -1) {
        hideLayer(e.caller.layerObject.id, e.caller.layerObject.list);
        delete layerDataCache[e.caller.layerObject.id];
        _buildLayer(e.caller.layerObject);
      }

    });

    //
    // when a layer is added, put it on the map
    //
    layerMenu.on("layerAdded", function (e) {

      _buildLayer(e.caller);

    });

    //
    // When a layer is clicked
    //
    layerMenu.on("layer-click", function(e) {

      var loaderWrapper = that.utils.parentHasClass(e.caller.event.target, "loaderwrapper", 3);

      //
      // Clicking on loader
      //
      if (loaderWrapper) {
        layerMenu.showLayerError(e.caller.layerObject.id, "This layer was canceled before it's data had loaded completely");
        requests[e.caller.layerObject.id].forEach(function() {
          ecoEngineClient.stopRecursiveRequest(requests[e.caller.layerObject.id][0].id);
        });
      }

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
alert('hi')
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.open("POST", "https://www.googleapis.com/urlshortener/v1/url?key=" + STMN.googleKey, true);
        xmlhttp.setRequestHeader("Content-type","application/json");

				//var req = new Object();
				//req.longUrl = window.location.href;

				//var jsonStr = JSON.stringify(req);

				//xmlHttp.send(jsonStr);

        xmlhttp.onreadystatechange = function() {
console.log(xmlhttp.responseText)
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

  function showLayer(layerObject, callback) {

    //
    // Make an eco engine client
    //
    if (!ecoEngineClient) {
      ecoEngineClient = new STMN.EcoengineClient();
    }

    //
    // At this time we will only fetch a layer once per page load
    // for that reason we can assume that if we have data for a layer
    // we can use it. One could force an update by deleting the
    // cache entry for a layer
    //

    if (layerDataCache[layerObject.id] || layerObject.list === "raster") {

      buildLayer(layerObject, layerDataCache[layerObject.id]);

    } else {

      requests[layerObject.id] = ecoEngineClient.requestRecursive(layerObject.uri.replace(/'/g,'"'),
      function(err, pages) { //Done

        if (err && err.status !==0 /* aborted */) {
          layerMenu.showLayerError(layerObject.id, "There was an error communicating with the server");
        }

        if (pages && !pages.length) {
          layerMenu.showLayerError(layerObject.id, "This query returned 0 records.");
        } else {
          layerDataCache[layerObject.id] = pages;
          buildLayer(layerObject, pages);
        }

        that.fire("showLayer");

        if (typeof callback === "function") {
          callback();
        }
      },
      function(err, pages) { //Progress

        layerDataCache[layerObject.id] = pages;
        buildLayer(layerObject, pages);

        if (pages.length >= recordLimit) {
          ecoEngineClient.stopRecursiveRequest(requests[layerObject.id].id);

          layerMenu.showLayerError(layerObject.id, "A layer has reached the maximum number of records (" + recordLimit + ") and has been stopped.");
        }

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

  function init() {
    initStatefulQuerystring();
    initLayerMenu();
    initMap();
    initShareButton();
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
  if (STMN.dynamicTemplate) {
    if (STMN.dynamicTemplateReady) {
      init();
    } else {
      window.STMN.onTemplateReady = init;
    }
  } else {
    init();
  }

  return that;

}

(new (STPX.samesies.extend(IndexController))());
