# Behkooshan, the printed catalogue as a digital one

The forty page print catalogue, rebuilt as a single scrolling web document so
it can be sent as a link and read without the printed copy. Same sequence,
same photographs, same words.

Two files, one per language: `index.html` is Persian and right to left,
`en/index.html` is English and left to right. Only one language is ever on
screen. The switch in the bar is a plain link between them, and script keeps a
fragment on it so the switch lands on whatever section is being read rather
than at the top.

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

`file://` will not work: the font and mask URLs resolve against the document
and the masks are blocked cross origin.

## Building

```bash
node tools/build-catalogue.mjs        # data/catalogue.json  ->  the two pages
```

The generated HTML is committed, so deploying is a file upload and nothing
else. Edit `data/catalogue.json` and re-run; never edit `index.html` by hand.

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
assets/css/tokens.css      The brand palette, type scale and spacing
assets/css/fonts.css       @font-face only
assets/css/shapes.css      Logo and shape masks. Generated, never hand edited
assets/images/             The photography at several widths, plus manifest.json
docs/DESIGN.md             The brand design guide, in Persian
```

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

One is missing: **Mohammad Jafar Mohammadi's portrait**, on printed page 22.
Three of the four portraits are in the client's zip and his is not. His
biography runs the full width of its row rather than leaving an empty frame.

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

Scrolling is not smooth, on purpose. The document is roughly 25,000 pixels
long, so a jump from the contents or a language switch is instant.

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
- **No contact details.** The print carries none and neither does this, beyond
  the address of the website in the footer.
