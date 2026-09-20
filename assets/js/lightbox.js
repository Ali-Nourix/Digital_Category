/**
 * Opens a photograph full screen, with its description, and lets you zoom.
 *
 * Every image marked [data-zoom] on the page joins the set, in document order,
 * so the arrows walk the gallery in the order it is read. The caption is the
 * image's own alt text: a description honest enough to hand a screen reader is
 * honest enough to print, and keeping one copy means the two can never drift.
 *
 * Built on <dialog>.showModal(), which brings the focus trap, the inert
 * background and Escape to close with it. Those are the parts a hand rolled
 * overlay usually gets wrong.
 *
 * If this file never loads, every photograph is still a plain <img> in the
 * page. Nothing is hidden behind the lightbox.
 */
(function () {
  var dialog = document.getElementById("lightbox");
  var images = Array.prototype.slice.call(document.querySelectorAll("[data-zoom]"));
  if (!dialog || !images.length || typeof dialog.showModal !== "function") return;

  var stage = document.getElementById("lightbox-stage");
  var view = document.getElementById("lightbox-img");
  var caption = document.getElementById("lightbox-caption");
  var counter = document.getElementById("lightbox-counter");
  var zoomButton = dialog.querySelector('[data-lightbox="zoom"]');
  var zoomLabel = document.getElementById("lightbox-zoom-label");
  var template = counter.getAttribute("data-template");

  var index = 0;
  var zoomed = false;
  var opener = null;

  function setZoom(on) {
    zoomed = on;
    stage.classList.toggle("is-zoomed", on);
    zoomButton.setAttribute("aria-pressed", String(on));
    zoomButton.querySelector(".lightbox__glyph").textContent = on ? "−" : "+";
    zoomLabel.textContent = zoomButton.getAttribute(on ? "data-out" : "data-in");

    // Coming out of zoom, put the view back at the middle rather than
    // wherever the last pan happened to leave it.
    if (!on) {
      stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
      stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
    }
  }

  function show(i) {
    index = (i + images.length) % images.length;
    var source = images[index];

    view.src = source.currentSrc || source.src;
    view.alt = source.alt;
    caption.textContent = source.alt;

    // "3 of 9", with both numbers in the page's own digits. The template is
    // "% of %" and carries no digit to read the script off, so the page's
    // language is what decides.
    var digits =
      document.documentElement.lang === "fa" ? "۰۱۲۳۴۵۶۷۸۹" : "0123456789";
    var n = 0;
    counter.textContent = template.replace(/%/g, function () {
      var value = n++ === 0 ? index + 1 : images.length;
      return String(value).replace(/[0-9]/g, function (d) {
        return digits[d];
      });
    });

    setZoom(false);
  }

  function open(i, from) {
    opener = from;
    show(i);
    dialog.showModal();
  }

  images.forEach(function (image, i) {
    // A zoomable photograph is something you operate, so it says so to the
    // pointer and answers the keyboard as a button would.
    image.tabIndex = 0;
    image.setAttribute("role", "button");

    image.addEventListener("click", function () {
      open(i, image);
    });

    image.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      open(i, image);
    });
  });

  dialog.addEventListener("click", function (event) {
    var action = event.target.closest("[data-lightbox]");

    if (action) {
      var which = action.getAttribute("data-lightbox");
      if (which === "close") dialog.close();
      if (which === "next") show(index + 1);
      if (which === "prev") show(index - 1);
      if (which === "zoom") setZoom(!zoomed);
      return;
    }

    // Clicking the photograph itself toggles zoom; clicking past it closes.
    if (event.target === view) {
      setZoom(!zoomed);
    } else if (event.target === dialog || event.target === stage) {
      dialog.close();
    }
  });

  dialog.addEventListener("keydown", function (event) {
    // Escape is the dialog's own, and while zoomed the arrows are panning the
    // photograph rather than walking the set.
    if (zoomed || event.key.indexOf("Arrow") !== 0) return;

    var forward = document.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    var back = document.dir === "rtl" ? "ArrowRight" : "ArrowLeft";

    if (event.key === forward) {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === back) {
      event.preventDefault();
      show(index - 1);
    }
  });

  // Whatever was clicked to get here is where the reader was, so that is
  // where the focus goes back to.
  dialog.addEventListener("close", function () {
    setZoom(false);
    if (opener) opener.focus();
  });

  document.documentElement.classList.add("has-lightbox");
})();
