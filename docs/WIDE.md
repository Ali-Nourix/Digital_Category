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
offered only above `60rem` wide and `38rem` tall, because below that the
sideways stylesheet switches itself off and a switch would swap a document
for a copy of itself.

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
all come from the browser. Nothing snaps: several readings of a panel are
legitimate, and snapping spends its time pulling a reader who is part way
between two of them back to an edge they did not ask for.

### One window, one spread

Every panel is exactly one window wide, and every composition inside it is
built to fit that. A panel wider than the window is never seen whole, so it
stops being a composition and becomes a stretch of scroll; the only exception
is the plate, at `88vw`, because a photograph is legible from any part of
itself and the sliver of the next panel it leaves in view is what tells a
reader the document goes sideways at all.

A panel's height is the window's, so its row is declared `minmax(0, 1fr)`
rather than left to size itself, and so is the row of every grid inside it
that holds something asking for a percentage of its height. A percentage of a
track the browser is still sizing resolves against nothing, and a figure
asking for one grows past the panel instead.

Every panel that carries type is framed the same way, `--panel-pad` at the
top and the bottom, so a reader travelling along the track finds each panel
beginning and ending on the same two lines. The gutters are one value too,
`--panel-gap`. The panels that are a photograph edge to edge, or a title on a
field of green, take no frame: they are meant to run to the trim.

### The compositions

| Panel | Sideways |
|---|---|
| Cover | The one panel that keeps the shell, so the mark sits where the printed cover sets it rather than against the window edge. |
| Divider | The green half and the title half, side by side, filling the panel. |
| Feature | Photograph the full height of the panel, type centred in the other half on a `34rem` measure. Both edges of that half are margins sideways, so the type is centred in it rather than held against the photograph. |
| Advantages | Three columns of type across the top and the eight photographs beneath them as a band that takes whatever height the type leaves. The type is poured across the three and balanced rather than given a column each: the three blocks are very different lengths, and a grid makes all three as deep as the longest. Upright the print runs the photographs down the gutter between two columns; a band along the foot is the same idea turned on its side. |
| Twelve millimetre slabs | The longest piece of writing in the catalogue, set the way a newspaper sets a story that has to fit a fixed depth: balanced columns from the top frame line down, three of them on a window of ordinary width. Multiple columns rather than a grid, because a grid gives every block a row and a short block beside a long one leaves a hole under it. The columns are set by width rather than by count, so a wider panel takes another column at the same measure instead of stretching the three it had. |
| The biographies | The tag and its lede hold the leading column; the two lives stack beside it, a half panel each, portrait to the outer edge. The portraits come out about twice the size they are upright. |
| Granite and quartzite | The arrangement the print uses: one tall photograph with two squarer ones stacked beside it, the rows declared so the block fills the height exactly. |
| Footer | The last panel of the track, keeping the angled edge and still overlapping the photograph before it by exactly that cut. |

### Panels on a smaller window

What a panel of type needs is area: a column of a certain width, for a
certain depth. Its width here is the window's, so the shorter the window, the
wider the panel has to be to hold the same words. The last section of the
stylesheet is that curve in five steps, keyed on the window's height alone
and written as a floor in rem, so `max(100vw, …)` gives a wide window its own
width and a narrow one the floor. It also takes a little photograph away from
the features, whose measure is capped and which therefore gain nothing from a
wider panel.

Those figures are load bearing rather than tidying. A spread of type set in
balanced columns of a fixed height puts whatever will not fit into one more
column, off the inline edge, where the panel's own `overflow: hidden` eats
it: a paragraph disappears and nothing on the page says so. Every step was
measured in both languages at the shortest window it has to cover, so
changing the words means measuring again. The check is that `.slabs` and
`.columns__text` report no `scrollWidth` past their `clientWidth`, at every
window height between the floor and the tallest screen the catalogue is
likely to meet.

That ladder is last in the file on purpose. A media query adds no weight of
its own, so a rule inside one only wins over a rule it would override if it
comes after it.

### Motion

The same four moves. Two of them have an axis: a block arrives from the
trailing edge rather than from below, and a full bleed photograph drifts
along `view(inline)` rather than down the block axis. The reading line in the
bar follows the track through a named scroll timeline, because the document
itself no longer scrolls.

### The two things a mouse cannot do

- **The wheel** reports `deltaY` and nothing else, so the vertical gesture is
  translated into travel along the track. Notches accumulate into one target
  and the track follows it frame by frame, rather than being handed to
  `scrollTo` with a smooth behaviour: that runs the browser's easing from
  scratch on every notch and lands a third of a second behind the wheel.
  The follow stands down the moment anything else moves the track, which it
  notices by finding a number it did not leave there; without that, a jump
  from the contents and the glide take a frame each and neither arrives.
- **Page Up and Page Down** turn a panel. Home and End go to the ends.

Below `60rem` wide or `38rem` tall the whole stylesheet switches off and the
page is the upright one. A sideways catalogue needs a landscape window with
room in it: every panel is a whole spread cut to the height of the window,
and under about six hundred pixels of that there is no height left to cut one
to.

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
