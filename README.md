# Behkooshan Digital Catalogue

Bilingual (Persian and English) digital catalogue for Behkooshan stone
processing. Plain static HTML and CSS, no build step, no dependencies.

Design rules live in **[docs/DESIGN.md](docs/DESIGN.md)**. Read that before
changing anything visual.

## Structure

```
index.html                    Persian home, RTL. The site root.
en/index.html                 English home, LTR.
products/                     Persian product index and page template
en/products/                  English product index and page template
404.html                      Self contained error page
assets/css/                   fonts, tokens, site, shapes, product
assets/fonts/                 Rokh (7 static weights) and TT Firs Neue (variable)
assets/logos/                 4 lockups, each in green and bone
assets/shapes/                21 abstract brand shapes
docs/DESIGN.md                Design guide
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
will not work, because the font and shape URLs are resolved relative to the
document.

## Deployment

`.github/workflows/deploy-pages.yml` publishes the `Behkooshan` branch to
GitHub Pages on every push. There is no build step; the repository root is
uploaded as is.

One manual step is needed the first time: in the repository, go to
**Settings > Pages** and set **Source** to **GitHub Actions**. Until that is
set, the workflow runs and then fails at the deploy step.

After that, pushing to `Behkooshan` publishes. The workflow can also be run
by hand from the Actions tab.

## Adding a product

1. Copy `products/template.html` and `en/products/template.html` to the new
   product slug in both languages.
2. Replace each `SLOT` comment with the real content. The image slots take an
   `<img>` in place of the whole `media-slot` div.
3. Point the two pages at each other with `hreflang`, and set the language
   switch links.
4. Add a card to `products/index.html` and `en/products/index.html`.
5. Delete the `notice` block, which exists only to mark the page as a template.

The specification grid is laid out for six specifications. If that count
changes, update `grid-template-columns` in `assets/css/product.css` so the
grid never ends on a half empty row.

## Before going live

TT Firs Neue is currently the **Trial** file, which is not licensed for
public deployment. A commercial web licence has to be bought from TypeType
and the file in `assets/fonts/tt-firs-neue/` replaced before the site is
published on the production domain.
