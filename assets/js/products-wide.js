/* ==========================================================================
   Behkooshan products, read sideways: the parts a horizontal track needs

   The track is a native scroll container, so the scrollbar, a swipe and a
   trackpad's sideways gesture all work on their own. What does not, and
   what this file is:

     1. a mouse wheel reports deltaY and nothing else, so the vertical
        gesture is turned into travel along the track, on the same glide the
        digital catalogue's sideways reading uses
     2. Page Up, Page Down, Home and End move along the track
     3. the quarry's writing is poured down columns, and how many columns it
        needs is measured here, since CSS cannot say how long a text is

   On a phone the track is a deck of cards, and the wheel and the keys turn
   a card at a time instead of gliding.

   Loaded only by the pages in wide/. Deleting it leaves the upright pages
   untouched.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var track = document.querySelector(".track");
  if (!track || root.dataset.axis !== "inline") return;

  /* The gates in products-wide.css. Keep them in step. */
  var gate = window.matchMedia("(min-width: 20rem) and (min-height: 34rem)");
  var narrow = window.matchMedia("(max-width: 59.9375rem), (max-height: 37.9375rem)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function sideways() {
    return gate.matches;
  }

  function onDeck() {
    return sideways() && narrow.matches;
  }

  function clamp(value, low, high) {
    return Math.min(high, Math.max(low, value));
  }

  /** Which way along scrollLeft reading forward goes: a right to left track
      runs from 0 down into the negatives. */
  function forward() {
    return getComputedStyle(track).direction === "rtl" ? -1 : 1;
  }

  function limit() {
    return track.scrollWidth - track.clientWidth;
  }

  /* ---------------------------------------------------------------- glide */

  /* The figures are the catalogue's, measured there frame by frame against
     a wheel turned steadily; see catalogue-wide.js for the reasoning. A notch
     adds to a distance and the track covers it on an ease out whose length
     grows with it, so a notch landing mid-glide carries on at the speed the
     last was running at. */
  var REACH = 2.2;
  var PACE = 0.7;
  var CURVE = 1.6;
  var LONGEST = 700;
  var SLOWEST = 420;
  var QUICKEST = 80;

  var target = null;
  var frame = null;
  var from = 0;
  var to = 0;
  var began = 0;
  var span = 0;
  var clock = 0;
  var shortest = SLOWEST;
  var last = null;

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    target = null;
    last = null;
    span = 0;
  }

  function step(now) {
    // Anything else moving the track wins: a hand on the scrollbar, the way
    // back to the filters, a key.
    if (last !== null && Math.abs(track.scrollLeft - last) > 1) return stop();

    clock = now;
    var t = span > 0 ? clamp((now - began) / span, 0, 1) : 1;
    var eased = 1 - Math.pow(1 - t, CURVE);

    track.scrollLeft = from + (to - from) * eased;
    last = track.scrollLeft;

    if (t >= 1) return stop();
    frame = requestAnimationFrame(step);
  }

  /** Travel so far along the track, in reading order. */
  function travel(delta) {
    var dir = forward();
    if (target === null) target = track.scrollLeft;
    target = clamp(target + delta * dir, dir > 0 ? 0 : -limit(), dir > 0 ? limit() : 0);

    if (reduced.matches) {
      track.scrollLeft = target;
      stop();
      return;
    }

    from = track.scrollLeft;
    to = target;
    span = Math.min(LONGEST, Math.max(shortest, Math.abs(to - from) * PACE));
    // Timed from the frame this notch belongs to, so the first frame of a
    // glide is never one with no time elapsed in it.
    began = frame !== null && clock ? clock : performance.now() - 16;

    if (frame === null) frame = requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------------- cards */

  /* On a phone every swipe comes to rest on a card, and a glide cannot live
     with that: the snap takes back every few pixels it sets. So there the
     wheel and the keys turn a card, and aim at exactly where it begins.

     Where the cards begin is read off whatever the stylesheet has made a
     snap target, as distances along the track in reading order. The filters
     hide and show stones, so they are read again at the start of each turn
     rather than once. */
  var CANDIDATES = ".intro, .group__title, .stone, .empty, .plate, .card, .about__inner, .deck-stop, .related__inner, .foot";

  var cards = [];
  var aim = null;
  var landing = null;

  /** How far along the track, in reading order, an element begins. */
  function along(el) {
    var dir = forward();
    var box = track.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    var edge = dir > 0 ? r.left - box.left : box.right - r.right;
    return track.scrollLeft * dir + edge;
  }

  function readCards() {
    var seen = {};
    cards = [];
    Array.prototype.forEach.call(track.querySelectorAll(CANDIDATES), function (el) {
      if (!el.getClientRects().length) return;
      var style = getComputedStyle(el);
      if (style.scrollSnapAlign.indexOf("start") < 0) return;
      // Where the snap would put the track: the element's start, less the
      // margin it asks to be kept from the edge.
      var at = clamp(Math.round(along(el) - (parseFloat(style.scrollMarginInlineStart) || 0)), 0, limit());
      if (!seen[at]) {
        seen[at] = true;
        cards.push(at);
      }
    });
    cards.sort(function (a, b) {
      return a - b;
    });
  }

  function nearestCard() {
    var here = track.scrollLeft * forward();
    var best = 0;
    for (var i = 1; i < cards.length; i += 1) {
      if (Math.abs(cards[i] - here) < Math.abs(cards[best] - here)) best = i;
    }
    return best;
  }

  function turn(by) {
    stop();
    if (aim === null) readCards();
    if (!cards.length) return;

    aim = clamp((aim !== null ? aim : nearestCard()) + by, 0, cards.length - 1);
    track.scrollTo({ left: cards[aim] * forward(), behavior: reduced.matches ? "auto" : "smooth" });

    if (landing !== null) clearTimeout(landing);
    landing = setTimeout(function () {
      aim = null;
      landing = null;
    }, 900);
  }

  track.addEventListener("scrollend", function () {
    aim = null;
  });

  /* The stone each card of a group begins with. A card is two columns and
     exactly a window wide, so the card a stone is on is how many windows
     it is from the first stone of its group, and it begins a card when it
     stands at the head of that window. Worked out from where the stones
     are laid out rather than from their places in the list, because the
     quarry takes two columns and the filters take stones away. */
  function markCards() {
    var deck = onDeck();
    root.classList.toggle("deck-cards", deck);
    Array.prototype.forEach.call(track.querySelectorAll(".stone[data-card]"), function (el) {
      el.removeAttribute("data-card");
    });
    cards = [];
    if (!deck) return;

    var width = window.innerWidth;
    Array.prototype.forEach.call(track.querySelectorAll(".stones"), function (grid) {
      var shown = Array.prototype.filter.call(grid.children, function (el) {
        return el.getClientRects().length > 0;
      });
      if (!shown.length) return;
      var first = along(shown[0]);
      var seen = {};
      shown.forEach(function (el) {
        var into = along(el) - first;
        var card = Math.floor((into + 2) / width);
        if (seen[card] || Math.abs(into - card * width) > 2) return;
        seen[card] = true;
        el.setAttribute("data-card", "");
      });
    });
  }

  /* The filters show and hide stones and whole groups by their hidden
     attribute; after they have, the cards are worked out again. */
  var remark = null;
  new MutationObserver(function () {
    if (remark !== null) return;
    remark = requestAnimationFrame(function () {
      remark = null;
      markCards();
    });
  }).observe(track, { subtree: true, attributes: true, attributeFilter: ["hidden"] });

  /* The wheel on a card, the catalogue's rule: a burst of events with no
     quiet longer than GESTURE in it is one gesture, which turns a card once
     it has travelled NUDGE; a wheel still being spun at the same strength
     turns another every PACING, a trackpad coasting away turns nothing more. */
  var GESTURE = 160;
  var NUDGE = 24;
  var PACING = 400;

  var gestureAt = -Infinity;
  var gathered = 0;
  var turnedAt = 0;
  var strength = 0;
  var heading = 0;

  function deckWheel(delta, now) {
    var sign = delta > 0 ? 1 : -1;

    if (now - gestureAt > GESTURE || (turnedAt && sign !== heading)) {
      gathered = 0;
      turnedAt = 0;
      strength = 0;
    }
    gestureAt = now;
    heading = sign;

    if (!turnedAt) {
      gathered += delta;
      if (Math.abs(gathered) < NUDGE) return;
      heading = gathered > 0 ? 1 : -1;
      turn(heading);
      turnedAt = now;
      strength = Math.abs(delta);
      return;
    }

    strength = Math.max(strength, Math.abs(delta));
    if (now - turnedAt >= PACING && Math.abs(delta) >= strength * 0.9) {
      turn(sign);
      turnedAt = now;
      strength = Math.abs(delta);
    }
  }

  /* ---------------------------------------------------------------- wheel */

  track.addEventListener(
    "wheel",
    function (event) {
      if (!sideways() || event.ctrlKey) return;
      // A panel taller than the window, the card of words on a short one,
      // scrolls down on its own; the wheel is left to it until it has come
      // to the end in that direction, and then travels the track.
      var inner = event.target.closest(".card, .intro");
      if (inner && event.deltaY &&
          (event.deltaY > 0 ? inner.scrollTop + inner.clientHeight < inner.scrollHeight - 1 : inner.scrollTop > 0)) {
        return;
      }

      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        stop();
        return;
      }
      if (!event.deltaY) return;

      var delta =
        event.deltaMode === 1 ? event.deltaY * 16 :
        event.deltaMode === 2 ? event.deltaY * track.clientWidth :
        event.deltaY;

      event.preventDefault();

      if (onDeck()) {
        deckWheel(delta, event.timeStamp || performance.now());
        return;
      }

      var mouse = event.deltaMode !== 0 || Math.abs(event.deltaY) >= 40;
      shortest = mouse ? SLOWEST : QUICKEST;
      travel(delta * REACH);
    },
    { passive: false }
  );

  ["pointerdown", "touchstart"].forEach(function (kind) {
    track.addEventListener(kind, function () {
      stop();
      aim = null;
    }, { passive: true });
  });

  /* ------------------------------------------------------------- keyboard */

  /* A group of stones runs to many windows, so a page here is a window, less
     a little so the last stones of one stay in sight on the next, as a page
     down a document keeps its last line. */
  var PAGE = 0.85;

  document.addEventListener("keydown", function (event) {
    if (!sideways() || event.altKey || event.ctrlKey || event.metaKey) return;
    if (document.querySelector("dialog[open]")) return;
    var at = event.target;
    if (at && at.closest && at.closest("input, textarea, select, [contenteditable]")) return;

    var key = event.key;
    if (key !== "PageDown" && key !== "PageUp" && key !== "Home" && key !== "End") return;
    event.preventDefault();

    if (onDeck()) {
      turn(key === "PageDown" ? 1 : key === "PageUp" ? -1 : key === "Home" ? -Infinity : Infinity);
      return;
    }

    shortest = SLOWEST;
    if (key === "Home" || key === "End") {
      stop();
      travel(key === "End" ? limit() : -limit());
      return;
    }
    travel((key === "PageDown" ? 1 : -1) * track.clientWidth * PAGE);
  });

  /* ------------------------------------------------------ the quarry's words */

  /* The writing on a stone's page is poured down columns of a fixed height,
     and the panel is given the width of however many columns it fills. Too
     narrow and the last column is laid out past the panel's edge, where it
     would be cut; that is exactly what is measured, the text box reporting
     a scroll width past its own, and the panel widens a column at a time
     until it stops. On a card a column is a card. */
  var MOST = 24;

  function spills(box) {
    return box.scrollWidth - box.clientWidth > 1;
  }

  /* Firefox does not keep a heading with the paragraph it opens inside
     columns, so a heading can end a column with its words at the head of the
     next. Where it has, the heading is pushed on after them. */
  function keepHeads(text) {
    Array.prototype.forEach.call(text.querySelectorAll("[data-pushed]"), function (el) {
      el.style.removeProperty("margin-block-start");
      el.removeAttribute("data-pushed");
    });

    var box = text.getBoundingClientRect();
    Array.prototype.forEach.call(text.querySelectorAll(".about__heading"), function (head) {
      var next = head.nextElementSibling;
      var a = head.getClientRects()[0];
      var b = next && next.getClientRects()[0];
      if (!a || !b || Math.abs(a.left - b.left) < a.width / 2) return;
      head.style.marginBlockStart = box.bottom - a.top + 1 + "px";
      head.setAttribute("data-pushed", "");
    });
  }

  function stops(panel, deck) {
    Array.prototype.forEach.call(panel.querySelectorAll(".deck-stop"), function (el) {
      el.remove();
    });
    if (!deck) return;
    var n = Math.round(panel.getBoundingClientRect().width / window.innerWidth);
    for (var k = 1; k < n; k += 1) {
      var mark = document.createElement("span");
      mark.className = "deck-stop";
      mark.setAttribute("aria-hidden", "true");
      mark.style.setProperty("--at", k);
      panel.appendChild(mark);
    }
  }

  function fitAbout() {
    var deck = onDeck();
    Array.prototype.forEach.call(document.querySelectorAll(".about__inner"), function (panel) {
      var text = panel.querySelector(".about__text");
      panel.style.removeProperty("--about-w");
      if (!text || !sideways()) return stops(panel, false);

      keepHeads(text);
      var style = getComputedStyle(text);
      var gap = parseFloat(style.columnGap) || 0;
      var column = deck ? window.innerWidth : (parseFloat(style.columnWidth) || 352) + gap;
      var width = panel.getBoundingClientRect().width;

      for (var n = 0; n < MOST && spills(text); n += 1) {
        width += column;
        panel.style.setProperty("--about-w", Math.ceil(width) + "px");
        keepHeads(text);
      }
      stops(panel, deck);
    });
    cards = [];
  }

  function fit() {
    fitAbout();
    markCards();
  }

  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  /* Turning the phone changes the width of a card and the height of a
     column, so the writing is measured again, and the reader is put back on
     the card nearest where they were. */
  var settle = null;
  window.addEventListener(
    "resize",
    function () {
      if (settle !== null) clearTimeout(settle);
      settle = setTimeout(function () {
        settle = null;
        var share = limit() > 0 ? track.scrollLeft / limit() : 0;
        stop();
        fit();
        track.scrollLeft = share * limit();
        if (onDeck()) {
          readCards();
          if (cards.length) track.scrollTo({ left: cards[nearestCard()] * forward(), behavior: "auto" });
        }
      }, 150);
    },
    { passive: true }
  );
})();
