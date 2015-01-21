require(["css!leaflet","leaflet","samesies","js/berkeley","js/pointLayer"], function(leafletCSS, L, samesies, berkeley, pointLayer) {
  "use strict";

  function IndexController() {

    var that = this,
        map;

    samesies.mix(that);



    function initMap() {

      // create a map in the "map" div, set the view to a given place and zoom
      map = L.map("map").setView([37.5333, -77.4667], 2);

      // add an OpenStreetMap tile layer
      L.tileLayer("http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"
      }).addTo(map);

      map.on("moveend", function() {
        that.fire("moved");
      });

    }

    //
    // Init
    //
    initMap();

    setTimeout(function() {
      berkeley.requestRecursive("https://dev-ecoengine.berkeley.edu/api/observations/?format=geojson&selected_facets=clss_exact%3A%22reptilia%22&&selected_facets=scientific_name_exact%3A%22Sceloporus%20occidentalis%22&q=&page_size=2000",
      function(pages) { //Done
        console.log("Done.", pages);
        pointLayer(pages).addTo(map);
      },
      function(pages) { //Progress
        console.log("Page recieved.", pages);
      });
    }, 100);

  }

  var indexController = new IndexController();

  console.log(indexController);

});
