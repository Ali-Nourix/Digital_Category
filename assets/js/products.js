/* ==========================================================================
   Behkooshan products: the page's behaviour

   The grid is written out in full; this only hides what does not match, and
   lays the photographs onto the page as the catalogue does.

     warm      ask for each photograph a few screens before the reader
               reaches it
     reveal    titles set themselves word by word and photographs are
               uncovered from the leading edge as they reach the screen
     band      the surfaces at the head of the listing, one after another
     search    by any name the stone has gone by, in either script, however
               it is typed: Arabic or Persian letter forms, with or without
               the half space, with or without the gaps between words
     filters   type, origin and colour; choices within a row are either/or,
               the rows together narrow each other
     address   the query and the choices live in the address, so a filtered
               view can be sent to someone and lands the same way
     way back  once the filters have gone by, a button takes the reader back
               to them, and gets out of the way of the footer

   The same file serves both readings. Sideways (data-axis="inline") the
   page does not scroll; its track does, along the inline axis, and every
   "ahead" here is measured along that.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var track = document.querySelector(".track");

  /** Whether the page is being read along its track, not down the window. */
  function sideways() {
    return !!track && track.scrollWidth > track.clientWidth + 1 && getComputedStyle(track).overflowX !== "visible";
  }

  /* ----------------------------------------------------------- warm-up */

  (function warm() {
    var lazy = Array.prototype.slice.call(document.querySelectorAll('img[loading="lazy"]'));
    if (!lazy.length || !("IntersectionObserver" in window)) return;
    function watch(options) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.loading = "eager";
          observer.unobserve(entry.target);
        });
      }, options);
      lazy.forEach(function (img) {
        observer.observe(img);
      });
    }
    watch({ rootMargin: "200% 0px 200% 0px" });
    if (track) watch({ root: track, rootMargin: "0px 150% 0px 150%" });
  })();

  /* ------------------------------------------------------------ reveal */

  (function reveal() {
    if (!("IntersectionObserver" in window) || reduced.matches) return;
    var targets = Array.prototype.slice.call(document.querySelectorAll(".headline, .stone__frame, .plate"));
    if (!targets.length) return;

    // Only what the reader cannot see yet is hidden, so nothing on the
    // first screen flashes out and back.
    var along = sideways();
    targets.forEach(function (el) {
      var box = el.getBoundingClientRect();
      var ahead = along ? Math.max(box.left, window.innerWidth - box.right) : box.top;
      var fold = (along ? window.innerWidth : window.innerHeight) * 0.94;
      if (ahead > fold) el.classList.add("is-out");
    });

    // Once laid down a photograph stays: a grid being browsed back and forth
    // is not a document being read in both directions.
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("is-out");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: along ? "0px -6% 0px -6%" : "0px 0px -6% 0px" }
    );
    targets.forEach(function (el) {
      if (el.classList.contains("is-out")) observer.observe(el);
    });
  })();

  /* -------------------------------------------------------------- band */

  /* The band's surfaces, each laid over the last from the leading edge every
     few seconds. The next is fetched and decoded before its turn, so the
     wipe never uncovers a picture still arriving; the band waits while it is
     off the screen or the tab is hidden, and holds its first surface for a
     reader who has asked for less motion. */
  (function band() {
    var hero = document.querySelector("[data-hero]");
    if (!hero || reduced.matches) return;
    var frame = hero.querySelector(".hero__frame");
    var slides = [];
    try {
      slides = JSON.parse(hero.getAttribute("data-slides") || "[]");
    } catch (e) {
      return;
    }
    if (!slides.length) return;

    var HOLD = 4200;
    var sizes = hero.getAttribute("data-sizes");
    var first = frame.querySelector(".hero__img");
    slides.unshift({ srcset: first.getAttribute("srcset"), src: first.getAttribute("src") });
    var index = 0;
    var timer = null;
    var visible = true;

    function next() {
      timer = null;
      if (!visible || document.hidden) return;
      index = (index + 1) % slides.length;
      var slide = slides[index];
      var img = document.createElement("img");
      img.className = "hero__img is-entering";
      img.alt = "";
      img.decoding = "async";
      img.sizes = sizes;
      img.srcset = slide.srcset;
      img.src = slide.src;
      var ready = img.decode ? img.decode() : Promise.resolve();
      ready.catch(function () {}).then(function () {
        frame.appendChild(img);
        // Two frames: one to lay it down closed, one to open it.
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            img.classList.add("is-in");
          });
        });
        setTimeout(function () {
          Array.prototype.slice.call(frame.querySelectorAll(".hero__img")).forEach(function (old) {
            if (old !== img) old.remove();
          });
          img.classList.remove("is-entering", "is-in");
          schedule();
        }, 1500);
      });
    }

    function schedule() {
      if (timer === null && visible && !document.hidden) timer = setTimeout(next, HOLD);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) schedule();
      }).observe(hero);
    }
    document.addEventListener("visibilitychange", schedule);
    schedule();
  })();

  /* ----------------------------------------------------- finding a stone */

  var form = document.querySelector("[data-filters]");
  if (!form) return;

  var lang = form.getAttribute("data-lang") || root.lang;
  var words = JSON.parse(document.querySelector("template[data-words]").innerHTML);
  var input = form.querySelector("#q");
  var picks = Array.prototype.slice.call(form.querySelectorAll(".pick"));
  var clears = Array.prototype.slice.call(document.querySelectorAll("[data-clear]"));
  var total = form.querySelector("[data-total]");
  var groups = Array.prototype.slice.call(document.querySelectorAll("[data-group]"));
  var empty = document.querySelector("[data-empty]");
  var stones = Array.prototype.slice.call(document.querySelectorAll(".stone"));
  var toggle = form.querySelector("[data-facets-toggle]");
  var activeCount = form.querySelector("[data-active]");

  var ROWS = ["type", "origin", "colour"];

  function num(n) {
    return lang === "fa" ? Number(n).toLocaleString("fa-IR", { useGrouping: false }) : String(n);
  }

  function count(n) {
    return (n === 1 ? words.one : words.stones).replace("%", num(n));
  }

  /* One way of writing a name, whatever the keyboard: Arabic yeh and kaf as
     the Persian ones, no half spaces or joining marks, no vowel marks, no
     case, and Persian or Arabic digits as Latin ones. Compared both with its
     spaces and without, so "absolut black" finds "Absolute Black" by its
     first word and "absoluteblack" finds it whole. */
  function fold(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/ة/g, "ه")
      .replace(/[أإآ]/g, "ا")
      .replace(/[ً-ٰٟ‌‍‎‏]/g, "")
      .replace(/[۰-۹]/g, function (d) {
        return String(d.charCodeAt(0) - 0x06f0);
      })
      .replace(/[٠-٩]/g, function (d) {
        return String(d.charCodeAt(0) - 0x0660);
      })
      .replace(/[\-_.،,|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  stones.forEach(function (stone) {
    var names = fold(stone.getAttribute("data-names"));
    stone._names = names;
    stone._tight = names.replace(/ /g, "");
    stone._type = stone.getAttribute("data-type");
    stone._origin = stone.getAttribute("data-origin");
    stone._colours = (stone.getAttribute("data-colours") || "").split(" ").filter(Boolean);
  });

  function matchesName(stone, query) {
    if (!query) return true;
    var parts = query.split(" ");
    for (var i = 0; i < parts.length; i += 1) {
      if (stone._names.indexOf(parts[i]) === -1) {
        return stone._tight.indexOf(query.replace(/ /g, "")) !== -1;
      }
    }
    return true;
  }

  function chosen() {
    var state = { type: [], origin: [], colour: [] };
    picks.forEach(function (pick) {
      if (pick.getAttribute("aria-pressed") !== "true") return;
      ROWS.forEach(function (row) {
        var value = pick.getAttribute("data-" + row);
        if (value) state[row].push(value);
      });
    });
    return state;
  }

  function fits(stone, state) {
    if (state.type.length && state.type.indexOf(stone._type) === -1) return false;
    if (state.origin.length && state.origin.indexOf(stone._origin) === -1) return false;
    if (state.colour.length) {
      var any = stone._colours.some(function (c) {
        return state.colour.indexOf(c) !== -1;
      });
      if (!any) return false;
    }
    return true;
  }

  /* The grid changes at once. A view transition would slide every stone to
     its new cell, but it photographs all ninety of them first, and the half
     second that took was felt on every choice. */
  function render() {
    var query = fold(input.value);
    var state = chosen();
    var shown = 0;

    stones.forEach(function (stone) {
      var visible = matchesName(stone, query) && fits(stone, state);
      // A stone coming back into the grid fades in where it lands, so a
      // change of filter reads as the grid settling rather than as a cut.
      if (visible && stone.hidden && !reduced.matches) {
        stone.classList.remove("is-arriving");
        void stone.offsetWidth;
        stone.classList.add("is-arriving");
      }
      stone.hidden = !visible;
      if (visible) shown += 1;
    });

    groups.forEach(function (group) {
      var inGroup = group.querySelectorAll(".stone:not([hidden])").length;
      group.hidden = inGroup === 0;
      var label = group.querySelector("[data-count]");
      if (label) label.textContent = num(inGroup);
    });

    var made = state.type.length + state.origin.length + state.colour.length;
    var active = !!query || made > 0;
    total.textContent = count(shown);
    empty.hidden = shown !== 0;
    clears.forEach(function (button) {
      if (button.closest("[data-empty]")) return;
      button.hidden = !active;
    });
    if (activeCount) {
      activeCount.hidden = made === 0;
      activeCount.textContent = made ? " (" + num(made) + ")" : "";
    }
    if (back) back.querySelector("[data-back-count]").textContent = count(shown);

    remember(query ? input.value.trim() : "", state);
  }

  function remember(query, state) {
    var params = new URLSearchParams();
    if (query) params.set("q", query);
    ROWS.forEach(function (row) {
      if (state[row].length) params.set(row, state[row].join(","));
    });
    var search = params.toString();
    history.replaceState(null, "", location.pathname + (search ? "?" + search : "") + location.hash);
  }

  function recall() {
    var params = new URLSearchParams(location.search);
    input.value = params.get("q") || "";
    ROWS.forEach(function (row) {
      var values = (params.get(row) || "").split(",").filter(Boolean);
      picks.forEach(function (pick) {
        var value = pick.getAttribute("data-" + row);
        if (value) pick.setAttribute("aria-pressed", values.indexOf(value) !== -1 ? "true" : "false");
      });
    });
  }

  /* ------------------------------------------------------------ way back */

  /* Shown once the filters are behind the reader, and taken away again
     while the footer is on the screen: it is a way back through the stones,
     and over the footer it sat on the contact details. */
  var back = null;

  function setUpWayBack() {
    if (!("IntersectionObserver" in window)) return;

    back = document.createElement("button");
    back.type = "button";
    back.className = "back-to-filters";
    back.innerHTML = "<span>" + words.filters + '</span><span class="back-to-filters__count" data-back-count></span>';
    back.setAttribute("aria-label", words.back);
    back.tabIndex = -1;
    document.body.appendChild(back);

    back.addEventListener("click", function () {
      form.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "start", inline: "start" });
      input.focus({ preventScroll: true });
    });

    var behind = false;
    var footer = false;
    function show() {
      var on = behind && !footer;
      back.classList.toggle("is-shown", on);
      back.tabIndex = on ? 0 : -1;
    }

    var barHeight = (document.querySelector(".bar") || {}).offsetHeight || 0;
    new IntersectionObserver(
      function (entries) {
        var entry = entries[0];
        behind = !entry.isIntersecting && (sideways() || entry.boundingClientRect.top < 0);
        show();
      },
      // Under the bar counts as behind it. The margin has to be in pixels.
      { rootMargin: "-" + barHeight + "px 0px 0px 0px" }
    ).observe(form);

    var foot = document.querySelector(".foot");
    if (foot) {
      new IntersectionObserver(function (entries) {
        footer = entries[0].isIntersecting;
        show();
      }).observe(foot);
    }
  }

  /* -------------------------------------------------------------- wiring */

  var typing = null;
  input.addEventListener("input", function () {
    if (typing !== null) clearTimeout(typing);
    // Quick enough to feel instant, slow enough not to rebuild the grid on
    // every key of a name being typed.
    typing = setTimeout(render, 90);
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && input.value) {
      input.value = "";
      render();
    }
  });

  picks.forEach(function (pick) {
    pick.addEventListener("click", function () {
      pick.setAttribute("aria-pressed", pick.getAttribute("aria-pressed") === "true" ? "false" : "true");
      render();
    });
  });

  clears.forEach(function (button) {
    button.addEventListener("click", function () {
      input.value = "";
      picks.forEach(function (pick) {
        pick.setAttribute("aria-pressed", "false");
      });
      render();
      input.focus();
    });
  });

  // The phone's fold over the three rows of choices.
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      form.classList.toggle("is-open", open);
    });
  }

  setUpWayBack();
  recall();
  render();
})();
