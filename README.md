# Behkooshan, the printed catalogue as a digital one

The forty page print catalogue, rebuilt as a single scrolling web document so
it can be sent as a link and read without the printed copy. Same sequence,
same photographs, same words.

Four documents: two languages by two ways of reading the same catalogue.

    /           upright, Persian, right to left
    /en/        upright, English, left to right
    /wide/      sideways, Persian, right to left
    /wide/en/   sideways, English, left to right

Only one language is ever on screen. Both switches in the bar are plain links,
and script keeps a fragment on them so either one lands on whatever section is
being read rather than at the top.

The sideways version runs the catalogue along the page instead of down it, so
the document travels the way its language is read. It is the same markup and
the same content; it differs by one stylesheet, one script and the directory
it is written to, and it is built to be removed or merged in one move. See
[docs/WIDE.md](docs/WIDE.md).

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

`file://` will not work: the font and mask URLs resolve against the document
and the masks are blocked cross origin.

## Building

```bash
node tools/build-catalogue.mjs        # data/catalogue.json  ->  the two pages
```

All four documents are generated. The HTML is committed, so deploying is a
file upload and nothing else. Edit `data/catalogue.json` and re-run; never
edit `index.html` by hand.

```bash
python3 tools/derive-images.py SRC    # the client's originals -> assets/images
```

Only needed when a photograph changes. It reads the client's zip, which lives
on the `source-material` branch rather than here because it is 88 MB, and
writes each image at several widths plus `assets/images/manifest.json`. The
generator reads that manifest, so a width that was not produced never appears
in a `srcset`.

## What is where

```
data/catalogue.json        Every word and every image reference, in page order
tools/build-catalogue.mjs  The generator
tools/derive-images.py     The image derivation, and the PDF to webp mapping
assets/css/catalogue.css   The whole design. Logical properties throughout,
                           so one stylesheet serves both directions
assets/js/catalogue.js     Reveal, reading position, contents. No scroll listener
assets/js/lightbox.js      The photograph viewer: zoom, pan, pinch, wheel
assets/css/catalogue-wide.css  The sideways version's layout. One media query
assets/js/catalogue-wide.js    The sideways version's wheel and page keys
docs/WIDE.md               What the sideways version is, and how to remove it
assets/icons/              Telegram, WhatsApp and Instagram, from Simple Icons
assets/css/tokens.css      The brand palette, type scale and spacing
assets/css/fonts.css       @font-face only
assets/css/shapes.css      Logo and shape masks. Generated, never hand edited
assets/images/             The photography at several widths, plus manifest.json
docs/DESIGN.md             The brand design guide, in Persian
```

`products/` is the product catalogue, published here so the one Pages site
carries both: the digital catalogue at `/` and the product catalogue at
`/products/`. It is written by the `Behkooshan-products` branch, whose publish
workflow copies its site into this folder and commits it on every push there.
Edit it on that branch, never here: the next push overwrites this copy. The
product research it is built from lives on that branch too, under
`research/products/`.

`data/home.json`, `data/products.json`, `data/about.json` and
`data/gallery.json` belong to the first design, on the `Behkooshan` branch.
They are kept here as the record of the client's copy and the specifications
derived from it. Nothing on this branch reads them.

## The two rules the content follows

**The words are the client's.** Every sentence is transcribed from the print
PDF and nothing was rewritten, shortened or added. Two repairs were made and
are listed at the top of `data/catalogue.json`: the PDF's text layer extracts
the lam alef ligature with its letters reversed, and page 29 sets
`EnvironmentalBenefits` with no word space. Both were read back off a 150 dpi
render before being written down. The print's own en dashes in the two
generation headings are kept as the client set them.

**The photographs are the client's originals, not the PDF's.** Every image the
print uses was matched to the file the client supplied. The images embedded in
the PDF are InDesign crops of those originals, so they are not used at all.
Where the print runs one photograph across a spread, the whole photograph is
here. `tools/derive-images.py` names the source file for each one.

All four portraits are here. Three came in the client's zip; Mohammad Jafar
Mohammadi's arrived later as a 3x4 PDF whose single embedded image is the
same one the print places on page 22, re-rendered at 600 dpi so its CMYK
profile is applied properly rather than converted by hand.

`focus` in the manifest is what keeps a subject inside its box. It becomes
`object-position` on the page and is only written where the subject is off
centre; the table lives in `tools/derive-images.py`.

## The design

White paper, `#184b36` for the headings and the section panels, and the two
brand faces. The green is the one printed in the catalogue, sampled from the
PDF; it sits in the brand's deep green family and measures 10.2:1 on paper.

Light only, deliberately. The artefact is printed on white paper and the brand
has no dark palette. `tokens.css` carries an unused dark block behind
`[data-theme="dark"]` and nothing switches it on.

Nine layout families, one per kind of printed spread: cover, section divider,
three feature compositions, the advantages columns with their photograph band,
the full bleed plate, the biographies, the twelve millimetre spread and the
two stone pages.

The brand's one piece of geometry is the notch off a corner, and it is used
in two places: on the framed photographs, which is the shape the print clips
its portraits into, and on the top edge of the footer, which is the cut the
stationery puts on a green panel. It stays off the full bleed plates. A
photograph running off the edge of the window has no frame to cut, and a
notch out of one reads as a rendering fault rather than as a shape.

A framed photograph also carries a hairline, because several of them are
studio shots on a white ground that would otherwise have no edge against
the page. The line is the frame's own one pixel of padding showing through
rather than a border, so it follows the diagonal as well as the four
straight sides; a border would be clipped away at the notch.

The footer is pulled up by exactly its cut, so the wedge the angle takes
out of the panel is filled by the last photograph rather than by a white
gap. Nothing else is placed on it: a loose shape under that top edge gets
sliced by the angle and reads as a stray triangle.

### Motion

Four moves, each with a job:

- **reveal** carries a block up as the scroll reaches it, and again on the way
  back up, because a catalogue is read in both directions
- **words** sets a title one word at a time, so the eye lands on the heading
  before the paragraph under it
- **place** uncovers a photograph from its leading edge and settles it out of a
  slight overscale
- **drift** moves a full bleed photograph against the scroll

The first three are an IntersectionObserver and a class. Drift and the reading
line in the bar are scroll driven CSS, behind `@supports`, and they only ever
add movement: nothing anywhere depends on them to become visible. There is no
scroll event listener in the page.

Everything collapses under `prefers-reduced-motion: reduce`. With JavaScript
switched off the page is complete and static, because every hidden state in
the stylesheet is gated on a class the script adds rather than removes.

Scrolling is not smooth by default. The document is roughly 25,000 pixels
long, so a language switch landing on a fragment is instant. Choosing a
destination from the contents is the one case where the journey is worth
showing, and that one call asks for it.

### The photograph viewer

Every photograph opens in it, at the largest size that was derived for that
picture rather than whatever the page happened to load. The wheel zooms
towards the pointer, a double click zooms in and out again, two fingers
pinch, dragging moves the picture and the arrows walk the set while it is
fitted. The picture is moved with one transform rather than by scrolling a
container, which is what makes the zoom continuous and what lets it hold the
point under the pointer still.

Nothing is printed under the picture but its position in the set. The print
carries no captions, and the description each photograph holds is alt text
for a screen reader, not a line of copy to set under the picture: the client
did not write it.

The picture is hidden while its source changes. An <img> goes on painting
what it already has until the new file has decoded, so the viewer used to
show the photograph you looked at last for as long as the next one took to
arrive. A request counter makes sure that a reader holding the next arrow
down uncovers only the picture they stopped on.

The pointer is captured only once a drag has really started. Capturing on
pointerdown retargets the click the browser sends afterwards to the
capturing element, so a plain click on the picture arrives as a click on the
backdrop and closes the viewer.

## Deployment

`.github/workflows/deploy-pages.yml` publishes this branch to GitHub Pages on
every push.

**A repository has one Pages site.** The `Behkooshan` branch carries the same
workflow pointed at itself, so both branches publish to the same URL and
whichever deployed last is live. To stop this branch publishing automatically,
delete the `push:` block and leave `workflow_dispatch:`.

One manual step, once: **Settings > Pages**, set **Source** to
**GitHub Actions**.

## Before going live

- **Font licence.** TT Firs Neue is the Trial file, which is not licensed for
  public deployment. Buy a web licence from TypeType and replace the file in
  `assets/fonts/tt-firs-neue/`.
- **The missing portrait**, above.
- **Two company names.** The copy describes Rijen Kashan Cobblestone
  Production Company and the Natanz quarry in Isfahan alongside Behkooshan.
  That is how the print sets it out; confirm it reads correctly online too.
- **Contact details** in the footer are the ones on behkooshan.ir: the Shams
  Abad address, the two numbers, and the Telegram, WhatsApp and Instagram
  accounts. Confirm they are current before this goes out.
