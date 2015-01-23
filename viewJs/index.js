"use strict";

function IndexController() {

  var map;

  function initMap() {

    // create a map in the "map" div, set the view to a given place and zoom
    map = L.map("map").setView([37.5333, -77.4667], 7);

    // add an OpenStreetMap tile layer
    L.tileLayer("http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
      attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"
    }).addTo(map);

  }

  //
  // Init
  //
  initMap();

  setTimeout(function() {
    STMN.berkeley.requestRecursive("https://dev-ecoengine.berkeley.edu/api/observations/?format=geojson&selected_facets=genus_exact%3A%22tamias%22&q=&min_date=1900-01-01&max_date=1930-12-30&page_size=2000",
    function(pages) { //Done
      //console.log("Done.", pages);

      var hulllayer1 = STMN.hullLayer(pages, {
        color : "blue"
      });
      hulllayer1.addTo(map);

      map.fitBounds(hulllayer1.getBounds());




    },
    function(pages) { //Progress
      console.log("Page recieved.", pages);
    });
  }, 1000);

  /*
  setTimeout(function() {
  STMN.berkeley.requestRecursive("https://dev-ecoengine.berkeley.edu/api/observations/?format=geojson&selected_facets=kingdom_exact%3A%22animalia%22&&selected_facets=genus_exact%3A%22tamias%22&&selected_facets=resource_exact%3A%22Observations%22&q=&min_date=1970-01-01&max_date=2010-12-30&page_size=2000",
  function(pages) { //Done
  //console.log("Done.", pages);

  var hulllayer2 = exports.hullLayer(pages, {
  color : "red"
});
hulllayer2.addTo(map);




},
function(pages) { //Progress
console.log("Page recieved.", pages);
});
}, 100);
*/

}

(new IndexController());
