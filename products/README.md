# Behkooshan, the products

The stones Behkooshan sells, one to a cell: found by name, colour, type and
origin, each with a page of its own and the texture file the brand published
for it, to download at the quality it was published at.

Drawn in the language of the digital catalogue (branch `Behkooshan-catalogue`)
rather than the old site's: white paper, the catalogue's printed green for
titles and filled controls, hairline rules, no radius, and the brand's cut
corner on every framed photograph.

    /                          the stones, Persian, right to left
    /en/                       the stones, English, left to right
    /product/<slug>/           one stone, Persian
    /en/product/<slug>/        one stone, English

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

## What is in this branch

| Folder | What it is |
|---|---|
| `research/products/` | Everything collected about the products from behkooshan.ir: one folder per product with its `product.json`, its original photographs and its texture files. How it was collected, what came from the site and what was translated is in `research/products/README.md`. This is the source; nothing here is edited by the build. |
| `docs/DESIGN.md` | The brand guide as implemented: colour, logo, type, shapes. Sections 1 to 4 are the brand; the rest describes the first site design and is reference, not rule. |
| `assets/fonts`, `assets/logos`, `assets/icons`, `assets/shapes` | The brand's faces, marks, social icons and shapes, as the catalogue uses them. Three interface icons are from Phosphor (MIT, `assets/icons/PHOSPHOR-LICENSE.txt`). |
| `assets/css/tokens.css`, `fonts.css`, `shapes.css` | The brand tokens and the classes for the faces, marks and shapes. |
| `assets/css/products.css` | This site's stylesheet. Its first half is the catalogue's own (bar, controls, cut corner, footer, photograph viewer); its second half is the product catalogue. |
| `assets/js/products.js` | The search and the filters. The grid is complete without it. |
| `assets/js/lightbox.js` | The catalogue's photograph viewer, unchanged. |
| `data/products.json` | What the pages are built from, written by `tools/derive-products.py`. |
| `media/` | The photographs as webp at 480 to 1600 pixels wide, written by the same tool. |

## Building

```bash
python3 tools/derive-products.py   # research -> media/ and data/products.json
node tools/build-products.mjs      # data -> every page
```

Run the first whenever the research changes and the second whenever the data
or the page templates do. Both are safe to run again.

What the derivation decides, and why, is written at the top of
`tools/derive-products.py`. In short:

- the photographs are shown as webp at a few widths, so a phone downloads a
  phone's worth of pixels; the texture downloads are the original files;
- the old site's listing pictures have its cut corner painted into them, and
  the installation photographs white bars; both are cropped away;
- colour: the site gave a colour to about half the stones. For the rest it is
  read from the slab's photograph and from any colour word in the trade name
  (Jeriba Blue is found among the blue stones). Where the site named a colour,
  the site's word stands. `colour_source` in each record says which.

A stone the research knows only by name (no photograph, type or origin) is
left out of the site until it has something to show. Black Tempest is the one.

## Publishing

The repository has one GitHub Pages site, built from the branch
`Behkooshan-catalogue` as it stands. This site is published in that branch's
`products/` folder: every push here runs `.github/workflows/publish.yml`, which
copies the site into that folder (without the original photographs, the data
and the tools) and commits it there, and Pages then publishes the digital
catalogue at `/` and this one at `/products/`. Edit the product catalogue here
only; the copy in the catalogue branch is overwritten on every push. The bar's
"Catalogue" link relies on that arrangement (`CATALOGUE` at the top of
`tools/build-products.mjs`).

## Fonts

TT Firs Neue is the trial version and may not be published on the brand's
own domain until a commercial web licence is bought from TypeType; see
`docs/DESIGN.md`.
