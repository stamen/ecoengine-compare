"use strict";

function LayerMenuController() {

  var dragConfig = {

    dynamicDrop: true,

    onstart: function(event) {

      event.target.setAttribute('data-x', event.target.offsetLeft-event.target.parentNode.offsetLeft);
      event.target.setAttribute('data-y', event.target.offsetTop-event.target.parentNode.offsetTop);

      event.target.parentNode.classList.add("dragging");
    },

    // call this function on every dragmove event
    onmove: function (event) {

      var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,

      isListItem = event.dropzone ? event.dropzone.selector.indexOf("draggable") : "null",
      dropZone   = event.dropzone ? document.querySelector(event.dropzone.selector) : null;

      // translate the element
      target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);

      if (isListItem > -1) {
        if (dropZone && dropZone.parentNode) {
          var dragPosState = [[event.pageX, event.pageY], [(dropZone.offsetLeft+dropZone.parentNode.offsetLeft+dropZone.offsetWidth)/2, (dropZone.offsetTop+dropZone.parentNode.offsetTop+dropZone.offsetHeight)/2]];

          if (dragPosState[0][1] < dragPosState[1][1]) {
            dropZone.style.marginTop = "100px";
            dropZone.style.marginBottom = "0";
          } else {
            dropZone.style.marginTop = "0";
            dropZone.style.marginBottom = "100px";
          }
        }
      }
    },
    // call this function on every dragend event
    onend: function (event) {
      event.target.style["-webkit-transform"] = "translate(0,0)";
      event.target.style["transform"] = "translate(0,0)";
      event.target.parentNode.classList.remove("dragging");

    }
  };

  var dropConfig = {
    // only accept elements matching this CSS selector
    accept: '.drag-drop',
    // Require a 75% element overlap for a drop to be possible
    overlap: .1,

    // listen for drop related events:

    ondropactivate: function (event) {
      // add active dropzone feedback
      event.target.classList.add('drop-active');
    },
    ondragenter: function (event) {
      var draggableElement = event.relatedTarget,
      dropzoneElement = event.target;

      // feedback the possibility of a drop
      dropzoneElement.classList.add('drop-target');
      draggableElement.classList.add('can-drop');
    },
    ondragleave: function (event) {
      // remove the drop feedback style
      event.target.classList.remove('drop-target');
      event.relatedTarget.classList.remove('can-drop');

      if (event.target.classList.contains("draggable")) {
        event.target.style.marginTop = "0";
        event.target.style.marginBottom = "0";
      }
    },
    ondrop: function dropEvent(event) {
      if (event.target.classList.contains("draggable") || event.target.classList.contains("draggable-2")) {
        //appendInPosition(event.relatedTarget, event.target.parentNode, event.target.parentNode.getAttribute("data-position"));
        event.target.parentNode.insertBefore(event.relatedTarget, event.target)
        event.target.style.marginTop = "0";
        event.target.style.marginBottom = "0";
      } else {
        event.target.appendChild(event.relatedTarget);
      }

    },
    ondropdeactivate: function (event) {
      // remove active dropzone feedback
      event.target.classList.remove('drop-active');
      event.target.classList.remove('drop-target');
    },
    ondropmove: function(event) {

    }
  };

  function appendInPosition(item, container, position) {
    var scrapDiv = document.createElement("div");

    if (container.children.length) {

      var l=container.children.length;

      for (var i=0; l > i; i++) {

        if (position|0 === i) {
          console.log(item, typeof item);
          scrapDiv.appendChild(item);
        }

        console.log(container.children[i], typeof container.children[i], i);
        scrapDiv.appendChild(container.children[i]);
      }

      console.log("count", scrapDiv.children);

      l = scrapDiv.children.length;

      for (var i=0; l > i; i++) {
        console.log("--",scrapDiv.children[i]);
        if (scrapDiv.children[i]) {
          container.appendChild(scrapDiv.children[i]);
        }
      }
    } else {
      scrapDiv.appendChild(item);
    }

  }

  // target elements with the "draggable" class
  interact('.draggable')
  .draggable(dragConfig).allowFrom(".grab").dropzone(dropConfig);

  // target elements with the "draggable" class
  interact('.draggable-2')
  .draggable(dragConfig).dropzone(dropConfig).dropzone(dropConfig);

  interact('.dropzone1').dropzone(dropConfig);

  interact('.dropzone2').dropzone(dropConfig);

  interact('.dropzone3').dropzone(dropConfig);

}

(new LayerMenuController());
