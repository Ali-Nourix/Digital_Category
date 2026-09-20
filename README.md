# Behkooshan Digital Catalogue

Bilingual (Persian and English) digital catalogue for Behkooshan stone
processing. Plain static HTML and CSS, no runtime dependencies.

The visual rules come from the Behkooshan Design Guide.
**[docs/DESIGN.md](docs/DESIGN.md)** records how that guide is implemented
here and where it was silent. Read it before changing anything visual.

## Structure

```
index.html                    Persian home, RTL. The site root.
about.html                    Persian About, generated
products/                     Persian catalogue, generated
en/                           The same three, in English
404.html                      Self contained error page
data/products.json            Single source of truth for products
data/about.json               Single source of truth for the About copy
tools/build-site.mjs          Generates every data driven page
tools/build-shape-css.py      Generates assets/css/shapes.css
assets/css/                   fonts, tokens, site, shapes, product, about
assets/fonts/                 Rokh (7 static weights), TT Firs Neue (variable)
assets/images/                Photography, named for where it is used
assets/logos/                 4 lockups, currentColor
assets/shapes/                21 abstract brand shapes, currentColor
docs/DESIGN.md                Implementation notes for the design guide
```

Persian sits at the root because the domain is `.ir` and the primary audience
is domestic. English lives under `/en/`. Swapping them means moving the two
folders and updating the `hreflang` links.

Every path in the HTML is relative, so the site works both at a domain root
and under a project sub-path such as `/Digital_Category/`.

## Local preview

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening the files directly with `file://`
will not work, because the font and shape URLs resolve relative to the
document.

## Adding or editing a product

Product and About pages are generated, so never edit `products/*.html`,
`about.html` or their English counterparts by hand. Those edits are lost on
the next build. Edit the JSON in `data/` instead.

1. Add or change the entry in `data/products.json`. Each product carries a
   `slug`, a `category`, and a `name`, `lede` and six `specs` per language.
2. Run the generator:

   ```bash
   node tools/build-site.mjs
   ```

   It writes the catalogue index, one detail page per product, and the About
   page, in both languages.
3. Commit the JSON and the generated HTML together.

Replacing a placeholder with a real photograph means swapping the whole
`media-slot` div for an `<img>`. Each slot's label states the size it needs.

The specification grid is laid out for the six fields the design guide
defines. If that count changes, update `grid-template-columns` in
`assets/css/product.css` so the grid never ends on a half empty row.

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
- **Product data.** Everything in `data/products.json` is sample data. The
  stone names and quarries are real; the finishes, slab sizes, grades and
  product codes are placeholders.
- **Photography.** The About page carries two real photographs. Every image
  in the catalogue is still a labelled placeholder.
- **Dark mode.** The design guide defines no dark palette. The values in
  `tokens.css` are derived from its light palette and need sign off.
- **Two company names.** The About copy describes Rijen Kashan Cobblestone
  Production Company and the Natanz quarry in Isfahan, while the rest of the
  site is Behkooshan in Shams Abad, Tehran. Confirm how the two relate before
  this page is published.
