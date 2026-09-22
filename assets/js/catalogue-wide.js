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

  var root = document.documentElement;
  var track = document.getElementById("doc");
  if (!track || root.dataset.axis !== "inline") return;

  /* The gate in the stylesheet. Below it the document is the upright one and
     nothing in this file should touch it. Keep the two in step. */
  var gate = window.matchMedia("(min-width: 20rem) and (min-height: 34rem)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /** Whether the stylesheet is laying the track out sideways at all. */
  function sideways() {
    return gate.matches;
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

  /* ----------------------------------------------------------- the deck */

  /* On a phone a panel is a card, and a section whose writing is longer than
     one card is given as many as it needs. How many that is, is a question
     CSS cannot answer: it is the height of a piece of text at a width, and
     there is no way to ask for that and then divide by the height of a card.
     So it is measured here.

     The stylesheet sets each of these sections in columns exactly one card
     wide and pours the text down them, and gives the section a width of
     `--cards` cards. Too few, and the last column has nowhere to go: it is
     laid out past the inline edge, where the section's own overflow eats it
     and a paragraph goes missing with nothing to say so. That is exactly
     what is measured — the poured box reports a scroll width past its own —
     so the count starts at one and goes up until the spill stops.

     Without this the stylesheet's own figures stand, and they are the number
     the smallest phone the deck is offered on needs. Nothing is ever lost
     without the script; a big phone is simply given one or two cards of
     white it did not need, and this takes them back. */

  var DECK = [
    { sec: ".sec--feature", pour: ".feature", prop: "--cards", hero: ".feature__figure" },
    { sec: ".sec--people", pour: ".shell", prop: "--cards" },
    { sec: ".sec--slabs", pour: ".shell", prop: "--cards" },
    { sec: ".sec--columns", pour: ".columns__text", prop: "--text-cards" },
  ];

  var MOST = 12;

  /* What a photograph at the head of a card may come down to before it stops
     being a photograph, and what it may come up to before the words under it
     read as a caption that has lost its picture. Shares of the card. */
  var HERO_LEAST = 0.28;
  var HERO_MOST = 0.64;

  /** Poured type that will not fit is laid out past the inline edge. */
  function spills(box) {
    return box.scrollWidth - box.clientWidth > 1;
  }

  /* A section whose writing fits one card is given its photograph back: the
     picture takes the card exactly, which both fills it and makes the
     picture as large as the words allow. Returns true if one card did it.

     Without this a section three lines over a card spends a second one on
     those three lines, and the reader swipes to a card that is empty. */
  function fitHero(sec, box, spot) {
    var fig = sec.querySelector(spot);
    if (!fig) return false;

    /* The card's own height, without the frame: clientHeight still counts
       the padding, and a photograph sized to include it is a photograph one
       frame too tall for the card it is filling. */
    var frame = getComputedStyle(box);
    var avail =
      box.clientHeight -
      parseFloat(frame.paddingBlockStart) -
      parseFloat(frame.paddingBlockEnd);

    sec.style.setProperty("--hero", "0px");
    var words = fig.nextElementSibling ? fig.nextElementSibling.offsetHeight : avail;
    /* A pixel short of exact, because a photograph that fills the last of the
       card to the subpixel is a photograph that sometimes does not. */
    var hero = Math.min(avail - words - 1, avail * HERO_MOST);

    if (hero >= avail * HERO_LEAST && !spills(box)) {
      sec.style.setProperty("--hero", hero + "px");
      if (!spills(box)) return true;
    }

    sec.style.removeProperty("--hero");
    return false;
  }

  /* A stop at every card boundary inside a panel that runs on, so a swipe
     can come to rest on the second card of a part as well as on the first.
     The cards past the first are columns of poured type, which are not
     elements and cannot be snapped to; these are one pixel wide, sit where
     each of those columns begins, and are nothing but somewhere to stop.
     Placed from the width each panel came out at, so they agree with the
     count by construction. */
  function markStops(narrow) {
    Array.prototype.forEach.call(document.querySelectorAll(".deck-stop"), function (stop) {
      stop.remove();
    });
    root.classList.toggle("deck-stops", narrow);
    if (!narrow) return;

    PANELS.forEach(function (panel) {
      var cards = Math.round(panel.getBoundingClientRect().width / window.innerWidth);
      for (var k = 1; k < cards; k += 1) {
        var stop = document.createElement("span");
        stop.className = "deck-stop";
        stop.setAttribute("aria-hidden", "true");
        stop.style.setProperty("--at", k);
        panel.appendChild(stop);
      }
    });
  }

  function fitCards() {
    var narrow = window.matchMedia("(max-width: 59.9375rem), (max-height: 37.9375rem)");
    var deck = sideways() && narrow.matches;

    DECK.forEach(function (kind) {
      Array.prototype.forEach.call(document.querySelectorAll(kind.sec), function (sec) {
        if (!deck) {
          sec.style.removeProperty(kind.prop);
          sec.style.removeProperty("--hero");
          return;
        }
        var box = sec.querySelector(kind.pour);
        if (!box) return;

        sec.style.setProperty(kind.prop, 1);
        if (kind.hero && fitHero(sec, box, kind.hero)) return;

        var n = 1;
        while (n < MOST && spills(box)) {
          n += 1;
          sec.style.setProperty(kind.prop, n);
        }
      });
    });

    markStops(deck);
  }

  /* Measured against the type as it will be set, not as it is set while the
     brand faces are still arriving. */
  function measureWhenReady() {
    fitCards();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitCards);
  }

  measureWhenReady();

  /* A turn of the phone changes both the width the words are set to and the
     height of the card holding them, so the whole deck is measured again.
     Keeping the reader where they were: the card they are on is the panel
     nearest the leading edge, and after the deck has been remade that panel
     is brought back to it. */
  var settle = null;
  window.addEventListener(
    "resize",
    function () {
      if (settle !== null) clearTimeout(settle);
      settle = setTimeout(function () {
        settle = null;
        var here = PANELS[currentPanel()];
        fitCards();
        if (here) here.scrollIntoView({ behavior: "auto", inline: "start", block: "nearest" });
      }, 150);
    },
    { passive: true }
  );
})();
