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
offered at `20rem` wide and `34rem` tall and up, which is the gate the
sideways stylesheet lays its track out inside; below that the stylesheet
switches itself off, the two builds render identically, and a switch would
swap a document for a copy of itself.

It is read two ways inside that gate, and which one depends on the shape of
the window rather than on the device:

- **the spread**, above `60rem` wide and `38rem` tall, where a panel is a
  printed spread and things stand side by side;
- **the deck**, below either of those, where a panel is a card and a phone
  held upright swipes through them.

The gate keeps out one shape in particular, a phone turned on its side: there
are barely three hundred pixels of height there to cut a panel to, and the
upright document is the better reading.

## What it is made of

| File | What it does |
|---|---|
| `assets/css/catalogue-wide.css` | Every layout override, in three blocks: the track, the spread, the deck. |
| `assets/js/catalogue-wide.js` | Turns a mouse wheel into travel along the track, makes Page Up and Page Down turn a panel, and measures how many cards each section of the deck needs. |
| `wide/index.html`, `wide/en/index.html` | Generated output. |
| `BUILDS` in `tools/build-catalogue.mjs` | Two rows, `mode: "wide"`. |

Three small things live in shared files and are marked where they are:

- `data-axis="inline"` on `<html>`, set by the generator. `assets/js/catalogue.js`
  reads it in one place (`var sideways = ...`) and uses it to choose the axis
  for its two observers and for the contents jump.
- `.chip[data-view-swap]` in `assets/css/catalogue.css`, which hides the
  switch below the gate, and the block under it that puts the bar's mark down
  to the monogram on a narrow window: three controls and a lockup are more
  than a phone's bar holds.
- The footer is written inside `<main>` in the sideways build, because there
  it is the last panel of the track rather than a band under the document.
  It carries `role="contentinfo"` there so it stays a landmark.

## How it works

The track is a native scroll container: `.doc` becomes a flex row that is one
window tall and as wide as its panels. A flex row follows `dir`, so the
Persian build scrolls right to left with no arithmetic anywhere, and the
scrollbar, the keyboard, the touch swipe and a trackpad's horizontal gesture
all come from the browser. Nothing snaps where the gesture is a wheel or a
bar: several readings of a panel are legitimate there, and snapping spends
its time pulling a reader who is part way between two of them back to an edge
they did not ask for. Where the gesture is a swipe — `pointer: coarse` — it
snaps by proximity, because a card wants to come to rest on a card.

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
it names; the yield of the thinner stone. A hairline down each gutter.

The block is as deep as its longest column and sits in the middle of the
panel, the same air over it as under it, rather than hanging from the top
frame line with everything left over falling in one piece under the shortest
column. The two shorter columns are stretched to the longest, which is what
carries the rules the whole way down: a rule that stopped with the last line
of its own column would say the spread ended there. The centring is `safe`,
so if the words ever came to more than the panel holds the block goes back to
the top line and only the foot is at risk, which is where the check below
would find it.

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
along `view(inline)` rather than down the block axis. The drifting photograph
is 114% of its frame and needs `max-inline-size: none` to be so: the reset
caps every image at the width of its box, and capped it is no wider than the
frame, so every pixel it drifts uncovers a pixel of the dark ground behind
it. The reading line in the
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

Below `20rem` wide or `34rem` tall the whole stylesheet switches off and the
page is the upright one.

## The deck

A phone held upright. The window is taller than it is wide, so nothing goes
side by side and a panel stops being a spread: it is a card, one screen of
it, and the reader swipes through a deck of forty or so, which is about what
the printed catalogue has pages.

Two things follow, and the third block of the stylesheet is one or the other.

**What was beside something is now over it.** A photograph and the words
about it, the green field and the section title, the stone and its caption:
each pair keeps its order, which is the order it is read in, and turns a
quarter turn. Where the pair had a share of the width it takes the same share
of the height, so the divider's printed 5:7 becomes green across the top and
the title under it, and the section opener still stands where the reading
starts, which on a card is the top of it.

Two compositions are drawn rather than turned, because turning them would not
have worked:

| Panel | Deck |
|---|---|
| Feature | The photograph across the top of the card, bleeding to the trim on three sides, and the writing running on under it. The photograph is a band and not a card of its own: given a whole card it would leave the shortest of the five a card of writing with two paragraphs on it, and the longest would still want two more. |
| The biographies | The portrait beside the name rather than over it, a byline. Down a page the portrait stands above the life it belongs to and there is a page to spare; on a card the two together are a hundred and fifty pixels of depth that the life itself needs. The first life follows the generation's opener on to its card when the whole of it fits there, and takes the next card when it does not. |

**And a card holds what a card holds.** The long sections are given more than
one card rather than a card with the foot cut off it, and where the writing
is already in parts (the three of the twelve millimetre spread, the two
lives, the three blocks of the advantages), the parts are where it divides. A
part opens a card and runs on to the next if it needs one. A paragraph may
run from the foot of one card to the head of the next, as it runs from page
to page in print, never with fewer than three lines at either end; a heading
never ends a card, and a list item, a named advantage or the quote is never
broken.

The mechanism is the same everywhere: the block is set in columns exactly one
card wide, poured rather than balanced (`column-fill: auto`), with the frame
moved off the shell and on to the blocks inside it, so that every column
carries the frame and not only the first and the last. A section is
`--cards` cards wide.

### Type on a card

The page's type scale is set for a spread, where a heading has half a window
to stand in, and on a phone it comes out loud: a section title two lines of
34px before a word of the section is read, a lede the size a heading should
be. The deck redeclares the steps above the body on `.doc`:

| | Spread | Deck |
|---|---|---|
| Body | 16-17px | 16px, unchanged |
| Lede, names, named advantages, tag | ~19px | 17px (tag 16px) |
| Headings, the quote | ~23px | 19px |
| Section titles | 34-43px | 24-28px |
| Section openers | 40px and up | 30-36px |

The hierarchy is carried by weight and green rather than by size alone. A
title and the heading under it are set as one unit, twelve pixels apart
rather than the page's thirty two. The Persian running text is set on 1.8
rather than 1.85, because short lines want less air between them to read as
a paragraph.

Running text is ranged from the start on a card, not justified. The print
justifies a column thirty words wide; a phone's line is eight or nine, and
spread across that the space between words opens into holes.

### Resting on a card

Swiped (`pointer: coarse`), a card comes to rest on a card, and one swipe is
one card: `scroll-snap-type: x mandatory` with `scroll-snap-stop: always` on
every stop. Every panel is a stop. So is every card inside a panel that runs
on, but those cards are columns of poured type and a column is not an
element, so `markStops` in the script places a one pixel `.deck-stop` where
each of them begins, from the width the panel came out at. Only once they are
there does the snap become mandatory; before that, and without the script, it
is by proximity, which never takes a reader away from a card there is no stop
for.

Two things had to change for this to work at all:

- **Panels are clipped, not hidden.** `overflow: hidden` makes every panel a
  scroll container of its own, and a snap point belongs to its nearest scroll
  container, so every stop drawn inside a panel was snapping the panel, which
  never scrolls, instead of the track. `overflow: clip` cuts off the same
  pixels without making a scroll container.
- **The plates are a whole card.** On a spread a photograph panel is most of
  a window, so the edge of the next panel shows and tells a reader the
  document goes sideways. In a deck that strip means no card after it ever
  comes to rest square to the screen.

The reveal had to learn one thing as well. A paragraph poured across two
cards is one element in two pieces, and an IntersectionObserver watches only
the first: when that piece left the screen it reported the paragraph gone and
the reveal took the whole of it out, including the half still being read.
`catalogue.js` now asks whether any piece of a block is on screen before
taking it out.

### How many cards

This is the one question CSS cannot answer. It is the height of a piece of
text at a width, divided by the height of a card, and there is no way to ask
for the first of those as a length. So `fitCards` in
`assets/js/catalogue-wide.js` measures it: it sets a section to one card and
grows the count while the poured box reports a scroll width past its own,
which is what a column with nowhere to go does.

The figures in the stylesheet are what stands without the script. They are
the number the smallest phone the deck is offered on needs, measured in both
languages, so nothing is ever lost without it; a big phone is simply given a
card or two of white that the script then takes back.

On a feature the script does one thing more. A section whose writing fits one
card gets its photograph sized to exactly what the words leave, so the card is
filled and the picture is as large as it can be. Without that, a section three
lines over a card spends a second card on those three lines and the reader
swipes to a card that is empty.

### What to check when the words change

Two things, at every phone size and in both languages, with the transitions
turned off first — a block on its way in from the trailing edge reports
itself outside its card and reads as lost text:

- nothing ends below the foot of the card it is on;
- no poured box reports a `scrollWidth` past its `clientWidth`, which is a
  column laid out past the inline edge where the section's own overflow eats
  it.

And the same with scripting off, which is what checks the figures in the
stylesheet rather than the ones the script works out.

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
