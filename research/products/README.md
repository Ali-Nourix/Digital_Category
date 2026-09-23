# Behkooshan (به‌کوشان) — product data

Product data of **Behkooshan Stone Processing Company** (شرکت فرآوری سنگ به‌کوشان), collected from its website
<https://behkooshan.ir> (English) and <https://fa.behkooshan.ir> (Persian) for reuse in a new product catalogue.

* Collected on **2026-09-23**. Site content dates from captures made between June 2025 and February 2026 (current site), plus older site versions for reference.
* **94 products** (93 catalogue products + the "Quarry" page, `natanz-white-granite-rijen`), **208 product images** and the site's texture download for **38 products**: 29 separate texture files, and for 9 products the texture is byte-identical to the main image and points to it. In total 237 image files, 36.3 MB.
* Categories: unknown 1, domestic 34, imported 58, quarry 1. Stone types (as shown on the site): Granite 76, Marble 5, Miscellaneous 1, unknown 1, Quartzite 11. The one "unknown" is `black-tempest`, see below.

## Where the data came from

The live site could not be reached from the collection environment: `behkooshan.ir`, `www.`, `fa.` and `en.behkooshan.ir` reset every HTTPS connection, and plain HTTP returned `503 upstream connect error … connection timeout`. That is typical of Iranian hosting that drops foreign traffic. The site's image CDN (`es55asecvav.exactdn.com`) no longer resolves. Everything was therefore recovered from the **Internet Archive Wayback Machine** using its raw `id_` endpoints:

* product sitemaps (`/product-sitemap.xml`: English Jun + Jul 2025, Persian Jun + Jul 2025 and 19 Feb 2026);
* every archived capture of every product page on both language sites (`/product/<slug>/`), 2025-06 … 2026-02;
* the WordPress REST records `/wp-json/wp/v2/product/<id>`, which carry the WooCommerce colour, stone-type and category attributes;
* product cards in the listing and "related products" grids of all archived pages, for products whose own page was not archived;
* project pages (`/projects/<slug>/` fa, `/_project/<slug>/` en) with installation photos;
* the "Texture Download" files (`/?jet_download=<hash>`); the archived response headers give the original file name;
* older versions of the site (2018, 2019-2021, 2021-2023), used only for reference, in `_legacy/legacy-catalogue.json` and in each product's `legacy` block.

The WooCommerce Store API (`/wp-json/wc/store/v1/products`) and the REST list endpoints (`/wp-json/wp/v2/product?per_page=…`, `/wp-json/wp/v2/media`) were never archived, so they could not be used. No other public mirror or cache of the site was reachable either (archive.today resets the connection).

Images: for every image the original upload was requested, with WordPress size suffixes such as `-300x221` stripped. If the original had not been archived, the largest archived version was taken instead: the WordPress `-scaled` copy (at most 2560 px) or the largest resized copy. Each image entry records `resolution` (original: 188, resized: 10, wp-scaled: 10), its `source_url` on the site and the exact `archived_url` it was downloaded from. Every file was checked with Pillow to be a real image. Exact duplicates, and near-duplicates (same picture and same aspect ratio), were removed, keeping the larger file. File names keep the site's file name after an order prefix (`01-`, `02-`, …). The extension is the file's real format: the CDN sometimes served JPEG data under a `.webp` URL, and such files are saved as `.jpg`.

## Layout

```
products/
  index.json                      list of all products (slug, category, name fa/en, type, origin, image/texture counts, path)
  <slug>/product.json             one product (fields below)
  <slug>/images/NN-<file>         product images in order: main slab image(s), listing image(s), project photos
  <slug>/textures/NN-<file>       the site's "Texture Download" file(s) (full slab surface)
  _legacy/legacy-catalogue.json   products of the 2018 / 2019-2021 / 2021-2023 site versions (names only)
```

`product.json` fields: `slug`, `category` (`domestic` / `imported` / `quarry`) + `category_label`, `name` {fa, en}, `description` {fa, en}, `specs` {fa: {…}, en: {…}}, `urls` {fa: [...], en: [...]} (current URL first, then former URLs), `images` [{file, source_url, archived_url, alt, alt_fa, kind, width, height, resolution, …}], `textures` [{file, source_url, original_filename, archived_url, …}], `translated` {fa, en}, `translated_fields` (exactly which fields I wrote), `notes`. There are also some extra fields for traceability: `site_names` (the name exactly as each site shows it), `site_post_ids`, `site_dates`, `listed_in_feb_2026_persian_sitemap`, `projects`, `archived_pages`, `legacy` (older Persian names of the same stone), `missing_images`, `missing_textures`.

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

* **Live site:** unreachable (see above), so anything published after the last Wayback captures (Feb 2026) is missing.
* **Products with no archived product page in either language** (data taken only from product cards: name, type, origin, one listing image): `bubble-gray`, `cristallo-rosa`, `dolce-vita`, `elegant-brown`, `grand-antique`, `jeriba-blue`, `mozzarella`, `nysa`, `quartzite-levanto`, `river-noire`, `river-stone`, `venetian-granite`. **`black-tempest`** is known only from its URL in the Feb 2026 sitemaps: no name, specs or images were archived, and its name is derived from the URL.
* **Products without any image:** `black-tempest`.
* **Images referenced by the site but never archived:** 33 (listed per product in `missing_images`), mostly project photos.
* **Textures:** 38 products have their "Texture Download" file. For 42 products the product page links a texture download (`/?jet_download=<hash>`) that the Wayback Machine never archived; the unarchived links are in `missing_textures`: `bellatrix`, `black-horse`, `casper`, `cohiba`, `colonial`, `dalmata`, `dark-golden-lightning`, `delicate`, `elegant-green`, `emerald-quartzite`, `evolution-green`, `gando`, `infinity-gold`, `jasmin`, `jet-black`, `kojin`, `kosmus-gold`, `lemurian-labradorite`, `lumix-wow`, `magma-gold`, `malibu-red`, `mercury-black`, `meteorus`, `midnight-gray`, `milky-way`, `naica-quartzite`, `native-black`, `negresco`, `new-galaxy`, `new-patagonia`, `oyster-quartz`, `patagonia-green`, `patagonia-pink`, `patagonia-tourmaline`, `purple-rain`, `river-blanche`, `serpentine`, `silver-fusion`, `taj-mahal`, `titanium-mc`, `verde-imperial`, `via-lattea`. For 13 products no texture link is known, because none of their product pages were archived: `black-tempest`, `bubble-gray`, `cristallo-rosa`, `dolce-vita`, `elegant-brown`, `grand-antique`, `jeriba-blue`, `mozzarella`, `nysa`, `quartzite-levanto`, `river-noire`, `river-stone`, `venetian-granite`. Every archived texture belongs to a product, so no `_textures/` folder was needed.
* **Project photos:** most images of the project galleries (`/projects/<slug>/`) were never archived; the archived ones are included as `kind: "project"`.
* **Descriptions, dimensions, thickness, finish, technical values:** not published on the site.
