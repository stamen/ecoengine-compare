"use strict";

function LayerMenuController() {

  var oldParent;

  var dragConfig = {

    onstart: function(event) {

      var oTop    = event.target.offsetTop,
          oLeft   = event.target.offsetLeft,
          oParent = event.target.parentNode;

      oldParent = oParent;

      document.querySelector("body").appendChild(event.target);

      event.target.setAttribute('data-x', (event.clientX-event.target.offsetLeft)-(event.clientX-oLeft));
      event.target.setAttribute('data-y', (event.clientY-event.target.offsetTop)-(event.clientY-oTop));

      /*
      event.target.style.webkitTransform =
      event.target.style.transform =
      'translate(' + (event.pageX-event.target.offsetLeft) + 'px, ' + (event.pageY-event.target.offsetTop) + 'px)';
      */

      event.target.parentNode.classList.add("dragging");
    },

    // call this function on every dragmove event
    onmove: function (event) {

      //event.target.setAttribute('data-x', event.target.offsetLeft-event.target.parentNode.offsetLeft);
      //event.target.setAttribute('data-y', event.target.offsetTop-event.target.parentNode.offsetTop);

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
            dropZone.style.marginTop = target.offsetHeight + "px";
            dropZone.style.marginBottom = "0";
          } else {
            dropZone.style.marginTop = "0";
            dropZone.style.marginBottom = target.offsetHeight + "px";
          }
        }
      }
    },
    // call this function on every dragend event
    onend: function (event) {
      event.target.style["-webkit-transform"] = "translate(0,0)";
      event.target.style["transform"] = "translate(0,0)";
      event.target.parentNode.classList.remove("dragging");

      if (event.target.parentNode.tagName === "BODY") {
        oldParent.appendChild(event.target);
      }

      oldParent = null;
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
      clearMargins();
    },
    ondrop: function dropEvent(event) {
      if (event.target.classList.contains("draggable") || event.target.classList.contains("draggable-2")) {
        event.target.parentNode.insertBefore(event.relatedTarget, event.target);
      } else {
        event.target.appendChild(event.relatedTarget);
      }
      clearMargins();
    },
    ondropdeactivate: function (event) {
      // remove active dropzone feedback
      event.target.classList.remove('drop-active');
      event.target.classList.remove('drop-target');
    },
    ondropmove: function(event) {

    }
  };

  function clearMargins() {
    var dropzones = document.querySelectorAll(".dropzone");

    for (var i=0; dropzones.length > i; i++) {
      for (var ii=0; dropzones[i].children.length > ii; ii++) {
        dropzones[i].children[ii].style.marginTop = "0";
        dropzones[i].children[ii].style.marginBottom = "0";
      }
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
