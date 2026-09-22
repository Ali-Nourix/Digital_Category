/* ==========================================================================
   Behkooshan catalogue

   Three jobs, no scroll listener between them:

     1. reveal    hide what is below the fold, then let an IntersectionObserver
                  bring each piece in as the scroll reaches it, and take it
                  back out when it leaves so the return journey plays too,
                  unless the stylesheet says the page is being read as a
                  deck of cards, where what has arrived stays
     2. position  keep track of which section is on screen, so the language
                  switch lands the reader in the same place in the other
                  document rather than at the top of it
     3. contents  open and close the index

   Every hidden state in the stylesheet is gated on html.js AND on a class
   this file adds. Nothing is hidden by CSS alone, so a page whose script
   never arrives is a complete page rather than an empty one.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Which way the document runs. The upright build leaves this alone; the
  // sideways one sets data-axis="inline" on <html>, and the two observers
  // below are the only things in this file that care. Removing the sideways
  // version means removing this line and taking the first branch of each
  // pair that reads it.
  var sideways = root.dataset.axis === "inline";

  /* ---------------------------------------------------------------- reveal */

  function setUpReveal() {
    if (!("IntersectionObserver" in window) || reduced.matches) return;

    // .reveal fades a block up, .headline writes a title one word at a time,
    // .place uncovers a photograph, .divider slides its green half out.
    var targets = Array.prototype.slice.call(
      document.querySelectorAll(".reveal, .headline, .place, .divider")
    );
    if (!targets.length) return;

    // Only hide what the reader cannot see yet. Hiding everything and then
    // letting the observer undo it one frame later is what makes a page
    // flash on load.
    var fold = (sideways ? window.innerWidth : window.innerHeight) * 0.94;
    targets.forEach(function (el) {
      var box = el.getBoundingClientRect();
      var ahead = sideways
        ? Math.max(box.left, window.innerWidth - box.right)
        : box.top;
      if (ahead > fold) el.classList.add("is-out");
    });

    // Whether any part of a block is on screen. A paragraph poured from the
    // foot of one column to the head of the next is one element in two
    // pieces, and the observer only watches the first: when that piece
    // leaves, it reports the whole paragraph gone, and taking it out then
    // would blank the half still being read.
    function onScreen(el) {
      var pieces = el.getClientRects();
      for (var i = 0; i < pieces.length; i += 1) {
        var r = pieces[i];
        if (r.right > 0 && r.left < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight) {
          return true;
        }
      }
      return false;
    }

    // Whether a block that has arrived goes back out when it leaves, so the
    // return journey plays too. The stylesheet decides, because it is the
    // one that knows what the page is being read as: on a phone's deck of
    // cards a photograph opens once and stays open, since a card being
    // dragged away is still being looked at.
    function returns() {
      return getComputedStyle(root).getPropertyValue("--reveal-returns").trim() !== "0";
    }

    var observer = new IntersectionObserver(
      function (entries) {
        var back = returns();
        entries.forEach(function (entry) {
          var gone = !entry.isIntersecting && !onScreen(entry.target);
          if (gone && !back) return;
          entry.target.classList.toggle("is-out", gone);
        });
      },
      // The trailing edge is pulled in a little so a block starts arriving
      // just before it would otherwise be flush with the window edge. Small,
      // because anything larger risks leaving the last block of the document
      // unrevealed at the end of the scroll.
      { rootMargin: sideways ? "0px -6% 0px -6%" : "0px 0px -6% 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* -------------------------------------------------------------- position */

  function setUpPosition() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-section]"));
    var swaps = Array.prototype.slice.call(
      document.querySelectorAll("[data-lang-swap], [data-view-swap]")
    );
    var links = {};

    Array.prototype.forEach.call(
      document.querySelectorAll(".contents__list a"),
      function (a) {
        links[a.getAttribute("href").slice(1)] = a;
      }
    );

    if (!sections.length || !swaps.length || !("IntersectionObserver" in window)) return;

    var bases = swaps.map(function (a) {
      return a.getAttribute("href").split("#")[0];
    });
    var current = null;

    function mark(id) {
      if (id === current) return;
      if (current && links[current]) links[current].removeAttribute("aria-current");
      current = id;
      if (links[id]) links[id].setAttribute("aria-current", "true");
      swaps.forEach(function (a, i) {
        a.setAttribute("href", bases[i] + "#" + id);
      });
    }

    // A band across the middle of the window: whichever section crosses it
    // is the one being read.
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) mark(entry.target.id);
        });
      },
      { rootMargin: sideways ? "0px -45% 0px -45%" : "-45% 0px -45% 0px" }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* -------------------------------------------------------------- contents */

  function setUpContents() {
    var dialog = document.getElementById("contents");
    var open = document.querySelector("[data-contents-open]");
    if (!dialog || !open || typeof dialog.showModal !== "function") return;

    open.hidden = false;

    open.addEventListener("click", function () {
      dialog.showModal();
    });

    dialog.addEventListener("click", function (event) {
      // A click that lands on the dialog element itself landed on the
      // backdrop: the panel's own children are what sit on top of it.
      if (event.target === dialog) return dialog.close();
      if (event.target.closest("[data-contents-close]")) return dialog.close();

      var link = event.target.closest(".contents__list a");
      if (!link) return;

      // Smooth, and only here. The page is about 25,000 pixels long, so
      // scroll-behavior on the document would also apply to the language
      // switch landing on a fragment, and spend two seconds travelling
      // through sections nobody asked to see. Choosing a destination from
      // the contents is the one case where the journey is worth showing.
      var target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;

      event.preventDefault();
      dialog.close();
      target.scrollIntoView({
        behavior: reduced.matches ? "auto" : "smooth",
        block: sideways ? "nearest" : "start",
        inline: sideways ? "start" : "nearest",
      });
      // The section is not focusable on its own, so give the reader's
      // keyboard somewhere to land at the other end of the journey.
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      history.replaceState(null, "", link.getAttribute("href"));
    });
  }

  setUpReveal();
  setUpPosition();
  setUpContents();
})();
