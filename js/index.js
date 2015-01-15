require(["css!leaflet","leaflet","samesies"], function(leafletCSS, L, samesies) {
  "use strict";

  function IndexController() {

    var that = this;

    samesies.mix(that);

    function initMap() {

      // create a map in the "map" div, set the view to a given place and zoom
      var map = L.map("map").setView([37.5333, -77.4667], 13);

      // add an OpenStreetMap tile layer
      L.tileLayer("http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"
      }).addTo(map);

      // add a marker in the given location, attach some popup content to it and open the popup
      L.marker([37.5333, -77.4667]).addTo(map)
      .bindPopup("Hi DSL!")
      .openPopup();

      map.on("moveend", function() {
        that.fire("moved");
      });

    }

    //
    // Init
    //
    initMap();

  }

  var indexController = new IndexController();

  indexController.on("moved", function() {
    alert("Moved!");
  });

});
