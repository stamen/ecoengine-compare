(function() {
  "use strict";

  window.STMN = window.STMN || {};

  window.STMN.dynamicTemplate = true;

  function append(rootNode, html, callback) {
    var div = document.createElement("div");
    div.innerHTML = html;
    while (div.children.length > 0) {
      rootNode.appendChild(div.children[0]);
    }

    callback();

    return div.children[0];
  }

  function request(uri, callback) {
    if (window && window.XMLHttpRequest) {
      var xmlHttp = null;

      xmlHttp = new window.XMLHttpRequest();

      xmlHttp.onreadystatechange = function() {
        if ((xmlHttp.readyState | 0) === 4 /*Done*/) {
          if ((xmlHttp.status|0) === 200 ) {

            callback(null, xmlHttp);
          } else {
            callback(xmlHttp);
          }
        }
      };

      xmlHttp.open("GET", uri, true);
      xmlHttp.send();
      return xmlHttp;
    } else {
      return false;
    }
  }

  //
  // Change this ID if you need the markup to be put in a different Div
  //
  var containerDiv = document.getElementById("ecoengine-compare-container");

  if (containerDiv) {
    request("./templates/index.html", function (err, r) {

      console.log(1);

      append(containerDiv, r.responseText, function() {

        console.log(2);

        window.STMN.dynamicTemplateReady = true;
        console.log("window.STMN.onTemplateReady", window.STMN.onTemplateReady);
        if (typeof STMN.onTemplateReady === "function") {
          window.STMN.onTemplateReady();
        }
      });

    });
  }
}());
