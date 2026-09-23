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

The Persian document moves the other way round: a block arrives from the
left, a photograph opens from its right hand edge and a divider's green from
the outer edge it is printed against, which in Persian is the right. Those
rules are written `html.js[dir="rtl"]`, one element, because the `js` class
is on `<html>` itself. Written `html[dir="rtl"] .js` they look for the class
on a descendant, never find it, and the Persian document silently moves the
Latin way round, which is what it did until they were corrected.

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

Three compositions are drawn rather than turned, because turning them would
not have worked:

| Panel | Deck |
|---|---|
| Feature | The photograph across the top of the card, bleeding to the trim on three sides, and the writing running on under it. The photograph is a band and not a card of its own: given a whole card it would leave the shortest of the five a card of writing with two paragraphs on it, and the longest would still want two more. The band is as deep as the horizon, below, on all five. Where the words under the band would run on to a second card by a few lines, and would fit one card on their own, the two cards are given the other way round: the photograph a card to itself, bleeding to the trim as the plates do, then the writing whole on the next (`feature--plated`, set by `plateFeature` in the script). Run on, the second card was three lines at its head and white to the foot. |
| The biographies | Each generation's head (its banner, what the print says of it, and who it was) opens a card, with the page's rule under it, and its two lives run straight on under that, one under the other with the rule between them. The whole generation is one card on every phone that can be made to hold it. A phone in the hand shows the card less the browser's own bars, and at the setting as first made that sent the second life to a card of its own on most phones. The words and their sizes are never touched; what gives is the air. Everything else on these cards is drawn between the setting as made (`--fit: 0`) and the closest it can be drawn (`--fit: 1` and a little past it): the leading of the lives from 1.75 to no less than 1.55 in Persian, the lede's from 1.6 to 1.5, the portraits from four rem to under three, and the space between the parts and round the card by about half, each with a floor. `fitPeople` in the script sets the least that puts both generations on one card each, the same on both. Past the closest setting the lives run beside their portraits (`people--wrap`). The banner and the names are led as titles (1.45 in Persian, 1.25 in English), not as running text. That holds both generations on one card each in Persian on every phone from 360 by 700 and 390 by 664 up, and in English from 412 by 780 up. Where even that is not enough the setting goes back to as made and the second life goes on to the next card whole, so the card holds the whole of what it says of that person and opens on them; let run on a line at a time it left its last three lines at the head of a card of white. The first life always stays with the head, which alone on a card is a banner and three lines. The portrait is beside the name rather than over it, a byline at four rem, and the lives are set a step under the running text, as notes on the people. |
| Granite and quartzite | The same three frames on both, one tall and two square, over the writing. Left alone each block of photographs takes what its own writing leaves, so the two came out different shapes on consecutive cards. `fitStones` in the script gives both the block the longer writing leaves, so the frames stand in the same places on both cards and the title under them starts on the same line. |

The lives are set in flow, not on the grid the page uses: the portrait floats
against the leading edge and the name sits beside it at its height. A grid is
not something every browser can carry from one column to the next, and flow
is, a line at a time. `markLives` draws the rule over the second life only when
its first piece is on the same card as the first life, so a life that ever
has to open a card does not open it under a line. The first life, and any
life longer than a card, runs on a line at a time; such a life may leave two
lines at the foot of a card instead of the three a paragraph is otherwise
held to.

The hairline the spread draws between two panels of writing is not drawn on a
card: the card's edge is the page turn, and at rest the line stood down the
edge of the screen on some cards and not others.

**And a card holds what a card holds.** The long sections are given more than
one card rather than a card with the foot cut off it. The writing runs on
from card to card without opening a new card for each of its parts (the
three of the twelve millimetre spread, the three blocks of the advantages):
given a card each, most parts left a card two thirds white. A new part is
marked instead by the air over its title, which is the largest space on a
card. A paragraph may
run from the foot of one card to the head of the next, as it runs from page
to page in print, never with fewer than three lines at either end; a heading
never ends a card, and a list item, a named advantage or the quote is never
broken.

A section never ends on a card holding only its last few lines. Where its
last card would be less than a quarter full, and its last part fits a card
whole, the whole part starts that card, under its title (`keepLastPart` in
the script). On the advantages the eight photographs are tried first: where
the words leave at least half of their last card, the photographs come up
under them, two across and four down to the bottom frame line, instead of
following on a card of their own (`liftBand`).

The mechanism is the same everywhere: the block is set in columns exactly one
card wide, poured rather than balanced (`column-fill: auto`), with the frame
moved off the shell and on to the blocks inside it, so that every column
carries the frame and not only the first and the last. A section is
`--cards` cards wide.

### The horizon

Every photograph across the head of a card and every section opener's green
stop on one line, `--horizon`, so that swiping from one to the next their
edges run on instead of stepping. Each photograph was once sized to what its
own writing left, and five sections in a row came out five heights between
308 and 511 pixels on the same phone. `fitHorizon` in the script measures
every feature whose writing fits one card and sets the horizon to the lowest
height any of them leaves, between 28% of the card and the print's 5:12, so
all of them still fit and none stands taller than the others.

### Rhythm on a card

What belongs together is set close and what does not is set apart: a title
twelve pixels over what it heads, the items of a list eight pixels apart and
close to the sentence that introduces them, a new block forty eight pixels
off the one before it. Set evenly, a one line list item stood as far from the
next as two paragraphs do, and a title as close to the list above it as to
its own. The same list spacing is used on the upright page at a phone's
width.

### Where a card breaks

Chrome and Safari keep a heading with its text, never cut a list item or a
byline in two and never leave one line of a paragraph alone at the foot or
head of a card, because the stylesheet asks them to. Firefox does none of it
inside columns, and does not honour a forced column break either. So after
the type is set, `paginate` in the script walks each poured box in reading
order and pushes any block that has broken one of those rules on to the next
card, with a margin exactly as deep as what was left of the card it was on.
Where the browser has done it already there is nothing to push. Check the
deck in Firefox as well as Chrome whenever the words change.

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

Running text is justified on a card as it is everywhere else: Persian flush
to both edges with its last line to the right, English with its last line to
the left. The rule is in `catalogue.css` and no reading overrides it. The
space a line has over goes between its words and nowhere else: no kashida
and no tracking, which would stretch a Persian word through its joins. The
English is hyphenated (`hyphens: auto`, six letters or more, two left behind
and three carried over), which is what keeps a phone's eight or nine words
to the line from opening into holes. Display type (titles, the banner, the
names, the pull quote) is not justified: a few words to the line at that
size cannot hide the space between them.

Two things to know when checking it:

- **The Persian face has a narrow space.** Rokh's word space is a tenth of an
  em, where the Latin face's is more than a quarter, so a justified Persian
  line whose spaces measure two or three times the plain one is a normal
  word space and not a loose line.
- **A test browser may not hyphenate.** Chrome fetches its hyphenation
  dictionaries as a component, and a Playwright Chromium never does, so the
  English it renders is set without hyphenation, with holes the reader's
  browser does not have. Measure English gaps with the breaks marked in as
  soft hyphens instead, from the en-us patterns and with the same limits.

### Resting on a card

A card comes to rest on a card, however it was moved, and one swipe is one
card: `scroll-snap-type: x mandatory` with `scroll-snap-stop: always` on
every stop. Every panel is a stop. So is every card inside a panel that runs
on, but those cards are columns of poured type and a column is not an
element, so `markStops` in the script places a one pixel `.deck-stop` where
each of them begins, from the width the panel came out at. Only once they are
there does the snap become mandatory; before that, and without the script, it
is by proximity, which never takes a reader away from a card there is no stop
for.

The snap is for every pointer, not only for touch. It was once kept to
`pointer: coarse`, because the wheel's glide sets the track a few pixels at a
time and a snap takes every one of them back; that left a desktop browser
emulating a phone, which reports a mouse, with no snap at all, and it came to
rest half way between two cards. On a card the wheel does not glide. It turns
cards, as a swipe does, aimed at exactly where a card begins:

- a burst of wheel events with no quiet longer than 160ms in it is one
  gesture, and a gesture turns a card once it has travelled 24px, so a notch
  answers at once and a finger resting on a trackpad does nothing;
- a gesture that keeps its strength (a wheel spun on) turns another card
  every 400ms; one that is dying away (a trackpad coasting after the fingers
  lift) turns nothing more, or one flick would run through four cards;
- a notch while a turn is still travelling is counted from the card the turn
  is bound for, so three notches are three cards.

Page Up and Page Down turn a card rather than a section, Home and End go to
the first and the last, and after a resize the reader is put back on the card
they were on, not only in the section. Where the cards begin is read off the
snap targets themselves, so the wheel, the keys and the snap always agree.

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

### Motion on a card

On a card the swipe is the motion. A spread is travelled across, and a block
arriving from the trailing edge is part of the travel; a card is carried in
under a thumb and read the moment it lands. Words that fade in after it has
landed make the reader wait for what they came to read, and words that fade
out while it is still being dragged away take the last line from under their
eyes. So on a card:

| | Spread | Card |
|---|---|---|
| Paragraphs, lists, quotes | arrive from the trailing edge, go back out when they leave | simply there |
| Titles | written a word at a time | simply there |
| Photographs | open from the leading edge, every time | open the first time, stay open |
| A section opener's green | wipes in from the outer edge, every time | comes down from the top the first time, stays |

The "stays" is the one part the stylesheet cannot say alone, because it is
the observer in `catalogue.js` that takes a block back out. The deck sets
`--reveal-returns: 0` on the root, and the observer reads it on every change
and leaves what has arrived where it is. The overrides are written
`html.js[dir]`, which outweighs the rtl variants of the same rules.

The generation's banner (the green «نسل اول – بنیان‌گذاران») is set in from
the frame by a margin rather than padded out to it. Every block in a poured
panel carries the frame as its own padding, so that every card has one, and
the banner took that padding inside its green: the green ran to the trim of
the card and joined the green of the divider beside it.

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

On a feature the script does one thing more. Every photograph across the head
of a card stops on the horizon, and a section whose words would then run on
to a second card by a few lines, but fit one card on their own, has its
photograph moved to a card of its own before them. Without that, a section
three lines over a card spends a second card on those three lines and the
reader swipes to a card that is empty.

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

That each generation is still one card at the heights a phone in the hand
really has, the screen less the browser's bars: 390 by 664 for an iPhone in
Safari, 412 by 780 for an Android phone in Chrome or Firefox, and 360 by 640
for a small one. A longer life is what raises the step `fitPeople` has to
take, and past the last step it sends the second life on to a card of its
own.

And that no card is left holding a few lines at its head and white under
them: the last card of every poured section should be a quarter full or more,
or open on a part, a person or a photograph. Measuring the lowest line on
each section's last card as a share of the card, at 360, 390, 393, 412 and
430 wide, in both languages and in Chrome and Firefox, is the quickest way
to see it.

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
