/* ==========================================================================
   Behkooshan products: finding a stone

   The grid is written out in full; this only hides what does not match.

     search    by any name the stone has gone by, in either script, however
               it is typed: Arabic or Persian letter forms, with or without
               the half space, with or without the gaps between words
     filters   type, origin and colour; choices within a row are either/or,
               the rows together narrow each other
     address   the query and the choices live in the address, so a filtered
               view can be sent to someone and lands the same way
     way back  once the filters have scrolled away, a button takes the reader
               back to them

   Nothing here runs on the page of one stone except the photograph warm-up.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ----------------------------------------------------------- warm-up */

  /* A photograph should be there when the reader reaches it, not start
     loading as they do. The browsers leave a lazy photograph until it is a
     screen or less away; this asks for each one two screens ahead. */
  (function warm() {
    var lazy = Array.prototype.slice.call(document.querySelectorAll('img[loading="lazy"]'));
    if (!lazy.length || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.loading = "eager";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "200% 0px 200% 0px" }
    );
    lazy.forEach(function (img) {
      observer.observe(img);
    });
  })();

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

  /* ------------------------------------------------------------ numbers */

  function num(n) {
    return lang === "fa" ? Number(n).toLocaleString("fa-IR", { useGrouping: false }) : String(n);
  }

  function count(n) {
    return (n === 1 ? words.one : words.stones).replace("%", num(n));
  }

  /* ------------------------------------------------------------- search */

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
      .replace(/[ة]/g, "ه")
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

  /* ------------------------------------------------------------- choices */

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

  /* -------------------------------------------------------------- apply */

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
      if (visible && !stone.closest(".related")) shown += 1;
    });

    groups.forEach(function (group) {
      var inGroup = group.querySelectorAll(".stone:not([hidden])").length;
      group.hidden = inGroup === 0;
      var label = group.querySelector("[data-count]");
      if (label) label.textContent = num(inGroup);
    });

    var active = !!query || state.type.length + state.origin.length + state.colour.length > 0;
    total.textContent = count(shown);
    empty.hidden = shown !== 0;
    clears.forEach(function (button) {
      if (button.closest("[data-empty]")) return;
      button.hidden = !active;
    });
    if (back) back.querySelector("[data-back-count]").textContent = count(shown);

    var made = state.type.length + state.origin.length + state.colour.length;
    if (activeCount) {
      activeCount.hidden = made === 0;
      activeCount.textContent = made ? " (" + num(made) + ")" : "";
    }

    remember(query ? input.value.trim() : "", state);
  }

  /* The grid changes at once. A view transition would slide every stone
     to its new cell, but it photographs all ninety of them first, and the
     half second that took was felt on every choice. */
  function update() {
    render();
  }

  /* ------------------------------------------------------------ address */

  function remember(query, state) {
    var params = new URLSearchParams();
    if (query) params.set("q", query);
    ROWS.forEach(function (row) {
      if (state[row].length) params.set(row, state[row].join(","));
    });
    var search = params.toString();
    var url = location.pathname + (search ? "?" + search : "") + location.hash;
    history.replaceState(null, "", url);
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

  /* ----------------------------------------------------------- the way back */

  var back = null;

  function setUpWayBack() {
    if (!("IntersectionObserver" in window)) return;

    back = document.createElement("button");
    back.type = "button";
    back.className = "back-to-filters";
    back.innerHTML =
      '<span>' + (lang === "fa" ? "فیلترها" : "Filters") + '</span>' +
      '<span class="back-to-filters__count" data-back-count></span>';
    back.setAttribute("aria-label", lang === "fa" ? "بازگشت به جست‌وجو و فیلترها" : "Back to the search and filters");
    document.body.appendChild(back);

    back.addEventListener("click", function () {
      form.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "start" });
      input.focus({ preventScroll: true });
    });

    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var behind = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          back.classList.toggle("is-shown", behind);
          back.tabIndex = behind ? 0 : -1;
        });
      },
      // Under the bar counts as behind it. The margin has to be in pixels.
      { rootMargin: "-" + ((document.querySelector(".bar") || {}).offsetHeight || 0) + "px 0px 0px 0px" }
    ).observe(form);
  }

  /* ------------------------------------------------------------- wiring */

  var typing = null;
  input.addEventListener("input", function () {
    if (typing !== null) clearTimeout(typing);
    // Quick enough to feel instant, slow enough not to rebuild the grid on
    // every key of a name being typed.
    typing = setTimeout(update, 90);
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && input.value) {
      input.value = "";
      update();
    }
  });

  picks.forEach(function (pick) {
    pick.addEventListener("click", function () {
      pick.setAttribute("aria-pressed", pick.getAttribute("aria-pressed") === "true" ? "false" : "true");
      update();
    });
  });

  clears.forEach(function (button) {
    button.addEventListener("click", function () {
      input.value = "";
      picks.forEach(function (pick) {
        pick.setAttribute("aria-pressed", "false");
      });
      update();
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
