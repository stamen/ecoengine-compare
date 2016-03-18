"use strict";

/* Legend Layer Component */
(function() {
  function LegendLayerMenu(rootSelector, options) {

    options = options || {};

    //
    // Constants
    //
    var that              = this,
        rootNode          = document.querySelector(rootSelector), //"#legend-layer-menu",
        layerGroups       = {},
        layers            = {},
        colors            = ["#2166ac","#b2182b","#f4a582","#4393c3","#67001f","#d1e5f0","#fddbc7","#f7f7f7","#d6604d","#92c5de","#053061"],
        defaultColor      = options.color || "#000",
        layerLimit        = options.layerLimit || colors.length,
        sortIcon          = [
              "<svg version=1.1 class=\"drag-icon\" xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px viewBox=\"-568.5 362.1 61.6 46.3\" enable-background=\"new -568.5 362.1 61.6 46.3\" xml:space=preserve class=\"grab\"><g><path d=\"M-507.3,370.4l-7.7-7.9c0,0,0,0,0,0c-0.1-0.1-0.3-0.3-0.5-0.4c0,0-0.1,0-0.1,0c0,0-0.1,0-0.1,0c-0.2,0-0.3-0.1-0.5-0.1",
              "c0,0,0,0,0,0c0,0,0,0,0,0c-0.2,0-0.3,0-0.5,0.1c0,0-0.1,0-0.1,0c-0.2,0.1-0.4,0.2-0.6,0.4l-7.7,7.9c-0.6,0.7-0.6,1.7,0,2.3",
              "c0.3,0.3,0.7,0.5,1.2,0.5c0.4,0,0.9-0.2,1.3-0.5l4.9-5v29.1c0,0.9,0.6,1.7,1.5,1.7c0.9,0,1.5-0.7,1.5-1.7v-29l4.9,4.9",
              "c0.3,0.3,0.8,0.5,1.2,0.5c0.4,0,0.9-0.2,1.2-0.5C-506.7,372.1-506.7,371.1-507.3,370.4z\"/>",
              "<title>Sorting control</title>",
              "<path d=\"M-552.8,397.7l-4.9,4.9v-29c0-0.9-0.6-1.7-1.5-1.7s-1.5,0.7-1.5,1.7v29.1l-4.9-5c-0.6-0.7-1.7-0.7-2.4,0",
              "c-0.7,0.6-0.7,1.7-0.1,2.3l7.6,7.9c0.3,0.3,0.7,0.5,1.2,0.5c0,0,0,0,0,0c0,0,0,0,0,0c0.2,0,0.4,0,0.6-0.1c0.2-0.1,0.4-0.2,0.5-0.4",
              "c0,0,0,0,0,0l7.7-7.9c0.6-0.7,0.6-1.7-0.1-2.3C-551.1,397.1-552.2,397.1-552.8,397.7z\"/><path d=\"M-524.5,383.2h-26.5c-0.9,0-1.7,0.9-1.7,1.9c0,0.9,0.7,1.9,1.7,1.9h26.5c0.9,0,1.7-0.9,1.7-1.9",
              "C-522.8,384.2-523.5,383.2-524.5,383.2z\"/><path d=\"M-524.5,375.8h-26.5c-0.9,0-1.7,0.9-1.7,1.9c0,0.9,0.7,1.9,1.7,1.9h26.5c0.9,0,1.7-0.9,1.7-1.9",
              "C-522.8,376.8-523.5,375.8-524.5,375.8z\"/><path d=\"M-524.5,390.6h-26.5c-0.9,0-1.7,0.9-1.7,1.9c0,0.9,0.7,1.9,1.7,1.9h26.5c0.9,0,1.7-0.9,1.7-1.9",
              "C-522.8,391.6-523.5,390.6-524.5,390.6z\"/></g></svg>"
            ].join(""),
        deleteIcon        = [
              "<svg class=\"delete-icon\" version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"",
              "viewBox=\"18.3 -2.1 93.6 92.3\" enable-background=\"new 18.3 -2.1 93.6 92.3\" xml:space=\"preserve\">",
              "<path d=\"M27.9-2.1l-8.4,8.4l4.2,4.2l33.6,33.6L23.7,77.7l-4.2,4.2l8.4,8.4l4.2-4.2l33.6-33.6l33.6,33.6l4.2,4.2l8.4-8.4l-4.2-4.2",
              "L74,44.1l33.6-33.6l4.2-4.2l-8.4-8.4l-4.2,4.2L65.7,35.7L32.1,2.1C32.1,2.1,27.9-2.1,27.9-2.1z\"/>",
              "</svg>"
        ].join(""),
        editIcon        = "<span class=\"edit-icon\">[edit]</span>",
        layerTemplate       = "<li class=\"draggable drag-drop layer-item-{id}\" data-id=\"{id}\" data-color=\"{color}\" data-list=\"{list}\" data-label=\"{label}\" data-uri=\"{uri}\"> " + sortIcon + "<input type=\"color\" class=\"color-picker\" value=\"{color}\"><span class=\"label\">{label}</span> " + deleteIcon + editIcon + " <div class=\"error\"></div></li>",
        inputFormTemplate   = "<div class=\"input-form hidden\"><form class=\"input-form-element\" name=\"{layerid}-input-form\"><input type=\"text\" name=\"uri\" placeholder=\"e.g., 'Puma concolor' or API URL\"><input type=\"text\" name=\"label\" placeholder=\"A name for this layer\"><input type=\"hidden\" name=\"id\"><button class=\"save\">Save</button><button class=\"close\">Close</button></form></div>",
        colorPickerTemplate = "<div class=\"color-picker-panel\" style=\"display:none;position:absolute;\">" + colors.map(function(c) {return "<div class=\"color\" style=\"background-color:"+c+";\"></div>"}).join("") + "</div>",
        i, dragConfig, oldParent, dropConfig, orderCache, inputFormNode;

    //
    // Add a default class name
    //
    rootNode.classList.add("legend-layer-menu");

    dragConfig = {

      onstart: function(event) {

        var oTop    = event.target.offsetTop,
            oLeft   = event.target.offsetLeft,
            oParent = event.target.parentNode;

        oldParent = oParent;

        rootNode.appendChild(event.target);

        //TODO: Stop hard coding the offset
        event.target.setAttribute("data-x", (event.clientX-event.target.offsetLeft+10)-(event.clientX-oLeft));
        event.target.setAttribute("data-y", (event.clientY-event.target.offsetTop+60)-(event.clientY-oTop));

        event.target.classList.add("dragging");

      },

      // call this function on every dragmove event
      onmove: function (event) {

        var layerNode = event.dropzone ? event.dropzone.element() : null;

        var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
        y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy,

        isListItem = event.dropzone ? layerNode.classList.contains("draggable") : null,
        dropZone   = layerNode;

        // translate the element
        target.style.webkitTransform =
        target.style.transform =
        "translate(" + x + "px, " + y + "px)";

        // update the posiion attributes
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);

        if (isListItem > -1) {
          if (dropZone && dropZone.parentNode) {
            var dragPosState = [[event.pageX, event.pageY], [(dropZone.offsetLeft+dropZone.parentNode.offsetLeft+dropZone.offsetWidth)/2, (dropZone.offsetTop+dropZone.parentNode.offsetTop+dropZone.offsetHeight)/2]];

            if (dragPosState[0][1] < dragPosState[1][1]) {
              dropZone.setAttribute("data-drop-direction","top");
            } else {
              dropZone.setAttribute("data-drop-direction","bottom");
            }
          }
        }
      },
      // call this function on every dragend event
      onend: function (event) {

        event.target.style["-webkit-transform"] = "translate(0,0)";
        event.target.style.transform = "translate(0,0)";
        event.target.parentNode.classList.remove("dragging");

        if (event.target.parentNode.classList.contains("legend-layer-menu")) {
          oldParent.appendChild(event.target);
        }

        //
        // This layer might be in a new list
        //
        event.target.setAttribute("data-list",event.target.parentNode.getAttribute("data-layername"))

        event.target.classList.remove("dragging");

        triggerOrderChange();

        oldParent = null;
      }
    };

    dropConfig = {
      // only accept elements matching this CSS selector
      accept: ".drag-drop",
      // Require a 75% element overlap for a drop to be possible
      overlap: 0.1,

      // listen for drop related events:

      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add("drop-active");
      },
      ondragenter: function (event) {
        var draggableElement = event.relatedTarget,
        dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add("drop-target");
        draggableElement.classList.add("can-drop");
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove("drop-target");
        event.relatedTarget.classList.remove("can-drop");
        clearMargins();
      },
      ondrop: function dropEvent(event) {
        if (event.target.classList.contains("draggable") || event.target.classList.contains("draggable-2")) {

          if (event.target.getAttribute("data-drop-direction") === "top") {
            event.target.parentNode.insertBefore(event.relatedTarget, event.target);
          } else {
            if (event.target.nextSibling) {
              event.target.parentNode.insertBefore(event.relatedTarget, event.target.nextSibling);
            } else {
              event.target.parentNode.appendChild(event.relatedTarget);
            }
          }

        } else {
          event.target.appendChild(event.relatedTarget);
        }
        clearMargins();
      },
      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove("drop-active");
        event.target.classList.remove("drop-target");
      },
      ondropmove: function(event) {

      }
    };

    //
    // Finds a color from the colors array which is not
    // already being used. If they are all being used, it
    // returns the default color
    //
    function getNewColor() {

      var usedColors = [],
          element;

      for (var i in layers) {
        if ( layers.hasOwnProperty(i) ) {

          element = layers[i].element();

          if (element && element.getAttribute("data-color")) {
            usedColors.push(element.getAttribute("data-color"));
          }

        }
      }

      for (var i=0; colors.length > i; i++) {
        if ( usedColors.indexOf( colors[ i ] ) < 0 ) {
          return colors[i];
        }
      }

      return defaultColor;

    }

    //
    // Emits the orderChanged event
    //
    function triggerOrderChange() {
      var order = getLayerOrder();

      if (order !== orderCache) {

        order = order.reverse().map(function(interactObject) {

          //
          // Convert output from interact objects to
          // user friendly layer objects, unless it is already one
          //

          if (!interactObject.list) {
            return getLayerObjectFromLayerElement(interactObject.element());
          } else {
            return interactObject;
          }
        });

        that.fire("orderChanged", {
          "order" : order
        });
        orderCache = order;
      }
    }

    //
    // Return layers in order. Currently deturmined by their order
    // in the DOM.
    // TODO: optionally read order from a data attribute on the layer
    //       element
    //
    function getLayerOrder() {
      var layerNodes   = rootNode.querySelectorAll(".draggable"),
          rasterLayers = rootNode.querySelectorAll("select"),
          order        = [];

      for (var i=0; layerNodes.length > i; i++) {
        order.push( layers[ layerNodes[i].getAttribute("data-id") ] );
      }

      for (var i=0; rasterLayers.length > i; i++) {
        if (rasterLayers[i].value.length) {
          order.push({
            "list" : "raster",
            "uri"  : rasterLayers[i].value,
            "id"   : rasterLayers[i].getAttribute("data-id")
          });
        }
      }

      return order;
    }

    function clearMargins() {
      var dropzones = document.querySelectorAll(".dropzone");

      for (var i=0; dropzones.length > i; i++) {
        for (var ii=0; dropzones[i].children.length > ii; ii++) {
          dropzones[i].children[ii].setAttribute("data-drop-direction",null);
        }
      }
    }

    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) {func.apply(context, args);}
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {func.apply(context, args);}
      };
    }

    function showLayerError(id, message) {

      var layerElement = layers[id].element(),
          errorElement = layerElement.querySelector(".error");


      if (errorElement) {

        if (message) {
          errorElement.innerHTML = message;
          errorElement.style.display = "block";
        } else {
          errorElement.innerHTML = "";
          errorElement.style.display = "none";
        }

      }

    }

    //
    // Create a unique id for layers
    // lifted from http://stackoverflow.com/a/8809472
    //
    function getUniqueId () {
        var d = new Date().getTime(),
            newId, r;

        newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });

        return newId;
    }

    //
    // Appends a markup string to the DOM as DOM elements
    //
    function append(rootNode, html) {
      var div = document.createElement("div");
      div.innerHTML = html;
      while (div.children.length > 0) {
        rootNode.appendChild(div.children[0]);
      }

      return rootNode;
    }

    //
    // Return the parent of this element which has the passed class. if
    // the startingElement has the class it will be returned. The depth
    // defaults to 10
    //
    function parentHasClass(startingElement, className, depth) {

      var last  = startingElement;

      for (var i=0; (depth||10) > i && last; i++) {

        if (last && last.className && typeof last.className === "string" && typeof last.className.indexOf === "function" && last.className.indexOf(className) > -1) {
          return last;
        }

        last = last.parentNode;

      }

      return null;
    }

    function processTemplate(template, data) {

        Object.keys(data).forEach(function(key) {

          template = template.split("{" + key + "}").join(data[key]);

        });

        return template;

    }

    function getHeaderByFor(forString) {
      var headers = rootNode.querySelectorAll("h2");

      for (var i=0; headers.length > i; i++) {
        if (headers[i].querySelector("button") && headers[i].querySelector("button").getAttribute("data-for") === forString) {
          return headers[i];
        }
      }

      return false;
    }

    //
    // Prompts user for data for a  layer. If this is passed a button Node
    // it will create a layer, if it is a layer node, it will update it
    //
    function promptUserForLayerData(buttonNodeOrLayerNode, callback) {

      var type       = buttonNodeOrLayerNode.classList.contains("draggable") ? "edit" : "add",
          formParent = (type === "add") ? buttonNodeOrLayerNode.parentNode : getHeaderByFor(buttonNodeOrLayerNode.getAttribute("data-list")),
          inputs;

      //
      // Get the input form for this group, if it exists
      //
      inputFormNode = formParent.querySelector(".input-form");

      //
      // Rise above!
      //
      formParent.style.zIndex = 1;

      //
      // Close any other dialogs
      //
      closeDialogs();

      //
      // Add input form for this menu group if it
      // does not already exist
      //
      if (!inputFormNode) {
        append(formParent, processTemplate(inputFormTemplate, {
          "layerid" : buttonNodeOrLayerNode.getAttribute("data-for")
        }));
        inputFormNode = formParent.querySelector(".input-form");

        //
        // The submit button
        //
        inputFormNode.querySelector("button.save").addEventListener("click", function(e) {

          e.preventDefault();

          e.target.parentNode.parentNode.classList.add("hidden");

          //
          // Sit back down
          //
          formParent.style.zIndex = "inherit";

          if (typeof callback === "function") {
            callback(inputFormNode);
          }

        }, false);

        //
        // The close button
        //
        inputFormNode.querySelector("button.close").addEventListener("click", function(e) {

          e.preventDefault();

          closeDialogs();

          //
          // Set prompting class
          //
          rootNode.classList.remove("prompting");

        }, false);
      }
      var inputFormNodeElement = formParent.querySelector(".input-form-element");

      //
      // Set form default state
      //
      if (type === "edit") {
        inputFormNodeElement.uri.value   = buttonNodeOrLayerNode.getAttribute("data-uri");
        inputFormNodeElement.label.value = buttonNodeOrLayerNode.getAttribute("data-label");
        inputFormNodeElement.id.value    = buttonNodeOrLayerNode.getAttribute("data-id");
      } else {
        inputFormNodeElement.uri.value   = "";
        inputFormNodeElement.label.value = "";
        inputFormNodeElement.id.value    = "";
      }

      //
      // Set prompting class
      //
      rootNode.classList.add("prompting");

      //
      // Show the form
      //
      inputFormNode.classList.remove("hidden");
    }

    function getLayerNode(layer) {

      //Allow lookup by layer object or layer id
      var id = (typeof layer === "object") ? layer.id : layer;

      return layers[id].element();

    }

    function getLayerGroupNode(groupId) {

      return layerGroups[groupId].element();

    }

    function createLayer (layerObject) {

      var layerNode;

      layerObject.id = layerObject.id || getUniqueId();

      //
      // Append new layer item in menu
      //
      append(
        getLayerGroupNode(layerObject.list),
        processTemplate(layerTemplate, layerObject)
      );

      layerNode = rootNode.querySelector(".layer-item-" + layerObject.id);

      layers[layerNode.getAttribute("data-id")] = interact(layerNode).draggable(dragConfig).dropzone(dropConfig);

      layerNode.addEventListener("click", function(e) {

        if (e.target.classList.contains("delete-icon")) {

          e.preventDefault();

          var layerElement = e.target.parentNode,
              id           = layerElement.getAttribute("data-id");

          layerElement.parentNode.removeChild(layerElement);

          delete layers[id];

          that.fire("layerRemoved", id);
        }

      });

      layerNode.addEventListener("dblclick", function() {
        promptUserForLayerData(layerNode, function(updates) {
          var form = updates.querySelector("form");
          updateLayerData(form.id.value, {
            "uri"   : queryOrSearch(form.uri.value),
            "id"    : form.id.value,
            "label" : form.label.value || form.uri.value
          });
        });
      });

      that.fire("layerAdded", getLayerObjectFromLayerElement(layerNode));
    }

    //
    // Intercept query string for Engine convenience (entering search term only)
    //
    function queryOrSearch(query) {
      if (query.indexOf("http") < 0) return "https://ecoengine.berkeley.edu/api/observations/?page_size=50&q=" + query;
        return query;
    }

    function updateLayerData(id, properties) {

      if (layers[id]) {
        var element           = layers[id].element(),
            updatedProperties = [];

        for (var i in properties) {
          if (properties.hasOwnProperty(i) && element.getAttribute("data-" + i) !== properties[i]) {

            element.setAttribute("data-" + i, properties[i]);
            updatedProperties.push(i);

          }
        }

        element.querySelector(".label").innerHTML = properties.label;

        if (updatedProperties.length) {
          that.fire("layerUpdated", {
            "layerObject"       : getLayerObjectFromLayerElement(element),
            "updatedProperties" : updatedProperties
          });
        }
      }

    }

    //
    // Builds an object from data attributes in the layer
    // element
    //
    function getLayerObjectFromLayerElement (element) {
      return {
        "list"    : element.getAttribute("data-list"),
        "label"   : element.getAttribute("data-label"),
        "uri"     : element.getAttribute("data-uri"),
        "id"      : element.getAttribute("data-id"),
        "color"   : element.getAttribute("data-color"),
        "element" : element
      };
    }

    //
    // Set the draggable state of a menu item by id
    //
    function enableMenuItemById(id) {
      layers[id].set("dissable", false);
      layers[id].element().setAttribute("dissabled", false);
    }

    function disableMenuItemById(id) {
      layers[id].set("dissable", true);
      layers[id].element().setAttribute("dissabled", true);
    }

    //
    // Returns full ui state object
    //
    function getMenuState() {
      return Object.keys(layers).map(function(key) {
        return getLayerObjectFromLayerElement(layers[key].element());
      });
    }

    function getDropdownState() {
      var dropdowns = rootNode.querySelectorAll("select"),
          state     = {};

      for (var i=0; dropdowns.length > i; i++) {

        state[dropdowns[i].id] = dropdowns[i].value;

      }

      return state;
    }

    function onClickLayerAddAction (e) {
      promptUserForLayerData(e.target, function() {
        var formNode     = e.target.parentNode.querySelector("form"),
            layerGroupId = e.target.getAttribute("data-for");

        //
        // Register new layer
        //
        createLayer({
          "label" : formNode.label.value || formNode.uri.value,
          "color" : getNewColor(),
          "list" : layerGroupId,
          "uri"   : queryOrSearch(formNode.uri.value)
        });

      });
    }

    function initColorPicker() {

      //
      // Test for native color picker support
      //
      var input   = document.createElement("input"),
          isSupported;

      //
      // Test for native color picker support
      // Test inspired by https://bgrins.github.io/spectrum/
      //
      try {
        input.type  = "color";
      } catch (err) {
        input.type  = "text";
      }

      input.value = "!";
      isSupported = (input.type === "color" && input.type !== "!");

      //
      // If isSupported is true, this browser supports native color
      // picking using the input[type=color] element
      //
      that.on("layerAdded", function(layer) {
        var pickerNode = layer.caller.element.querySelector(".color-picker"),
            panelNode  = document.querySelector(".color-picker-panel");

        if (isSupported) {

          pickerNode.addEventListener("change", function(e) {
            e.target.parentNode.setAttribute("data-color", e.target.value);

            that.fire("color-change", getLayerObjectFromLayerElement(e.target.parentNode));
          });
        } else {

          pickerNode.classList.add("polyfill");
          pickerNode.style.backgroundColor = pickerNode.value;
          pickerNode.style.cursor = "pointer";
          pickerNode.style.color = "transparent";

          if (!panelNode) {
            append(rootNode, processTemplate(colorPickerTemplate, {}));
            panelNode  = document.querySelector(".color-picker-panel");
          }

          pickerNode.addEventListener("click", function(e) {

            e.target.parentNode.parentNode.insertBefore(panelNode, e.target.parentNode);
            e.target.parentNode.parentNode.insertBefore(e.target.parentNode, panelNode); //TODO: There is probably a better way to flip these around
            panelNode.style.top     = (e.target.parentNode.offsetTop) + "px";
            panelNode.style.left    = (e.target.parentNode.offsetLeft) + "px";
            panelNode.style.display = "block";
            panelNode.setAttribute("data-for", layer.caller.id);
          });

        }
      });

    }

    function closeDialogs() {
      var inputFormNodes = rootNode.querySelectorAll(".input-form");

      for (var i=0; inputFormNodes.length > i; i++) {
        inputFormNodes[i].classList.add("hidden");
      }
    }

    function init() {

      var layerGroupNodes = rootNode.querySelectorAll("ul"),
          actionNodes     = document.querySelectorAll("h2 button"),
          rasterLayers    = rootNode.querySelectorAll("select"),
          layerName, dropdown;

      //
      // Iterate through unordered list elements in the root
      // container and use them to create Interact drop zones
      // and then add them to the groups
      //
      for (i=0; layerGroupNodes.length > i; i++) {

        //Get layername from markup
        layerName = layerGroupNodes[i].getAttribute("data-layername");

        //Add a class to drop zone for styleing
        layerGroupNodes[i].classList.add("dropzone");

        //Bind Interact to drop zone
        layerGroups[layerName] = interact(layerGroupNodes[i]).dropzone(dropConfig);

      }

      //
      // Make layers to match marker state
      //
      if (options.menuState && options.menuState.length) {
        options.menuState.forEach(function (layerObject) {

          createLayer(layerObject);

        });
      }

      //
      // Dropdown state
      //
      if (options.dropdownState) {
        for (var i in options.dropdownState) {
          if (options.dropdownState.hasOwnProperty(i)) {
            dropdown = rootNode.querySelector("#" + i);

            dropdown.value = options.dropdownState[i];
          }
        }
      }

      //
      // Handle click events
      //
      rootNode.addEventListener("click", function(e) {
        var layerNode = parentHasClass(e.target, "draggable"),
            layerObject;

        //
        // Listener for add layer action
        //
        if (e.target.classList.contains("add-action")) {
          onClickLayerAddAction.apply(this, arguments);
        }

        //TODO: Turn this into a color input polyfill module
        //
        // Choose a color. This interface is only shown on browsers
        // which do not support the color input type
        //
        if (e.target.classList.contains("color")) {
          layerObject = layers[e.target.parentNode.getAttribute("data-for")];
          layerNode   = layerObject.element();

          layerNode.setAttribute("data-color", e.target.style.backgroundColor);
          e.target.parentNode.style.display = "none";
          layerNode.querySelector(".color-picker").setAttribute("value", e.target.style.backgroundColor);
          layerNode.querySelector(".color-picker").style.backgroundColor = e.target.style.backgroundColor;
          that.fire("color-change", getLayerObjectFromLayerElement(layerNode));
        }

        //
        // layer item click
        //
        if (layerNode) {
          that.fire("layer-click", {
            "event"       : e,
            "layerObject" : getLayerObjectFromLayerElement(layerNode)
          });
        }

      }, false);

      //
      // a general escape listener. All dialogs should go away if escape is pressed
      //
      document.querySelector("body").addEventListener("keyup", function(e) {

        if (e.keyCode === 27) { //Escape
          closeDialogs();
        }

      }, this);

      //
      // Add change listeners to raster layers
      //
      for (var i=0; rasterLayers.length > i; i++) {
        rasterLayers[i].addEventListener("change", function(e) {
          triggerOrderChange();
        });
      }
    }

    //
    // Public interface
    //
    that.getLayerNode        = getLayerNode;
    that.getLayerOrder       = getLayerOrder;
    that.rootNode            = rootNode;
    that.getMenuState        = getMenuState;
    that.getDropdownState    = getDropdownState;
    that.disableMenuItemById = disableMenuItemById;
    that.enableMenuItemById  = enableMenuItemById;
    that.showLayerError      = showLayerError;

    //
    // Here we go
    //

    initColorPicker();
    init();

    return that;

  }

  //
  // Make available to STMN namespace
  //
  if (typeof window.STMN !== "object") {
    window.STMN = {};
  }

  window.STMN.LegendLayerMenu = STPX.samesies.extend(LegendLayerMenu);

  //
  // Make available to CommonJS
  //
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = STMN.LegendLayerMenu;

  // Make available to AMD module
  } else if (typeof define === "function" && define.amd) {
    define(STMN.LegendLayerMenu);
  }
}());



/* Application */
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
          hex.data(pages.filter(function(p){return (typeof p.geometry === "object" && "coordinates" in p.geometry)}).map(function(p) {return p.geometry.coordinates;}));

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
            if ("coordinates" in feature.geometry) {
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

          hex.data(pages.filter(function(p){return (typeof p.geometry === "object" && "coordinates" in p.geometry)}).map(function(p) {
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

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.open("POST", "https://www.googleapis.com/urlshortener/v1/url?key=" + STMN.googleKey, true);
        xmlhttp.setRequestHeader("Content-type","application/json");

        xmlhttp.onreadystatechange = function() {

					setTimeout('', 1500);

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

        xmlhttp.send("{\"longUrl\": \"" + window.location.href + "\"}");

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
