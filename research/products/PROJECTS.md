# Project photos — the site's "Projects" section

Status **2026-09-24**. The site has a Projects section (English `https://behkooshan.ir/_project/`, Persian `https://fa.behkooshan.ir/projects/`) in which each project page shows photos of one stone in use (kitchens, bathrooms, floors, facades). This file records where every one of those photos came from, which stone it is attached to and why.

**Source of truth: the live site, read on 2026-09-24.** The first pass (2026-09-23 and the morning of 2026-09-24) used only the Wayback Machine; its evidence is kept at the end of this file. After that, the live site became reachable through Google Translate's website proxy, and the live pages replaced the archive as the source.

## Totals

| | Before (Wayback only) | Now (live site) |
|---|---|---|
| Project pages known | 11 English + 8 Persian archived; 12 more known only from listing cards; 18 more only from the Persian project sitemap | **40 English + 40 Persian**, all read live (41 projects by title) |
| Gallery entries on the project pages | 41 English + 24 Persian in the archived pages | 168 English + 174 Persian = 342 |
| Distinct photos in the galleries | — | **170** (en/fa copies and duplicate uploads merged) |
| Project photos in `images` (`kind: "project"`) | **22** in 21 products | **171** in 39 products |
| Photos listed in `missing_images` | **33** | **0** |

* **Recovered now: 149 new project photos**, plus **7 existing ones replaced**: 2 by a larger `-scaled` copy (Evolution Green `Northgolestan_project_9`, Patagonia Original `IMG_3170-2`: 1920 → 2560 px wide) and 5 by the site's own file of the same size, where the Wayback copy was the CDN's re-encoded copy (Belvedere, Jacaranda, Patagonia Black, River Noire, T.Rex). **14 existing project photos are unchanged**: for 10 the live site serves byte-identical files; for 4 (Black Horse `Black-Horse-2`, Infinity Gold `42`, Negresco `35-final`, Nysa `62`) the site also has a 3000 px original, which is recorded in `original_upload` but not stored.
* All **33** `missing_images` entries are resolved: 31 became new files, and 2 turned out to be the same picture as a file that was already there (Jacaranda `2-2.jpg` = `03-2-1-scaled.jpg`; `Verde-Karzai-project1.jpeg` = Verde Fantastic `03-Verde-Karzai-project1-1.jpeg`).
* **Still missing: none.** The single photo of the new **Calacatta Viola** project was attached once the live sync (LIVE-SYNC.md) had added that stone.
* Nothing was removed: every project photo that was in the data is still in a live gallery, except `jeriba-blue/images/03-2338-038-2048x1141.jpg`, which never was a gallery photo (it is the Jeriba Blue project's featured image, a slab close-up); it is kept as it was.
* Size: to keep the repository light, a photo is stored as the site's own `-scaled` copy (at most 2560 px on the long edge) whenever the original upload is larger than 2560 px or 3 MB; the original's URL, pixel size, byte size and SHA-1 are kept in the entry's `original_upload` (50 photos), so it can be fetched later. Originals of at most 2560 px and 3 MB are stored as they are. The catalogue pipeline (`tools/derive-products.py`) never uses more than 1600 px. The 149 new files are 24.5 MB and the replacements add 0.5 MB; image and texture files in `research/products/` now total **61.3 MB** (was 36.3 MB), the whole folder 62.3 MB.

## Where on the site these photos are

* **Listing pages** `/_project/` and `/projects/` (post types `_project` and `projects`), 10 projects per page, 4 pages each (`/page/2/` … `/page/4/`; the listing says `found_posts: 40`). They are an Elementor archive template with a JetEngine **Listing Grid** (listing 5845 English, 6076 Persian). Each card shows the project's featured image as an `<img>` (a slab or listing image of the stone, already in the product data) and one gallery photo as the CSS `background-image` of the card.
* **Project pages** `/_project/<slug>/` and `/projects/<slug>/` use one Elementor single-post template (5839 English, 6010 Persian): breadcrumb, a heading with the project title, and one Elementor Pro **Gallery** widget (`data-widget_type="gallery.default"`, grid layout, links to the file, lightbox). Each photo is `<a class="e-gallery-item" href="<full-size URL>" data-elementor-lightbox-title="<attachment title>" data-e-action-hash="#elementor-action:action=lightbox&settings=<base64 {id, url}>">` around `<div class="e-gallery-image" data-thumbnail="<same URL>" data-width=… data-height=…>`. There is no `srcset`, `data-src`, `noscript` copy or JSON gallery; the `href` is the `-scaled` copy or the original file. The page has no other text, no link to a product and no visible tag; the only naming is the title (the same on the listing card), the slug, the featured image and the file names.
* The English and Persian sites are separate WordPress installations with separate uploads. The same photo usually exists on both, often under a different name or size (for example English `54-scaled.jpg` 1440×1080 with the original `54.jpg` 3000×2250, Persian `54.jpg` 1440×1080). In the February 2026 captures the English pages served images from the ExactDN CDN (`es55asecvav.exactdn.com`); the live pages link `behkooshan.ir/wp-content/uploads/` directly.

## Rule used to tie a photo to a stone

1. A photo belongs to the stone of the **project page whose gallery shows it**. The project is identified by its **title**; the slug, and the featured image when it is one of that product's own slab or listing images, confirm it (given per page below). For 37 of the 41 projects, title, slug and product name agree.
2. Exceptions, resolved by the title: Persian `/projects/jeiba-blue/` (slug typo) is titled "Jeriba Blue" → `jeriba-blue`. English `/_project/verde-karzai/` is titled "Verde Fantastic", and Persian `/projects/verde-karzai/` ("Verde Karzai") shows the same photos as `/projects/verde-fantastic/` → all attached to `verde-fantastic` (see "Uncertain"). "Calacatta Viola" → `calacatta-viola`, attached after the live sync added the stone.
3. Card backgrounds on the listing pages are not used to assign stones: the Persian Tropical Storm card shows a Naica Quartzite photo (`Naica-Quartzite-project2.jpg`), which is a site mistake.
4. **Same photo**: two files are the same picture when their 256-bit difference hash differs in at most 12 bits and their aspect ratios differ by at most 2 %. Within a stone the English and Persian copies, and duplicate uploads such as `IMG_1579.jpg` / `IMG_1579-1.jpg`, are merged and the file with the most pixels is kept (ties: original upload before `-scaled`, JPEG before WebP, larger file). Every pair treated as different was at least 17 bits apart (the closest are two renders of the same kitchen with different stones: Negresco `36-final.jpg` and Nysa `58.jpg`).
5. **Which copy is stored**: for every gallery URL the unsuffixed original was requested as well (`-scaled` stripped), and for `.webp` URLs also `.jpg`/`.jpeg`, so the largest file of each photo is known. If that original is at most 2560 px on the long edge and at most 3 MB it is stored; otherwise the largest copy of at most 2560 px is stored (ties: the file already in the data, then a `-scaled` copy, then JPEG, then the larger file), and the original is recorded in `original_upload`. Every file was opened with Pillow; the extension is the real format.

## How the files were fetched

* Pages: `https://behkooshan-ir.translate.goog/<path>?_x_tr_sl=fa&_x_tr_tl=en&_x_tr_hl=en` (Persian site: `fa-behkooshan-ir.translate.goog`). The visible text is machine-translated, but the markup, titles in Latin letters and all URLs are intact. Links in the pages point back to the proxy and were mapped back to the site URLs.
* Images: the same proxy on `/wp-content/uploads/<file>`. It returns the site's own bytes: `fa.behkooshan.ir/wp-content/uploads/62.jpg` came back with SHA-1 `3e4740e7…`, identical to the Wayback copy, and so did the 10 existing project photos that are kept unchanged. The proxy **cuts responses off at 15,728,209 bytes** and does not support range requests: the English originals of Jacaranda `1-2.jpg` and `2-1.jpg` are larger, so the 720×1080 copies were used (`1-2.jpg` from the Persian site, `2-1-scaled.jpg`); the originals' pixel sizes (4672×7008 and 5300×7946) were read from the JPEG headers and are in `original_upload` with `bytes: null`.
* New and replaced entries have `archived_url: null` and record `retrieved_url` (the proxy URL), `retrieved_at` (UTC), `retrieved_via`, `site_title` (the lightbox title), `site_files` (every URL under which the site shows the photo), `original_upload` (the larger original upload that is not stored: URL, width, height, bytes, SHA-1), and where relevant `replaces` (the previous file, with its Wayback URL) or `also_shown_for`. `alt`/`alt_fa` follow the existing project images ("<Name> – project gallery image (installation photo or slab shown in the site's Projects section)" / "<نام> – تصویر بخش پروژه‌های سایت"). `seen_on` lists every project page (and listing card) that shows the photo; `project_page` is the English page when there is one.
* Also changed in the product files: `projects` now lists every live project page of the stone (17 products had none), null titles were filled from the live pages, `missing_images` entries that were recovered were removed, and stale notes ("N image(s) … not archived and are missing", Black Tempest "no images", the two Verde notes) were rewritten; three notes were added for the uncertain cases below. `index.json` `image_count` was updated. No other field was changed.

## Project → stone

Every live project, the stone its photos are attached to, and the number of distinct photos in its galleries (English and Persian merged). Page URLs are relative to `https://behkooshan.ir` (English) and `https://fa.behkooshan.ir` (Persian); listing pages read live 2026-09-24 14:30–14:31 UTC.

| Project (as titled on the site) | English page | Persian page | Stone in this data | Photos |
|---|---|---|---|---|
| Absolute Black | `/_project/absolute-black/` | `/projects/absolute-black/` | `absolute-black` | 2 |
| Bellatrix | `/_project/bellatrix/` | `/projects/bellatrix/` | `bellatrix` | 2 |
| Belvedere | `/_project/belvedere/` | `/projects/belvedere/` | `belvedere` | 2 |
| Black Diamond | `/_project/black-diamond/` | `/projects/black-diamond/` | `black-diamond` | 6 |
| Black Horse | `/_project/black-horse/` | `/projects/black-horse/` | `black-horse` | 3 |
| Black Tempest | `/_project/black-tempest/` | `/projects/black-tempest/` | `black-tempest` | 6 |
| Black Zebra | `/_project/black-zebra/` | `/projects/black-zebra/` | `black-zebra` | 10 |
| Calacatta Viola | `/_project/calacatta-viola/` | `/projects/calacatta-viola/` | calacatta-viola | 1 |
| Casper | `/_project/casper/` | `/projects/casper/` | `casper` | 10 |
| Copper Dune | `/_project/copper-dune/` | `/projects/copper-dune/` | `copper-dune` | 3 |
| Elegant Brown | `/_project/elegant-brown/` | `/projects/elegant-brown/` | `elegant-brown` (1 photo shared with Naica Quartzite) | 4 |
| Emerald Quartzite | `/_project/emerald-quartzite/` | `/projects/emerald-quartzite/` | `emerald-quartzite` | 2 |
| Evolution Green | `/_project/evolution-green/` | `/projects/evolution-green/` | `evolution-green` | 5 |
| Gando | `/_project/gando/` | `/projects/gando/` | `gando` | 4 |
| Infinity Gold | `/_project/infinity-gold/` | `/projects/infinity-gold/` | `infinity-gold` | 3 |
| Jacaranda | `/_project/jacaranda/` | `/projects/jacaranda/` | `jacaranda` | 2 |
| Jeriba Blue | `/_project/jeriba-blue/` | `/projects/jeiba-blue/` (slug typo) | `jeriba-blue` | 3 |
| Lemurian Labradorite | `/_project/lemurian-labradorite/` | `/projects/lemurian-labradorite/` | `lemurian-labradorite` | 3 |
| Lumix Wow | `/_project/lumix-wow/` | `/projects/lumix-wow/` | `lumix-wow` | 1 |
| Malibu Red | `/_project/malibu-red/` | `/projects/malibu-red/` | `malibu-red` | 4 |
| Meteorus | `/_project/meteorus/` | `/projects/meteorus/` | `meteorus` | 4 |
| Milky Way | `/_project/milky-way/` | `/projects/milky-way/` | `milky-way` | 1 |
| Naica Quartzite | `/_project/naica-quartzite/` | `/projects/naica-quartzite/` | `naica-quartzite` (1 photo shared with Elegant Brown) | 10 |
| Negresco | `/_project/negresco/` | `/projects/negresco/` | `negresco` | 8 |
| New Patagonia | `/_project/new-patagonia/` | `/projects/new-patagonia/` | `new-patagonia` | 4 |
| Nysa | `/_project/nysa/` | `/projects/nysa/` | `nysa` | 9 |
| Patagonia Black | `/_project/patagonia-black/` | `/projects/patagonia-black/` | `patagonia-black` | 2 |
| Patagonia Original | `/_project/patagonia-original/` | `/projects/patagonia-original/` | `patagonia-original` | 3 |
| Platinum | `/_project/platinum/` | `/projects/platinum/` | `platinum` | 3 |
| Purple Rain | `/_project/purple-rain/` | `/projects/purple-rain/` | `purple-rain` | 12 |
| River Noire | `/_project/river-noire/` | — | `river-noire` | 3 |
| Sanded White | `/_project/sanded-white/` | `/projects/sanded-white/` | `sanded-white` | 8 |
| T.Rex | `/_project/t-rex/` | `/projects/t-rex/` | `t-rex` | 6 |
| Titanium MC | `/_project/titanium-mc/` | `/projects/titanium-mc/` | `titanium-mc` | 2 |
| Tropical Storm | `/_project/tropical-storm/` | `/projects/tropical-storm/` | `tropical-storm` | 3 |
| Turquoise | `/_project/turquoise/` | `/projects/turquoise/` | `turquoise` | 4 |
| Venetian Granite | `/_project/venetian-granite/` | `/projects/venetian-granite/` | `venetian-granite` | 4 |
| Verde Fantastic | `/_project/verde-karzai/` (slug says Karzai) | `/projects/verde-fantastic/` | `verde-fantastic` | 6 |
| Verde Imperial | `/_project/verde-imperial/` | `/projects/verde-imperial/` | `verde-imperial` | 2 |
| Verde Karzai | — | `/projects/verde-karzai/` | photos → `verde-fantastic` (same 5 photos as Verde Fantastic); page listed under `verde-karzai` | 5 |
| Volga Blue | `/_project/volga-blue/` | `/projects/volga-blue/` | `volga-blue` | 1 |

## Uncertain — needs the owner's decision

1. **Verde Fantastic / Verde Karzai.** The five photos `Verde-Karzai-project.jpeg`, `…project1…4.jpeg` appear on three live pages: English `/_project/verde-karzai/` (titled **"Verde Fantastic"**, featured image `Verde-Fantastic-p.jpg`, plus `Verde-Fantastic.jpeg`), Persian `/projects/verde-fantastic/` (**"Verde Fantastic"**, re-uploaded as `Verde-Karzai-project*-1.jpeg`, plus `Verde-Fantastic.jpeg`) and Persian `/projects/verde-karzai/` (**"Verde Karzai"**, featured image `verde-Karzai-p.jpg`, the original uploads). They are attached to **`verde-fantastic`** because two of the three pages name Verde Fantastic, the English site kept only that project, and the stone in the photos (mid-green with thin white veins) looks like the Verde Fantastic slab and not the Verde Karzai slab (dark blue-green with golden veins). The file names and the Persian "Verde Karzai" page point the other way. `verde-karzai` therefore has no project photos; both products have a note.
2. **Elegant Brown / Naica Quartzite.** One photo (a real photograph of a kitchen corridor with a light, veined floor) is in the Elegant Brown gallery in both languages as `Elegant-Brown-pr2.webp` (1708×2560) and in the Persian Naica Quartzite gallery as `PR_1816-HDR-scaled.jpg` (original `PR_1816-HDR.jpg`, 5269×7899). It is attached to **both** products, stored in both as the largest copy of at most 2560 px, which is the Elegant Brown file `Elegant-Brown-pr2.webp` (so the Naica file is named `12-Elegant-Brown-pr2.webp`); `original_upload` points to `PR_1816-HDR.jpg`, and `also_shown_for` and a note flag it, because the photo alone does not show which stone it is.
3. **Calacatta Viola** is a new project on both live sites (`/_project/calacatta-viola/`, `/projects/calacatta-viola/`, 1 photo: `https://behkooshan.ir/wp-content/uploads/Calacatta-Viola-1.webp`, WebP 640×1080, 84 KB; the Persian page has the same file). The live site also has a product page `/product/calacatta-viola/`; the live sync added it as `calacatta-viola`, and the photo is attached there as `images/02-Calacatta-Viola-1.webp` (identical on both sites).
4. **Persian Tropical Storm card** on `/projects/page/4/` shows the Naica Quartzite photo `Naica-Quartzite-project2.jpg` as its background; the Tropical Storm gallery itself has only Tropical Storm photos. Treated as a site mistake; nothing was attached from the card.
5. **Jacaranda**: the English originals `1-2.jpg` (4672×7008) and `2-1.jpg` (5300×7946) exist on the site but are larger than the proxy's 15 MB limit, so only the 720×1080 copies were taken; that is enough for the catalogue, and the originals are recorded in `original_upload`.
6. **Jeriba Blue** `03-2338-038-2048x1141.jpg` has `kind: "project"` but is the project's featured image (slab close-up), not an installation photo; left unchanged, noted in the product.
7. **What the photos show.** Many gallery images look like computer-generated interior visualisations rather than photographs of finished buildings (for example the Nysa, T.Rex, Meteorus and Infinity Gold kitchens); others are clearly photographs (for example Patagonia Original `IMG_3035/3040/3170`, Naica Quartzite `PR_*` and `IMG_1579–1581`, Casper `20260103_*_iOS.jpg`, Negresco `WhatsApp-Image-…`, the Venetian Granite facade). The site does not label them, and this was not checked photo by photo.
8. **Black Tempest** now has project photos, but still no slab or listing image. The project's featured image `https://behkooshan.ir/wp-content/uploads/4196X-035-scaled.jpg` is probably its slab; it was not added, because this task covered project photos only.
9. English-only / Persian-only projects: River Noire has only an English project page; the Persian site has Verde Fantastic and Verde Karzai as two projects where the English site has one.

## Per stone

For every stone: its live project pages (English/Persian, title, featured image, number of gallery photos, when they were read, and the Wayback capture if there is one), then every project photo now in `images` with its source URL, size and what changed. Sizes are pixels and file size.

### Absolute Black (`absolute-black`)

- fa https://fa.behkooshan.ir/projects/absolute-black/ — title "Absolute Black", featured image `Absolute-Black-p.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:32:23Z; never archived; its photos are attached here.
- en https://behkooshan.ir/_project/absolute-black/ — title "Absolute Black", featured image `Absolute-Black-p.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:31:23Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-1698175922.jpg` | https://fa.behkooshan.ir/wp-content/uploads/1698175922.jpg | 1801×1080, 159 KB | kept (live file identical) | — |
| `04-1698176110.jpg` | https://fa.behkooshan.ir/wp-content/uploads/1698176110.jpg | 1801×1080, 233 KB | new (live) | — |

Still missing: none.

### Bellatrix (`bellatrix`)

- fa https://fa.behkooshan.ir/projects/bellatrix/ — title "Bellatrix", featured image `Bellatrix.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:32:38Z; never archived; its photos are attached here.
- en https://behkooshan.ir/_project/bellatrix/ — title "Bellatrix", featured image `Bellatrix.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:31:26Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `02-Bellatrix-project.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Bellatrix-project.jpg | 1640×1229, 92 KB | kept (live file identical) | — |
| `03-Bellatrix-project1.jpg` | https://behkooshan.ir/wp-content/uploads/Bellatrix-project1.jpg | 1364×1229, 74 KB | new (live) | — |

Still missing: none.

### Belvedere (`belvedere`)

- fa https://fa.behkooshan.ir/projects/belvedere/ — title "Belvedere", featured image `3776_-025-scaled.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:32:34Z; never archived; its photos are attached here.
- en https://behkooshan.ir/_project/belvedere/ — title "Belvedere", featured image `3776_-025-scaled.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:31:24Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `04-Belvedere-1-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/Belvedere-1-scaled.jpg | 1440×1080, 141 KB | replaced 04-Belvedere-1-scaled.jpg (1440×1080, Wayback) — the site's own file instead of the CDN copy | `Belvedere-1.jpg` 3000×2250, 3.9 MB |
| `05-Belvedere-02-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Belvedere-02-scaled.jpg | 1440×1080, 186 KB | new (live) | `Belvedere-02.jpg` 3000×2250, 3.9 MB |

Still missing: none.

### Black Diamond (`black-diamond`)

- en https://behkooshan.ir/_project/black-diamond/ — title "Black Diamond", featured image `Black-Diamond-p_11zon.jpg` (one of this product's own images), 5 gallery photo(s); live read 2026-09-24T14:31:28Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/black-diamond/ — title "Black Diamond", featured image `Black-Diamond-m_11zon.jpg` (one of this product's own images), 6 gallery photo(s); live read 2026-09-24T14:32:47Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-3.jpg` | https://behkooshan.ir/wp-content/uploads/3.jpg | 1639×1229, 157 KB | new (live) | — |
| `04-707caca5-dc52-43b8-a8cb-f28b9fdd8542.jpg` | https://behkooshan.ir/wp-content/uploads/707caca5-dc52-43b8-a8cb-f28b9fdd8542.jpg | 720×1080, 73 KB | new (live) | — |
| `05-Black-Diamond-2-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Diamond-2-scaled.jpg | 1440×1080, 221 KB | new (live) | `Black-Diamond-2.jpg` 3000×2250, 4.4 MB |
| `06-Black-Diamond-1-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Diamond-1-scaled.jpg | 1440×1080, 191 KB | new (live) | `Black-Diamond-1.jpg` 3000×2250, 4.2 MB |
| `07-Black-Diamond.jpeg` | https://behkooshan.ir/wp-content/uploads/Black-Diamond.jpeg | 720×1080, 90 KB | new (live) | — |
| `08-2.jpg` | https://fa.behkooshan.ir/wp-content/uploads/2.jpg | 1639×1229, 127 KB | new (live) | — |

Still missing: none.

### Black Horse (`black-horse`)

- fa https://fa.behkooshan.ir/projects/black-horse/ — title "Black Horse", featured image `Black-Horse-p_11zon.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:32:39Z; never archived; its photos are attached here.
- en https://behkooshan.ir/_project/black-horse/ — title "Black Horse", featured image `Black-Horse-p_11zon.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:31:24Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Black-Horse-2-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Horse-2-scaled.jpg | 1440×1080, 172 KB | kept (same file as before) | `Black-Horse-2.jpg` 3000×2250, 3.4 MB |
| `04-Black-Horse-1.jpg` | https://behkooshan.ir/wp-content/uploads/Black-Horse-1.jpg | 1920×1229, 109 KB | new (live) | — |
| `05-Black-Horse-3-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Horse-3-scaled.jpg | 1440×1080, 224 KB | new (live) | `Black-Horse-3.jpg` 3000×2250, 4.3 MB |

Still missing: none.

### Black Tempest (`black-tempest`)

- en https://behkooshan.ir/_project/black-tempest/ — title "Black Tempest", featured image `4196X-035-scaled.jpg`, 6 gallery photo(s); live read 2026-09-24T14:31:31Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/black-tempest/ — title "Black Tempest", featured image `4196X-035-scaled.jpg`, 5 gallery photo(s); live read 2026-09-24T14:33:07Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `01-Black-Tempest-project.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Tempest-project.jpg | 764×1080, 137 KB | new (live) | — |
| `02-Black-Tempest-project1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Tempest-project1.jpg | 1920×1358, 174 KB | new (live) | — |
| `03-Black-Tempest-project2.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Tempest-project2.jpg | 873×1080, 159 KB | new (live) | — |
| `04-Black-Tempest-project3.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Tempest-project3.jpg | 1920×1358, 206 KB | new (live) | — |
| `05-Black-Tempest-project4.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Tempest-project4.jpg | 720×1080, 119 KB | new (live) | — |
| `06-Black-Tempest-bathroom-2-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/Black-Tempest-bathroom-2-scaled.jpg | 1080×1080, 113 KB | new (live) | `Black-Tempest-bathroom-2.jpg` 3000×3000, 4.7 MB |

Still missing: none.

### Black Zebra (`black-zebra`)

- en https://behkooshan.ir/_project/black-zebra/ — title "Black Zebra", featured image `Zebra-p.jpg`, 10 gallery photo(s); live read 2026-09-24T14:31:27Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/black-zebra/ — title "Black Zebra", featured image `Zebra-m.jpg` (one of this product's own images), 10 gallery photo(s); live read 2026-09-24T14:32:48Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Black-Zebra-p1.jpg` | https://behkooshan.ir/wp-content/uploads/Black-Zebra-p1.jpg | 810×1080, 52 KB | new (live) | — |
| `04-Black-Zebra-p2.jpg` | https://behkooshan.ir/wp-content/uploads/Black-Zebra-p2.jpg | 810×1080, 58 KB | new (live) | — |
| `05-Black-Zebra-p3.jpg` | https://behkooshan.ir/wp-content/uploads/Black-Zebra-p3.jpg | 922×1229, 37 KB | new (live) | — |
| `06-Black-Zebra-p6.jpg` | https://behkooshan.ir/wp-content/uploads/Black-Zebra-p6.jpg | 607×1080, 35 KB | new (live) | — |
| `07-1.jpeg` | https://behkooshan.ir/wp-content/uploads/1.jpeg | 1080×810, 84 KB | new (live) | — |
| `08-2.jpeg` | https://behkooshan.ir/wp-content/uploads/2.jpeg | 810×1080, 84 KB | new (live) | — |
| `09-Black-Zebra-02.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Zebra-02.jpg | 1618×1080, 675 KB | new (live) | — |
| `10-Black-Zebra-04.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Zebra-04.jpg | 1618×1080, 502 KB | new (live) | — |
| `11-Black-Zebra.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Black-Zebra.jpg | 1618×1080, 626 KB | new (live) | — |
| `12-Blak-Zebra-03.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Blak-Zebra-03.jpg | 721×1080, 321 KB | new (live) | — |

Still missing: none.

### Casper (`casper`)

- en https://behkooshan.ir/_project/casper/ — title "Casper", featured image `Casper-p.jpg` (one of this product's own images), 10 gallery photo(s); live read 2026-09-24T14:31:31Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/casper/ — title "Casper", featured image `Casper-p.jpg` (one of this product's own images), 10 gallery photo(s); live read 2026-09-24T14:33:08Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Casper-project.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Casper-project.jpg | 864×1080, 73 KB | new (live) | — |
| `04-Casper-project1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Casper-project1.jpg | 718×1080, 121 KB | new (live) | — |
| `05-Casper-project2.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Casper-project2.jpg | 718×1080, 112 KB | new (live) | — |
| `06-1-1.jpg` | https://behkooshan.ir/wp-content/uploads/1-1.jpg | 1115×743, 373 KB | new (live) | — |
| `07-2.jpg` | https://behkooshan.ir/wp-content/uploads/2.jpg | 1115×743, 60 KB | new (live) | — |
| `08-3-1.jpg` | https://behkooshan.ir/wp-content/uploads/3-1.jpg | 1115×743, 476 KB | new (live) | — |
| `09-4.jpg` | https://behkooshan.ir/wp-content/uploads/4.jpg | 1115×743, 438 KB | new (live) | — |
| `10-20260103_145713528_iOS.jpg` | https://fa.behkooshan.ir/wp-content/uploads/20260103_145713528_iOS.jpg | 1080×1080, 165 KB | new (live) | — |
| `11-20260103_145736128_iOS.jpg` | https://fa.behkooshan.ir/wp-content/uploads/20260103_145736128_iOS.jpg | 1080×1080, 108 KB | new (live) | — |
| `12-20260103_145754929_iOS.jpg` | https://fa.behkooshan.ir/wp-content/uploads/20260103_145754929_iOS.jpg | 1080×1080, 160 KB | new (live) | — |

Still missing: none.

### Copper Dune (`copper-dune`)

- en https://behkooshan.ir/_project/copper-dune/ — title "Copper Dune", featured image `Copper-Dune.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:31:32Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/copper-dune/ — title "Copper Dune", featured image `Copper-Dune.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:33:12Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Copper-Dune-project.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Copper-Dune-project.jpg | 775×1080, 86 KB | new (live) | — |
| `04-Copper-Dune-project1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Copper-Dune-project1.jpg | 1920×1280, 120 KB | new (live) | — |
| `05-Copper-Dune-project2.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Copper-Dune-project2.jpg | 720×1080, 79 KB | new (live) | — |

Still missing: none.

### Elegant Brown (`elegant-brown`)

- en https://behkooshan.ir/_project/elegant-brown/ — title "Elegant Brown", featured image `Elegant-Brown-1.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:31:26Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/elegant-brown/ — title "Elegant Brown", featured image `Elegant-Brown.jpg`, 4 gallery photo(s); live read 2026-09-24T14:32:52Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `02-Elegant-Brown-pr.webp` | https://behkooshan.ir/wp-content/uploads/Elegant-Brown-pr.webp | 2560×1708, 255 KB | new (live) | — |
| `03-Elegant-Brown-pr1.webp` | https://behkooshan.ir/wp-content/uploads/Elegant-Brown-pr1.webp | 2560×1708, 192 KB | new (live) | — |
| `04-Elegant-Brown-pr2.webp` | https://behkooshan.ir/wp-content/uploads/Elegant-Brown-pr2.webp | 1708×2560, 191 KB | new (live) — also on `naica-quartzite` | `PR_1816-HDR.jpg` 5269×7899, 2.3 MB |
| `05-Elegant-Brown-pr3.webp` | https://behkooshan.ir/wp-content/uploads/Elegant-Brown-pr3.webp | 2560×1707, 146 KB | new (live) | — |

Still missing: none.

### Emerald Quartzite (`emerald-quartzite`)

- en https://behkooshan.ir/_project/emerald-quartzite/ — title "Emerald Quartzite", featured image `Emerald-Quartzite-m_11zon.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:31:30Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/emerald-quartzite/ — title "Emerald Quartzite", featured image `emerald_green.jpg`, 2 gallery photo(s); live read 2026-09-24T14:33:03Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Emerald-Quartzite-project.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Emerald-Quartzite-project.jpeg | 1280×960, 84 KB | new (live) | — |
| `04-Emerald-Quartzite-project1.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Emerald-Quartzite-project1.jpeg | 960×1280, 221 KB | new (live) | — |

Still missing: none.

### Evolution Green (`evolution-green`)

- fa https://fa.behkooshan.ir/projects/evolution-green/ — title "Evolution Green", featured image `Evolution-Green-p.jpg` (one of this product's own images), 5 gallery photo(s); live read 2026-09-24T14:32:19Z; never archived; its photos are attached here.
- en https://behkooshan.ir/_project/evolution-green/ — title "Evolution Green", featured image `Evolution-Green-p.jpg` (one of this product's own images), 5 gallery photo(s); live read 2026-09-24T14:31:22Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Northgolestan_project_9-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/Northgolestan_project_9-scaled.jpg | 2560×1709, 401 KB | replaced 03-Northgolestan_project_9-scaled.jpg (1920×1282, Wayback) — larger copy | `Northgolestan_project_9.jpg` 6720×4485, 2.3 MB |
| `04-Modernkitchendesign_1-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/Modernkitchendesign_1-scaled.jpg | 1709×2560, 440 KB | new (live) | `Modernkitchendesign_1.jpg` 4485×6720, 2.6 MB |
| `05-Modernkitchendesign_6-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/Modernkitchendesign_6-scaled.jpg | 2560×2238, 509 KB | new (live) | `Modernkitchendesign_6.jpg` 5533×4837, 2.2 MB |
| `06-Modernkitchendesign_8-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/Modernkitchendesign_8-scaled.jpg | 1709×2560, 411 KB | new (live) | `Modernkitchendesign_8.jpg` 3989×5976, 1.8 MB |
| `07-Northgolestan_project_8-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/Northgolestan_project_8-scaled.jpg | 2560×1708, 399 KB | new (live) | `Northgolestan_project_8.jpg` 6720×4484, 2.0 MB |

Still missing: none.

### Gando (`gando`)

- en https://behkooshan.ir/_project/gando/ — title "Gando", featured image `Gando-1-p.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:31:20Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/gando/ — title "Gando", featured image `Gando-1-p.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:32:05Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Gando-03.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Gando-03.jpg | 563×1000, 26 KB | kept (live file identical) | — |
| `04-Gando-01.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Gando-01.jpg | 614×1080, 82 KB | new (live) | — |
| `05-Gando-02.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Gando-02.jpg | 563×1000, 31 KB | new (live) | — |
| `06-Gando-04.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Gando-04.jpg | 563×1000, 51 KB | new (live) | — |

Still missing: none.

### Infinity Gold (`infinity-gold`)

- en https://behkooshan.ir/_project/infinity-gold/ — title "Infinity Gold", featured image `Infinity-Gold-p.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:31:20Z; Wayback capture 20260227143852; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/infinity-gold/ — title "Infinity Gold", featured image `Infinity-Gold-p.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:32:08Z; Wayback capture 20260225031145; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-42-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/42-scaled.jpg | 1440×1080, 173 KB | kept (same file as before) | `42.jpg` 3000×2250, 3.6 MB |
| `04-43-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/43-scaled.jpg | 1440×1080, 172 KB | new (live) | `43.jpg` 3000×2250, 3.5 MB |
| `05-44-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/44-scaled.jpg | 1440×1080, 197 KB | new (live) | `44.jpg` 3000×2250, 3.9 MB |

Recovered from `missing_images` (2): `43-scaled.jpg` → `04-43-scaled.jpg`, `44-scaled.jpg` → `05-44-scaled.jpg`.

Still missing: none.

### Jacaranda (`jacaranda`)

- en https://behkooshan.ir/_project/jacaranda/ — title "Jacaranda", featured image `Jacaranda-p_11zon.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:31:19Z; Wayback capture 20260226192526; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/jacaranda/ — title "Jacaranda", featured image `Jacaranda-p_11zon.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:31:53Z; Wayback capture 20260225042224; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-2-1-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/2-1-scaled.jpg | 721×1080, 79 KB | replaced 03-2-1-scaled.jpg (721×1080, Wayback) — the site's own file instead of the CDN copy | `2-1.jpg` 5300×7946, > 15 MB |
| `04-1-2.jpg` | https://fa.behkooshan.ir/wp-content/uploads/1-2.jpg | 720×1080, 104 KB | new (live) | `1-2.jpg` 4672×7008, > 15 MB |

Recovered from `missing_images` (2): `1-2-scaled.jpg` → `04-1-2.jpg`, `2-2.jpg` → `03-2-1-scaled.jpg`.

Still missing: none.

### Jeriba Blue (`jeriba-blue`)

- fa https://fa.behkooshan.ir/projects/jeiba-blue/ — title "Jeriba Blue", featured image `2338-038-scaled.jpg`, 3 gallery photo(s); live read 2026-09-24T14:32:27Z; never archived; its photos are attached here.
- en https://behkooshan.ir/_project/jeriba-blue/ — title "Jeriba Blue", featured image `2338-038-scaled.jpg`, 3 gallery photo(s); live read 2026-09-24T14:31:23Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `02-Jeriba-Blue-pr1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Jeriba-Blue-pr1.jpg | 922×1229, 62 KB | kept (live file identical) | — |
| `03-2338-038-2048x1141.jpg` | https://fa.behkooshan.ir/wp-content/uploads/2338-038-2048x1141.jpg | 2048×1141, 416 KB | kept (not in any live gallery) | — |
| `04-Jeriba-Blue-pr.jpg` | https://behkooshan.ir/wp-content/uploads/Jeriba-Blue-pr.jpg | 922×1229, 85 KB | new (live) | — |
| `05-39-final-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/39-final-scaled.jpg | 810×1080, 148 KB | new (live) | `39-final.jpg` 2250×3000, 4.6 MB |

Still missing: none.

### Lemurian Labradorite (`lemurian-labradorite`)

- en https://behkooshan.ir/_project/lemurian-labradorite/ — title "Lemurian Labradorite", featured image `Lemurian-Labradorite.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:31:32Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/lemurian-labradorite/ — title "Lemurian Labradorite", featured image `Lemurian-Labradorite.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:33:16Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Lemurian-Labradorite-project.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Lemurian-Labradorite-project.jpg | 1920×1280, 130 KB | new (live) | — |
| `04-Lemurian-Labradorite-project1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Lemurian-Labradorite-project1.jpg | 1920×1280, 131 KB | new (live) | — |
| `05-Lemurian-Labradorite-project2.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Lemurian-Labradorite-project2.jpg | 1920×1280, 135 KB | new (live) | — |

Still missing: none.

### Lumix Wow (`lumix-wow`)

- en https://behkooshan.ir/_project/lumix-wow/ — title "Lumix Wow", featured image `New-Lumix-wow-m.jpg`, 1 gallery photo(s); live read 2026-09-24T14:31:28Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/lumix-wow/ — title "Lumix Wow", featured image `New-Lumix-wow-p.jpg`, 1 gallery photo(s); live read 2026-09-24T14:32:56Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Lumix.webp` | https://behkooshan.ir/wp-content/uploads/Lumix.webp | 1024×1536, 204 KB | new (live) | — |

Still missing: none.

### Malibu Red (`malibu-red`)

- en https://behkooshan.ir/_project/malibu-red/ — title "Malibu Red", featured image `Malibu-Red-p.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:31:33Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/malibu-red/ — title "Malibu Red", featured image `Malibu-Red-p.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:33:08Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Malibu-Red-project.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Malibu-Red-project.jpg | 1080×720, 70 KB | new (live) | — |
| `04-Malibu-Red-project1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Malibu-Red-project1.jpg | 1080×720, 51 KB | new (live) | — |
| `05-Malibu-Red-02.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Malibu-Red-02.jpeg | 1280×854, 120 KB | new (live) | — |
| `06-Malibu-Red-05.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Malibu-Red-05.jpeg | 1280×854, 106 KB | new (live) | — |

Still missing: none.

### Meteorus (`meteorus`)

- en https://behkooshan.ir/_project/meteorus/ — title "Meteorus", featured image `ChatGPT-Image-Dec-23-2025-10_44_38-AM.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:31:17Z; Wayback capture 20260227022139; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/meteorus/ — title "Meteorus", featured image `Metereous.jpg`, 4 gallery photo(s); live read 2026-09-24T14:31:45Z; Wayback capture 20260225055845; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `02-67.jpg` | https://fa.behkooshan.ir/wp-content/uploads/67.jpg | 810×1080, 162 KB | kept (live file identical) | — |
| `03-60-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/60-scaled.jpg | 1440×1080, 342 KB | new (live) | `60.jpg` 3000×2250, 5.0 MB |
| `04-61-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/61-scaled.jpg | 1440×1080, 232 KB | new (live) | `61.jpg` 3000×2250, 4.5 MB |
| `05-72.jpg` | https://fa.behkooshan.ir/wp-content/uploads/72.jpg | 810×1080, 100 KB | new (live) | — |

Recovered from `missing_images` (3): `60-scaled.jpg` → `03-60-scaled.jpg`, `61-scaled.jpg` → `04-61-scaled.jpg`, `72.jpg` → `05-72.jpg`.

Still missing: none.

### Milky Way (`milky-way`)

- en https://behkooshan.ir/_project/milky-way/ — title "Milky Way", featured image `Milky-Way-scaled.jpg` (one of this product's own images), 1 gallery photo(s); live read 2026-09-24T14:31:18Z; Wayback capture 20260225062813; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/milky-way/ — title "Milky Way", featured image `Milky-Way.jpg` (one of this product's own images), 1 gallery photo(s); live read 2026-09-24T14:31:49Z; Wayback capture 20260225020032; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `02-Milky-Way-1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Milky-Way-1.jpg | 1536×1024, 337 KB | kept (live file identical) | — |

Still missing: none.

### Naica Quartzite (`naica-quartzite`)

- en https://behkooshan.ir/_project/naica-quartzite/ — title "Naica Quartzite", featured image `Naica-Quartzite-m_11zon.jpg` (one of this product's own images), 8 gallery photo(s); live read 2026-09-24T14:31:31Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/naica-quartzite/ — title "Naica Quartzite", featured image `Naica-Quartzite-p_11zon.jpg` (one of this product's own images), 12 gallery photo(s); live read 2026-09-24T14:33:19Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Naica-Quartzite-project.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Naica-Quartzite-project.jpg | 1920×1440, 122 KB | new (live) | — |
| `04-Naica-Quartzite-project1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Naica-Quartzite-project1.jpg | 1920×1440, 120 KB | new (live) | — |
| `05-Naica-Quartzite-project2.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Naica-Quartzite-project2.jpg | 1920×1440, 147 KB | new (live) | — |
| `06-IMG_1579.jpg` | https://fa.behkooshan.ir/wp-content/uploads/IMG_1579.jpg | 694×731, 39 KB | new (live) | — |
| `07-IMG_1580.jpg` | https://fa.behkooshan.ir/wp-content/uploads/IMG_1580.jpg | 717×1080, 110 KB | new (live) | — |
| `08-IMG_1581.jpg` | https://fa.behkooshan.ir/wp-content/uploads/IMG_1581.jpg | 584×867, 44 KB | new (live) | — |
| `09-15-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/15-scaled.jpg | 810×1080, 88 KB | new (live) | `15.jpg` 2250×3000, 3.2 MB |
| `10-16-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/16-scaled.jpg | 810×1080, 92 KB | new (live) | `16.jpg` 2250×3000, 3.5 MB |
| `11-PR_1506-HDR-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/PR_1506-HDR-scaled.jpg | 1619×1080, 153 KB | new (live) | `PR_1506-HDR.jpg` 7920×5283, 1.6 MB |
| `12-Elegant-Brown-pr2.webp` | https://behkooshan.ir/wp-content/uploads/Elegant-Brown-pr2.webp | 1708×2560, 191 KB | new (live) — also on `elegant-brown` | `PR_1816-HDR.jpg` 5269×7899, 2.3 MB |

Still missing: none.

### Negresco (`negresco`)

- fa https://fa.behkooshan.ir/projects/negresco/ — title "Negresco", featured image `Negresco-p.jpg` (one of this product's own images), 8 gallery photo(s); live read 2026-09-24T14:32:31Z; never archived; its photos are attached here.
- en https://behkooshan.ir/_project/negresco/ — title "Negresco", featured image `Negresco-p.jpg` (one of this product's own images), 8 gallery photo(s); live read 2026-09-24T14:31:24Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-35-final-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/35-final-scaled.jpg | 810×1080, 108 KB | kept (same file as before) | `35-final.jpg` 2250×3000, 3.3 MB |
| `04-36-final-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/36-final-scaled.jpg | 1440×1080, 203 KB | new (live) | `36-final.jpg` 3000×2250, 3.3 MB |
| `05-38-final-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/38-final-scaled.jpg | 1440×1080, 201 KB | new (live) | `38-final.jpg` 3000×2250, 3.9 MB |
| `06-37-final-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/37-final-scaled.jpg | 1440×1080, 219 KB | new (live) | `37-final.jpg` 3000×2250, 4.0 MB |
| `07-ba89e198-f5f9-46ed-8629-2821c0eb7269.jpg` | https://behkooshan.ir/wp-content/uploads/ba89e198-f5f9-46ed-8629-2821c0eb7269.jpg | 607×1080, 78 KB | new (live) | — |
| `08-WhatsApp-Image-2025-09-04-at-14.39.09-1.jpeg` | https://behkooshan.ir/wp-content/uploads/WhatsApp-Image-2025-09-04-at-14.39.09-1.jpeg | 720×1080, 96 KB | new (live) | — |
| `09-Negresco-02.jpeg` | https://behkooshan.ir/wp-content/uploads/Negresco-02.jpeg | 1080×720, 70 KB | new (live) | — |
| `10-Negresco.jpeg` | https://behkooshan.ir/wp-content/uploads/Negresco.jpeg | 720×1080, 82 KB | new (live) | — |

Still missing: none.

### New Patagonia (`new-patagonia`)

- en https://behkooshan.ir/_project/new-patagonia/ — title "New Patagonia", featured image `New-Patagonia-p_11zon.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:31:28Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/new-patagonia/ — title "New Patagonia", featured image `New-Patagonia-1.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:32:47Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `04-New-Patagonia-pr.jpg` | https://behkooshan.ir/wp-content/uploads/New-Patagonia-pr.jpg | 1639×1229, 115 KB | new (live) | — |
| `05-New-Patagonia-pr1.jpg` | https://behkooshan.ir/wp-content/uploads/New-Patagonia-pr1.jpg | 1639×1229, 83 KB | new (live) | — |
| `06-New-Patagonia-pr2.jpg` | https://behkooshan.ir/wp-content/uploads/New-Patagonia-pr2.jpg | 1639×1229, 85 KB | new (live) | — |
| `07-New-Patagonia-pr3.jpg` | https://behkooshan.ir/wp-content/uploads/New-Patagonia-pr3.jpg | 1639×1229, 76 KB | new (live) | — |

Still missing: none.

### Nysa (`nysa`)

- en https://behkooshan.ir/_project/nysa/ — title "Nysa", featured image `49031-001-scaled.jpg` (one of this product's own images), 9 gallery photo(s); live read 2026-09-24T14:31:16Z; Wayback capture 20260225050247; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/nysa/ — title "Nysa", featured image `49031-001.jpg` (one of this product's own images), 9 gallery photo(s); live read 2026-09-24T14:31:41Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `02-62.jpg` | https://fa.behkooshan.ir/wp-content/uploads/62.jpg | 1440×1080, 234 KB | kept (same file as before) | `62.jpg` 3000×2250, 3.5 MB |
| `03-54-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/54-scaled.jpg | 1440×1080, 232 KB | new (live) | `54.jpg` 3000×2250, 4.4 MB |
| `04-56-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/56-scaled.jpg | 1440×1080, 215 KB | new (live) | `56.jpg` 3000×2250, 4.1 MB |
| `05-57-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/57-scaled.jpg | 1440×1080, 291 KB | new (live) | `57.jpg` 3000×2250, 4.4 MB |
| `06-58-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/58-scaled.jpg | 1440×1080, 228 KB | new (live) | `58.jpg` 3000×2250, 4.0 MB |
| `07-65-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/65-scaled.jpg | 772×1080, 84 KB | new (live) | `65.jpg` 2143×3000, 3.5 MB |
| `08-68-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/68-scaled.jpg | 1440×1080, 263 KB | new (live) | `68.jpg` 3000×2250, 4.5 MB |
| `09-69-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/69-scaled.jpg | 1440×1080, 206 KB | new (live) | `69.jpg` 3000×2250, 4.6 MB |
| `10-71-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/71-scaled.jpg | 1920×1080, 394 KB | new (live) | `71.jpg` 4000×2250, 8.0 MB |

Recovered from `missing_images` (8): `54-scaled.jpg` → `03-54-scaled.jpg`, `56-scaled.jpg` → `04-56-scaled.jpg`, `57-scaled.jpg` → `05-57-scaled.jpg`, `58-scaled.jpg` → `06-58-scaled.jpg`, `65-scaled.jpg` → `07-65-scaled.jpg`, `68-scaled.jpg` → `08-68-scaled.jpg`, `69-scaled.jpg` → `09-69-scaled.jpg`, `71-scaled.jpg` → `10-71-scaled.jpg`.

Still missing: none.

### Patagonia Black (`patagonia-black`)

- en https://behkooshan.ir/_project/patagonia-black/ — title "Patagonia Black", featured image `Patagonia-Black-p.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:31:25Z; Wayback capture 20260219164936; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/patagonia-black/ — title "Patagonia Black", featured image `Patagonia-Black-p.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:32:42Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Patagonia-Black-1.jpg` | https://behkooshan.ir/wp-content/uploads/Patagonia-Black-1.jpg | 879×1229, 56 KB | replaced 03-Patagonia-Black-1.jpg (879×1229, Wayback) — the site's own file instead of the CDN copy | — |
| `04-Patagonia-Black1.jpg` | https://behkooshan.ir/wp-content/uploads/Patagonia-Black1.jpg | 897×1229, 87 KB | new (live) | — |

Recovered from `missing_images` (1): `Patagonia-Black1.jpg` → `04-Patagonia-Black1.jpg`.

Still missing: none.

### Patagonia Original (`patagonia-original`)

- fa https://fa.behkooshan.ir/projects/patagonia-original/ — title "Patagonia Original", featured image `Patagonia-Orginal-p_11zon.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:32:16Z; never archived; its photos are attached here.
- en https://behkooshan.ir/_project/patagonia-original/ — title "Patagonia Original", featured image `Patagonia-Orginal-p_11zon.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:31:22Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-IMG_3170-2-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/IMG_3170-2-scaled.jpg | 2560×1707, 410 KB | replaced 03-IMG_3170-2-scaled.jpg (1920×1280, Wayback) — larger copy | `IMG_3170-2.jpg` 6720×4480, 14.4 MB |
| `04-IMG_3035-HDR-2-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/IMG_3035-HDR-2-scaled.jpg | 2560×1707, 238 KB | new (live) | `IMG_3035-HDR-2.jpg` 6720×4480, 9.2 MB |
| `05-IMG_3040-HDR-2-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/IMG_3040-HDR-2-scaled.jpg | 2560×1707, 336 KB | new (live) | `IMG_3040-HDR-2.jpg` 6720×4480, 11.5 MB |

Still missing: none.

### Platinum (`platinum`)

- en https://behkooshan.ir/_project/platinum/ — title "Platinum", featured image `platinium1.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:31:30Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/platinum/ — title "Platinum", featured image `platinium1.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:33:06Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Platinum-project.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Platinum-project.jpg | 1130×1080, 195 KB | new (live) | — |
| `04-Platinum-project1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Platinum-project1.jpg | 1920×1437, 225 KB | new (live) | — |
| `05-Platinum-project2.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Platinum-project2.jpg | 721×1080, 115 KB | new (live) | — |

Still missing: none.

### Purple Rain (`purple-rain`)

- en https://behkooshan.ir/_project/purple-rain/ — title "Purple Rain", featured image `Purple-Rain-p_68877951f3fa7_1753708881_compressed.jpg`, 12 gallery photo(s); live read 2026-09-24T14:31:29Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/purple-rain/ — title "Purple Rain", featured image `Purple-Rain-p_68877951f3fa7_1753708881_compressed.jpg`, 12 gallery photo(s); live read 2026-09-24T14:32:56Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Purple-Rain-pr.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Purple-Rain-pr.jpeg | 1199×1600, 76 KB | new (live) | — |
| `04-Purple-Rain-pr1.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Purple-Rain-pr1.jpeg | 809×1080, 66 KB | new (live) | — |
| `05-Purple-Rain-pr2.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Purple-Rain-pr2.jpeg | 809×1080, 91 KB | new (live) | — |
| `06-Purple-Rain-pr3.jpeg` | https://behkooshan.ir/wp-content/uploads/Purple-Rain-pr3.jpeg | 1199×1600, 68 KB | new (live) | — |
| `07-Purple-Rain-pr4.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Purple-Rain-pr4.jpeg | 1199×1600, 86 KB | new (live) | — |
| `08-Purple-Rain.jpeg` | https://behkooshan.ir/wp-content/uploads/Purple-Rain.jpeg | 720×1080, 63 KB | new (live) | — |
| `09-Purple-Rain-01.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Purple-Rain-01.jpg | 476×845, 43 KB | new (live) | — |
| `10-Purple-Rain-02.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Purple-Rain-02.jpg | 563×1000, 47 KB | new (live) | — |
| `11-Purple-Rain-03.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Purple-Rain-03.jpg | 563×1000, 52 KB | new (live) | — |
| `12-1eeb97a9-e598-48e9-9c75-2ca5898ac4eb.jpg` | https://fa.behkooshan.ir/wp-content/uploads/1eeb97a9-e598-48e9-9c75-2ca5898ac4eb.jpg | 720×1080, 97 KB | new (live) | — |
| `13-34bba4e5-74cf-45c5-b4f8-12e08c703464.jpg` | https://fa.behkooshan.ir/wp-content/uploads/34bba4e5-74cf-45c5-b4f8-12e08c703464.jpg | 720×1080, 51 KB | new (live) | — |
| `14-bb0ba710-f9c0-4fe9-946c-faea4c2daf39.jpg` | https://fa.behkooshan.ir/wp-content/uploads/bb0ba710-f9c0-4fe9-946c-faea4c2daf39.jpg | 810×1080, 102 KB | new (live) | — |

Still missing: none.

### River Noire (`river-noire`)

- en https://behkooshan.ir/_project/river-noire/ — title "River Noire", featured image `4643-005-scaled.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:31:21Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-48-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/48-scaled.jpg | 1440×1080, 147 KB | replaced 03-48-scaled.jpg (1440×1080, Wayback) — the site's own file instead of the CDN copy | `48.jpg` 3000×2250, 3.4 MB |
| `04-49-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/49-scaled.jpg | 1440×1080, 193 KB | new (live) | `49.jpg` 3000×2250, 3.7 MB |
| `05-50-scaled.jpg` | https://behkooshan.ir/wp-content/uploads/50-scaled.jpg | 810×1080, 93 KB | new (live) | `50.jpg` 2250×3000, 3.5 MB |

Still missing: none.

### Sanded White (`sanded-white`)

- en https://behkooshan.ir/_project/sanded-white/ — title "Sanded White", featured image `Sanded-White-p.jpg` (one of this product's own images), 8 gallery photo(s); live read 2026-09-24T14:31:27Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/sanded-white/ — title "Sanded White", featured image `Sanded-White-m.jpg` (one of this product's own images), 8 gallery photo(s); live read 2026-09-24T14:32:48Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Sanded-White-p3.jpg` | https://behkooshan.ir/wp-content/uploads/Sanded-White-p3.jpg | 983×1229, 115 KB | new (live) | — |
| `04-Sanded-White-p4.jpg` | https://behkooshan.ir/wp-content/uploads/Sanded-White-p4.jpg | 983×1229, 114 KB | new (live) | — |
| `05-Sanded-White-pr.jpg` | https://behkooshan.ir/wp-content/uploads/Sanded-White-pr.jpg | 1639×1229, 148 KB | new (live) | — |
| `06-Sanded-White-pr1.jpg` | https://behkooshan.ir/wp-content/uploads/Sanded-White-pr1.jpg | 1639×1229, 110 KB | new (live) | — |
| `07-606216c2-be8d-44b7-91ae-860c0e2ca909.jpg` | https://fa.behkooshan.ir/wp-content/uploads/606216c2-be8d-44b7-91ae-860c0e2ca909.jpg | 1920×1080, 223 KB | new (live) | — |
| `08-c7173c40-bd0b-4d99-aca6-b774520a9f51.jpg` | https://behkooshan.ir/wp-content/uploads/c7173c40-bd0b-4d99-aca6-b774520a9f51.jpg | 2560×1440, 320 KB | new (live) | — |
| `09-dea54320-6448-4d62-a5a7-d0ad8f3d80a3.jpg` | https://fa.behkooshan.ir/wp-content/uploads/dea54320-6448-4d62-a5a7-d0ad8f3d80a3.jpg | 1920×1080, 271 KB | new (live) | — |
| `10-f8bef301-3e67-4717-a2a2-af367ba994c5.jpg` | https://fa.behkooshan.ir/wp-content/uploads/f8bef301-3e67-4717-a2a2-af367ba994c5.jpg | 810×1080, 120 KB | new (live) | — |

Still missing: none.

### T.Rex (`t-rex`)

- en https://behkooshan.ir/_project/t-rex/ — title "T.Rex", featured image `3878X1-001-scaled.jpg` (one of this product's own images), 6 gallery photo(s); live read 2026-09-24T14:31:21Z; Wayback capture 20260223212043; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/t-rex/ — title "T.Rex", featured image `3878X1-001-scaled.jpg` (one of this product's own images), 6 gallery photo(s); live read 2026-09-24T14:32:12Z; Wayback capture 20260225151159; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `04-53-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/53-scaled.jpg | 1440×1080, 225 KB | replaced 04-53-scaled.jpg (1440×1080, Wayback) — the site's own file instead of the CDN copy | `53.jpg` 3000×2250, 4.7 MB |
| `05-45-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/45-scaled.jpg | 1920×1080, 382 KB | new (live) | `45.jpg` 4000×2250, 6.8 MB |
| `06-46-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/46-scaled.jpg | 1440×1080, 309 KB | new (live) | `46.jpg` 3000×2250, 5.3 MB |
| `07-47-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/47-scaled.jpg | 810×1080, 168 KB | new (live) | `47.jpg` 2250×3000, 4.9 MB |
| `08-51-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/51-scaled.jpg | 1440×1080, 228 KB | new (live) | `51.jpg` 3000×2250, 4.6 MB |
| `09-52-scaled.jpg` | https://fa.behkooshan.ir/wp-content/uploads/52-scaled.jpg | 1440×1080, 312 KB | new (live) | `52.jpg` 3000×2250, 5.5 MB |

Recovered from `missing_images` (5): `45-scaled.jpg` → `05-45-scaled.jpg`, `46-scaled.jpg` → `06-46-scaled.jpg`, `47-scaled.jpg` → `07-47-scaled.jpg`, `51-scaled.jpg` → `08-51-scaled.jpg`, `52-scaled.jpg` → `09-52-scaled.jpg`.

Still missing: none.

### Titanium MC (`titanium-mc`)

- fa https://fa.behkooshan.ir/projects/titanium-mc/ — title "Titanium MC", featured image `titanium_mc1.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:32:43Z; never archived; its photos are attached here.
- en https://behkooshan.ir/_project/titanium-mc/ — title "Titanium MC", featured image `titanium_mc1.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:31:25Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Titanium-MC1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Titanium-MC1.jpg | 1638×1229, 80 KB | kept (live file identical) | — |
| `04-Titanium-MC.jpg` | https://behkooshan.ir/wp-content/uploads/Titanium-MC.jpg | 922×1229, 44 KB | new (live) | — |

Still missing: none.

### Tropical Storm (`tropical-storm`)

- en https://behkooshan.ir/_project/tropical-storm/ — title "Tropical Storm", featured image `Tropical-Storm-p.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:31:33Z; Wayback capture 20260225130116; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/tropical-storm/ — title "Tropical Storm", featured image `Tropical-Storm-p.jpg` (one of this product's own images), 3 gallery photo(s); live read 2026-09-24T14:33:12Z; Wayback capture 20260227071527; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Tropical-Storm-project.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Tropical-Storm-project.jpg | 1024×683, 50 KB | new (live) | — |
| `04-Tropical-Storm-project1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Tropical-Storm-project1.jpg | 819×1024, 74 KB | new (live) | — |
| `05-Tropical-Storm-project2.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Tropical-Storm-project2.jpg | 819×1024, 45 KB | new (live) | — |

Recovered from `missing_images` (3): `Tropical-Storm-project.jpg` → `03-Tropical-Storm-project.jpg`, `Tropical-Storm-project1.jpg` → `04-Tropical-Storm-project1.jpg`, `Tropical-Storm-project2.jpg` → `05-Tropical-Storm-project2.jpg`.

Still missing: none.

### Turquoise (`turquoise`)

- en https://behkooshan.ir/_project/turquoise/ — title "Turquoise", featured image `turquoise-p.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:31:30Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/turquoise/ — title "Turquoise", featured image `turquoise-p.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:33:03Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `04-Turquoise-01.webp` | https://behkooshan.ir/wp-content/uploads/Turquoise-01.webp | 1024×1024, 108 KB | new (live) | — |
| `05-Turquoise-pr2.jpg` | https://behkooshan.ir/wp-content/uploads/Turquoise-pr2.jpg | 1639×1229, 72 KB | new (live) | — |
| `06-Turquoise-pr3.jpg` | https://behkooshan.ir/wp-content/uploads/Turquoise-pr3.jpg | 1440×1085, 56 KB | new (live) | — |
| `07-Turquoise-pr4.jpg` | https://behkooshan.ir/wp-content/uploads/Turquoise-pr4.jpg | 1440×961, 48 KB | new (live) | — |

Still missing: none.

### Venetian Granite (`venetian-granite`)

- en https://behkooshan.ir/_project/venetian-granite/ — title "Venetian Granite", featured image `4615-007-scaled.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:31:19Z; Wayback capture 20260225052201; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/venetian-granite/ — title "Venetian Granite", featured image `4615-007.jpg` (one of this product's own images), 4 gallery photo(s); live read 2026-09-24T14:31:57Z; Wayback capture 20260225225654; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `02-65fa37d6-0f1c-44d4-86da-5ad830c4cff3.jpg` | https://fa.behkooshan.ir/wp-content/uploads/65fa37d6-0f1c-44d4-86da-5ad830c4cff3.jpg | 810×1080, 192 KB | kept (live file identical) | — |
| `03-0a2b00f0-b8a6-4db7-b9bf-f764b426947e.jpg` | https://fa.behkooshan.ir/wp-content/uploads/0a2b00f0-b8a6-4db7-b9bf-f764b426947e.jpg | 810×1080, 203 KB | new (live) | — |
| `04-3da1f1b3-ef0e-4837-bfab-c665e5cc5920.jpg` | https://fa.behkooshan.ir/wp-content/uploads/3da1f1b3-ef0e-4837-bfab-c665e5cc5920.jpg | 810×1080, 155 KB | new (live) | — |
| `05-5d947982-19cb-4c9a-a2ab-e868d47da9d3.jpg` | https://fa.behkooshan.ir/wp-content/uploads/5d947982-19cb-4c9a-a2ab-e868d47da9d3.jpg | 810×1080, 158 KB | new (live) | — |

Recovered from `missing_images` (3): `0a2b00f0-b8a6-4db7-b9bf-f764b426947e.jpg` → `03-0a2b00f0-b8a6-4db7-b9bf-f764b426947e.jpg`, `3da1f1b3-ef0e-4837-bfab-c665e5cc5920.jpg` → `04-3da1f1b3-ef0e-4837-bfab-c665e5cc5920.jpg`, `5d947982-19cb-4c9a-a2ab-e868d47da9d3.jpg` → `05-5d947982-19cb-4c9a-a2ab-e868d47da9d3.jpg`.

Still missing: none.

### Verde Fantastic (`verde-fantastic`)

- fa https://fa.behkooshan.ir/projects/verde-fantastic/ — title "Verde Fantastic", featured image `Verde-Fantastic-m.jpg` (one of this product's own images), 6 gallery photo(s); live read 2026-09-24T14:32:44Z; never archived; its photos are attached here.
- en https://behkooshan.ir/_project/verde-karzai/ — title "Verde Fantastic", featured image `Verde-Fantastic-p.jpg` (one of this product's own images), 6 gallery photo(s); live read 2026-09-24T14:31:29Z; Wayback capture 20260227050356; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/verde-karzai/ — title "Verde Karzai", featured image `verde-Karzai-p.jpg`, 5 gallery photo(s); live read 2026-09-24T14:32:59Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Verde-Karzai-project1-1.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Verde-Karzai-project1-1.jpeg | 1280×960, 80 KB | kept (live file identical) | — |
| `04-Verde-Karzai-project.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Verde-Karzai-project.jpeg | 960×1280, 80 KB | new (live) | — |
| `05-Verde-Karzai-project2.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Verde-Karzai-project2.jpeg | 960×1280, 110 KB | new (live) | — |
| `06-Verde-Karzai-project3.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Verde-Karzai-project3.jpeg | 1280×960, 88 KB | new (live) | — |
| `07-Verde-Karzai-project4.jpeg` | https://behkooshan.ir/wp-content/uploads/Verde-Karzai-project4.jpeg | 1280×960, 80 KB | new (live) | — |
| `08-Verde-Fantastic.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Verde-Fantastic.jpeg | 721×1080, 196 KB | new (live) | — |

Still missing: none.

### Verde Imperial (`verde-imperial`)

- en https://behkooshan.ir/_project/verde-imperial/ — title "Verde Imperial", featured image `verde-imperial1.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:31:34Z; never archived; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/verde-imperial/ — title "Verde Imperial", featured image `verde-imperial1.jpg` (one of this product's own images), 2 gallery photo(s); live read 2026-09-24T14:33:08Z; never archived; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Verde-Imperial-project.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Verde-Imperial-project.jpg | 1080×720, 52 KB | new (live) | — |
| `04-Verde-Imperial-project1.jpg` | https://fa.behkooshan.ir/wp-content/uploads/Verde-Imperial-project1.jpg | 1080×938, 87 KB | new (live) | — |

Still missing: none.

### Verde Karzai (`verde-karzai`)

- en https://behkooshan.ir/_project/verde-karzai/ — title "Verde Fantastic", featured image `Verde-Fantastic-p.jpg`, 6 gallery photo(s); live read 2026-09-24T14:31:29Z; Wayback capture 20260227050356; its photos are attached to `verde-fantastic`.
- fa https://fa.behkooshan.ir/projects/verde-karzai/ — title "Verde Karzai", featured image `verde-Karzai-p.jpg` (one of this product's own images), 5 gallery photo(s); live read 2026-09-24T14:32:59Z; never archived; its photos are attached to `verde-fantastic`.

No project photos attached here.

Removed from `missing_images` and attached to another stone (6): `Verde-Karzai-project.jpeg` → `verde-fantastic`, `Verde-Karzai-project1.jpeg` → `verde-fantastic`, `Verde-Karzai-project2.jpeg` → `verde-fantastic`, `Verde-Karzai-project3.jpeg` → `verde-fantastic`, `Verde-Karzai-project4.jpeg` → `verde-fantastic`, `Verde-Fantastic.jpeg` → `verde-fantastic`.

Still missing: none.

### Volga Blue (`volga-blue`)

- en https://behkooshan.ir/_project/volga-blue/ — title "Volga Blue", featured image `volga_blue3_tzLE2qZ6YWLcdLJeeEKr.jpg` (one of this product's own images), 1 gallery photo(s); live read 2026-09-24T14:31:19Z; Wayback capture 20260224152759; its photos are attached here.
- fa https://fa.behkooshan.ir/projects/volga-blue/ — title "Volga Blue", featured image `volga_blue3_tzLE2qZ6YWLcdLJeeEKr.jpg` (one of this product's own images), 1 gallery photo(s); live read 2026-09-24T14:32:01Z; Wayback capture 20260225133701; its photos are attached here.

| File | Source URL | Stored | Status | Larger original on the site |
|---|---|---|---|---|
| `03-Volga-Blue.jpeg` | https://fa.behkooshan.ir/wp-content/uploads/Volga-Blue.jpeg | 721×1080, 89 KB | kept (live file identical) | — |

Still missing: none.

## Wayback Machine evidence (first pass, superseded by the live site)

Kept as the record of what the archive had. All requests were raw `id_` or CDX API calls, sequential or two in parallel, retried with 2/4/8/16 s back-off.

* **Projects section, CDX prefix queries (all status codes):** `behkooshan.ir/_project/` → 15 rows: `/_project/` 20260218210243 and 20260226184150, `/_project/page/2/` 20260226233942, `/_project/feed/`, and one capture each of 11 project pages: infinity-gold 20260227143852, jacaranda 20260226192526, meteorus 20260227022139, milky-way 20260225062813, nysa 20260225050247, patagonia-black 20260219164936, t-rex 20260223212043, tropical-storm 20260225130116, venetian-granite 20260225052201, verde-karzai 20260227050356, volga-blue 20260224152759. `fa.behkooshan.ir/projects/` → 12 rows: `/projects/` 20260218210436, `/projects/page/2/` 20260226031813, `/projects/feed/`, `/projects-sitemap.xml` 20260219204010 (39 projects), and 8 project pages: infinity-gold 20260225031145, jacaranda 20260225042224, meteorus 20260225055845, milky-way 20260225020032, t-rex 20260225151159, tropical-storm 20260227071527, venetian-granite 20260225225654, volga-blue 20260225133701. Listing pages 3 and 4 were never archived. `www.` variants return the same rows; `behkooshan.ir/projects/`, `fa.behkooshan.ir/_project/`, `en.behkooshan.ir/_project/` and `en.behkooshan.ir/projects/` return nothing new. The REST records `/wp-json/wp/v2/_project/<id>` (9) and `/wp-json/wp/v2/projects/<id>` (8) contain the title, featured image id and a project category, but no gallery.
* **Older site versions:** `behkooshan.ir/project/` → 160 rows (2018–2020): the 2018 theme's portfolio posts (`/project/مالیبورد/`, `/project/پرشین-ماگما/`, `/project/پرشین-نویر/`, `/project/آبی-فیروزه‌ای/`, `/project/turquoise-granaite/`, `-2/`, `/project/verde-fantastico/`, `/project/miniature/`, `/project/شماره-یک/`, `-سه/`, `-چهار/`) are the old *product* pages (header "محصولات", placeholder text "متن"); their carousels use `/wp-content/uploads/2018/07/behkooshan1…8.jpg` (the same files on several stones) and theme demo files `/2015/11/project_N-compressor-1070x600.jpg`; `behkooshan.ir/wp-content/uploads/2018/`, `/2015/`, `/2016/` have 0 captures. `www.behkooshan.ir/Projects` (2019–2020, 5 captures) is an empty list; `en.behkooshan.ir/project/no1/` and `/our-projects/portfolio-style-2/` (2018) are theme demo pages. None of these are real-use photos of a stone.
* **Uploads inventory:** prefix `es55asecvav.exactdn.com/wp-content/uploads/` 993 rows, `behkooshan.ir/wp-content/uploads/` 860 (the same for `www.`), `fa.behkooshan.ir/wp-content/uploads/` 1010; no dated folders (`/2023/10/`…) exist in any of them.
* **The 33 missing photos:** for each, CDX on the exact URL (with and without `?strip=all`, all status codes) → 0 rows; CDX prefix on the stripped stem on each of the four upload hosts → no row for that file (the only hits were other files: prefix `46` → `4615-007…`/`4643-00…`, `65` → `65fa37d6…`, `Verde-Fantastic` → the product images `Verde-Fantastic-m/-p`, `Verde-Karzai-project` → `Verde-Karzai-project1-1.jpeg`); playback `https://web.archive.org/web/2026id_/<URL>` → 404. The last two stems (`Verde-Karzai-project1`, `-project3`) were still being queried when the live route became available; the uploads inventory had already shown no capture of them.
* **Existing project photos:** every other archived copy of the 22 photos (CDN and Persian copies, card backgrounds `Belvedere-2-scaled.jpg`, `Patagonia-Black.jpg`, `IMG_3170-scaled.jpg`, `Northgolestan_project_9-scaled.jpg`, `2338-038-scaled.jpg`) was downloaded and compared: all were the same picture at the same or a smaller size, so the archive had nothing better.
