# The sideways version

A second reading of the same catalogue. The upright one runs down the page;
this one runs along it, right to left in Persian and left to right in
English, so the document travels the way its language is read.

It is the same markup, the same words and the same photographs. The
difference is one stylesheet, one script and the directory it is written to.

    /                upright, Persian
    /en/             upright, English
    /wide/           sideways, Persian, right to left
    /wide/en/        sideways, English, left to right

The chip in the bar switches between the upright and the sideways reading of
whatever section is on screen, next to the one that switches language. It is
offered only above `60rem` wide and `30rem` tall, because below that the two
builds render identically and a switch would swap a document for a copy of
itself.

## What it is made of

| File | What it does |
|---|---|
| `assets/css/catalogue-wide.css` | Every layout override. One media query wraps the file. |
| `assets/js/catalogue-wide.js` | Turns a mouse wheel into travel along the track, and makes Page Up and Page Down turn a panel. |
| `wide/index.html`, `wide/en/index.html` | Generated output. |
| `BUILDS` in `tools/build-catalogue.mjs` | Two rows, `mode: "wide"`. |

Three small things live in shared files and are marked where they are:

- `data-axis="inline"` on `<html>`, set by the generator. `assets/js/catalogue.js`
  reads it in one place (`var sideways = ...`) and uses it to choose the axis
  for its two observers and for the contents jump.
- `.chip[data-view-swap]` in `assets/css/catalogue.css`, which hides the
  switch below the breakpoint.
- The footer is written inside `<main>` in the sideways build, because there
  it is the last panel of the track rather than a band under the document.
  It carries `role="contentinfo"` there so it stays a landmark.

## How it works

The track is a native scroll container: `.doc` becomes a flex row that is one
window tall and as wide as its panels. A flex row follows `dir`, so the
Persian build scrolls right to left with no arithmetic anywhere, and the
scrollbar, the keyboard, the touch swipe and a trackpad's horizontal gesture
all come from the browser.

Each section is a panel with a width of its own. Most take one window. The
two spreads the print sets dense take more, because given one window each
their type would have to be set too small to read:

| Panel | Width |
|---|---|
| Most sections | `100vw` |
| Advantages | `178vw` |
| Twelve millimetre slabs | `152vw` |
| The biographies | `124vw` |
| A full bleed plate | `88vw`, so the edge of the next panel stays in view |

A panel's height is the window's, so its row is declared `minmax(0, 1fr)`
rather than left to size itself. A percentage of a track the browser is still
sizing resolves against nothing, and a figure asking for one grows past the
panel instead.

Two things a mouse cannot do for itself:

- **The wheel** reports `deltaY` and nothing else. It is translated into
  travel along the track. Notches accumulate into one target and the track is
  moved with `scrollTo({behavior: "smooth"})` rather than by assigning
  `scrollLeft`: an assignment counts as a finished scroll, and the track's
  proximity snapping pulls anything short of the next panel straight back to
  the last one.
- **Page Up and Page Down** turn a panel. Home and End go to the ends.

The motion is the same four moves. Two of them have an axis: a block arrives
from the trailing edge rather than from below, and a full bleed photograph
drifts along `view(inline)` rather than down the block axis. The reading line
in the bar follows the track through a named scroll timeline, because the
document itself no longer scrolls.

Below `60rem` wide or `30rem` tall the whole stylesheet switches off and the
page is the upright one. A sideways catalogue needs a landscape window: the
panels are built out of side by side compositions that have nowhere to go in
a portrait phone.

## Removing it

    rm -rf wide assets/css/catalogue-wide.css assets/js/catalogue-wide.js docs/WIDE.md

Then, in `tools/build-catalogue.mjs`, delete the two `mode: "wide"` rows from
`BUILDS` and the `view:` column from the other two, and the `[data-view-swap]`
chip from the bar. In `assets/css/catalogue.css` delete the block marked
`--- The view switch ---`. In `assets/js/catalogue.js` delete `var sideways`
and take the first branch of each of the four expressions that read it. In
`data/catalogue.json` delete the four `View` strings from each language.

Run `node tools/build-catalogue.mjs` and the two upright documents are back
exactly as they were.

## Merging it instead

If the sideways reading is the one that is kept, the move is the reverse:
fold `catalogue-wide.css` into `catalogue.css`, fold `catalogue-wide.js` into
`catalogue.js`, drop the two `mode: "flow"` rows so the build writes to `/`
and `/en/`, and take `data-axis="inline"` as the only value. Nothing in the
sideways version depends on the upright one still existing.
