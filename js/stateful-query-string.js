//
// Stateful QueryString
//
// This module syncs an object and events with the browser location
// serch (query string) section.
//
// !!So far I have not needed this for a
// single page app so it only reads the query string once on load!!
//
// Requires:
//  * https://github.com/sindresorhus/query-string
//  * https://github.com/standardpixel/samesies
//

(function(history) {
  "use strict";

  function StatefulQueryString() {

    var that = this,
        cacheQueryString;

    function init() {

      //
      // Populate data object with starting state
      // of URL
      //
      cacheQueryString = queryString.parse(location.search);

      //
      // Set each property to the module data object
      //
      that.set(cacheQueryString);

      //
      // Set up data listener
      //
      that.on("set", function(e) {
        history.pushState({}, document.title, "?state=" + e.caller.data.state);
      });

    }

    //
    // Go for it!
    //
    if (history) {

      init();

    } else { //History API is not supported
      return null;
    }

  }

  //
  // Make available to STMN namespace
  //
  if (typeof window.STMN !== "object") {
    window.STMN = {};
  }

  //
  // Set the constructor to the STMN namespace
  //
  window.STMN.StatefulQueryString = STPX.samesies.extend(StatefulQueryString);

  //
  // Make available to CommonJS
  //
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = STMN.StatefulQueryString;

  // Make available to AMD module
  } else if (typeof define === "function" && define.amd) {
    define(["samesies", "query-string"], STMN.StatefulQueryString);
  }

}(window.history));
