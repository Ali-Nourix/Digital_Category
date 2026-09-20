/**
 * Reveals blocks as they scroll into view.
 *
 * The hidden starting state is applied by CSS only under `html.js`, and that
 * class is set by a one line inline script in the head. So if this file
 * fails to load, or scripting is off, nothing is ever hidden and the page
 * reads normally.
 *
 * An earlier version used CSS scroll driven animations instead. They are
 * elegant but two things ruled them out: Firefox does not support them, and
 * a block sitting close to the end of the document can run out of scroll
 * before its range completes, leaving it stuck at zero opacity for good.
 */
(function () {
  var items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  var show = function (el) {
    el.classList.add("is-visible");
  };

  if (!("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(items, show);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    },
    // Start the reveal a little before the block is fully on screen, so it
    // has finished by the time the reader reaches it.
    { rootMargin: "0px 0px -8% 0px", threshold: 0 }
  );

  Array.prototype.forEach.call(items, function (el) {
    observer.observe(el);
  });
})();
