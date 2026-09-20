/**
 * Catalogue search and filtering.
 *
 * Everything this needs is already in the markup. Each tile carries its own
 * name and facet values as data attributes, so there is no product list in
 * here to fall out of step with the page, and adding a facet to
 * data/products.json needs no change to this file.
 *
 * With scripting off the form never appears and the grid is the full list, so
 * nothing is hidden behind a control that is not working.
 */
(function () {
  var form = document.getElementById("catalogue-filter");
  var grid = document.getElementById("catalogue-grid");
  var empty = document.getElementById("catalogue-empty");
  var tally = document.getElementById("catalogue-count");
  if (!form || !grid || !empty || !tally) return;

  var cards = Array.prototype.slice.call(grid.children);
  var search = form.querySelector('input[type="search"]');
  var clear = form.querySelector(".filter__clear");

  // "% products" with the count still in it, and the singular spelled out
  // separately, both handed over by the generator in the page's own language
  // and digits.
  var plural = tally.textContent.trim();
  var digits = plural.match(/[۰-۹]/) ? "۰۱۲۳۴۵۶۷۸۹" : "0123456789";
  var singular = tally.getAttribute("data-one") || plural;

  function localise(n) {
    return String(n).replace(/[0-9]/g, function (d) {
      return digits[d];
    });
  }

  function say(n) {
    // At zero the empty panel below already says it in words, so the tally
    // stands down rather than printing "0 products" above it.
    tally.hidden = n === 0;
    if (n === 0) return;
    tally.textContent =
      n === 1 ? singular : plural.replace(/[0-9۰-۹]+/, localise(n));
  }

  /** The facet radios, as {name: selected value}, skipping the "All" ones. */
  function selected() {
    var chosen = {};
    var radios = form.querySelectorAll('input[type="radio"]:checked');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].value) chosen[radios[i].name] = radios[i].value;
    }
    return chosen;
  }

  function matches(card, query, chosen) {
    if (query && card.getAttribute("data-name").indexOf(query) === -1) return false;

    for (var key in chosen) {
      // A product that does not declare a facet at all is not a match for it.
      // Listing it anyway would credit the stone with a property nobody
      // claimed, which is worse than leaving it out of that filter.
      var values = card.getAttribute("data-" + key);
      if (!values) return false;
      if (values.split(" ").indexOf(chosen[key]) === -1) return false;
    }
    return true;
  }

  function apply() {
    var query = search.value.trim().toLowerCase();
    var chosen = selected();
    var shown = 0;

    cards.forEach(function (card) {
      var hit = matches(card, query, chosen);
      card.hidden = !hit;
      if (hit) shown++;
    });

    empty.hidden = shown !== 0;
    grid.hidden = shown === 0;
    say(shown);

    // The reset only appears once there is something to reset.
    var touched = query !== "" || Object.keys(chosen).length > 0;
    if (clear) clear.hidden = !touched;
  }

  form.addEventListener("input", apply);

  // A reset repaints from the browser's restored state, which is only settled
  // after this event finishes.
  form.addEventListener("reset", function () {
    window.setTimeout(apply, 0);
  });

  // Submitting would reload the page and throw the filtering away.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  apply();
})();
