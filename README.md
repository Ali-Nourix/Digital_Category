# Behkooshan Digital Catalogue

Bilingual (Persian and English) digital catalogue for Behkooshan stone
processing. Plain static HTML and CSS, no runtime dependencies.

The visual rules come from the Behkooshan Design Guide.
**[docs/DESIGN.md](docs/DESIGN.md)** records how that guide is implemented
here and where it was silent. Read it before changing anything visual.

## Structure

```
index.html                    Persian home, RTL. The site root. Generated.
about.html                    Persian About, generated
products/                     Persian catalogue, generated
en/                           The same three, in English
404.html                      Self contained error page
data/home.json                Single source of truth for the home page copy
data/products.json            Single source of truth for products
data/about.json               Single source of truth for the About copy
tools/build-site.mjs          Generates every data driven page
tools/build-shape-css.py      Generates assets/css/shapes.css
assets/css/                   fonts, tokens, site, shapes, product, about
assets/js/reveal.js           Reveals blocks on scroll
assets/js/catalogue.js        Catalogue search and filtering
assets/fonts/                 Rokh (7 static weights), TT Firs Neue (variable)
assets/images/                Photography, named for where it is used
assets/logos/                 4 lockups in currentColor, plus favicon.svg
assets/shapes/                21 abstract brand shapes, currentColor
docs/DESIGN.md                Implementation notes for the design guide
```

Every page on the site is generated. Editing `index.html`, `about.html` or
anything under `products/` by hand loses the edit on the next build.

Persian sits at the root because the domain is `.ir` and the primary audience
is domestic. English lives under `/en/`. Swapping them means moving the two
folders and updating the `hreflang` links.

Every path in the HTML is relative, so the site works both at a domain root
and under a project sub-path such as `/Digital_Category/`.

## Scripting

Two scripts, and the site is fully readable without either.

`assets/js/reveal.js` fades blocks marked `.reveal` into place as they scroll
in. The hidden starting state is applied by CSS only under `html.js`, a class
set by one inline line in the head, so if the script never loads nothing was
ever hidden. Under `prefers-reduced-motion: reduce` nothing is hidden or moved.

When adding a `.reveal`, scroll the page to the very bottom and check the
block actually reaches full opacity. Anything that can end up below the last
scroll position is the case worth testing.

`assets/js/catalogue.js` drives the catalogue's search box and filter chips.
Each tile carries its own name and facet values as data attributes, so the
script holds no product list of its own and adding a facet to
`data/products.json` needs no change to it. The whole filter bar is hidden by
CSS unless `html.js` is set, because a search box that cannot search is worse
than no search box; without scripting the catalogue is the full list.

## Local preview

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening the files directly with `file://`
will not work, because the font and shape URLs resolve relative to the
document.

## Adding or editing a product

1. Add the entry to `data/products.json`. Each product carries a `slug`, its
   `facets`, an `images` block with a `main` and a `gallery`, and per language
   a `name`, a `body` and its `specs`.
2. Put the photographs in `assets/images/`, named for the product and for what
   the shot is of (`granite-bathroom-vanity.webp`, not `IMG_2404.webp`).
3. Run the generator:

   ```bash
   node tools/build-site.mjs
   ```
4. Commit the JSON, the images and the generated HTML together.

**The prose is the client's, verbatim.** `body` holds exactly what they sent,
and everything in `specs` is derived from that same text, with a `specSources`
entry naming the sentence each figure came from. Nothing on a product page is
written here. A product whose copy has not arrived yet carries
`"awaitingCopy": true` and a `pending` line, and its page says so plainly
rather than showing invented description.

**Filters come from the data.** The bar renders one radio group per entry in
`facets` at the top of the file, so giving products an origin or a finish is a
data edit, not a code change. A product only declares a facet its text
supports; it is better for a stone to be absent from a filter than to be
listed under a claim nobody made.

Both hairline grids (product specifications, About features) draw their rules
as a spread `box-shadow` on each cell rather than as a container colour showing
through the gaps, so a row the cells do not fill draws nothing instead of a
grey slab. Any cell count works.

After adding, removing or re-exporting a logo or shape, run
`python3 tools/build-shape-css.py` to refresh the generated stylesheet.

## Deployment

`.github/workflows/deploy-pages.yml` publishes the `Behkooshan` branch to
GitHub Pages on every push. The generators run locally and their output is
committed, so deployment itself is a plain file upload with no build step.

One manual step is needed the first time: in the repository, go to
**Settings > Pages** and set **Source** to **GitHub Actions**. Until that is
set, the workflow runs and then fails at the deploy step.

## Before going live

- **Font licence.** TT Firs Neue is currently the Trial file, which is not
  licensed for public deployment. Buy a commercial web licence from TypeType
  and replace the file in `assets/fonts/tt-firs-neue/`.
- **Quartzite copy.** `data/products.json` marks the quartzite
  `"awaitingCopy": true`. Its name, photographs and the two specifications
  that come from the company introduction are in place; the description and
  the specifications derived from it are still owed by the client. Until they
  arrive the product page says so.
- **Dark mode.** The design guide defines no dark palette, so the site ships
  light only. The values in `tokens.css` are derived from its light palette
  and stay behind `[data-theme="dark"]` until they are signed off; nothing
  switches them on automatically.
- **Two company names.** The About copy describes Rijen Kashan Cobblestone
  Production Company and the Natanz quarry in Isfahan, while the rest of the
  site is Behkooshan in Shams Abad, Tehran. Confirm how the two relate before
  this page is published.
