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

  /* The glide.

     A notch does not move the track itself. It adds to a distance, and the
     track covers that distance on an ease out whose length grows with it, so
     a long spin travels further and takes longer to come to rest.

     Growing the length with the distance is what makes it feel even. The
     speed an ease out sets off at is its distance over its length, so tying
     the two together leaves that speed the same whatever is pending, and a
     notch landing in the middle of a glide carries on at the speed the last
     one was running at instead of lurching.

     An ease out and not an ease in and out: the track has to leave under the
     hand at once, and the softness belongs at the far end, where it stops.
     The exponent is low, so the speed holds up through most of the glide and
     the curve does its work in the last of it; a steeper one spends its
     speed early and lands the same stop-start the easing is here to remove.
     Every figure here was chosen by measuring the travel frame by frame
     against a wheel turned steadily. */
  var PACE = 0.7;
  var CURVE = 1.6;
  var LONGEST = 700;

  /* The shortest a glide may be, which is the one number the two kinds of
     wheel disagree about.

     A mouse reports one large notch every eighty milliseconds or so and
     nothing in between, so its glide has to outlast the gap between notches
     or the track stops and starts. A trackpad reports a small distance every
     frame, and a glide that long would leave the track trailing a quarter of
     a second behind the fingers; it wants only enough to take the edges off. */
  var SLOWEST = 420;
  var QUICKEST = 80;

  /* Where the reader has asked to get to, as opposed to where the track has
     caught up to. Kept between notches so that spinning the wheel
     accumulates into one glide instead of restarting from wherever the
     animation happens to be. */
  var target = null;
  var frame = null;

  /* The glide in flight: where it set off from, where it is bound, when it
     started and how long it has. `clock` is the timestamp of the last frame
     drawn, which is what a glide already running is timed against. */
  var from = 0;
  var to = 0;
  var began = 0;
  var span = 0;
  var clock = 0;
  var shortest = SLOWEST;

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
    span = 0;
  }

  function step(now) {
    /* Anything else that moves the track wins, and the glide gets out of the
       way: a jump from the contents, a panel turned with the keyboard, a
       hand on the scrollbar. Without this the two take a frame each and
       neither ever arrives. */
    if (last !== null && Math.abs(track.scrollLeft - last) > 1) return stop();

    clock = now;

    /* Held inside nought and one all the same. Two clocks meet here and the
       arithmetic between them is not guaranteed to come out positive. */
    var t = span > 0 ? clamp((now - began) / span, 0, 1) : 1;
    var eased = 1 - Math.pow(1 - t, CURVE);

    track.scrollLeft = from + (to - from) * eased;
    last = track.scrollLeft;

    if (t >= 1) return stop();
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

    /* The glide is re-aimed from wherever the track has got to, rather than
       handed to scrollTo with a smooth behaviour. That runs the browser's
       own easing from scratch on every notch, which lands a good third of a
       second behind the wheel and reads as lag. */
    from = track.scrollLeft;
    to = target;
    span = Math.min(LONGEST, Math.max(shortest, Math.abs(to - from) * PACE));

    /* Timed from the frame this notch belongs to, not from the instant the
       handler ran. A frame's timestamp is the moment it began, and input is
       handled after that but before the frame is drawn, so timing a glide
       from `performance.now()` leaves its first frame with no elapsed time
       at all and the track standing still through it. One stalled frame in
       every six or seven is exactly the stutter this is here to remove. */
    began = frame !== null && clock ? clock : performance.now() - 16;

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
      var mouse = event.deltaMode !== 0 || Math.abs(event.deltaY) >= 40;
      shortest = mouse ? SLOWEST : QUICKEST;

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
