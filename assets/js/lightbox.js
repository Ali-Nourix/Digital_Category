/* ==========================================================================
   Behkooshan catalogue, the photograph viewer

   Every photograph in the document opens here at the largest size that was
   derived for it. Once open it behaves the way a picture viewer is expected
   to: the wheel zooms towards the pointer, a double click zooms in and out
   again, two fingers pinch, dragging moves the picture, and the arrows walk
   the set while it is fitted.

   The picture is moved with one transform rather than by scrolling a
   container. That is what makes the zoom continuous instead of a switch
   between two sizes, and it is what lets the zoom keep the point under the
   pointer still.

   Built on <dialog>.showModal(), which brings the focus trap, the inert
   background and Escape with it. If this file never loads, every photograph
   is still an ordinary <img> in the page.
   ========================================================================== */

(function () {
  "use strict";

  var dialog = document.getElementById("lightbox");
  var figures = Array.prototype.slice.call(document.querySelectorAll("[data-zoom]"));
  if (!dialog || !figures.length || typeof dialog.showModal !== "function") return;

  var stage = dialog.querySelector(".lb__stage");
  var view = dialog.querySelector(".lb__img");
  var counter = dialog.querySelector(".lb__counter");
  var template = counter.getAttribute("data-template");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  var MIN = 1;          // fitted: the picture is exactly as large as the stage allows
  var MAX = 6;
  var STEP = 1.6;       // one press of a zoom button, or one double click

  var index = 0;
  var scale = 1;
  var tx = 0;
  var ty = 0;
  var opener = null;
  var pointers = new Map();
  var pinch = null;
  var moved = false;
  var request = 0;

  view.draggable = false;

  /* ------------------------------------------------------------ transform */

  function clamp(value, low, high) {
    return Math.min(high, Math.max(low, value));
  }

  /** Keep the picture overlapping the stage: it can be moved, not lost. */
  function clampPan() {
    var box = stage.getBoundingClientRect();
    // offsetWidth is the laid out size, which the transform does not touch,
    // so this stays the fitted size however far in the reader has zoomed.
    var slackX = Math.max(0, (view.offsetWidth * scale - box.width) / 2);
    var slackY = Math.max(0, (view.offsetHeight * scale - box.height) / 2);
    tx = clamp(tx, -slackX, slackX);
    ty = clamp(ty, -slackY, slackY);
  }

  function paint(animate) {
    clampPan();
    // The opacity part is always in the list: it is what covers the swap
    // from one photograph to the next, and paint() would otherwise drop it
    // every time it sets the transform.
    var fade = reduced.matches ? "" : "opacity 180ms linear";
    var move = animate && !reduced.matches ? "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)" : "";
    view.style.transition = [move, fade].filter(Boolean).join(", ") || "none";
    view.style.transform = "translate(" + tx + "px, " + ty + "px) scale(" + scale + ")";
    stage.classList.toggle("is-zoomed", scale > MIN + 0.01);
    dialog.querySelectorAll("[data-lb-zoom]").forEach(function (button) {
      var direction = Number(button.getAttribute("data-lb-zoom"));
      button.disabled = direction > 0 ? scale >= MAX - 0.01 : scale <= MIN + 0.01;
    });
  }

  /**
   * Change the scale while holding one point of the picture still.
   * @param {number} next   the scale asked for, before clamping
   * @param {number} [px]   the fixed point, in client coordinates
   * @param {number} [py]
   */
  function zoomTo(next, px, py, animate) {
    var box = stage.getBoundingClientRect();
    var from = scale;
    scale = clamp(next, MIN, MAX);
    if (scale === from) return;

    // Where the fixed point sits relative to the centre of the stage, which
    // is what the transform is measured from.
    var cx = (px === undefined ? box.left + box.width / 2 : px) - (box.left + box.width / 2);
    var cy = (py === undefined ? box.top + box.height / 2 : py) - (box.top + box.height / 2);

    // Solving cx = (cx - tx) / from * scale + tx' for the new translation.
    var ratio = 1 - scale / from;
    tx += (cx - tx) * ratio;
    ty += (cy - ty) * ratio;

    if (scale === MIN) { tx = 0; ty = 0; }
    paint(animate);
  }

  function reset() {
    scale = MIN;
    tx = 0;
    ty = 0;
    paint(false);
  }

  /* ----------------------------------------------------------------- set */

  var digits = document.documentElement.lang === "fa" ? "۰۱۲۳۴۵۶۷۸۹" : "0123456789";

  function localise(value) {
    return String(value).replace(/[0-9]/g, function (d) { return digits[d]; });
  }

  function show(i) {
    index = (i + figures.length) % figures.length;
    var figure = figures[index];
    var img = figure.querySelector("img") || figure;

    // Hidden before the source changes. An <img> goes on painting the
    // picture it already has until the new one has decoded, so without this
    // the viewer shows the photograph you looked at last for as long as the
    // new one takes to arrive.
    view.classList.add("is-loading");
    var mine = ++request;

    view.src = img.getAttribute("data-full") || img.currentSrc || img.src;
    view.alt = img.alt;

    function reveal() {
      // A reader holding the next arrow down can be two pictures ahead by
      // the time this one decodes; only the latest request may uncover.
      if (mine === request) view.classList.remove("is-loading");
    }

    if (typeof view.decode === "function") view.decode().then(reveal, reveal);
    else if (view.complete) reveal();
    else view.addEventListener("load", reveal, { once: true });

    var n = 0;
    counter.textContent = template.replace(/%/g, function () {
      return localise(n++ === 0 ? index + 1 : figures.length);
    });

    reset();
  }

  function open(i, from) {
    opener = from;
    show(i);
    dialog.showModal();
  }

  figures.forEach(function (figure, i) {
    var button = figure.querySelector(".lb-open");
    if (!button) return;
    button.addEventListener("click", function () { open(i, button); });
  });

  /* ------------------------------------------------- pointer: pan, pinch */

  var SLOP = 4;

  function centreOf(list) {
    var a = list[0];
    var b = list[1];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2,
             d: Math.hypot(a.x - b.x, a.y - b.y) };
  }

  /**
   * Take the pointer, but never on pointerdown. Capturing retargets the
   * click the browser sends afterwards to the capturing element, so a plain
   * click on the picture would arrive as a click on the stage, which is the
   * gesture that closes the viewer. Capture once the gesture is unmistakably
   * a drag and the click is going to be suppressed anyway.
   */
  function capture(id) {
    if (!stage.hasPointerCapture(id)) stage.setPointerCapture(id);
  }

  stage.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY,
                                    startX: event.clientX, startY: event.clientY,
                                    tx: tx, ty: ty });
    moved = false;

    if (pointers.size === 2) {
      var list = Array.from(pointers.values());
      pinch = { start: centreOf(list), scale: scale, tx: tx, ty: ty };
      moved = true;
      pointers.forEach(function (_, id) { capture(id); });
    }
  });

  stage.addEventListener("pointermove", function (event) {
    var start = pointers.get(event.pointerId);
    if (!start) return;
    start.x = event.clientX;
    start.y = event.clientY;

    if (pointers.size === 2 && pinch) {
      var now = centreOf(Array.from(pointers.values()));
      if (pinch.start.d > 0) {
        scale = pinch.scale;
        tx = pinch.tx;
        ty = pinch.ty;
        zoomTo(pinch.scale * (now.d / pinch.start.d), now.x, now.y, false);
      }
      return;
    }

    if (pointers.size !== 1 || scale <= MIN + 0.01) return;

    var dx = event.clientX - start.startX;
    var dy = event.clientY - start.startY;
    if (!moved) {
      if (Math.abs(dx) + Math.abs(dy) <= SLOP) return;
      moved = true;
      capture(event.pointerId);
      stage.classList.add("is-dragging");
    }
    tx = start.tx + dx;
    ty = start.ty + dy;
    paint(false);
  });

  function release(event) {
    if (stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!pointers.size) stage.classList.remove("is-dragging");
  }

  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  /* -------------------------------------------------------------- wheel */

  stage.addEventListener("wheel", function (event) {
    event.preventDefault();
    // deltaMode 1 is lines rather than pixels, which trackpads never send
    // and some mice always do; normalising keeps one notch the same size.
    var delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    zoomTo(scale * Math.exp(-delta / 420), event.clientX, event.clientY, false);
  }, { passive: false });

  /* ------------------------------------------------------------- clicks */

  view.addEventListener("dblclick", function (event) {
    event.preventDefault();
    if (scale > MIN + 0.01) reset();
    else zoomTo(STEP * 1.6, event.clientX, event.clientY, true);
  });

  dialog.addEventListener("click", function (event) {
    var button = event.target.closest("button");

    if (button && button.hasAttribute("data-lb-zoom")) {
      var direction = Number(button.getAttribute("data-lb-zoom"));
      zoomTo(direction > 0 ? scale * STEP : scale / STEP, undefined, undefined, true);
      return;
    }
    if (button && button.hasAttribute("data-lb-reset")) { reset(); return; }
    if (button && button.hasAttribute("data-lb-close")) { dialog.close(); return; }
    if (button && button.hasAttribute("data-lb-step")) {
      show(index + Number(button.getAttribute("data-lb-step")));
      return;
    }

    // A drag that travelled is not a click on the backdrop.
    if (moved) { moved = false; return; }

    // Clicking past the picture closes, but only while it is fitted. Zoomed
    // in, the reader is working inside the picture and the stage's own
    // padding is a few pixels from the edge of it; closing because they
    // aimed wide would throw away the position they had panned to.
    if (scale <= MIN + 0.01 && (event.target === dialog || event.target === stage)) {
      dialog.close();
    }
  });

  /* ------------------------------------------------------------ keyboard */

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "+" || event.key === "=") { zoomTo(scale * STEP, undefined, undefined, true); return; }
    if (event.key === "-") { zoomTo(scale / STEP, undefined, undefined, true); return; }
    if (event.key === "0") { reset(); return; }

    if (event.key.indexOf("Arrow") !== 0) return;

    // Zoomed, the arrows move the picture. Fitted, they walk the set.
    if (scale > MIN + 0.01) {
      var pan = { ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80] }[event.key];
      if (!pan) return;
      event.preventDefault();
      tx += pan[0];
      ty += pan[1];
      paint(true);
      return;
    }

    var forward = document.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    var back = document.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (event.key === forward) { event.preventDefault(); show(index + 1); }
    else if (event.key === back) { event.preventDefault(); show(index - 1); }
  });

  window.addEventListener("resize", function () {
    if (dialog.open) paint(false);
  });

  dialog.addEventListener("close", function () {
    reset();
    if (opener) opener.focus();
  });

  document.documentElement.classList.add("has-lightbox");
})();
