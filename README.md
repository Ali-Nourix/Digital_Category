# Behkooshan Catalogue, design branch

A second take on the Behkooshan digital catalogue. This branch carries every
piece of raw material the first one used and none of its design, so the next
one can be built without inheriting the last one's decisions.

The first design lives on the `Behkooshan` branch and is still there to look
at, or to lift a solved problem out of.

## What is here

```
assets/fonts/          Rokh (7 static weights), TT Firs Neue (variable)
assets/logos/          4 lockups in currentColor, plus favicon.svg
assets/shapes/         21 abstract brand shapes, currentColor
assets/images/         All the photography, named for what each shot is of
assets/css/fonts.css   @font-face only. No font is declared anywhere else.
assets/css/tokens.css  The brand palette, type scale and spacing
assets/css/shapes.css  Logo and shape library. Generated, never hand edited.
data/home.json         The company introduction, both languages
data/products.json     Granite and quartzite: copy, specifications, images
data/about.json        The About page copy, both languages
data/gallery.json      The gallery photographs and their captions
docs/DESIGN.md         The design guide, in Persian
tools/build-shape-css.py   Regenerates assets/css/shapes.css from the SVGs
index.html, en/        A placeholder page. See below.
```

## What is deliberately not here

Everything that was the first design: its stylesheets (`site`, `about`,
`product`, `gallery`, `lightbox`), its scripts, its page generator
(`tools/build-site.mjs`) and every page it produced. Rebuilding those is the
job of this branch.

## The three stylesheets that came along

`fonts.css` and `shapes.css` are plumbing and are safe to keep as they are.
`shapes.css` is generated: edit the SVGs and re-run the generator, never the
stylesheet.

`tokens.css` needs a judgement call, because it holds two different kinds of
value:

- **From the design guide, and not yours to change.** The two brand greens,
  the bone, the ink, the two type families, the per script leading and
  tracking. Changing these changes the brand, not the design.
- **Decisions the first design made.** The type scale steps, the spacing
  scale, `--shell`, `--header-h`, `--control-h`, `--section-gap`, `--measure`
  and the motion durations. Defaults, not rules. Replace them freely.

`docs/DESIGN.md` is the same mixture. Sections 1 to 4 are the brand: colour,
logo, typography, shapes. Sections 5 onward describe how the first design
implemented them, and are reference here rather than instruction.

## The placeholder page

`index.html` and `en/index.html` exist so the branch has something to deploy
before the design starts. They are a header, a line of text and a footer, and
they load `assets/css/starter.css`, which says at the top of the file that it
is disposable.

They are worth keeping until the first real page exists, because rendering
them checks three things at once: both faces load in both scripts, the brand
colours resolve, and the logo and shape masks resolve their paths. That last
one has broken on this project before, and it only shows up once the files
are served from a real path rather than opened from disk.

Delete all three the moment there is a real page.

## Local preview

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening the files directly with `file://`
will not work: the font and mask URLs resolve relative to the document, and
the masks are blocked cross origin.

## Deployment

`.github/workflows/deploy-pages.yml` publishes this branch to GitHub Pages on
every push.

**A repository has one Pages site.** The `Behkooshan` branch carries the same
workflow pointed at itself, so both branches publish to the same URL and
whichever deployed last is what is live. Decide which branch owns the URL. To
stop this branch publishing automatically, delete the `push:` block in the
workflow and leave `workflow_dispatch:`, which keeps the manual trigger in the
Actions tab.

One manual step is needed the first time, if it was not done already: in the
repository, **Settings > Pages**, set **Source** to **GitHub Actions**.

## Working with the copy

The prose in `data/` is the client's own text, verbatim, and it stays that
way. Everything in a product's `specs` is derived from that same text, with a
`specSources` entry naming the sentence each figure came from. Nothing on a
page should say anything the client did not write, or anything that cannot be
traced back to something they did.

## Before going live

- **Font licence.** TT Firs Neue is the Trial file, which is not licensed for
  public deployment. Buy a commercial web licence from TypeType and replace
  the file in `assets/fonts/tt-firs-neue/`.
- **Two company names.** The About copy describes Rijen Kashan Cobblestone
  Production Company and the Natanz quarry in Isfahan, while the rest of the
  site is Behkooshan in Shams Abad, Tehran. Confirm how the two relate before
  that page is published.
- **Contact.** There is still no contact page, which is why nothing in the
  data carries a call to action.
