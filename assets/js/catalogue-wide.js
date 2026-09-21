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

  var wide = window.matchMedia("(min-width: 60rem) and (min-height: 38rem)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /** The stylesheet only lays the track out sideways above this breakpoint. */
  function sideways() {
    return wide.matches;
  }

  /* ---------------------------------------------------------------- wheel */

  /* A notch of the wheel is worth rather more here than it would be down a
     page: a panel is a whole window wide. */
  var REACH = 2.2;

  /* How much of the remaining distance the track covers each frame. High
     enough that the first frame has visibly moved, low enough that a long
     throw still glides. */
  var FOLLOW = 0.24;

  /* The two kinds of wheel, and the reason there are two.

     A trackpad reports a small distance every frame, so the travel it asks
     for is already even and the track can simply follow it.

     A mouse reports one large notch every eighty milliseconds or so, and
     nothing in between. Following that directly turns each notch into a
     shove: the speed leaps on the frame the notch lands and then decays to
     almost nothing before the next one, which is felt as the track moving
     in lumps rather than gliding. So for a mouse the speed itself is eased
     towards what the follow asks for, over several frames, which fills the
     gaps between the notches and takes the top off the shoves. The number
     is the fraction of that difference taken per frame; the trackpad's 1
     means no easing at all. */
  var EASE_FINE = 1;
  var EASE_COARSE = 0.3;

  /* Where the reader has asked to get to, as opposed to where the track has
     caught up to. Kept between notches so that spinning the wheel
     accumulates into one glide instead of restarting from wherever the
     animation happens to be. */
  var target = null;
  var frame = null;

  /* The speed the glide is running at, and how fast that speed is allowed to
     change. Speed is carried between frames because easing it is the whole
     point: it cannot be recomputed from the gap alone. */
  var speed = 0;
  var ease = EASE_FINE;

  /* Where the glide left the track on its last frame. Read back after the
     assignment rather than remembered from before it, so that finding a
     different number here next frame means something else moved the track. */
  var last = null;

  function clamp(value, low, high) {
    return Math.min(high, Math.max(low, value));
  }

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    target = null;
    last = null;
    speed = 0;
  }

  function step() {
    /* Anything else that moves the track wins, and the glide gets out of the
       way: a jump from the contents, a panel turned with the keyboard, a
       hand on the scrollbar. Without this the two take a frame each and
       neither ever arrives. */
    if (last !== null && Math.abs(track.scrollLeft - last) > 1) return stop();

    var gap = target - track.scrollLeft;
    speed += (gap * FOLLOW - speed) * ease;

    /* Both, not either: the gap can close while the speed is still up, and
       stopping there would cut the glide off at the knees. */
    if (Math.abs(gap) < 0.5 && Math.abs(speed) < 0.5) {
      track.scrollLeft = target;
      return stop();
    }

    track.scrollLeft += speed;
    last = track.scrollLeft;
    frame = requestAnimationFrame(step);
  }

  function travel(delta) {
    var limit = track.scrollWidth - track.clientWidth;
    // In a right to left track scrollLeft runs from 0 down into the
    // negatives, so travelling forward is always away from zero.
    var forward = getComputedStyle(track).direction === "rtl" ? -1 : 1;

    if (target === null) target = track.scrollLeft;
    target = clamp(target + delta * forward, forward > 0 ? 0 : -limit, forward > 0 ? limit : 0);

    if (reduced.matches) {
      track.scrollLeft = target;
      stop();
      return;
    }

    // Followed frame by frame rather than handed to scrollTo with a smooth
    // behaviour. That runs the browser's own easing from scratch on every
    // notch, which lands a good third of a second behind the wheel and
    // reads as lag; this has moved by the next frame.
    if (frame === null) frame = requestAnimationFrame(step);
  }

  track.addEventListener(
    "wheel",
    function (event) {
      if (!sideways() || event.ctrlKey) return;

      // A trackpad swiped sideways already reports deltaX and the browser
      // has already scrolled the track with it. Only the vertical part of
      // the gesture needs translating, and only when it is the larger one.
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        stop();
        return;
      }
      if (!event.deltaY) return;

      // deltaMode 1 is lines rather than pixels, which some mice always
      // send; normalising keeps one notch of the wheel the same distance.
      var step = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;

      // Which kind of wheel this is. Anything reporting in lines is a mouse,
      // and so is anything moving this far in one event: a trackpad covers
      // the same ground in a stream of small ones.
      ease = event.deltaMode !== 0 || Math.abs(event.deltaY) >= 40 ? EASE_COARSE : EASE_FINE;

      // Nothing else on the page scrolls, so the gesture has nowhere else
      // to go and the browser's own handling is never what is wanted.
      event.preventDefault();
      travel(step * REACH);
    },
    { passive: false }
  );

  // A hand on the track abandons the wheel's destination straight away,
  // rather than waiting for the next frame to notice it has moved.
  ["pointerdown", "touchstart"].forEach(function (kind) {
    track.addEventListener(kind, stop, { passive: true });
  });

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
    // A glide still in flight is handing the track a new position every
    // frame, and a smooth jump started underneath it would spend the whole
    // journey being pulled back.
    stop();

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
