/**
 * Opens a photograph full screen, with its description, and lets you zoom.
 *
 * Every image marked [data-zoom] on the page joins the set, in document order,
 * so the arrows walk the gallery in the order it is read. The caption is the
 * image's own alt text: a description honest enough to hand a screen reader is
 * honest enough to print, and keeping one copy means the two can never drift.
 *
 * Built on <dialog>.showModal(), which brings the focus trap, the inert
 * background and Escape to close with it. Those are the parts a hand rolled
 * overlay usually gets wrong.
 *
 * If this file never loads, every photograph is still a plain <img> in the
 * page. Nothing is hidden behind the lightbox.
 */
(function () {
  var dialog = document.getElementById("lightbox");
  var images = Array.prototype.slice.call(document.querySelectorAll("[data-zoom]"));
  if (!dialog || !images.length || typeof dialog.showModal !== "function") return;

  var stage = document.getElementById("lightbox-stage");
  var view = document.getElementById("lightbox-img");
  var caption = document.getElementById("lightbox-caption");
  var counter = document.getElementById("lightbox-counter");
  var zoomButton = dialog.querySelector('[data-lightbox="zoom"]');
  var zoomLabel = document.getElementById("lightbox-zoom-label");
  var template = counter.getAttribute("data-template");

  var index = 0;
  var zoomed = false;
  var opener = null;
  var drag = null;
  var draggedAway = false;

  // The browser's own image drag would start a ghost drag the moment you try
  // to pan, so it is turned off here rather than left to fight the handler.
  view.draggable = false;

  /**
   * @param {boolean} on
   * @param {{clientX: number, clientY: number}} [at]
   *   Where the reader asked to zoom. The photograph is bigger than the stage
   *   once zoomed, so without this it would land in a corner and they would
   *   have to pan back to whatever they were pointing at.
   */
  function setZoom(on, at) {
    zoomed = on;
    stage.classList.toggle("is-zoomed", on);
    zoomButton.setAttribute("aria-pressed", String(on));
    zoomButton.querySelector(".lightbox__glyph").textContent = on ? "\u2212" : "+";
    zoomLabel.textContent = zoomButton.getAttribute(on ? "data-out" : "data-in");

    // Reading scrollWidth here settles the layout the class change just
    // invalidated, so the numbers below are the zoomed ones.
    var box = stage.getBoundingClientRect();
    var x = on && at ? (at.clientX - box.left) / box.width : 0.5;
    var y = on && at ? (at.clientY - box.top) / box.height : 0.5;

    stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) * x;
    stage.scrollTop = (stage.scrollHeight - stage.clientHeight) * y;
  }

  function show(i) {
    index = (i + images.length) % images.length;
    var source = images[index];

    view.src = source.currentSrc || source.src;
    view.alt = source.alt;
    caption.textContent = source.alt;

    // "3 of 9", with both numbers in the page's own digits. The template is
    // "% of %" and carries no digit to read the script off, so the page's
    // language is what decides.
    var digits =
      document.documentElement.lang === "fa" ? "۰۱۲۳۴۵۶۷۸۹" : "0123456789";
    var n = 0;
    counter.textContent = template.replace(/%/g, function () {
      var value = n++ === 0 ? index + 1 : images.length;
      return String(value).replace(/[0-9]/g, function (d) {
        return digits[d];
      });
    });

    setZoom(false);
  }

  function open(i, from) {
    opener = from;
    show(i);
    dialog.showModal();
  }

  images.forEach(function (image, i) {
    // A zoomable photograph is something you operate, so it says so to the
    // pointer and answers the keyboard as a button would.
    image.tabIndex = 0;
    image.setAttribute("role", "button");

    image.addEventListener("click", function () {
      open(i, image);
    });

    image.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      open(i, image);
    });
  });

  /* --- Panning -------------------------------------------------------------
     Zoomed, the photograph is larger than the stage and has to be draggable,
     not just scrollable: the cursor says `grab`, so dragging has to do
     something. Touch is left to the browser, whose own scrolling has momentum
     and beats anything reimplemented here. */

  var SLOP = 4;

  stage.addEventListener("pointerdown", function (event) {
    draggedAway = false;
    if (!zoomed || event.button !== 0 || event.pointerType === "touch") return;

    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: stage.scrollLeft,
      top: stage.scrollTop,
      captured: false,
    };
  });

  stage.addEventListener("pointermove", function (event) {
    if (!drag || event.pointerId !== drag.id) return;

    var dx = event.clientX - drag.x;
    var dy = event.clientY - drag.y;

    // Capture only once the pointer has really travelled. Capturing on
    // pointerdown would retarget the click the browser sends afterwards to
    // the stage, and a plain click on the photograph would never reach it,
    // so tapping to zoom back out would silently do nothing.
    if (!drag.captured) {
      if (Math.abs(dx) + Math.abs(dy) <= SLOP) return;
      drag.captured = true;
      stage.setPointerCapture(drag.id);
      stage.classList.add("is-dragging");
    }

    stage.scrollLeft = drag.left - dx;
    stage.scrollTop = drag.top - dy;
  });

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;

    if (drag.captured) {
      // This was a drag, not a click, so the click the browser sends next
      // must not be allowed to toggle the zoom back off.
      draggedAway = true;
      stage.classList.remove("is-dragging");
      if (stage.hasPointerCapture(drag.id)) stage.releasePointerCapture(drag.id);
    }

    drag = null;
  }

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  dialog.addEventListener("click", function (event) {
    var action = event.target.closest("[data-lightbox]");

    if (action) {
      var which = action.getAttribute("data-lightbox");
      if (which === "close") dialog.close();
      if (which === "next") show(index + 1);
      if (which === "prev") show(index - 1);
      if (which === "zoom") setZoom(!zoomed);
      return;
    }

    if (draggedAway) {
      draggedAway = false;
      return;
    }

    // Clicking the photograph itself toggles zoom.
    if (event.target === view) {
      setZoom(!zoomed, event);
      return;
    }

    // Clicking past it closes, but only while it is fitted. Zoomed in, the
    // reader is working inside the photograph and the stage's own padding is
    // a few pixels from the edge of it; closing the whole thing because they
    // aimed slightly wide would throw away the position they had panned to.
    if (!zoomed && (event.target === dialog || event.target === stage)) {
      dialog.close();
    }
  });

  dialog.addEventListener("keydown", function (event) {
    // Escape is the dialog's own, and while zoomed the arrows are panning the
    // photograph rather than walking the set.
    if (zoomed || event.key.indexOf("Arrow") !== 0) return;

    var forward = document.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    var back = document.dir === "rtl" ? "ArrowRight" : "ArrowLeft";

    if (event.key === forward) {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === back) {
      event.preventDefault();
      show(index - 1);
    }
  });

  // Whatever was clicked to get here is where the reader was, so that is
  // where the focus goes back to.
  dialog.addEventListener("close", function () {
    setZoom(false);
    if (opener) opener.focus();
  });

  document.documentElement.classList.add("has-lightbox");
})();
