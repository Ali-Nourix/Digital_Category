/* ==========================================================================
   Behkooshan catalogue, read sideways: the parts a horizontal track needs

   The track itself is a native scroll container, so the scrollbar, the
   keyboard, the touch swipe and a trackpad's horizontal gesture all work
   without any help. Two things do not, and this file is those two:

     1. a mouse wheel reports deltaY and nothing else, so the vertical
        gesture has to be turned into travel along the track
     2. Page Up and Page Down should turn a panel rather than do nothing

   On a phone the track is a deck of cards instead, and both of those turn
   a card at a time; the rest of the file is what the deck needs measured.

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
  /* And the one inside it that turns the spread into a deck of cards. */
  var narrow = window.matchMedia("(max-width: 59.9375rem), (max-height: 37.9375rem)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /** Whether the stylesheet is laying the track out sideways at all. */
  function sideways() {
    return gate.matches;
  }

  /** Whether it is laying it out as a deck of cards, a card to the screen. */
  function onDeck() {
    return sideways() && narrow.matches;
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
      // send, and 2 is whole pages; normalising keeps one notch of the wheel
      // the same distance.
      var step =
        event.deltaMode === 1 ? event.deltaY * 16 :
        event.deltaMode === 2 ? event.deltaY * track.clientWidth :
        event.deltaY;

      // Nothing else on the page scrolls, so the gesture has nowhere else
      // to go and the browser's own handling is never what is wanted.
      event.preventDefault();

      if (onDeck()) {
        deckWheel(step, event.timeStamp || performance.now());
        return;
      }

      // Which kind of wheel this is. Anything reporting in lines is a mouse,
      // and so is anything moving this far in one event: a trackpad covers
      // the same ground in a stream of small ones.
      var mouse = event.deltaMode !== 0 || Math.abs(event.deltaY) >= 40;
      shortest = mouse ? SLOWEST : QUICKEST;

      travel(step * REACH);
    },
    { passive: false }
  );

  // A hand on the track abandons the wheel's destination straight away,
  // rather than waiting for the next frame to notice it has moved.
  ["pointerdown", "touchstart"].forEach(function (kind) {
    track.addEventListener(kind, function () {
      stop();
      aim = null;
    }, { passive: true });
  });

  /* ------------------------------------------------------------ the cards */

  /* On a phone the track is a deck, and a deck is only read on a card: at
     rest half way between two, the reader has the end of one and the start
     of the next and neither to read. The snap in the stylesheet brings a
     swipe to rest on a card, but a glide cannot live with it (the glide sets
     the track a few pixels at a time, and a snap takes every one of those
     back to the card it came from), so on a card the wheel and the page keys
     do not glide. They turn a card, as a swipe does, and aim the track at
     exactly where the card begins, which is where the snap would put it.

     Where the cards begin is read off the snap targets themselves, every
     panel and every stop `markStops` placed inside one, as distances along
     the track in reading order. */
  var cards = [];

  /* The card a turn in flight is bound for. A second notch while the track
     is still travelling is counted from here, not from wherever the track
     has got to, so turning the wheel three times turns three cards. */
  var aim = null;
  var landing = null;

  /** Which way along scrollLeft reading forward goes. */
  function forward() {
    return getComputedStyle(track).direction === "rtl" ? -1 : 1;
  }

  /** How far along the track, in reading order, an element begins. */
  function startOf(el) {
    var dir = forward();
    var box = track.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    var edge = dir > 0 ? r.left - box.left : r.right - box.right;
    return clamp(Math.round((track.scrollLeft + edge) * dir), 0, track.scrollWidth - track.clientWidth);
  }

  function readCards() {
    var seen = {};
    cards = [];
    Array.prototype.forEach.call(track.querySelectorAll("[data-section], .foot, .deck-stop"), function (el) {
      var at = startOf(el);
      if (!seen[at]) {
        seen[at] = true;
        cards.push(at);
      }
    });
    cards.sort(function (a, b) {
      return a - b;
    });
  }

  /** The card nearest to where the track is now. */
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
    if (!cards.length) readCards();
    if (!cards.length) return;

    aim = clamp((aim !== null ? aim : nearestCard()) + by, 0, cards.length - 1);
    track.scrollTo({
      left: cards[aim] * forward(),
      behavior: reduced.matches ? "auto" : "smooth",
    });

    // Once the track has come to rest the next turn is counted from where it
    // is. The scroll says when it has ended where the browser can; the wait
    // is for the ones that cannot, and is longer than any turn takes.
    if (landing !== null) clearTimeout(landing);
    landing = setTimeout(function () {
      aim = null;
      landing = null;
    }, 900);
  }

  track.addEventListener("scrollend", function () {
    aim = null;
  });

  /* The wheel on a card.

     A mouse and a trackpad send such different streams that one rule for
     both has to be about the stream rather than about the device. A burst
     of events with no quiet longer than GESTURE in it is one gesture: one
     notch, a spin of several, or one stroke of two fingers together with
     the coasting that follows it after they lift. A gesture turns a card as
     soon as it has travelled NUDGE, so a wheel answers on its first notch
     and a finger resting on the pad does nothing.

     After that, a gesture that keeps going at the strength it turned with
     is a wheel being spun, and turns another card every PACING, which is
     about as long as one turn takes to travel. A gesture that is dying away
     is a trackpad coasting, and turns nothing more: without that, one flick
     of the fingers would run through three or four cards. */
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

    // On a card a page is a card, not a section: a section may run to five.
    if (onDeck()) {
      if (event.key === "PageDown") { event.preventDefault(); turn(1); }
      else if (event.key === "PageUp") { event.preventDefault(); turn(-1); }
      else if (event.key === "Home") { event.preventDefault(); turn(-Infinity); }
      else if (event.key === "End") { event.preventDefault(); turn(Infinity); }
      return;
    }

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
    { sec: ".sec--feature", pour: ".feature", prop: "--cards" },
    { sec: ".sec--people", pour: ".shell", prop: "--cards" },
    { sec: ".sec--slabs", pour: ".shell", prop: "--cards", part: ".slabs__col" },
    { sec: ".sec--columns", pour: ".columns__text", prop: "--text-cards", part: ".columns__block" },
  ];

  var MOST = 12;

  /** Poured type that will not fit is laid out past the inline edge. */
  function spills(box) {
    return box.scrollWidth - box.clientWidth > 1;
  }

  /* The horizon: one line across the deck that every photograph at the head
     of a card and every section opener's green stops on, so that the edges
     run on from card to card instead of stepping at every swipe.

     It is the height the shortest writing leaves: every section whose words
     fit one card with a photograph of a reasonable height over them is
     measured, and the horizon is the lowest of what they leave, so all of
     them still fit their one card and none has a photograph taller than the
     others. A section whose writing is longer than a card runs on to the
     next whatever the photograph does, and has no say. Kept between two
     shares of the card: under the first a photograph stops being one, and
     over the second, the 5:12 of the print's section openers, the writing
     under it reads as a caption that has lost its picture. */
  var HORIZON_LEAST = 0.28;
  var HORIZON_MOST = 5 / 12;

  /** The height of a block of writing, however many columns it runs over. */
  function depth(el) {
    var sum = 0;
    Array.prototype.forEach.call(el.getClientRects(), function (r) {
      sum += r.height;
    });
    return sum;
  }

  function fitHorizon(deck) {
    root.style.removeProperty("--horizon");
    if (!deck) return;

    var card = track.clientHeight;
    var best = card * HORIZON_MOST;
    Array.prototype.forEach.call(document.querySelectorAll(".sec--feature .feature"), function (box) {
      var fig = box.querySelector(".feature__figure");
      var words = fig && fig.nextElementSibling;
      if (!words) return;
      var frame = getComputedStyle(box);
      var avail = box.clientHeight - parseFloat(frame.paddingBlockStart) - parseFloat(frame.paddingBlockEnd);
      /* A pixel short of exact, because a photograph that fills the last of
         the card to the subpixel is a photograph that sometimes does not. */
      var leaves = avail - depth(words) - 1;
      if (leaves >= card * HORIZON_LEAST) best = Math.min(best, leaves);
    });
    root.style.setProperty("--horizon", Math.floor(best) + "px");
  }

  /* Where a card breaks, done by hand.

     The stylesheet asks for a heading never to end a card, for a list item,
     a named advantage, the quote, a byline and a life no longer than a card
     never to be broken, and for a
     paragraph never to leave one line alone at the foot of a card. Chrome
     and Safari do as they are asked. Firefox does none of it inside columns:
     a heading ends a card with its text on the next, and a list item is cut
     in two. So after the type is set this walks the poured box in reading
     order and, wherever one of those has happened, pushes the block on to
     the next card with a margin exactly as deep as what was left of the
     card it was on. Where the browser has already done it, nothing is found
     and nothing is moved. */
  var HEADS = ".title, .heading, .benefit__title, .tag, .slabs__uses-intro";
  var WHOLE = "li, .benefit, .pull, .person__name";

  /* What every step of placing by hand needs to know about a poured box:
     the height of a card inside its frame, which card a piece of it is on
     and how far down, and how to move a block on to the next card. */
  function pager(box) {
    var frame = getComputedStyle(box);
    var rtl = frame.direction === "rtl";
    var width = window.innerWidth;
    var height = box.clientHeight - parseFloat(frame.paddingBlockStart) - parseFloat(frame.paddingBlockEnd);

    function place(rect) {
      var edge = box.getBoundingClientRect();
      var x = rtl ? edge.right - rect.right : rect.left - edge.left;
      return {
        column: Math.floor((x + 1) / width),
        top: rect.top - edge.top - parseFloat(frame.paddingBlockStart),
      };
    }

    /* Measured again after every step, because the margin given may
       collapse into one the block already had and move it less than asked. */
    function push(el) {
      var from = el.getClientRects()[0];
      if (!from) return;
      var column = place(from).column;
      for (var tries = 0; tries < 4; tries += 1) {
        var now = el.getClientRects()[0];
        var at = place(now);
        if (at.column !== column) return;
        var left = height - at.top;
        if (left <= 1) return;
        var margin = parseFloat(getComputedStyle(el).marginBlockStart) || 0;
        el.style.marginBlockStart = margin + left + 1 + "px";
        el.setAttribute("data-pushed", "");
      }
    }

    /* The first piece of a block that has anything in it: a list can start
       with nothing but its own top edge at the foot of one card and its
       first item on the next. */
    function start(el) {
      var pieces = el.getClientRects();
      for (var i = 0; i < pieces.length; i += 1) if (pieces[i].height > 2) return pieces[i];
      return pieces[0];
    }

    return { height: height, place: place, push: push, start: start };
  }

  function paginate(box) {
    paginateUndo(box);

    var pg = pager(box);
    var height = pg.height;
    var place = pg.place;
    var push = pg.push;
    var start = pg.start;

    /* A life's byline is its portrait and its name together, so it is the
       whole life that moves. */
    function mover(el) {
      return el.classList.contains("person__name") ? el.closest(".person") || el : el;
    }

    Array.prototype.forEach.call(box.querySelectorAll(HEADS + ", " + WHOLE + ", .prose p, .person"), function (el) {
      var pieces = el.getClientRects();
      if (!pieces.length) return;
      var here = place(pieces[0]);

      if (pieces.length > 1 && place(pieces[pieces.length - 1]).column !== here.column) {
        if (el.matches(WHOLE)) return push(mover(el));
        // The second life goes on whole, unless it is longer than a card.
        // The first stays with the head it follows, which alone on a card
        // is a banner and three lines.
        if (el.matches(".person")) {
          var first = !(el.previousElementSibling && el.previousElementSibling.matches(".person"));
          return !first && depth(el) < height ? push(el) : undefined;
        }
        // A paragraph that leaves a single line at the foot of a card, or
        // carries a single line over to the head of the next: the whole of
        // it goes on, which the next card has room for.
        var line = parseFloat(getComputedStyle(el).lineHeight) || 28;
        var tail = pieces[pieces.length - 1].height;
        if (pieces[0].height < line * 1.6 || (tail < line * 1.6 && depth(el) < height)) return push(el);
      }

      if (el.matches(HEADS)) {
        var next = el.nextElementSibling;
        var after = next && start(next);
        if (after && place(after).column !== here.column) push(mover(el));
      }
    });
  }

  /* The last card of a section holding only the last few lines of it. The
     writing runs on from card to card, and where it ran on to a card of its
     own by three lines that card looked lost rather than turned to. So when
     the last card would be that empty, and the last part of the section
     (the last block with a title of its own) fits a card whole, the whole
     part goes on to the last card instead: a part opening a card, under its
     title, as it would if the card had been turned to on purpose. */
  var SHORT = 0.25;

  function keepLastPart(box, part) {
    var parts = box.querySelectorAll(part);
    var last = parts[parts.length - 1];
    if (!last) return;

    var pg = pager(box);
    var pieces = Array.prototype.filter.call(last.getClientRects(), function (r) {
      return r.height > 2;
    });
    if (pieces.length < 2) return;

    var head = pg.place(pieces[0]);
    var tail = pieces[pieces.length - 1];
    var foot = pg.place(tail);
    if (foot.column === head.column) return;
    if (foot.top + tail.height >= pg.height * SHORT) return;
    if (depth(last) >= pg.height) return;

    pg.push(last);
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

  /* A generation's two lives stand one under the other on the card after
     its opener, as they stand down the upright page, with the page's rule
     between them. Should a card ever have no room even to start the second,
     it goes on to the next card, and a rule over it there would be a line
     across the head of that card with nothing above it; so the rule is
     drawn only over a life that starts on the card the one before it is on.
     A life that runs on to the next card is in two pieces, and it is the
     first piece that says where it starts. The rule is out of the flow, so
     drawing it moves nothing and cannot change where either life lands. */
  function markLives(deck) {
    Array.prototype.forEach.call(document.querySelectorAll(".person"), function (life) {
      var before = life.previousElementSibling;
      var under = false;
      if (deck && before !== null && before.classList.contains("person")) {
        var a = before.getClientRects()[0];
        var b = life.getClientRects()[0];
        under = !!a && !!b && Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2) < window.innerWidth / 2;
      }
      life.classList.toggle("person--under", under);
    });
  }

  /* Granite and quartzite are one composition on two cards: the same three
     frames in the same places, and the writing under them. Each card gives
     its photographs what its own writing leaves, so a longer paragraph used
     to mean a shorter block of photographs and the two cards came out two
     different shapes. They are given the same block, the one the longer
     writing leaves, and the shorter writing has the more white under it. */
  function fitStones(deck) {
    var stones = Array.prototype.slice.call(document.querySelectorAll(".sec--stone"));
    stones.forEach(function (sec) {
      sec.style.removeProperty("--stone-figures");
    });
    if (!deck) return;

    var least = Infinity;
    stones.forEach(function (sec) {
      var figures = sec.querySelector(".stone__figures");
      if (figures) least = Math.min(least, figures.getBoundingClientRect().height);
    });
    if (!isFinite(least) || least <= 0) return;

    stones.forEach(function (sec) {
      sec.style.setProperty("--stone-figures", Math.floor(least) + "px");
    });
  }

  /* A feature that runs on to a second card only by a few lines is given
     its two cards the other way round, the photograph on the first and the
     writing whole on the second, if the writing fits one card on its own.
     If it does not, the photograph goes back over the words and they run
     on as they did. */
  function plateFeature(sec, box, cards) {
    var fig = box.querySelector(".feature__figure");
    var words = fig && fig.nextElementSibling;
    if (!words) return;

    paginateUndo(box);
    box.classList.add("feature--plated");
    sec.style.setProperty("--cards", 2);
    if (words.scrollHeight - words.clientHeight <= 1) return;

    box.classList.remove("feature--plated");
    sec.style.setProperty("--cards", cards);
    paginate(box);
  }

  /* The eight photographs of the advantages come up under the last of the
     writing when it leaves at least half of its card, rather than following
     on a card of their own. What the words leave is measured from the foot
     of the last line on that card to the bottom frame line. */
  var BAND_LEAST = 0.5;

  function liftBand(sec, box) {
    var band = sec.querySelector(".band");
    var last = box.lastElementChild;
    var pieces = last && last.getClientRects();
    if (!band || !pieces || !pieces.length) return;

    var frame = getComputedStyle(box);
    var foot = box.getBoundingClientRect().bottom - parseFloat(frame.paddingBlockEnd);
    var room = foot - pieces[pieces.length - 1].bottom;
    if (room < track.clientHeight * BAND_LEAST) return;

    sec.classList.add("columns--band-up");
    sec.style.setProperty("--band-room", Math.floor(room) + "px");
  }

  /* Each generation, its head and both its lives, on one card. The
     stylesheet draws the air on those cards, never the words or their
     sizes, between the setting as made (`--fit: 0`) and the closest it can
     be drawn (`--fit: 1`); this finds the least that puts both generations
     whole on one card each, in tenths, and gives both the same so they read
     as a pair. Past that the lives run beside their portraits instead of
     under them (`people--wrap`) and the air closes a little more, down to
     floors the stylesheet sets. Where even that does not do it the setting
     goes back to as made, and the second life goes on to the next card as
     it would have. */
  var FIT_STAGES = [];
  (function () {
    for (var step = 0; step <= 10; step += 1) FIT_STAGES.push({ fit: step / 10, wrap: false });
    [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6].forEach(function (fit) {
      FIT_STAGES.push({ fit: fit, wrap: true });
    });
  })();

  function fitPeople(deck) {
    var secs = Array.prototype.slice.call(document.querySelectorAll(".sec--people"));
    function set(stage) {
      secs.forEach(function (sec) {
        if (stage) {
          sec.style.setProperty("--fit", stage.fit);
          sec.style.setProperty("--cards", 1);
        } else {
          sec.style.removeProperty("--fit");
        }
        sec.classList.toggle("people--wrap", !!stage && stage.wrap);
      });
    }

    set(null);
    if (!deck || !secs.length) return;

    for (var i = 0; i < FIT_STAGES.length; i += 1) {
      set(FIT_STAGES[i]);
      var whole = secs.every(function (sec) {
        var box = sec.querySelector(".shell");
        if (!box) return true;
        paginate(box);
        return !spills(box);
      });
      if (whole) return;
    }

    set(null);
  }

  function fitCards() {
    var deck = onDeck();

    Array.prototype.forEach.call(document.querySelectorAll(".feature--plated"), function (box) {
      box.classList.remove("feature--plated");
    });
    Array.prototype.forEach.call(document.querySelectorAll(".columns--band-up"), function (sec) {
      sec.classList.remove("columns--band-up");
      sec.style.removeProperty("--band-room");
    });

    fitHorizon(deck);
    fitPeople(deck);

    DECK.forEach(function (kind) {
      Array.prototype.forEach.call(document.querySelectorAll(kind.sec), function (sec) {
        var box = sec.querySelector(kind.pour);
        if (!deck) {
          sec.style.removeProperty(kind.prop);
          if (box) paginateUndo(box);
          return;
        }
        if (!box) return;

        sec.style.setProperty(kind.prop, 1);
        paginate(box);

        var n = 1;
        while (n < MOST && spills(box)) {
          n += 1;
          sec.style.setProperty(kind.prop, n);
        }

        // Photographs brought up under the words fill that card better
        // than the last part moved on to it, so those are tried first.
        if (kind.sec === ".sec--columns") liftBand(sec, box);

        if (kind.part && n > 1 && !sec.classList.contains("columns--band-up")) {
          keepLastPart(box, kind.part);
          while (n < MOST && spills(box)) {
            n += 1;
            sec.style.setProperty(kind.prop, n);
          }
        }

        if (kind.sec === ".sec--feature" && n === 2) plateFeature(sec, box, n);
        if (kind.sec === ".sec--columns" && !sec.classList.contains("columns--band-up")) liftBand(sec, box);
      });
    });

    fitStones(deck);
    markStops(deck);
    markLives(deck);
    readCards();
  }

  function paginateUndo(box) {
    Array.prototype.forEach.call(box.querySelectorAll("[data-pushed]"), function (el) {
      el.style.removeProperty("margin-block-start");
      el.removeAttribute("data-pushed");
    });
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
     Keeping the reader where they were: the panel they are in is the one
     nearest the leading edge, and they are so many cards into it. After the
     deck has been remade they are put back on that card of that panel, or on
     its last if it now runs to fewer. */
  var settle = null;
  window.addEventListener(
    "resize",
    function () {
      if (settle !== null) clearTimeout(settle);
      settle = setTimeout(function () {
        settle = null;
        var here = PANELS[currentPanel()];
        var into = here ? Math.max(0, Math.round((track.scrollLeft * forward() - startOf(here)) / window.innerWidth)) : 0;
        fitCards();
        if (!here) return;
        here.scrollIntoView({ behavior: "auto", inline: "start", block: "nearest" });
        if (!onDeck() || !into) return;

        var first = cards.indexOf(startOf(here));
        var span = Math.round(here.getBoundingClientRect().width / window.innerWidth);
        if (first < 0 || span < 2) return;
        aim = null;
        var card = cards[Math.min(cards.length - 1, first + Math.min(into, span - 1))];
        track.scrollTo({ left: card * forward(), behavior: "auto" });
      }, 150);
    },
    { passive: true }
  );
})();
