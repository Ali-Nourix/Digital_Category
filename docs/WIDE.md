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
field of green, take no frame: they are meant to run to the trim. There is
one exception, the twelve millimetre spread, and the reason is below.

### The compositions

| Panel | Sideways |
|---|---|
| Cover | The one panel that keeps the shell, so the mark sits where the printed cover sets it rather than against the window edge. |
| Divider | The green half and the title half, side by side, filling the panel. The title stands where the reading starts, at the top of the start edge of the white, rather than in the middle of it: a panel is met all at once and the eye goes first to that corner. Logical properties, so Persian puts it top right and English top left with no second rule. |
| Feature | Photograph the full height of the panel, type centred in the other half on a `34rem` measure. Both edges of that half are margins sideways, so the type is centred in it rather than held against the photograph. |
| Advantages | Three columns of type across the top and the eight photographs beneath them as a band that takes whatever height the type leaves. The type is poured across the three and balanced rather than given a column each: the three blocks are very different lengths, and a grid makes all three as deep as the longest. Upright the print runs the photographs down the gutter between two columns; a band along the foot is the same idea turned on its side. |
| Twelve millimetre slabs | The longest piece of writing in the catalogue, in three parts, one to a column, with a hairline down each gutter. See below. |
| The biographies | The upright composition, unchanged: the tag, its lede under it, and the two lives side by side with a small portrait against the outer edge of each. The panel keeps the page's own shell, so the measure and the portraits come out the size they are upright, and the block sits in the middle of the panel's height. Below `56rem` of window height the shell goes, because a page can be any height and a panel cannot; the arrangement stays, only the line gets longer. |
| Granite and quartzite | One tall photograph with two squarer ones stacked beside it, the rows declared so the block fills the height exactly. Both sections are led by the photographs, where the print alternates them: a panel is not turned to but travelled to, and the two arrive one after the other along the same line, so alternating them only makes the stone jump the width of the panel from one section to the next. |
| Footer | The last panel of the track, keeping the angled edge and still overlapping the photograph before it by exactly that cut. |

### The twelve millimetre spread

The longest piece of writing in the catalogue, and the one panel that is
built to a different rule from the rest.

It is written in three parts, and each part is a column: the product and its
four named advantages; the environmental case with the uses and the project
it names; the yield of the thinner stone. A hairline down each gutter, and
the columns run the full depth of the panel whether or not the words reach
the bottom, because it is the rule that says a column is a column.

So the markup is three parts, not two. Upright, the second and the third
stand one above the other and are the right hand column of the printed
spread, so they are wrapped in `.slabs__side`, which is set like a column.
Sideways `.slabs__side` is `display: contents` and dissolves, and the three
parts become the three items of one grid. The upright page is unchanged to
the pixel; it was compared before and after.

A grid and not poured columns. Poured, the browser has to be given a height
to pour into, and it answers a part that will not fit by making one more
column past the inline edge, where the panel's own `overflow: hidden` eats
it: a paragraph goes missing and nothing says so. Told the columns instead of
asked for them, there is nothing to guess and nothing to lose. The three
tracks are weighted `1.35 / 1.1 / 0.68`, because the first part is nine
blocks and the last is three; set equal, the last ends halfway up the panel.

The panel is capped at `max(108rem, 172rem - 80vh, 62vw)` and centred, so a
very wide window does not stretch the lines past the length at which they
stop being read. The cap lifts as the window gets shorter, because there the
panel is wide for a reason.

**Its type is set to the window, not to the page.** Everywhere else a shorter
window is answered with a wider panel. That does not work here: the first
part is nine blocks deep, and nine blocks are nine blocks however long the
line is, so past a certain width it stops getting shorter and no amount of
panel will make it fit. What it is made of is lines, so the lines are what
give: `--step-0`, `--step-1`, `--step-2`, `--step-4`, the gaps between blocks
and the Persian leading are all redeclared on `.sec--slabs` as a function of
`vh`. At a full height window they are the figures the rest of the catalogue
uses. The frame comes in too, for the same reason: measured, `--panel-pad`
is worth about thirty five pixels of depth and the panel has no other thirty
five to give.

Below `47rem` of window height the two long parts will not stand in a column
at any width, so each is set across two measures inside its own column — the
first in Persian, the second in English, and both are given the room. The
spread is still three parts and the rules still fall between them. There is
no rule between the two measures of a part, which would make five columns of
what is meant to read as three.

### Panels on a smaller window

What a panel of type needs is area: a column of a certain width, for a
certain depth. Its width here is the window's, so the shorter the window, the
wider the panel has to be to hold the same words. The last section of the
stylesheet is that curve in steps, keyed on the window's height alone and
written as a floor in rem, so `max(100vw, …)` gives a wide window its own
width and a narrow one the floor. It also takes a little photograph away from
the features, whose measure is capped and which therefore gain nothing from a
wider panel. The twelve millimetre spread has a ladder of its own after that
one, because what it is up against is not the same thing.

Those figures are load bearing rather than tidying. Every step was measured
in both languages at the shortest window it has to cover, so changing the
words means measuring again. Two checks:

- no part of `.slabs` ends below the foot of its panel, and
- `.slabs`, any `.slabs__col`, and `.columns__text` report no `scrollWidth`
  past their `clientWidth`,

at every window height between the floor and the tallest screen the catalogue
is likely to meet, and at a range of widths at each. Settle the reveal and
turn transitions off before measuring: a block on its way in from the
trailing edge reports itself outside its column and reads as lost text.

Both ladders are last in the file on purpose. A media query adds no weight of
its own, so a rule inside one only wins over a rule it would override if it
comes after it — and the steps inside a ladder run from the tallest window
down, because on a short one several of them match at once and the last wins.

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

  A mouse and a trackpad are told apart, because they need different things.
  A trackpad asks for a small distance every frame and the track can simply
  follow it. A mouse asks for one large notch every eighty milliseconds and
  nothing in between, so following it directly makes each notch a shove: the
  speed leaps on the frame the notch lands and decays to almost nothing
  before the next, which is felt as the track moving in lumps. For a mouse
  the speed itself is eased towards what the follow asks for, which fills the
  gaps between notches. Measured over a steady turn of the wheel, that takes
  the variation in speed from frame to frame from 0.62 of the mean down to
  0.21, flatter than a trackpad's own 0.25, and costs the first six frames of
  response nothing.
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
