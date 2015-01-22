(function(exports) {

  "use strict";

  function request(uri, callback) {
    if (window && window.XMLHttpRequest) {
      var xmlHttp = null;

      xmlHttp = new window.XMLHttpRequest();

      xmlHttp.onreadystatechange = function() {
        if ((xmlHttp.readyState|0) === 4) {
          if ((xmlHttp.status|0) === 200 ) {

            callback(null, xmlHttp);
          } else {
            callback(xmlHttp);
          }
        }
      };

      xmlHttp.open( "GET", uri, false );
      return xmlHttp.send( null );
    } else {
      return false;
    }
  }

  var pages = [],
  thisPage, firstCallback, firstProgress;

  function requestRecursive(uri, callback, progress) {

    if (callback) {
      firstCallback = callback;
    }

    if (progress) {
      firstProgress = progress;
    }

    request(uri, function(e, r) {

      thisPage = JSON.parse(r.responseText);

      pages = pages.concat(thisPage.features);

      if (thisPage.next) {

        firstProgress(pages);
        requestRecursive(thisPage.next, null);

      } else {

        firstCallback(pages);

      }

    });

  }

  exports.berkeley = {
    "requestRecursive" : requestRecursive
  };

}(window.STMN));
