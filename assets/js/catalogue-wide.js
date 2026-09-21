/* ==========================================================================
   Behkooshan catalogue, read sideways: the parts a horizontal track needs

   The track itself is a native scroll container, so the scrollbar, the
   keyboard, the touch swipe and a trackpad's horizontal gesture all work
   without any help. Two things do not, and this file is those two:

     1. a mouse wheel reports deltaY and nothing else, so the vertical
        gesture has to be turned into travel along the track
     2. Page Up and Page Down should turn a panel rather than do nothing

   Loaded only by the wide build. Deleting it leaves the upright version
   untouched; see docs/WIDE.md.
   ========================================================================== */

(function () {
  "use strict";

  var track = document.getElementById("doc");
  if (!track || document.documentElement.dataset.axis !== "inline") return;

  var wide = window.matchMedia("(min-width: 60rem) and (min-height: 30rem)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /** The stylesheet only lays the track out sideways above this breakpoint. */
  function sideways() {
    return wide.matches;
  }

  /* ---------------------------------------------------------------- wheel */

  /* A notch of the wheel is worth rather more here than it would be down a
     page: a panel is a whole window wide. */
  var REACH = 1.8;

  /* Where the reader has asked to get to, as opposed to where the track has
     animated to so far. Kept between notches so that spinning the wheel
     accumulates into one glide instead of restarting from wherever the
     animation happens to be. Forgotten once the wheel goes quiet, so that a
     drag of the scrollbar or a touch swipe starts a fresh reckoning. */
  var target = null;
  var settle;

  function clamp(value, low, high) {
    return Math.min(high, Math.max(low, value));
  }

  function travel(delta) {
    var limit = track.scrollWidth - track.clientWidth;
    // In a right to left track scrollLeft runs from 0 down into the
    // negatives, so travelling forward is always away from zero.
    var forward = getComputedStyle(track).direction === "rtl" ? -1 : 1;

    if (target === null) target = track.scrollLeft;
    target = clamp(target + delta * forward, forward > 0 ? 0 : -limit, forward > 0 ? limit : 0);

    // scrollTo rather than assigning scrollLeft: an assignment counts as a
    // finished scroll, and the track's proximity snapping pulls anything
    // short of the next panel straight back to the last one.
    track.scrollTo({ left: target, behavior: reduced.matches ? "auto" : "smooth" });

    clearTimeout(settle);
    settle = setTimeout(function () {
      target = null;
    }, 280);
  }

  track.addEventListener(
    "wheel",
    function (event) {
      if (!sideways() || event.ctrlKey) return;

      // A trackpad swiped sideways already reports deltaX and the browser
      // has already scrolled the track with it. Only the vertical part of
      // the gesture needs translating, and only when it is the larger one.
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (!event.deltaY) return;

      // deltaMode 1 is lines rather than pixels, which some mice always
      // send; normalising keeps one notch of the wheel the same distance.
      var step = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;

      // Nothing else on the page scrolls, so the gesture has nowhere else
      // to go and the browser's own handling is never what is wanted.
      event.preventDefault();
      travel(step * REACH);
    },
    { passive: false }
  );

  /* ------------------------------------------------------------- keyboard */

  var PANELS = Array.prototype.slice.call(track.querySelectorAll("[data-section], .foot"));

  /** The panel nearest the leading edge of the window right now. */
  function currentPanel() {
    var best = 0;
    var closest = Infinity;
    PANELS.forEach(function (panel, i) {
      var edge = Math.abs(panel.getBoundingClientRect()[
        getComputedStyle(track).direction === "rtl" ? "right" : "left"
      ] - (getComputedStyle(track).direction === "rtl" ? track.clientWidth : 0));
      if (edge < closest) {
        closest = edge;
        best = i;
      }
    });
    return best;
  }

  function go(step) {
    var panel = PANELS[Math.min(PANELS.length - 1, Math.max(0, currentPanel() + step))];
    if (!panel) return;
    panel.scrollIntoView({
      behavior: reduced.matches ? "auto" : "smooth",
      inline: "start",
      block: "nearest",
    });
  }

  document.addEventListener("keydown", function (event) {
    if (!sideways()) return;
    // Not while the reader is inside the viewer or the contents, both of
    // which are modal and have their own keys.
    if (document.querySelector("dialog[open]")) return;
    if (event.target.closest("input, textarea, [contenteditable]")) return;

    if (event.key === "PageDown") { event.preventDefault(); go(1); }
    else if (event.key === "PageUp") { event.preventDefault(); go(-1); }
    else if (event.key === "Home") { event.preventDefault(); go(-PANELS.length); }
    else if (event.key === "End") { event.preventDefault(); go(PANELS.length); }
  });
})();
