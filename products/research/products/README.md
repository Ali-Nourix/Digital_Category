# Behkooshan (به‌کوشان) — product data

Product data of **Behkooshan Stone Processing Company** (شرکت فرآوری سنگ به‌کوشان), collected from its website
<https://behkooshan.ir> (English) and <https://fa.behkooshan.ir> (Persian) for reuse in a new product catalogue.

* Collected on **2026-09-23** from Wayback Machine captures (June 2025 to February 2026), plus older site versions for reference, then **checked against the live site on 2026-09-24 and updated to it** (see [LIVE-SYNC.md](LIVE-SYNC.md) and, for the project photos, [PROJECTS.md](PROJECTS.md)).
* **102 folders**: the 99 products the live site lists, the "Quarry" page (`natanz-white-granite-rijen`), and two the live site no longer shows, kept as the record of what was: `black-fantasy` (renamed and moved by the site to Black Tempest; `merged_into: "black-tempest"`) and `river-blanche` (no longer listed on either site; `listed_on_live_site` false). `tools/derive-products.py` leaves both out of the catalogue.
* **382 image records** (main 104, listing 78, project 172, quarry 13, legacy 1, and the site's former pictures: former 6, superseded 8), 59 of them stored as a smaller copy with the site's full upload recorded in `original_upload`. The texture download for **94 products**: 66 separate files, 36 pointing to an image file. In total 448 image and texture files, 75.8 MB; no stored file is over 2560 px on its long edge or 3 MB.
* Categories: domestic 37, imported 64, quarry 1. Stone types (as shown on the site): Granite 78, Quartzite 12, Marble 11, Miscellaneous 1.

## Where the data came from

The live site could not be reached from the collection environment: `behkooshan.ir`, `www.`, `fa.` and `en.behkooshan.ir` reset every HTTPS connection, and plain HTTP returned `503 upstream connect error … connection timeout`. That is typical of Iranian hosting that drops foreign traffic. The site's image CDN (`es55asecvav.exactdn.com`) no longer resolves. Everything was therefore recovered from the **Internet Archive Wayback Machine** using its raw `id_` endpoints:

* product sitemaps (`/product-sitemap.xml`: English Jun + Jul 2025, Persian Jun + Jul 2025 and 19 Feb 2026);
* every archived capture of every product page on both language sites (`/product/<slug>/`), 2025-06 … 2026-02;
* the WordPress REST records `/wp-json/wp/v2/product/<id>`, which carry the WooCommerce colour, stone-type and category attributes;
* product cards in the listing and "related products" grids of all archived pages, for products whose own page was not archived;
* project pages (`/projects/<slug>/` fa, `/_project/<slug>/` en) with installation photos;
* the "Texture Download" files (`/?jet_download=<hash>`); the archived response headers give the original file name;
* older versions of the site (2018, 2019-2021, 2021-2023), used only for reference, in `_legacy/legacy-catalogue.json` and in each product's `legacy` block.

**Project photos (2026-09-24):** the live site was then reached through Google Translate's website proxy (`https://behkooshan-ir.translate.goog/<path>?_x_tr_sl=fa&_x_tr_tl=en&_x_tr_hl=en`, and `fa-behkooshan-ir.translate.goog` for the Persian site). It returns the live HTML (visible text machine-translated, markup and URLs intact) and the original bytes of `/wp-content/uploads/` files; it cuts files off at about 15 MB. All 40 project pages of each language were read from it, and their gallery photos were taken from it. To keep the repository light, a photo whose original upload is larger than 2560 px on the long edge or 3 MB is stored as the site's own `-scaled` copy (at most 2560 px); the original's URL, size, bytes and SHA-1 are kept in `original_upload` (50 photos). These image entries have `archived_url: null` and record `retrieved_url`, `retrieved_at` and `retrieved_via` instead; see PROJECTS.md.

The WooCommerce Store API (`/wp-json/wc/store/v1/products`) and the REST list endpoints (`/wp-json/wp/v2/product?per_page=…`, `/wp-json/wp/v2/media`) were never archived, so they could not be used. No other public mirror or cache of the site was reachable either (archive.today resets the connection).

Images: for every image the original upload was requested, with WordPress size suffixes such as `-300x221` stripped. If the original had not been archived, the largest archived version was taken instead: the WordPress `-scaled` copy (at most 2560 px) or the largest resized copy. Each image entry records `resolution` (original: 300, resized: 10, wp-scaled: 47), its `source_url` on the site and the exact `archived_url` it was downloaded from (or, for photos taken from the live site, `retrieved_url`). Every file was checked with Pillow to be a real image. Exact duplicates, and near-duplicates (same picture and same aspect ratio), were removed, keeping the larger file. File names keep the site's file name after an order prefix (`01-`, `02-`, …). The extension is the file's real format: the CDN sometimes served JPEG data under a `.webp` URL, and such files are saved as `.jpg`.

## Layout

```
products/
  index.json                      list of all products (slug, category, name fa/en, type, origin, image/texture counts, path)
  <slug>/product.json             one product (fields below)
  <slug>/images/NN-<file>         product images in order: main slab image(s), listing image(s), project photos
  <slug>/textures/NN-<file>       the site's "Texture Download" file(s) (full slab surface)
  _legacy/legacy-catalogue.json   products of the 2018 / 2019-2021 / 2021-2023 site versions (names only)
```

`product.json` fields: `slug`, `category` (`domestic` / `imported` / `quarry`) + `category_label`, `name` {fa, en}, `description` {fa, en}, `specs` {fa: {…}, en: {…}}, `urls` {fa: [...], en: [...]} (current URL first, then former URLs), `images` [{file, source_url, archived_url, alt, alt_fa, kind, width, height, resolution, …}], `textures` [{file, source_url, original_filename, archived_url, …}], `translated` {fa, en}, `translated_fields` (exactly which fields I wrote), `notes`. There are also some extra fields for traceability: `site_names` (the name exactly as each site shows it), `site_post_ids`, `site_dates`, `listed_in_feb_2026_persian_sitemap`, `projects`, `archived_pages`, `legacy` (older Persian names of the same stone), `missing_images`, `missing_textures`. Project photos taken from the live site also carry `site_title` (the attachment title shown in the lightbox), `retrieved_url` / `retrieved_at` / `retrieved_via`, `site_files` (every URL under which the site shows that photo), `original_upload` (a larger original upload on the site that is not stored), and where relevant `replaces` (the earlier, smaller file it replaced) or `also_shown_for` (another stone whose project page shows the same photo).

Specs keys: Persian `نوع` (type), `کشور مبدا` (country of origin), `رنگ` (colour), `دسته‌بندی` (category); English `Type`, `Origin` (the site's label is misspelled "Orgin"), `Colour`, `Category`. Colour comes from the site's hidden WooCommerce colour attribute (terms black / blue / cream / green / grey / white / pink). It exists only for products whose REST record was archived.

## What the site does and does not provide

* It provides, per product: a Latin trade name (shown in Latin on the Persian pages as well), stone type, country of origin, category (Domestic / Imported, "داخلی" / "وارداتی"), the colour attribute, a listing image (`…-p`), a main slab image (`…-m`), a "Texture Download" file and, for some products, a project gallery.
* **No product descriptions.** The WooCommerce description field holds the placeholder `توضیح محصول توضیح محصول …`, and the short description is one generic paragraph about quartzite ("Quartzite is a hard, non-foliated metamorphic rock …") repeated on all products, granites included. `description` is therefore `null` for all catalogue products. The only real bilingual text is the Quarry page (`natanz-white-granite-rijen`), included verbatim.
* **No dimensions, thickness, finish or technical values** (density, water absorption, …) for any product. Older site versions had only generic text: a granite paragraph with density 2.75 g/cm³ (2019-2021) and a features/applications icon template (2021-2023). Both are identical on every product and kept in `_legacy/legacy-catalogue.json`.
* Every product page shows the same site-wide block, which may be useful for the new catalogue. English: "Beautifully Strong — For a Polished Surface that Lasts — Granite is a type of igneous stone and is made from magma slowly cooling underground. It is one the strongest building materials in the world and can be used in facades, floors, walls, kitchen countertops and more. Behkooshan Stone Processing Company is the first Iranian factory to manufacture Granite slabs using cutting-edge technology." Persian: «برای یک سطح صیقلی که دوام دارد — گرانیت نوعی سنگ آذرین است و از ماگمایی که به آرامی در زیر زمین سرد می شود ساخته می شود. این یکی از قوی ترین مصالح ساختمانی در جهان است و می تواند در نما، کف، دیوار، میز آشپزخانه و غیره استفاده شود. شرکت فرآوری سنگ بهکوشان اولین کارخانه ایرانی است که اسلب گرانیت را با استفاده از تکنولوژی روز تولید می کند.»

## What I translated (flagged in `translated` / `translated_fields`)

* **Persian names.** The current site writes every product name only in Latin letters, including on its Persian pages. `name.fa` is my Persian-script transliteration, and the Latin name as the site shows it is in `site_names`. When an older version of the site had a Persian name for the same stone, it is kept verbatim in `legacy.names_fa` (for example «ابسلوت بلک», «مالیبورد», «بیلویدیری»), so the brand's historic spelling can be chosen instead.
* **Persian colour labels** (the site stores only the English attribute terms).
* **Persian spec values** where the Persian page showed English words (for example `Granite` / `Brazil` on 2025-2026 Persian pages), or where the product was archived only on the English site (13 products: `cohiba`, `dolce-vita`, `elegant-brown`, `gando`, `grand-antique`, `green-shadow`, `jeriba-blue`, `kosmus-gold`, `milky-way`, `nysa`, `purple-rain`, `river-stone`, `venetian-granite`).
* **English spec values** where the product was archived only on the Persian site (2 products: `cristallo-rosa`, `mozzarella`). The Persian site shows the Latin name, so English names always come from the site.
* In `_legacy/legacy-catalogue.json`: English versions of the old features/applications template and of the generic 2019-2021 granite text.

Persian text taken from the site (spec values, category labels, the Quarry page, older names) is kept exactly as written, including the site's own spellings such as «اکراین» and «آندومدا».

## Decisions worth knowing

* Renamed or duplicated products were merged, with each product's `notes` explaining why: `kojin` (formerly Nehbandan), `lumix-wow` (New Lumix Wow), `emerald-quartzite` (Emerald Green), `black-zebra` (Zebra), `platinum` (Platinium), `t-rex` (two posts both named "T.Rex"), `river-noire` (fa `river-noir` = en `river-noire`). All old URLs are listed in `urls`.
* Slugs follow the product name where the site's URL is misleading or misspelled: `copper-dune` (site URL `/product/elegant-brown/`), `elegant-brown` (site URL `/product/elegant-brown-2/`), `patagonia-original`, `patagonia-tourmaline`, `quartzite-levanto`, `lemurian-labradorite`, `oyster-quartz`, `patagonia-a`.
* Where the two language sites (or older and newer captures) disagree on type, origin, colour or category, each language keeps its own site's latest value and the conflict is written into `notes`. The top-level `category` follows the origin when the sites disagree. The category listing pages cannot be used here, because every category page shows the same unfiltered grid.
* Products no longer in the Feb 2026 Persian sitemap are kept, since they were on the site in 2025; check `listed_in_feb_2026_persian_sitemap`. The English site also had products that the archived Persian sitemap does not list (for example `river-stone`).

## What could not be retrieved

* **Live site:** unreachable directly, reached on 2026-09-24 through Google Translate's website proxy (`behkooshan-ir.translate.goog`, `fa-behkooshan-ir.translate.goog`), which serves the site's own, untranslated HTML and files. Every product, the Quarry page, the media library, every texture download and every project page were read that way; see LIVE-SYNC.md for the method and the full list of changes. 12 texture links (6 products, both sites) could not be relayed by the proxy and are in `missing_textures`.
* **Products with no archived product page in either language** (data taken only from product cards: name, type, origin, one listing image): `bubble-gray`, `cristallo-rosa`, `dolce-vita`, `elegant-brown`, `grand-antique`, `jeriba-blue`, `mozzarella`, `nysa`, `quartzite-levanto`, `river-noire`, `river-stone`, `venetian-granite`. All of them were read live on 2026-09-24 (LIVE-SYNC.md). **`black-tempest`** was known only from its URL in the Feb 2026 sitemaps; the live site shows it as Black Fantasy renamed and moved, and its record now comes from there.
* **Products without any image:** none since 2026-09-24.
* **Images referenced by the site but never archived:** 33, all project photos; all 33 were retrieved from the live site on 2026-09-24, so every `missing_images` list is now empty.
* **Textures:** * **Textures:** 94 products have their "Texture Download": 66 separate files, 36 pointing to a product image file. 9 products still have links in `missing_textures` that could not be fetched: the Wayback Machine never archived them and the translate proxy cannot relay them (LIVE-SYNC.md).tos:** most images of the project galleries were never archived. They were taken from the live site instead (2026-09-24): every gallery photo of the live project pages is now in the stone's `images` as `kind: "project"`, including the one Calacatta Viola photo, attached once the live sync had added that stone. Where the original upload is over 2560 px or 3 MB, the site's `-scaled` copy is stored and the original is recorded in `original_upload`; two Jacaranda originals are also over the proxy's 15 MB limit, so their size comes from the JPEG header. See PROJECTS.md.
* **Descriptions, dimensions, thickness, finish, technical values:** not published on the site.
