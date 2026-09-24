# Behkooshan products: sync with the live site (2026-09-24)

The research in `research/products/` was built from Wayback Machine captures (June 2025 to February 2026). This is a check of every product against the **live** sites <https://fa.behkooshan.ir> and <https://behkooshan.ir> on 2026-09-24, and of the patch that brought the research up to date. The patch (`apply_live_sync.py`) was run once from a working folder and is not kept in the repository; every change it made is in the commit that added this file.

## Summary

|  | count |
|---|---|
| Live products, Persian site | 99 |
| Live products, English site | 97 |
| Distinct live products (both sites merged, as the research merges them) | 99 |
| New products (not in the research) | 8 |
| Research products gone from both live sites | 2 |
| Name changes (site titles, either language) | 7 |
| Spec / category / type / colour value changes (fields) | 42 |
| Products whose spec values change | 19 |
| Description or other text changes | 0 |
| Image changes (new, larger, no longer shown, re-classed, original recorded) | 40 |
| Products with image changes | 30 |
| Texture changes (newly held, new file, larger, gone) | 65 |
| Products with texture changes | 61 |
| missing_textures links resolved (file now held) | 73 |

Most important:

* **Black Fantasy is now Black Tempest.** Post 4276 (`/product/black-fantasy/`) was renamed "Black Tempest" and moved to
  `/product/black-tempest/` on both sites, with the same photographs and texture link. The research had these as two
  products: `black-fantasy` (archived name, specs, photos) and `black-tempest` (known only from its URL, now with the
  project photos). The patch completes `black-tempest` from the live site (Quartzite, Brazil, imported, Grey, its
  photographs and texture) and marks `black-fantasy` with `merged_into: "black-tempest"`. **Delete
  `research/products/black-fantasy/` (and `media/black-fantasy/`)**; the patch never deletes. `derive-products.py`
  already skips it.
* **8 new products** (6 on both sites published 2026-09-21, 2 Persian-only published 2026-05-05): 6 marbles and 2 granites.
* **River Blanche** is gone from both sites (kept, `listed_on_live_site` false; `derive-products.py` skips it).
* **Photographs replaced by the site**: belvedere, new-patagonia and purple-rain now show different main and listing
  pictures; rosso-fantastico has a new main picture on the English site. The old ones become kind `former` (file kept).
* **Larger copies**: for 8 products (cristallo-rosa, dolce-vita, elegant-green, evolution-green, new-patagonia, nysa,
  river-noire, venetian-granite) the site serves a bigger file than the archive held, and the largest copy within
  2560 px and 3 MB is stored; for 5 more the research already holds that copy and only `original_upload` is added
  (see the size rule below).
* **Texture downloads**: 94 products have their texture after the patch (38 before); 73 `missing_textures` links are
  resolved.
* **Colour attribute** now known from the site for 71 products (was 47); 3 origins changed.


## Method

### Routes (2026-09-24, about 14:40 to 16:40 UTC)

Direct connections to `behkooshan.ir` are still dropped from the collection environment. The live site was read through
the **Google Translate website proxy**, which fetches from the origin at request time:

* English site: `https://behkooshan-ir.translate.goog/<path>?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en`
* Persian site: `https://fa-behkooshan-ir.translate.goog/<path>?_x_tr_sl=auto&_x_tr_tl=fa&_x_tr_hl=fa`
* files: the same hosts with `_x_tr_sl=fa&_x_tr_tl=en&_x_tr_hl=en` (the proxy returns the file's bytes unchanged).

| source | what it gives | result |
|---|---|---|
| WordPress REST `/wp-json/wp/v2/product?per_page=100` | every published product: post id, slug, title, dates, category and attribute classes | 97 (en), 99 (fa); page 2 answers `rest_post_invalid_page_number`, so the lists are complete |
| WooCommerce Store API `/wp-json/wc/store/v1/products?per_page=100` | stone-type (`pa_brand`) and colour (`pa_color`) terms, description, short description, product images | 97 / 99, same ids |
| WordPress REST `/wp-json/wp/v2/media` (all pages) | the media library: original file names, bytes, pixel sizes, `-scaled` copies and every WordPress size variant | 493 (en) / 508 (fa) attachments |
| every product page `/product/<slug>/` | what the page displays: title, "Type:/نوع :", "Orgin:/کشور مبدا :", breadcrumb category, main image, "Texture Download" link, project link | 97 / 99 pages, all HTTP 200 |
| the Quarry page `/natanz-white-granite-quarry-rijen/` | text and 13 photos | both languages |
| `/?jet_download=<hash>` | the texture download files | 184 of 196 links (see (f)) |
| `/wp-content/uploads/<file>` | every product image at its original upload size, and the size variants the size rule needs | all product images |

Not usable: the sitemaps (`sitemap_index.xml`, `product-sitemap.xml`) answer 302 through the proxy; the shop and category
listing pages are filled by script and every page of them shows the same 9 to 12 cards (as the README found for the
archived copies). The APIs are complete, so they give the product list, and every product page was fetched for what it
displays.

The **r.jina.ai** reader was used as an independent second route for a sample, until it refused further anonymous
requests (HTTP 401, "bad IP reputation").

After about 120 quick requests Google's anti-abuse page appeared (302 to `google.com/sorry`); those answers were
discarded and everything was fetched again one request at a time, with pauses and backoff.

### Is the text verbatim?

Yes. The proxy returns the site's own HTML and the translation is done afterwards by a script in the visitor's browser,
which a plain HTTP client does not run. (With a target language different from the page's, text the proxy renders is
translated; every page here was requested with its own language as target.) Checks:

* The English pages keep the site's misspelling "**Orgin:**"; 20 Persian pages keep English words ("Granite", "Marble",
  "Quartzite", "Brazil", "Italy", ...) that a translation into Persian would have changed.
* Five product pages (fa `alaska-white`, `bianco-vena`, `namibia-white`; en `belvedere`, `verde-atlantic`) and both
  Quarry pages were also read through r.jina.ai: titles, labels and values are identical.
* The Quarry page text through the proxy is character for character the text archived by the Wayback Machine and stored
  in the research, in both languages.

No machine-translated text is stored. Where a Persian page shows an English word, the Persian value is written with the
site's own Persian word for it ("Marble" as «مرمریت», the site's own term in its Persian attribute list) and flagged in
`translated_fields`, as the research already did.

### How pictures were compared

Bytes cannot be compared across the two sites: the **English site's uploads were re-saved by the EWWW Image Optimizer**
(metadata stripped, some re-compressed; the Absolute Black texture is 263,084 bytes in the archive and on the Persian
site, 242,695 bytes on the English site, with identical pixels), while the Persian site's files are byte-identical to
the archived ones. Every file was therefore compared by its **decoded pixels** (SHA-1 of the RGB data), then, to find the
same photograph at another size, by aspect ratio (1.5 %) and a 32x32 greyscale copy. Where both sites hold the same
picture, the Persian site's file (the unmodified upload) is kept. Doubtful cases (purple-rain, rosso-fantastico,
belvedere, new-patagonia, dolce-vita) were also checked by eye.

The proxy drops the `Content-Disposition` header of texture downloads, so each texture's original file name was taken
from the media-library entry with exactly the same byte size and pixel size (`original_filename`).


## The live product list

One row per live post. `slug` is the research folder the post belongs to (the research merges renamed or re-published posts of the same stone). Type and origin are exactly as the product page shows them; colour and stone-type attribute come from the WooCommerce Store API; category from the page's breadcrumb. Texture = the page has a "Texture Download" link; project = it links a project page.

### Persian site (fa.behkooshan.ir): 99 products

| slug | URL | name | category | type | origin | colour | type attr. | texture | project | post | published | modified |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| absolute-black | [absolute-black](https://fa.behkooshan.ir/product/absolute-black/) | Absolute Black | domestic | گرانیت | ایران | – | گرانیت | yes | – | 2347 | 2023-03-05 | 2024-04-20 |
| alaska-white | [alaska-white](https://fa.behkooshan.ir/product/alaska-white/) | Alaska White | imported | گرانیت | هند | cream | گرانیت | yes | – | 5926 | 2025-07-23 | 2025-07-23 |
| amazonite | [amazonite](https://fa.behkooshan.ir/product/amazonite/) | Amazonite | imported | گرانیت | ماداگاسکار | blue | گرانیت | yes | – | 5404 | 2023-12-12 | 2025-07-23 |
| andromeda | [andromeda](https://fa.behkooshan.ir/product/andromeda/) | Andromeda | imported | گرانیت | سریلانکا | – | – | yes | – | 5409 | 2023-12-12 | 2025-07-23 |
| belissimo-verde | [belissimo-verde](https://fa.behkooshan.ir/product/belissimo-verde/) | Belissimo Verde | domestic | Granite | ایران | green | گرانیت | yes | – | 7039 | 2026-09-21 | 2026-09-21 |
| bellatrix | [bellatrix](https://fa.behkooshan.ir/product/bellatrix/) | Bellatrix | imported | گرانیت | برزیل | – | – | yes | yes | 6672 | 2025-08-26 | 2025-08-26 |
| belvedere | [belvedere](https://fa.behkooshan.ir/product/belvedere/) | Belvedere | imported | گرانیت | آنگولا | – | – | yes | yes | 5415 | 2023-12-12 | 2025-09-01 |
| bianco-vena | [bianco-vena](https://fa.behkooshan.ir/product/bianco-vena/) | Bianco Vena | imported | Marble | یونان | white | مرمریت | yes | – | 7030 | 2026-09-21 | 2026-09-21 |
| black-beat | [black-beat](https://fa.behkooshan.ir/product/black-beat/) | Black Beat | imported | گرانیت | هند | – | – | yes | – | 5420 | 2023-12-12 | 2025-07-23 |
| black-diamond | [black-diamond](https://fa.behkooshan.ir/product/black-diamond/) | Black Diamond | imported | گرانیت | آنگولا | black | گرانیت | yes | yes | 4272 | 2023-08-11 | 2025-08-17 |
| black-galaxy | [black-galaxy](https://fa.behkooshan.ir/product/black-galaxy/) | Black Galaxy | imported | گرانیت | هند | – | – | yes | – | 5429 | 2023-12-12 | 2025-07-23 |
| black-horse | [black-horse](https://fa.behkooshan.ir/product/black-horse/) | Black Horse | imported | گرانیت | برزیل | black | گرانیت | yes | – | 4280 | 2023-08-11 | 2024-04-20 |
| black-tempest | [black-tempest](https://fa.behkooshan.ir/product/black-tempest/) | Black Tempest | imported | کوارتزیت | برزیل | grey | کوارتزیت | yes | yes | 4276 | 2023-08-11 | 2025-07-28 |
| black-zebra | [black-zebra](https://fa.behkooshan.ir/product/black-zebra/) | Black Zebra | domestic | گرانیت | ایران | black | گرانیت | yes | yes | 5930 | 2025-07-23 | 2025-07-23 |
| blanco-potiguar | [blanco-potiguar](https://fa.behkooshan.ir/product/blanco-potiguar/) | Blanco Potiguar | imported | گرانیت | برزیل | cream | گرانیت | yes | – | 4735 | 2023-09-05 | 2024-04-20 |
| bronze-antique | [bronze-antique](https://fa.behkooshan.ir/product/bronze-antique/) | Bronze Antique | imported | گرانیت | اکراین | black | گرانیت | yes | – | 4744 | 2023-09-05 | 2024-04-20 |
| bubble-gray | [bubble-gray](https://fa.behkooshan.ir/product/bubble-gray/) | Bubble Gray | domestic | گرانیت | ایران | – | گرانیت | yes | – | 2343 | 2023-03-05 | 2024-04-20 |
| calacatta-rhino | [calacatta-rhino](https://fa.behkooshan.ir/product/calacatta-rhino/) | Calacatta Rhino | imported | Marble | نامیبیا | white | مرمریت | yes | – | 7036 | 2026-09-21 | 2026-09-21 |
| calacatta-viola | [calacatta-viola](https://fa.behkooshan.ir/product/calacatta-viola/) | Calacatta Viola | imported | Marble | ایتالیا | cream | مرمریت | yes | yes | 7027 | 2026-09-21 | 2026-09-21 |
| casper | [casper](https://fa.behkooshan.ir/product/casper/) | Casper | domestic | گرانیت | ایران | – | گرانیت | yes | yes | 2334 | 2023-03-03 | 2025-07-28 |
| casper-line | [casper-line](https://fa.behkooshan.ir/product/casper-line/) | Casper Line | domestic | گرانیت | ایران | – | گرانیت | yes | – | 2314 | 2023-03-03 | 2024-04-20 |
| cohiba | [cohiba](https://fa.behkooshan.ir/product/cohiba/) | Cohiba | imported | گرانیت | آنگولا | black | گرانیت | yes | – | 5937 | 2025-07-23 | 2025-07-23 |
| colonial | [colonial](https://fa.behkooshan.ir/product/colonial/) | Colonial | imported | گرانیت | سریلانکا | cream | گرانیت | yes | – | 4268 | 2023-08-11 | 2024-04-20 |
| copper-dune | [elegant-brown](https://fa.behkooshan.ir/product/elegant-brown/) | Copper Dune | imported | کوارتزیت | برزیل | cream | quartzite | yes | yes | 4749 | 2023-09-05 | 2025-07-27 |
| cristallo-rosa | [cristallo-rosa](https://fa.behkooshan.ir/product/cristallo-rosa/) | Cristallo Rosa | imported | کوارتزیت | برزیل | cream, white | کوارتزیت | yes | – | 6493 | 2025-08-11 | 2025-08-13 |
| dalmata | [dalmata](https://fa.behkooshan.ir/product/dalmata/) | Dalmata | imported | مرمریت | برزیل | black, white | مرمریت | yes | – | 4805 | 2023-09-05 | 2025-08-11 |
| dark-golden-lightning | [dark-golden-lightning](https://fa.behkooshan.ir/product/dark-golden-lightning/) | Dark Golden Lightning | domestic | گرانیت | ایران | – | گرانیت | yes | – | 2313 | 2023-03-03 | 2024-04-20 |
| dedalus | [dedalus](https://fa.behkooshan.ir/product/dedalus/) | Dedalus | imported | Marble | برزیل | green | مرمریت | yes | – | 6713 | 2025-09-01 | 2026-09-21 |
| delicate | [delicate](https://fa.behkooshan.ir/product/delicate/) | Delicate | domestic | گرانیت | ایران | – | گرانیت | yes | – | 2312 | 2023-03-03 | 2024-04-20 |
| dolce-vita | [dolce-vita](https://fa.behkooshan.ir/product/dolce-vita/) | Dolce Vita | imported | Quartzite | Brazil | cream, white | کوارتزیت | yes | – | 6633 | 2025-08-20 | 2025-09-01 |
| dover-blue | [dover-blue](https://fa.behkooshan.ir/product/dover-blue/) | Dover Blue | domestic | مرمریت | آنگولا | blue | مرمریت | yes | – | 5942 | 2025-07-23 | 2025-07-23 |
| elegant-brown | [elegant-brown-2](https://fa.behkooshan.ir/product/elegant-brown-2/) | Elegant Brown | imported | Granite | برزیل | cream | گرانیت | yes | yes | 6568 | 2025-08-16 | 2025-08-16 |
| elegant-green | [elegant-green](https://fa.behkooshan.ir/product/elegant-green/) | Elegant Green | domestic | گرانیت | ایران | – | گرانیت | yes | – | 3898 | 2023-08-01 | 2024-04-20 |
| emerald-quartzite | [emerald-quartzite](https://fa.behkooshan.ir/product/emerald-quartzite/) | Emerald Quartzite | imported | کوارتزیت | برزیل | green | کوارتزیت | yes | yes | 4758 | 2023-09-05 | 2025-07-28 |
| evolution-green | [evolution-green](https://fa.behkooshan.ir/product/evolution-green/) | Evolution Green | domestic | گرانیت | ایران | green | گرانیت | yes | – | 3901 | 2023-08-01 | 2024-04-22 |
| explosion-blue | [explosion-blue](https://fa.behkooshan.ir/product/explosion-blue/) | Explosion Blue | imported | گرانیت | برزیل | – | – | yes | – | 5443 | 2023-12-12 | 2025-07-23 |
| gando | [gando](https://fa.behkooshan.ir/product/gando/) | Gando | domestic | گرانیت | ایران | green | گرانیت | yes | – | 5949 | 2025-07-23 | 2025-07-23 |
| grand-antique | [grand-antique](https://fa.behkooshan.ir/product/grand-antique/) | Grand Antique | imported | Marble | فرانسه | black, white | مرمریت | yes | – | 6640 | 2025-08-20 | 2026-09-21 |
| green-shadow | [green-shadow](https://fa.behkooshan.ir/product/green-shadow/) | Green Shadow | domestic | گرانیت | ایران | black, green | گرانیت | yes | – | 5954 | 2025-07-23 | 2025-07-23 |
| infinity-gold | [infinity-gold](https://fa.behkooshan.ir/product/infinity-gold/) | Infinity Gold | domestic | گرانیت | ایران | cream | گرانیت | yes | – | 5324 | 2023-12-12 | 2024-04-20 |
| jacaranda | [jacaranda](https://fa.behkooshan.ir/product/jacaranda/) | Jacaranda | imported | گرانیت | برزیل | cream | گرانیت | yes | – | 4775 | 2023-09-05 | 2024-04-20 |
| jasmin | [jasmin](https://fa.behkooshan.ir/product/jasmin/) | Jasmine | domestic | گرانیت | ایران | green | گرانیت | yes | – | 3904 | 2023-08-01 | 2025-08-10 |
| jeriba-blue | [jeriba-blue](https://fa.behkooshan.ir/product/jeriba-blue/) | Jeriba Blue | imported | Quartzite | Brazil | blue, grey | کوارتزیت | yes | – | 6637 | 2025-08-20 | 2025-08-20 |
| jet-black | [jet-black](https://fa.behkooshan.ir/product/jet-black/) | Jet Black | domestic | گرانیت | ایران | – | گرانیت | yes | – | 3907 | 2023-08-01 | 2024-04-20 |
| kojin | [kojin](https://fa.behkooshan.ir/product/kojin/) | Kojin | domestic | گرانیت | ایران | cream | گرانیت | yes | – | 5964 | 2025-07-23 | 2025-07-23 |
| kosmus-a | [kosmus-a](https://fa.behkooshan.ir/product/kosmus-a/) | Kosmus “A” | imported | گرانیت | برزیل | cream, grey | گرانیت | yes | – | 4780 | 2023-09-05 | 2025-07-23 |
| kosmus-gold | [kosmus-gold](https://fa.behkooshan.ir/product/kosmus-gold/) | Kosmus Gold | imported | گرانیت | برزیل | black | گرانیت | yes | – | 5968 | 2025-07-23 | 2025-07-23 |
| lemurian-labradorite | [labradorite](https://fa.behkooshan.ir/product/labradorite/) | Lemurian Labradorite | imported | گرانیت | ماداگاسکار | black, blue | گرانیت | yes | – | 4785 | 2023-09-05 | 2025-07-27 |
| lumix-wow | [lumix-wow](https://fa.behkooshan.ir/product/lumix-wow/) | Lumix Wow | imported | مرمریت | هند | – | – | yes | yes | 5973 | 2025-07-23 | 2025-08-07 |
| magma-gold | [magma-gold](https://fa.behkooshan.ir/product/magma-gold/) | Magma Gold | imported | گرانیت | برزیل | cream | گرانیت | yes | – | 4790 | 2023-09-05 | 2024-04-20 |
| malibu-red | [malibu-red](https://fa.behkooshan.ir/product/malibu-red/) | Malibu Red | domestic | گرانیت | ایران | – | گرانیت | yes | yes | 3910 | 2023-08-01 | 2025-07-27 |
| mercury-black | [mercury-black](https://fa.behkooshan.ir/product/mercury-black/) | Mercury Black | domestic | گرانیت | ایران | – | گرانیت | yes | – | 3913 | 2023-08-01 | 2024-04-20 |
| meteorus | [meteorus](https://fa.behkooshan.ir/product/meteorus/) | Meteorus | imported | Granite | Brazil | grey | گرانیت | yes | – | 6859 | 2025-12-23 | 2025-12-25 |
| midnight-gray | [midnight-gray](https://fa.behkooshan.ir/product/midnight-gray/) | Midnight Gray | domestic | گرانیت | ایران | – | گرانیت | yes | – | 3916 | 2023-08-01 | 2024-04-20 |
| milky-way | [milky-way](https://fa.behkooshan.ir/product/milky-way/) | Milky Way | imported | Granite | India | – | – | yes | – | 6841 | 2025-11-19 | 2025-11-19 |
| mont-blanc | [mont-blanc](https://fa.behkooshan.ir/product/mont-blanc/) | Mont Blanc | imported | کوارتزیت | برزیل | white | کوارتزیت | yes | – | 5511 | 2024-01-01 | 2024-04-20 |
| mozzarella | [mozzarella](https://fa.behkooshan.ir/product/mozzarella/) | Mozzarella | domestic | متفرقه | ایران | cream | متفرقه | yes | – | 6481 | 2025-08-11 | 2025-08-11 |
| naica-quartzite | [naica-quartzite](https://fa.behkooshan.ir/product/naica-quartzite/) | Naica Quartzite | imported | گرانیت | آنگولا | – | – | yes | – | 5456 | 2023-12-12 | 2025-07-27 |
| namibia-white | [namibia-white](https://fa.behkooshan.ir/product/namibia-white/) | Namibia White | imported | Marble | نامیبیا | white | مرمریت | yes | – | 6994 | 2026-05-05 | 2026-09-21 |
| native-black | [native-black](https://fa.behkooshan.ir/product/native-black/) | Native Black | domestic | گرانیت | ایران | – | گرانیت | yes | – | 3919 | 2023-08-01 | 2024-04-20 |
| negresco | [negresco](https://fa.behkooshan.ir/product/negresco/) | Negresco | imported | گرانیت | برزیل | – | – | yes | – | 5461 | 2023-12-12 | 2025-07-23 |
| new-galaxy | [new-galaxy](https://fa.behkooshan.ir/product/new-galaxy/) | New Galaxy | imported | گرانیت | آنگولا | black | گرانیت | yes | – | 4795 | 2023-09-05 | 2024-04-20 |
| new-golden-silver | [new-golden-silver](https://fa.behkooshan.ir/product/new-golden-silver/) | New Golden Silver | imported | گرانیت | برزیل | cream | گرانیت | yes | – | 4800 | 2023-09-05 | 2024-04-20 |
| new-patagonia | [new-patagonia](https://fa.behkooshan.ir/product/new-patagonia/) | New Patagonia | imported | گرانیت | هند | cream | گرانیت | yes | yes | 5466 | 2023-12-12 | 2025-08-17 |
| nysa | [nysa](https://fa.behkooshan.ir/product/nysa/) | Nysa | domestic | Granite | Iran | – | – | yes | – | 6881 | 2026-01-26 | 2026-01-26 |
| oyster-quartz | [oyster](https://fa.behkooshan.ir/product/oyster/) | Oyster Quartz | imported | مرمریت | آنگولا | white | مرمریت | yes | – | 4810 | 2023-09-05 | 2024-04-22 |
| patagonia-a | [patagonia](https://fa.behkooshan.ir/product/patagonia/) | Patagonia “A” | imported | گرانیت | برزیل | cream | گرانیت | yes | – | 4815 | 2023-09-05 | 2024-04-20 |
| patagonia-black | [patagonia-black](https://fa.behkooshan.ir/product/patagonia-black/) | Patagonia Black | imported | گرانیت | هند | black, pink | گرانیت | yes | – | 5983 | 2025-07-23 | 2025-07-23 |
| patagonia-green | [patagonia-green](https://fa.behkooshan.ir/product/patagonia-green/) | Patagonia Green | imported | گرانیت | برزیل | green, white | گرانیت | yes | – | 5471 | 2023-12-12 | 2025-07-23 |
| patagonia-original | [patagonia-orginal](https://fa.behkooshan.ir/product/patagonia-orginal/) | Patagonia Orginal | imported | گرانیت | برزیل | – | – | yes | – | 5477 | 2023-12-12 | 2025-07-23 |
| patagonia-pink | [patagonia-pink](https://fa.behkooshan.ir/product/patagonia-pink/) | Patagonia Pink | imported | گرانیت | هند | pink, white | گرانیت | yes | – | 5990 | 2025-07-23 | 2025-07-23 |
| patagonia-tourmaline | [patagonia-troumaline](https://fa.behkooshan.ir/product/patagonia-troumaline/) | Patagonia troumaline | imported | گرانیت | برزیل | – | – | yes | – | 5482 | 2023-12-12 | 2025-07-23 |
| picasso | [picasso](https://fa.behkooshan.ir/product/picasso/) | Picasso | domestic | گرانیت | ایران | green | گرانیت | yes | – | 3925 | 2023-08-01 | 2024-04-22 |
| platinum | [platinum](https://fa.behkooshan.ir/product/platinum/) | Platinum | imported | گرانیت | هند | black | گرانیت | yes | yes | 4821 | 2023-09-05 | 2025-07-28 |
| pumpkin-viola | [pumpkin-viola](https://fa.behkooshan.ir/product/pumpkin-viola/) | Pumpkin Viola | domestic | Marble | Iran | cream | مرمریت | yes | – | 7033 | 2026-09-21 | 2026-09-21 |
| purple-rain | [purple-rain](https://fa.behkooshan.ir/product/purple-rain/) | Purple Rain | domestic | گرانیت | ایران | grey | گرانیت | yes | yes | 5996 | 2025-07-23 | 2025-07-28 |
| python | [python](https://fa.behkooshan.ir/product/python/) | Python | domestic | گرانیت | ایران | – | گرانیت | yes | – | 3928 | 2023-08-01 | 2024-04-20 |
| quartzite-levanto | [quartzite-levatnto](https://fa.behkooshan.ir/product/quartzite-levatnto/) | Quartzite Levanto | imported | Quartzite | Brazil | – | – | yes | – | 6792 | 2025-09-23 | 2025-09-23 |
| river-noire | [river-noir](https://fa.behkooshan.ir/product/river-noir/) | River Noire | imported | Granite | India | black | گرانیت | yes | – | 6710 | 2025-08-31 | 2025-09-21 |
| rosso-fantastico | [rosso-fantastico](https://fa.behkooshan.ir/product/rosso-fantastico/) | Rosso Fantastico | domestic | گرانیت | ایران | – | گرانیت | yes | – | 3934 | 2023-08-01 | 2024-04-20 |
| rosso-levanto | [rosso-levanto](https://fa.behkooshan.ir/product/rosso-levanto/) | Rosso Levanto | imported | Marble | Italy | pink | مرمریت | yes | – | 6997 | 2026-05-05 | 2026-05-05 |
| sanded-white | [sanded-white](https://fa.behkooshan.ir/product/sanded-white/) | Sanded White | domestic | گرانیت | ایران | – | – | yes | yes | 5361 | 2023-12-12 | 2025-08-17 |
| serpentine | [serpentine](https://fa.behkooshan.ir/product/serpentine/) | Serpentine | domestic | گرانیت | ایران | green | گرانیت | yes | – | 3940 | 2023-08-01 | 2024-04-22 |
| silver-fusion | [silver-fusion](https://fa.behkooshan.ir/product/silver-fusion/) | Silver Fusion | imported | گرانیت | برزیل | grey | گرانیت | yes | – | 4826 | 2023-09-05 | 2024-04-20 |
| space-gray | [space-gray](https://fa.behkooshan.ir/product/space-gray/) | Space Gray | domestic | گرانیت | ایران | – | – | yes | – | 5371 | 2023-12-12 | 2024-04-20 |
| spectrolite-blue | [spectrolite-blue](https://fa.behkooshan.ir/product/spectrolite-blue/) | Spectrolite Blue | imported | گرانیت | اکراین | black, blue | گرانیت | yes | – | 4831 | 2023-09-05 | 2024-04-22 |
| t-rex | [t-rex-2](https://fa.behkooshan.ir/product/t-rex-2/) | T.Rex | domestic | Granite | Iran | grey | گرانیت | yes | – | 6777 | 2025-09-21 | 2025-09-21 |
| t-rex | [t-rex](https://fa.behkooshan.ir/product/t-rex/) | T Rex | domestic | گرانیت | ایران | – | – | yes | – | 5376 | 2023-12-12 | 2024-04-20 |
| taj-mahal | [taj-mahal](https://fa.behkooshan.ir/product/taj-mahal/) | Taj Mahal | imported | گرانیت | آنگولا | – | – | yes | – | 5487 | 2023-12-12 | 2024-04-20 |
| titanium-mc | [titanium-mc](https://fa.behkooshan.ir/product/titanium-mc/) | Titanium MC | imported | گرانیت | برزیل | black | گرانیت | yes | yes | 4836 | 2023-09-05 | 2024-04-20 |
| tropical-storm | [tropical-storm](https://fa.behkooshan.ir/product/tropical-storm/) | Tropical Storm | imported | گرانیت | آنگولا | black | گرانیت | yes | yes | 5576 | 2024-01-22 | 2025-07-27 |
| turquoise | [turquoise](https://fa.behkooshan.ir/product/turquoise/) | Turquoise | domestic | گرانیت | ایران | green | گرانیت | yes | yes | 3943 | 2023-08-01 | 2025-07-28 |
| venetian-granite | [venetian-granite](https://fa.behkooshan.ir/product/venetian-granite/) | Venetian Granite | domestic | Granite | Iran | – | – | yes | – | 6824 | 2025-11-03 | 2025-11-03 |
| verde-atlantic | [verde-atlantic](https://fa.behkooshan.ir/product/verde-atlantic/) | Verde Atlantic | domestic | Granite | ایران | green | گرانیت | yes | – | 7042 | 2026-09-21 | 2026-09-21 |
| verde-fantastic | [verde-fantastic](https://fa.behkooshan.ir/product/verde-fantastic/) | Verde Fantastic | domestic | گرانیت | ایران | green | گرانیت | yes | yes | 3946 | 2023-08-01 | 2024-04-22 |
| verde-imperial | [verde-imperial](https://fa.behkooshan.ir/product/verde-imperial/) | Verde Imperial | domestic | گرانیت | ایران | green | گرانیت | yes | yes | 3949 | 2023-08-01 | 2025-07-27 |
| verde-karzai | [verde-karzai](https://fa.behkooshan.ir/product/verde-karzai/) | Verde Karzai | domestic | گرانیت | ایران | – | – | yes | yes | 5389 | 2023-12-12 | 2025-07-28 |
| via-lattea | [via-lattea](https://fa.behkooshan.ir/product/via-lattea/) | Via Lattea | imported | گرانیت | برزیل | black | گرانیت | yes | – | 4841 | 2023-09-05 | 2024-04-20 |
| volga-blue | [volga-blue](https://fa.behkooshan.ir/product/volga-blue/) | Volga Blue | imported | گرانیت | اکراین | black, blue | گرانیت | yes | – | 4846 | 2023-09-05 | 2024-04-22 |

### English site (behkooshan.ir): 97 products

| slug | URL | name | category | type | origin | colour | type attr. | texture | project | post | published | modified |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| absolute-black | [absolute-black](https://behkooshan.ir/product/absolute-black/) | Absolute Black | domestic | Granite | Iran | – | Granite | yes | yes | 2347 | 2023-03-05 | 2023-12-12 |
| alaska-white | [alaska-white](https://behkooshan.ir/product/alaska-white/) | Alaska White | imported | Granite | India | cream | Granite | yes | – | 5741 | 2025-05-07 | 2025-08-15 |
| amazonite | [amazonite](https://behkooshan.ir/product/amazonite/) | Amazonite | imported | Granite | Madagascar | – | – | yes | – | 5404 | 2023-12-12 | 2025-07-22 |
| andromeda | [andromeda](https://behkooshan.ir/product/andromeda/) | Andromeda | imported | Granite | Sri-Lanka | – | – | yes | – | 5409 | 2023-12-12 | 2025-05-07 |
| belissimo-verde | [belissimo-verde](https://behkooshan.ir/product/belissimo-verde/) | Belissimo Verde | domestic | Granite | Iran | green | Granite | yes | – | 6845 | 2026-09-21 | 2026-09-21 |
| bellatrix | [bellatrix](https://behkooshan.ir/product/bellatrix/) | Bellatrix | imported | Granite | Brazil | – | – | yes | yes | 6335 | 2025-08-17 | 2025-08-26 |
| belvedere | [belvedere](https://behkooshan.ir/product/belvedere/) | Belvedere | imported | Granite | Angola | – | – | yes | yes | 5415 | 2023-12-12 | 2025-09-01 |
| bianco-vena | [bianco-vena](https://behkooshan.ir/product/bianco-vena/) | Bianco Vena | imported | Marble | Greece | white | Marble | yes | – | 6836 | 2026-09-21 | 2026-09-21 |
| black-beat | [black-beat](https://behkooshan.ir/product/black-beat/) | Black Beat | imported | Granite | India | – | – | yes | – | 5420 | 2023-12-12 | 2025-05-07 |
| black-diamond | [black-diamond](https://behkooshan.ir/product/black-diamond/) | Black Diamond | imported | Granite | Angola | cream | Quartzite | yes | yes | 4272 | 2023-08-11 | 2023-12-12 |
| black-galaxy | [black-galaxy](https://behkooshan.ir/product/black-galaxy/) | Black Galaxy | imported | Granite | India | – | – | yes | – | 5429 | 2023-12-12 | 2025-05-07 |
| black-horse | [black-horse](https://behkooshan.ir/product/black-horse/) | Black Horse | imported | Granite | Brazil | black | Granite | yes | yes | 4280 | 2023-08-11 | 2023-12-12 |
| black-tempest | [black-tempest](https://behkooshan.ir/product/black-tempest/) | Black Tempest | imported | Quartzite | Brazil | blue | Quartzite | yes | yes | 4276 | 2023-08-11 | 2025-08-11 |
| black-zebra | [black-zebra](https://behkooshan.ir/product/black-zebra/) | Black Zebra | domestic | Granite | Iran | black | Granite | yes | yes | 5779 | 2025-07-22 | 2025-08-17 |
| blanco-potiguar | [blanco-potiguar](https://behkooshan.ir/product/blanco-potiguar/) | Blanco Potiguar | imported | Granite | Brazil | cream | Granite | yes | – | 4735 | 2023-09-05 | 2023-09-26 |
| bronze-antique | [bronze-antique](https://behkooshan.ir/product/bronze-antique/) | Bronze Antique | imported | Granite | Ukraine | black | Granite | yes | – | 4744 | 2023-09-05 | 2023-09-26 |
| bubble-gray | [bubble-gray](https://behkooshan.ir/product/bubble-gray/) | Bubble Gray | domestic | Granite | Iran | – | Granite | yes | – | 2343 | 2023-03-05 | 2023-12-12 |
| calacatta-rhino | [calacatta-rhino](https://behkooshan.ir/product/calacatta-rhino/) | Calacatta Rhino | imported | Marble | Namibia | white | Marble | yes | – | 6842 | 2026-09-21 | 2026-09-21 |
| calacatta-viola | [calacatta-viola](https://behkooshan.ir/product/calacatta-viola/) | Calacatta Viola | imported | Marble | Italy | cream | Marble | yes | yes | 6833 | 2026-09-21 | 2026-09-21 |
| casper | [casper](https://behkooshan.ir/product/casper/) | Casper | domestic | Granite | Iran | – | Granite | yes | yes | 2334 | 2023-03-03 | 2025-07-28 |
| casper-line | [casper-line](https://behkooshan.ir/product/casper-line/) | Casper Line | domestic | Granite | Iran | – | Granite | yes | – | 2314 | 2023-03-03 | 2023-12-12 |
| cohiba | [cohiba](https://behkooshan.ir/product/cohiba/) | Cohiba | imported | Granite | Angola | – | – | yes | – | 5727 | 2025-05-07 | 2025-05-07 |
| colonial | [colonial](https://behkooshan.ir/product/colonial/) | Colonial | imported | Granite | Sri-Lanka | cream | Granite | yes | – | 4268 | 2023-08-11 | 2023-09-26 |
| copper-dune | [elegant-brown](https://behkooshan.ir/product/elegant-brown/) | Copper Dune | imported | Quartzite | Brazil | cream | granite | yes | yes | 4749 | 2023-09-05 | 2025-07-27 |
| cristallo-rosa | [cristallo-rosa](https://behkooshan.ir/product/cristallo-rosa/) | Cristallo Rosa | imported | Quartzite | Brazil | cream, white | Quartzite | yes | – | 5966 | 2025-08-11 | 2025-08-13 |
| dalmata | [dalmata](https://behkooshan.ir/product/dalmata/) | Dalmata | imported | Marble | Brazil | black, white | Granite | yes | – | 4805 | 2023-09-05 | 2023-11-19 |
| dark-golden-lightning | [dark-golden-lightning](https://behkooshan.ir/product/dark-golden-lightning/) | Dark Golden Lightning | domestic | Granite | Iran | – | Granite | yes | – | 2313 | 2023-03-03 | 2023-12-12 |
| dedalus | [dedalus](https://behkooshan.ir/product/dedalus/) | Dedalus | imported | Marble | Brazil | green | Marble | yes | – | 6496 | 2025-09-01 | 2025-09-01 |
| delicate | [delicate](https://behkooshan.ir/product/delicate/) | Delicate | domestic | Granite | Iran | – | Granite | yes | – | 2312 | 2023-03-03 | 2023-12-12 |
| dolce-vita | [dolce-vita](https://behkooshan.ir/product/dolce-vita/) | Dolce Vita | imported | Quartzite | Brazil | cream, white | Quartzite | yes | – | 6398 | 2025-08-20 | 2025-09-01 |
| dover-blue | [dover-blue](https://behkooshan.ir/product/dover-blue/) | Dover Blue | imported | Marble | Angola | blue | Marble | yes | – | 5592 | 2024-03-06 | 2024-03-07 |
| elegant-brown | [elegant-brown-2](https://behkooshan.ir/product/elegant-brown-2/) | Elegant Brown | domestic | Granite | Brazil | cream | Granite | yes | yes | 6290 | 2025-08-16 | 2025-08-16 |
| elegant-green | [elegant-green](https://behkooshan.ir/product/elegant-green/) | Elegant Green | domestic | Granite | Iran | – | Granite | yes | – | 3898 | 2023-08-01 | 2023-12-12 |
| emerald-quartzite | [emerald-green](https://behkooshan.ir/product/emerald-green/) | Emerald Quartzite | imported | Quartzite | Brazil | green | Granite | yes | yes | 4758 | 2023-09-05 | 2025-07-28 |
| evolution-green | [evolution-green](https://behkooshan.ir/product/evolution-green/) | Evolution Green | domestic | Granite | Iran | – | Granite | yes | yes | 3901 | 2023-08-01 | 2023-12-12 |
| explosion-blue | [explosion-blue](https://behkooshan.ir/product/explosion-blue/) | Explosion Blue | imported | Granite | Brazil | – | – | yes | – | 5443 | 2023-12-12 | 2025-05-07 |
| gando | [gando](https://behkooshan.ir/product/gando/) | Gando | domestic | Granite | Iran | green | Granite | yes | yes | 5730 | 2025-05-07 | 2025-07-21 |
| grand-antique | [grand-antique](https://behkooshan.ir/product/grand-antique/) | Grand Antique | domestic | Marble | France | black, white | Marble | yes | – | 6405 | 2025-08-20 | 2025-08-26 |
| green-shadow | [green-shadow](https://behkooshan.ir/product/green-shadow/) | Green Shadow | domestic | Granite | Iran | black, green | Granite | yes | – | 5748 | 2025-05-07 | 2025-07-21 |
| infinity-gold | [infinity-gold](https://behkooshan.ir/product/infinity-gold/) | Infinity Gold | domestic | Granite | Iran | cream | Granite | yes | yes | 5324 | 2023-12-12 | 2023-12-12 |
| jacaranda | [jacaranda](https://behkooshan.ir/product/jacaranda/) | Jacaranda | imported | Granite | Brazil | cream | Granite | yes | yes | 4775 | 2023-09-05 | 2023-12-12 |
| jasmin | [jasmin](https://behkooshan.ir/product/jasmin/) | Jasmine | domestic | Granite | Iran | – | Granite | yes | – | 3904 | 2023-08-01 | 2025-08-10 |
| jeriba-blue | [jeriba-blue](https://behkooshan.ir/product/jeriba-blue/) | Jeriba Blue | imported | Quartzite | Brazil | blue, grey | Quartzite | yes | yes | 6402 | 2025-08-20 | 2025-08-20 |
| jet-black | [jet-black](https://behkooshan.ir/product/jet-black/) | Jet Black | domestic | Granite | Iran | – | Granite | yes | – | 3907 | 2023-08-01 | 2023-12-12 |
| kojin | [nehbandan](https://behkooshan.ir/product/nehbandan/) | Kojin | domestic | Granite | Iran | – | Granite | yes | – | 3922 | 2023-08-01 | 2025-05-07 |
| kosmus-a | [kosmus-a](https://behkooshan.ir/product/kosmus-a/) | Kosmus “A” | imported | Granite | Brazil | grey | Granite | yes | – | 4780 | 2023-09-05 | 2023-12-12 |
| kosmus-gold | [kosmus-gold](https://behkooshan.ir/product/kosmus-gold/) | Kosmus Gold | imported | Granite | Brazil | black | – | yes | – | 5753 | 2025-05-07 | 2025-05-07 |
| lemurian-labradorite | [labradorite](https://behkooshan.ir/product/labradorite/) | Lemurian Labradorite | imported | Granite | Madagascar | black, blue | Granite | yes | yes | 4785 | 2023-09-05 | 2025-08-17 |
| lumix-wow | [new-lumix-wow](https://behkooshan.ir/product/new-lumix-wow/) | Lumix Wow | imported | Quartzite | India | white | Quartzite | yes | yes | 5567 | 2024-01-22 | 2025-08-13 |
| magma-gold | [magma-gold](https://behkooshan.ir/product/magma-gold/) | Magma Gold | imported | Granite | Brazil | cream | Granite | yes | – | 4790 | 2023-09-05 | 2023-09-26 |
| malibu-red | [malibu-red](https://behkooshan.ir/product/malibu-red/) | Malibu Red | domestic | Granite | Iran | – | Granite | yes | yes | 3910 | 2023-08-01 | 2025-07-27 |
| mercury-black | [mercury-black](https://behkooshan.ir/product/mercury-black/) | Mercury Black | domestic | Granite | Iran | – | Granite | yes | – | 3913 | 2023-08-01 | 2023-09-27 |
| meteorus | [meteorus](https://behkooshan.ir/product/meteorus/) | Meteorus | imported | Granite | Brazil | grey | Granite | yes | yes | 6713 | 2025-12-23 | 2025-12-25 |
| midnight-gray | [midnight-gray](https://behkooshan.ir/product/midnight-gray/) | Midnight Gray | domestic | Granite | Iran | – | Granite | yes | – | 3916 | 2023-08-01 | 2023-12-12 |
| milky-way | [milky-way](https://behkooshan.ir/product/milky-way/) | Milky Way | imported | Granite | India | black | Granite | yes | yes | 6678 | 2025-11-19 | 2025-11-19 |
| mont-blanc | [mont-blanc](https://behkooshan.ir/product/mont-blanc/) | Mont Blanc | imported | Quartzite | Brazil | white | Quartzite | yes | – | 5511 | 2024-01-01 | 2024-01-01 |
| mozzarella | [mozzarella](https://behkooshan.ir/product/mozzarella/) | Mozzarella | domestic | Miscellaneous | Iran | cream | Miscellaneous | yes | – | 5958 | 2025-08-11 | 2025-08-11 |
| naica-quartzite | [naica-quartzite](https://behkooshan.ir/product/naica-quartzite/) | Naica Quartzite | imported | Quartzite | Brazil | – | – | yes | yes | 5456 | 2023-12-12 | 2025-07-27 |
| native-black | [native-black](https://behkooshan.ir/product/native-black/) | Native Black | domestic | Granite | Iran | – | Granite | yes | – | 3919 | 2023-08-01 | 2023-12-12 |
| negresco | [negresco](https://behkooshan.ir/product/negresco/) | Negresco | imported | Granite | Brazil | – | – | yes | yes | 5461 | 2023-12-12 | 2025-05-07 |
| new-galaxy | [new-galaxy](https://behkooshan.ir/product/new-galaxy/) | New Galaxy | imported | Granite | Angola | black | Granite | yes | – | 4795 | 2023-09-05 | 2023-09-26 |
| new-golden-silver | [new-golden-silver](https://behkooshan.ir/product/new-golden-silver/) | New Golden Silver | imported | Granite | Brazil | cream | Granite | yes | – | 4800 | 2023-09-05 | 2023-09-26 |
| new-patagonia | [new-patagonia](https://behkooshan.ir/product/new-patagonia/) | New Patagonia | imported | Granite | India | – | – | yes | yes | 5466 | 2023-12-12 | 2025-08-16 |
| nysa | [nysa](https://behkooshan.ir/product/nysa/) | Nysa | domestic | Granite | Iran | – | – | yes | yes | 6733 | 2026-01-26 | 2026-01-26 |
| oyster-quartz | [oyster](https://behkooshan.ir/product/oyster/) | Oyster Quartz | imported | Marble | Angola | white | Granite | yes | – | 4810 | 2023-09-05 | 2023-09-26 |
| patagonia-a | [patagonia](https://behkooshan.ir/product/patagonia/) | Patagonia “A” | imported | Granite | Brazil | cream | Granite | yes | – | 4815 | 2023-09-05 | 2023-09-26 |
| patagonia-black | [patagonia-black](https://behkooshan.ir/product/patagonia-black/) | Patagonia Black | imported | Granite | India | black, pink | Granite | yes | yes | 5724 | 2025-05-07 | 2025-07-21 |
| patagonia-green | [patagonia-green](https://behkooshan.ir/product/patagonia-green/) | Patagonia Green | imported | Granite | Brazil | – | – | yes | – | 5471 | 2023-12-12 | 2025-05-07 |
| patagonia-original | [patagonia-orginal](https://behkooshan.ir/product/patagonia-orginal/) | Patagonia Orginal | imported | Granite | Brazil | – | – | yes | yes | 5477 | 2023-12-12 | 2025-05-07 |
| patagonia-pink | [patagonia-pink](https://behkooshan.ir/product/patagonia-pink/) | Patagonia Pink | imported | Granite | India | pink, white | – | yes | – | 5720 | 2025-05-07 | 2025-05-07 |
| patagonia-tourmaline | [patagonia-troumaline](https://behkooshan.ir/product/patagonia-troumaline/) | Patagonia Tourmaline | imported | Granite | Brazil | – | – | yes | – | 5482 | 2023-12-12 | 2025-05-07 |
| picasso | [picasso](https://behkooshan.ir/product/picasso/) | Picasso | domestic | Granite | Iran | – | Granite | yes | – | 3925 | 2023-08-01 | 2023-12-12 |
| platinum | [platinum](https://behkooshan.ir/product/platinum/) | Platinum | imported | Granite | India | black | Granite | yes | – | 4821 | 2023-09-05 | 2025-07-28 |
| pumpkin-viola | [pumpkin-viola](https://behkooshan.ir/product/pumpkin-viola/) | Pumpkin Viola | domestic | Marble | Iran | cream | Marble | yes | – | 6839 | 2026-09-21 | 2026-09-21 |
| purple-rain | [purple-rain](https://behkooshan.ir/product/purple-rain/) | Purple Rain | domestic | Granite | Iran | grey | Granite | yes | yes | 5736 | 2025-05-07 | 2025-07-28 |
| python | [python](https://behkooshan.ir/product/python/) | Python | domestic | Granite | Iran | – | Granite | yes | – | 3928 | 2023-08-01 | 2023-12-12 |
| quartzite-levanto | [quartzite-levatnto](https://behkooshan.ir/product/quartzite-levatnto/) | Quartzite Levanto | imported | Quartzite | Brazil | – | – | yes | – | 6628 | 2025-09-23 | 2025-09-23 |
| river-noire | [river-noire](https://behkooshan.ir/product/river-noire/) | River Noire | imported | Granite | India | black | Granite | yes | – | 6606 | 2025-09-21 | 2025-11-19 |
| river-stone | [river-stone](https://behkooshan.ir/product/river-stone/) | River Stone | imported | Granite | Brazil | black, grey | Granite | yes | – | 6499 | 2025-09-01 | 2025-09-01 |
| rosso-fantastico | [rosso-fantastico](https://behkooshan.ir/product/rosso-fantastico/) | Rosso Fantastic | domestic | Granite | Iran | – | Granite | yes | – | 3934 | 2023-08-01 | 2025-09-28 |
| sanded-white | [sanded-white](https://behkooshan.ir/product/sanded-white/) | Sanded White | domestic | Granite | Iran | – | – | yes | yes | 5361 | 2023-12-12 | 2025-08-17 |
| serpentine | [serpentine](https://behkooshan.ir/product/serpentine/) | Serpentine | domestic | Granite | Iran | – | Granite | yes | – | 3940 | 2023-08-01 | 2023-12-12 |
| silver-fusion | [silver-fusion](https://behkooshan.ir/product/silver-fusion/) | Silver Fusion | imported | Granite | Brazil | grey | Granite | yes | – | 4826 | 2023-09-05 | 2023-09-26 |
| space-gray | [space-gray](https://behkooshan.ir/product/space-gray/) | Space Gray | domestic | Granite | Iran | – | – | yes | – | 5371 | 2023-12-12 | 2023-12-12 |
| spectrolite-blue | [spectrolite-blue](https://behkooshan.ir/product/spectrolite-blue/) | Spectrolite Blue | imported | Granite | Ukraine | black | Granite | yes | – | 4831 | 2023-09-05 | 2023-09-26 |
| t-rex | [t-rex](https://behkooshan.ir/product/t-rex/) | T.Rex | domestic | Granite | Iran | – | – | yes | yes | 6613 | 2025-09-21 | 2026-05-19 |
| taj-mahal | [taj-mahal](https://behkooshan.ir/product/taj-mahal/) | Taj Mahal | imported | Granite | Angola | – | – | yes | – | 5487 | 2023-12-12 | 2023-12-12 |
| titanium-mc | [titanium-mc](https://behkooshan.ir/product/titanium-mc/) | Titanium MC | imported | Granite | Brazil | black | Granite | yes | yes | 4836 | 2023-09-05 | 2023-09-26 |
| tropical-storm | [tropical-storm](https://behkooshan.ir/product/tropical-storm/) | Tropical Storm | imported | Granite | Angola | black | Granite | yes | yes | 5576 | 2024-01-22 | 2025-07-27 |
| turquoise | [turquoise](https://behkooshan.ir/product/turquoise/) | Turquoise | domestic | Granite | Iran | – | Quartzite | yes | yes | 3943 | 2023-08-01 | 2025-07-28 |
| venetian-granite | [venetian-granite](https://behkooshan.ir/product/venetian-granite/) | Venetian Granite | domestic | Granite | Iran | – | – | yes | yes | 6667 | 2025-11-03 | 2025-11-03 |
| verde-atlantic | [verde-atlantic](https://behkooshan.ir/product/verde-atlantic/) | Verde Atlantic | domestic | Granite | Iran | green | Granite | yes | – | 6848 | 2026-09-21 | 2026-09-21 |
| verde-fantastic | [verde-fantastic](https://behkooshan.ir/product/verde-fantastic/) | Verde Fantastic | domestic | Granite | Iran | white | Marble | yes | yes | 3946 | 2023-08-01 | 2023-12-12 |
| verde-imperial | [verde-imperial](https://behkooshan.ir/product/verde-imperial/) | Verde Imperial | domestic | Granite | Iran | green | Granite | yes | yes | 3949 | 2023-08-01 | 2025-07-27 |
| verde-karzai | [verde-karzai](https://behkooshan.ir/product/verde-karzai/) | Verde Karzai | domestic | Granite | Iran | – | – | yes | – | 5389 | 2023-12-12 | 2025-07-28 |
| via-lattea | [via-lattea](https://behkooshan.ir/product/via-lattea/) | Via Lattea | imported | Granite | Brazil | black | Granite | yes | – | 4841 | 2023-09-05 | 2023-12-12 |
| volga-blue | [volga-blue](https://behkooshan.ir/product/volga-blue/) | Volga Blue | imported | Granite | Ukraine | black | Granite | yes | yes | 4846 | 2023-09-05 | 2023-09-26 |

## (a) New products on the live site

| slug | name (en, site) | name (fa, mine) | sites | category | Type | نوع | Origin | کشور مبدا | colour | published | images | texture |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| belissimo-verde | Belissimo Verde | بلیسیمو ورده | fa+en | domestic | Granite | گرانیت | Iran | ایران | Green | 2026-09-21 | Belissimo-Verde.jpg 1052x646 | yes |
| bianco-vena | Bianco Vena | بیانکو ونا | fa+en | imported | Marble | مرمریت | Greece | یونان | White | 2026-09-21 | Bianco-Vena.webp 1052x646 | link only |
| calacatta-rhino | Calacatta Rhino | کالاکاتا راینو | fa+en | imported | Marble | مرمریت | Namibia | نامیبیا | White | 2026-09-21 | Calacatta-Rhino.webp 1052x646 | link only |
| calacatta-viola | Calacatta Viola | کالاکاتا ویولا | fa+en | imported | Marble | مرمریت | Italy | ایتالیا | Cream | 2026-09-21 | Calacatta-Viola.webp 1052x646 | link only |
| namibia-white | Namibia White | نامیبیا وایت | fa | imported | Marble | مرمریت | Namibia | نامیبیا | White | 2026-05-05 | Namibia.jpg 1880x1080 | yes |
| pumpkin-viola | Pumpkin Viola | پامپکین ویولا | fa+en | domestic | Marble | مرمریت | Iran | ایران | Cream | 2026-09-21 | Pumpkin-Viola.webp 1052x646 | link only |
| rosso-levanto | Rosso Levanto | روسو لوانتو | fa | imported | Marble | مرمریت | Italy | ایتالیا | Pink | 2026-05-05 | Rosso-Levanto.jpg 1920x1016 | yes |
| verde-atlantic | Verde Atlantic | ورده آتلانتیک | fa+en | domestic | Granite | گرانیت | Iran | ایران | Green | 2026-09-21 | Verde-Atlantic.webp 1052x646 | link only |

The Persian-script names of the new products are my transliterations (flagged in `translated_fields`), like the other products' Persian names: the site writes every name in Latin letters on both sites.

## (b) Research products no longer on the live site

Nothing is deleted by the patch; these are reported and marked (`listed_on_live_site`).

| slug | site | former URL / what happened | action |
|---|---|---|---|
| black-fantasy | both | renamed: continued as `black-tempest` (same post 4276) | remove the folder (and `media/black-fantasy/`), or the stone is listed twice |
| river-blanche | both | https://fa.behkooshan.ir/product/river-blanche/, https://behkooshan.ir/product/river-blanche/ | kept, decide whether to keep it in the catalogue |

Former URLs of products that are still live (the product moved or was re-published):

| slug | live check |
|---|---|
| black-tempest | on the Persian site the product is at https://fa.behkooshan.ir/product/black-tempest/; https://fa.behkooshan.ir/product/black-fantasy/ is no longer on the site. |
| black-tempest | on the English site the product is at https://behkooshan.ir/product/black-tempest/; https://behkooshan.ir/product/black-fantasy/ is no longer on the site. |
| black-zebra | on the Persian site the product is at https://fa.behkooshan.ir/product/black-zebra/; https://fa.behkooshan.ir/product/zebra/ is no longer on the site. |
| black-zebra | on the English site the product is at https://behkooshan.ir/product/black-zebra/; https://behkooshan.ir/product/zebra/ is no longer on the site. |
| emerald-quartzite | on the Persian site the product is at https://fa.behkooshan.ir/product/emerald-quartzite/; https://fa.behkooshan.ir/product/emerald-green/ is no longer on the site. |
| kojin | on the Persian site the product is at https://fa.behkooshan.ir/product/kojin/; https://fa.behkooshan.ir/product/nehbandan/ is no longer on the site. |
| lumix-wow | on the Persian site the product is at https://fa.behkooshan.ir/product/lumix-wow/; https://fa.behkooshan.ir/product/new-lumix-wow/ is no longer on the site. |
| platinum | on the Persian site the product is at https://fa.behkooshan.ir/product/platinum/; https://fa.behkooshan.ir/product/platinium/ is no longer on the site. |
| platinum | on the English site the product is at https://behkooshan.ir/product/platinum/; https://behkooshan.ir/product/platinium/ is no longer on the site. |
| t-rex | on the English site the product is at https://behkooshan.ir/product/t-rex/; https://behkooshan.ir/product/t-rex-2/ is no longer on the site. |

## (c) Name changes

| slug | site | was (archive) | live |
|---|---|---|---|
| black-tempest | fa | Black Fantasy | Black Tempest |
| black-tempest | en | Black Fantasy | Black Tempest |
| black-zebra | en | Zebra | Black Zebra |
| emerald-quartzite | fa | Emerald Green | Emerald Quartzite |
| jasmin | en | Jasmin | Jasmine |
| kosmus-a | fa | “Kosmus “A | Kosmus “A” |
| platinum | fa | Platinium | Platinum |

`name.en` follows the English site, so it changes too: `jasmin` "Jasmin" → "Jasmine". Slugs are not renamed (a folder rename would be a delete). The Persian `name.fa` values are my transliterations and stay as they are.

Site titles now known for the first time (the product had never been archived on that site): `cohiba` (fa: "Cohiba"), `cristallo-rosa` (en: "Cristallo Rosa"), `dolce-vita` (fa: "Dolce Vita"), `elegant-brown` (fa: "Elegant Brown"), `gando` (fa: "Gando"), `grand-antique` (fa: "Grand Antique"), `green-shadow` (fa: "Green Shadow"), `jeriba-blue` (fa: "Jeriba Blue"), `kosmus-gold` (fa: "Kosmus Gold"), `milky-way` (fa: "Milky Way"), `mozzarella` (en: "Mozzarella"), `nysa` (fa: "Nysa"), `purple-rain` (fa: "Purple Rain"), `venetian-granite` (fa: "Venetian Granite").

## (d) Spec, category, type and colour changes

Old = research (archive), new = live. Persian values that the Persian page shows as English words are translated with the site's own Persian words, as before, and flagged.

| slug | lang | field | old | new | note |
|---|---|---|---|---|---|
| alaska-white | fa | specs.رنگ | – | کرم | – |
| alaska-white | en | specs.Colour | – | Cream | – |
| black-tempest | both | category | – | imported | – |
| black-tempest | fa | specs.نوع | – | کوارتزیت | – |
| black-tempest | fa | specs.دسته‌بندی | – | وارداتی | – |
| black-tempest | fa | specs.کشور مبدا | – | برزیل | – |
| black-tempest | fa | specs.رنگ | – | طوسی | – |
| black-tempest | en | specs.Colour | – | Grey | – |
| black-tempest | en | specs.Category | – | Imported | – |
| black-tempest | en | specs.Type | – | Quartzite | – |
| black-tempest | en | specs.Origin | – | Brazil | – |
| cohiba | fa | specs.رنگ | – | مشکی | – |
| cohiba | en | specs.Colour | – | Black | – |
| cristallo-rosa | fa | specs.رنگ | – | کرم, سفید | – |
| cristallo-rosa | en | specs.Colour | – | Cream, White | – |
| dedalus | fa | specs.رنگ | – | سبز | – |
| dedalus | en | specs.Colour | – | Green | – |
| dolce-vita | fa | specs.رنگ | – | کرم, سفید | – |
| dolce-vita | en | specs.Colour | – | Cream, White | – |
| elegant-brown | fa | specs.رنگ | – | کرم | – |
| elegant-brown | en | specs.Colour | – | Cream | – |
| explosion-blue | fa | specs.کشور مبدا | آنگولا | برزیل | – |
| grand-antique | fa | specs.رنگ | – | مشکی, سفید | – |
| grand-antique | en | specs.Colour | – | Black, White | – |
| jeriba-blue | fa | specs.رنگ | – | آبی, طوسی | – |
| jeriba-blue | en | specs.Colour | – | Blue, Grey | – |
| kojin | fa | specs.رنگ | – | کرم | – |
| kojin | en | specs.Colour | – | Cream | – |
| lumix-wow | en | specs.Origin | Brazil | India | – |
| mozzarella | fa | specs.رنگ | – | کرم | – |
| mozzarella | en | specs.Colour | – | Cream | – |
| negresco | fa | specs.کشور مبدا | آنگولا | برزیل | – |
| new-patagonia | fa | specs.رنگ | – | کرم | – |
| new-patagonia | en | specs.Colour | – | Cream | – |
| purple-rain | fa | specs.رنگ | – | طوسی | – |
| purple-rain | en | specs.Colour | – | Grey | – |
| river-noire | fa | specs.رنگ | – | مشکی | – |
| river-noire | en | specs.Colour | – | Black | – |
| river-stone | fa | specs.رنگ | – | مشکی, طوسی | – |
| river-stone | en | specs.Colour | – | Black, Grey | – |
| t-rex | fa | specs.رنگ | – | طوسی | – |
| t-rex | en | specs.Colour | – | Grey | – |

By field: رنگ 16, Colour 16, کشور مبدا 3, Origin 2, category 1, نوع 1, دسته‌بندی 1, Category 1, Type 1.

## (e) Description and other text

No product has description text on the live site. The WooCommerce description and short description are now empty
on every product except `absolute-black` and `bubble-gray`, which still carry the placeholder «توضیح محصول ...» and the
generic quartzite paragraph. `description` stays null everywhere, and the shared note changes on every product that has
a live page:

* old: "Description: the site has no product-specific description text (the WooCommerce description field holds the
  placeholder "توضیح محصول ..." and the short description is one generic quartzite paragraph shared by all products),
  so description is null."
* new: "Description: the live site (2026-09-24) has no description text for this product (the WooCommerce description
  and short description are empty on both language sites), so description is null." (absolute-black and bubble-gray
  keep the old note, which is still true.)

The **Quarry page** (`natanz-white-granite-rijen`) is unchanged: title and text are identical to the research in both
languages, and its 13 photos are the same pictures (the English site's are re-saved webp copies).

The site-wide "Beautifully Strong" block quoted in the README is unchanged on the live pages.


## (f) Image and texture changes

Compared by decoded pixels and by picture similarity at any size, not by URL or bytes (see Method). "larger original" / "larger copy" = the live site has a bigger file of the picture than the research held; the new file (within the size rule, see below) is added and the old record becomes kind `superseded` (file kept). "already holds the site's copy" = the research's file is already the largest copy the size rule allows; only `original_upload` is added to its record. "not on the live site" = the research picture is no longer shown by either site; its record becomes kind `former` (file kept), which `derive-products.py` does not show.

### Images

| slug | kind | change | live file | live size | research file | research size | seen on |
|---|---|---|---|---|---|---|---|
| belissimo-verde | main | new picture | Belissimo-Verde.jpg | 1052x646 |  | – | product page https://fa.behkooshan.ir/product/belissimo-verde/, og:image of https://fa.behkooshan.ir/product/belissimo-verde/, product page https://behkooshan.i |
| belvedere | main | already holds the site's 2048x1019 copy; original upload 6737x3353 recorded; kind listing -> main | 3776_-025.jpg | 6737x3353 | images/02-3776_-025-2048x1019.jpg | – | product page https://fa.behkooshan.ir/product/belvedere/, og:image of https://fa.behkooshan.ir/product/belvedere/, product page https://behkooshan.ir/product/be |
| belvedere | main | not on the live site | – | – | images/01-belvedere-m_11zon.jpg | 1052x646 |  |
| belvedere | listing | not on the live site | – | – | images/03-belvedere-p_11zon.jpg | 1077x794 |  |
| bianco-vena | main | new picture | Bianco-Vena.webp | 1052x646 |  | – | product page https://fa.behkooshan.ir/product/bianco-vena/, og:image of https://fa.behkooshan.ir/product/bianco-vena/, product page https://behkooshan.ir/produc |
| black-tempest | main | copied from the former product folder (same picture) | black-fantasy.jpg | 1052x646 | images/01-black-fantasy.jpg | – | product page https://fa.behkooshan.ir/product/black-tempest/, product page https://behkooshan.ir/product/black-tempest/ |
| black-tempest | listing | copied from the former product folder (same picture) | black-fantasy2.jpg | 1077x794 | images/02-black-fantasy2.jpg | – | og:image of https://fa.behkooshan.ir/product/black-tempest/, og:image of https://behkooshan.ir/product/black-tempest/ |
| bubble-gray | main | new picture | Bubble-Gray-m.jpg | 1052x646 |  | – | product page https://fa.behkooshan.ir/product/bubble-gray/, product page https://behkooshan.ir/product/bubble-gray/ |
| calacatta-rhino | main | new picture | Calacatta-Rhino.webp | 1052x646 |  | – | product page https://fa.behkooshan.ir/product/calacatta-rhino/, og:image of https://fa.behkooshan.ir/product/calacatta-rhino/, product page https://behkooshan.i |
| calacatta-viola | main | new picture | Calacatta-Viola.webp | 1052x646 |  | – | product page https://fa.behkooshan.ir/product/calacatta-viola/, og:image of https://fa.behkooshan.ir/product/calacatta-viola/, product page https://behkooshan.i |
| cristallo-rosa | main | new picture | Crystal-Rose-m.webp | 1052x646 |  | – | product page https://fa.behkooshan.ir/product/cristallo-rosa/, product page https://behkooshan.ir/product/cristallo-rosa/ |
| cristallo-rosa | listing | larger original | Crystal-Rose-p.webp | 1077x794 | images/01-Crystal-Rose-p-1024x755.webp | 1024x755 | og:image of https://fa.behkooshan.ir/product/cristallo-rosa/, og:image of https://behkooshan.ir/product/cristallo-rosa/ |
| dolce-vita | main | larger copy (original upload recorded) | 4037-004-1.jpg | 6473x3745 | images/01-4037-004_68a56914930db_1755670804_compressed.jpg | 1729x997 | product page https://fa.behkooshan.ir/product/dolce-vita/, og:image of https://fa.behkooshan.ir/product/dolce-vita/, product page https://behkooshan.ir/product/ |
| elegant-brown | main | same picture; kind listing -> main | Elegant-Brown.jpg | 1052x646 | images/01-Elegant-Brown-1.jpg | – | product page https://fa.behkooshan.ir/product/elegant-brown-2/, og:image of https://fa.behkooshan.ir/product/elegant-brown-2/, product page https://behkooshan.i |
| elegant-green | main | larger original | Elegant-Green-m.jpg | 1052x646 | images/01-Elegant-Green-m-1024x629.jpg | 1024x629 | product page https://fa.behkooshan.ir/product/elegant-green/, product page https://behkooshan.ir/product/elegant-green/ |
| evolution-green | main | larger original | Evolution-Green-m.jpg | 1052x646 | images/01-Evolution-Green-m-1024x629.jpg | 1024x629 | product page https://fa.behkooshan.ir/product/evolution-green/, product page https://behkooshan.ir/product/evolution-green/ |
| grand-antique | main | same picture; kind listing -> main | Grand-Antique.jpg | 1920x1229 | images/01-Grand-Antique.jpg | – | product page https://fa.behkooshan.ir/product/grand-antique/, og:image of https://fa.behkooshan.ir/product/grand-antique/, product page https://behkooshan.ir/pr |
| jeriba-blue | main | same picture; kind listing -> main | 030618-001_68a56ffa74e19_1755672570_compressed.jpg | 1920x1211 | images/01-030618-001_68a56ffa74e19_1755672570_compressed.jpg | – | product page https://fa.behkooshan.ir/product/jeriba-blue/, og:image of https://fa.behkooshan.ir/product/jeriba-blue/, product gallery of https://fa.behkooshan. |
| lumix-wow | gallery | already held as a project photo | Lumix.webp | 1024x1536 | images/03-Lumix.webp | – | product gallery of https://behkooshan.ir/product/new-lumix-wow/ |
| milky-way | main | already holds the site's 2048x1267 copy; original upload 6065x3753 recorded | Milky-Way.jpg | 6065x3753 | images/01-Milky-Way-2048x1267.jpg | – | product page https://fa.behkooshan.ir/product/milky-way/, og:image of https://fa.behkooshan.ir/product/milky-way/, product page https://behkooshan.ir/product/mi |
| mozzarella | main | new picture | Mozzarella-m.jpg | 1052x646 |  | – | product page https://fa.behkooshan.ir/product/mozzarella/, product page https://behkooshan.ir/product/mozzarella/ |
| namibia-white | main | new picture | Namibia.jpg | 1880x1080 |  | – | product page https://fa.behkooshan.ir/product/namibia-white/, og:image of https://fa.behkooshan.ir/product/namibia-white/ |
| new-patagonia | main | larger original | New-Patagonia-1.jpg | 1920x1077 | images/02-New-Patagonia-1-1536x862.jpg | 1536x862 | product page https://fa.behkooshan.ir/product/new-patagonia/, og:image of https://fa.behkooshan.ir/product/new-patagonia/, product page https://behkooshan.ir/pr |
| new-patagonia | main | not on the live site | – | – | images/01-New-Patagonia-m_11zon.jpg | 1052x646 |  |
| new-patagonia | listing | not on the live site | – | – | images/03-New-Patagonia-p_11zon.jpg | 1077x794 |  |
| nysa | main | larger copy (original upload recorded) | 49031-001.jpg | 4633x1897 | images/01-49031-001.jpg | 1920x786 | product page https://fa.behkooshan.ir/product/nysa/, og:image of https://fa.behkooshan.ir/product/nysa/, product page https://behkooshan.ir/product/nysa/, og:im |
| pumpkin-viola | main | new picture | Pumpkin-Viola.webp | 1052x646 |  | – | product page https://fa.behkooshan.ir/product/pumpkin-viola/, og:image of https://fa.behkooshan.ir/product/pumpkin-viola/, product page https://behkooshan.ir/pr |
| purple-rain | main | new picture | Purple-Rain-m1_688779518e62c_1753708881_compressed.jpg | 1052x646 |  | – | product page https://fa.behkooshan.ir/product/purple-rain/, product page https://behkooshan.ir/product/purple-rain/ |
| purple-rain | listing | new picture | Purple-Rain-p_68877951f3fa7_1753708881_compressed.jpg | 1077x794 |  | – | og:image of https://fa.behkooshan.ir/product/purple-rain/, og:image of https://behkooshan.ir/product/purple-rain/ |
| purple-rain | main | not on the live site | – | – | images/01-Purple-Rain-m.jpg | 1052x646 |  |
| purple-rain | listing | not on the live site | – | – | images/02-Purple-Rain-p.jpg | 1077x794 |  |
| quartzite-levanto | main | already holds the site's 2048x1112 copy; original upload 6561x3561 recorded; kind listing -> main | 254_1__-024.jpg | 6561x3561 | images/01-254_1__-024-2048x1112.jpg | – | product page https://fa.behkooshan.ir/product/quartzite-levatnto/, og:image of https://fa.behkooshan.ir/product/quartzite-levatnto/, product page https://behkoo |
| river-noire | main | larger copy (original upload recorded) | 4643-004.jpg | 5905x3601 | images/02-4643-004-scaled.jpg | 1771x1080 | product page https://fa.behkooshan.ir/product/river-noir/, og:image of https://fa.behkooshan.ir/product/river-noir/ |
| river-noire | main | already holds the site's 2048x1227 copy; original upload 5865x3513 recorded; kind listing -> main | 4643-005.jpg | 5865x3513 | images/01-4643-005-2048x1227.jpg | – | product page https://behkooshan.ir/product/river-noire/, og:image of https://behkooshan.ir/product/river-noire/ |
| river-stone | main | same picture; kind listing -> main | River-Stone.jpg | 1920x1189 | images/01-River-Stone.jpg | – | product page https://behkooshan.ir/product/river-stone/, og:image of https://behkooshan.ir/product/river-stone/ |
| rosso-fantastico | main | new picture | Rosso-Fantastic.jpg | 1920x1229 |  | – | product page https://behkooshan.ir/product/rosso-fantastico/, og:image of https://behkooshan.ir/product/rosso-fantastico/ |
| rosso-levanto | main | new picture | Rosso-Levanto.jpg | 1920x1016 |  | – | product page https://fa.behkooshan.ir/product/rosso-levanto/, og:image of https://fa.behkooshan.ir/product/rosso-levanto/ |
| t-rex | main | already holds the site's 2048x1116 copy; original upload 5889x3209 recorded; kind listing -> main | 3878X1-001.jpg | 5889x3209 | images/02-3878X1-001-2048x1116.jpg | – | product page https://fa.behkooshan.ir/product/t-rex-2/, og:image of https://fa.behkooshan.ir/product/t-rex-2/, product page https://behkooshan.ir/product/t-rex/ |
| venetian-granite | main | larger copy (original upload recorded) | 4615-007.jpg | 5873x3649 | images/01-4615-007.jpg | 1738x1080 | product page https://fa.behkooshan.ir/product/venetian-granite/, og:image of https://fa.behkooshan.ir/product/venetian-granite/, product page https://behkooshan |
| verde-atlantic | main | new picture | Verde-Atlantic.webp | 1052x646 |  | – | product page https://fa.behkooshan.ir/product/verde-atlantic/, og:image of https://fa.behkooshan.ir/product/verde-atlantic/, product page https://behkooshan.ir/ |

### Textures ("Texture Download")

| slug | change | live file | size | research file | link |
|---|---|---|---|---|---|
| alaska-white | new texture file | Alaska-scaled.jpg | 1889x1080 |  | https://behkooshan.ir/?jet_download=39d8be37122c7adb79ebee0a5830d801e9a239aa |
| belissimo-verde | texture now held (same picture as a new product image) | Belissimo-Verde.jpg | 1052x646 |  | https://fa.behkooshan.ir/?jet_download=0cac8979b896658889920fa2aea61b70ea3c35bf, https://behkooshan.ir/?jet_download=136ad7a49d706b542be4879e396fc5bc4fc951a8 |
| bellatrix | texture now held (same picture as a product image) | Bellatrix.jpg | 1920x1229 | images/01-Bellatrix.jpg | https://fa.behkooshan.ir/?jet_download=098c84f40ccdfdef9f6f1e8868dfe528d89b201e, https://behkooshan.ir/?jet_download=8a0cb97e468794f6cfddcc87fec18e958f20f361 |
| belvedere | new texture file | 3776_-025-scaled.jpg | 1920x956 |  | https://fa.behkooshan.ir/?jet_download=e7dc7248aaea8f275988dc6751656950a531abf1, https://behkooshan.ir/?jet_download=e95157100b6293ec0d8d6907143bb7ba23c3d871 |
| belvedere | not on the live site | – | – | textures/01-belvedere.jpg | https://fa.behkooshan.ir/?jet_download=55224e65fbede3c8f3cc2ab8986542fac51645f5 |
| black-horse | new texture file | Black-Horse.jpg | 1466x901 |  | https://fa.behkooshan.ir/?jet_download=7b80c7f673da76a1d89f24dd750285f9b485ad5d, https://behkooshan.ir/?jet_download=7b80c7f673da76a1d89f24dd750285f9b485ad5d |
| black-tempest | texture now held (same picture as a new product image) | black-fantasy.jpg | 1052x646 |  | https://fa.behkooshan.ir/?jet_download=8629d2593c3f7fbc20a5b8d18ffe2e8da3db5447, https://behkooshan.ir/?jet_download=8629d2593c3f7fbc20a5b8d18ffe2e8da3db5447 |
| bubble-gray | new texture file | Bubble-Gray.jpg | 1793x877 |  | https://fa.behkooshan.ir/?jet_download=359eb3629ce52dafea95b3982c8dc55412392942, https://behkooshan.ir/?jet_download=359eb3629ce52dafea95b3982c8dc55412392942 |
| casper | new texture file | Casper.jpg | 1376x880 |  | https://fa.behkooshan.ir/?jet_download=b4010f429f6e5e3393a3dc816346a9b739480c66, https://behkooshan.ir/?jet_download=b4010f429f6e5e3393a3dc816346a9b739480c66 |
| cohiba | new texture file | Cohiba-scaled-1.jpg | 1598x1080 |  | https://fa.behkooshan.ir/?jet_download=fd5d43ffe1e904f781ff971a9ac7136b5b9f8ae9, https://behkooshan.ir/?jet_download=7b420d145f1e064eb00bb3403c6a5e241d3f7d92 |
| colonial | texture now held (same picture as a product image) | Colonial.jpg | 1052x646 | images/01-Colonial.jpg | https://fa.behkooshan.ir/?jet_download=b065d8cabf71d8069ee10ab38d820fb9e6555bf5, https://behkooshan.ir/?jet_download=b065d8cabf71d8069ee10ab38d820fb9e6555bf5 |
| dalmata | new texture file | Dalmata-1-scaled.jpg | 1830x1080 |  | https://fa.behkooshan.ir/?jet_download=b6e885d7ee189022828e6d59815333b622ce4547, https://behkooshan.ir/?jet_download=b6e885d7ee189022828e6d59815333b622ce4547 |
| dark-golden-lightning | new texture file | Dark-Golden-Lightning.jpg | 1390x913 |  | https://fa.behkooshan.ir/?jet_download=818f960bdb97effe4f37d146674a9dba0d49ed40, https://behkooshan.ir/?jet_download=818f960bdb97effe4f37d146674a9dba0d49ed40 |
| delicate | new texture file | Delicate.jpg | 1325x904 |  | https://fa.behkooshan.ir/?jet_download=6aaa14c5015ea3c1d1cf433ac4d7e63683bb78bd, https://behkooshan.ir/?jet_download=6aaa14c5015ea3c1d1cf433ac4d7e63683bb78bd |
| dolce-vita | new texture file | 4037-004-1-scaled.jpg | 1867x1080 |  | https://fa.behkooshan.ir/?jet_download=37e73546da768ef5338cbb073b7538dcf5461f68, https://behkooshan.ir/?jet_download=8a53250a0e34ebb60331cf3faf57c2b92bdc69a6 |
| elegant-brown | texture now held (same picture as a product image) | Elegant-Brown.jpg | 1052x646 | images/01-Elegant-Brown-1.jpg | https://fa.behkooshan.ir/?jet_download=3718e4cdc10c12c04d3a03a42177af60845f07dd, https://behkooshan.ir/?jet_download=4413132198c31042a11bec8a74ccfe4778dd2afc |
| elegant-green | new texture file | Elegant-Green.jpg | 1520x907 |  | https://fa.behkooshan.ir/?jet_download=91c9041981b1bd932b305cf32352a8276e74df6c, https://behkooshan.ir/?jet_download=91c9041981b1bd932b305cf32352a8276e74df6c |
| emerald-quartzite | new texture file | Emerald-Quartzite.jpg | 1424x877 |  | https://fa.behkooshan.ir/?jet_download=c91adb1d97037adec10ade946c91c80c4e5ce3b5, https://behkooshan.ir/?jet_download=c91adb1d97037adec10ade946c91c80c4e5ce3b5 |
| evolution-green | new texture file | Evolution-Green.jpg | 1687x889 |  | https://fa.behkooshan.ir/?jet_download=9d6ecc94622f749788bbf6a62190b2b235a2b753, https://behkooshan.ir/?jet_download=9d6ecc94622f749788bbf6a62190b2b235a2b753 |
| gando | new texture file | Gando-1-scaled-1.jpg | 1920x866 |  | https://fa.behkooshan.ir/?jet_download=f751198aa6d9138ccd3d82114b1050540b844648 |
| gando | texture now held (same picture as a product image) | Gando-1-m.jpg | 1052x646 | images/01-Gando-1-m.jpg | https://behkooshan.ir/?jet_download=741bf43acf845c3c131b97afa5a1a592974c08c4 |
| grand-antique | texture now held (same picture as a product image) | Grand-Antique.jpg | 1920x1229 | images/01-Grand-Antique.jpg | https://fa.behkooshan.ir/?jet_download=8eeec848182d1758f21fc80a504b9e2fd0cf06a6, https://behkooshan.ir/?jet_download=45f4f3e65735593b8cbf4bf8ad9b76526f23bc90 |
| green-shadow | new texture file | Green-Shadow-scaled-1.jpg | 1920x927 |  | https://fa.behkooshan.ir/?jet_download=ea1ecca3465a74a79547a7803d93ab87d812e054 |
| infinity-gold | new texture file | Infinity-Gold.jpg | 1368x877 |  | https://fa.behkooshan.ir/?jet_download=e227f1fbd8584e7e789e26b712960de58d0ce963, https://behkooshan.ir/?jet_download=e227f1fbd8584e7e789e26b712960de58d0ce963 |
| jasmin | new texture file | Jasmin.jpg | 1393x895 |  | https://fa.behkooshan.ir/?jet_download=c52eeea673ab1455e0c839d34fe00db083a19ea3, https://behkooshan.ir/?jet_download=c52eeea673ab1455e0c839d34fe00db083a19ea3 |
| jeriba-blue | texture now held (same picture as a product image) | 030618-001_68a56ffa74e19_1755672570_compressed.jpg | 1920x1211 | images/01-030618-001_68a56ffa74e19_1755672570_compressed.jpg | https://fa.behkooshan.ir/?jet_download=0240b445520fd88c3d809d8ac9b05312fd0a0786, https://behkooshan.ir/?jet_download=294855dcff2c64ccf447d4da7ae613dc3c5617a9 |
| jet-black | new texture file | Jet-Black.jpg | 1379x856 |  | https://fa.behkooshan.ir/?jet_download=98c8a53cc4fc35a45ef4ac56b2b871c49e0c4530, https://behkooshan.ir/?jet_download=98c8a53cc4fc35a45ef4ac56b2b871c49e0c4530 |
| kojin | texture now held (same picture as a product image) | nehbandan.jpg | 1052x646 | images/01-nehbandan.jpg | https://fa.behkooshan.ir/?jet_download=da70db7b7a3a3d1fa219f408b6e8d5bc6b328954, https://behkooshan.ir/?jet_download=8f83fa74a350d4091df1c64e49fc3bbdcfd33484 |
| kosmus-gold | texture now held (same picture as a product image) | Kosmus-Gold-m.jpg | 1052x646 | images/01-Kosmus-Gold-m.jpg | https://fa.behkooshan.ir/?jet_download=3fdf5ddfad7288ae6ab919ef8cd99be94018826e |
| kosmus-gold | new texture file | 3447_1-001-scaled.jpg | 1889x1080 |  | https://behkooshan.ir/?jet_download=e49db242696668881085f4732d9b2ca38d0f585c |
| lemurian-labradorite | new texture file | labradorite.jpg | 1052x646 |  | https://fa.behkooshan.ir/?jet_download=769d7c66b9ce71cf30455e9ab4fc79dcadd7b5cf, https://behkooshan.ir/?jet_download=769d7c66b9ce71cf30455e9ab4fc79dcadd7b5cf |
| lumix-wow | new texture file | New-Lumix-wow-scaled.jpg | 1917x1080 |  | https://fa.behkooshan.ir/?jet_download=d2aa6bfe6a9efd14aeb1cba4c341ae9f811773f2, https://behkooshan.ir/?jet_download=986a7673c4a96c5038b4777acd18c3235805a84f |
| magma-gold | texture now held (same picture as a product image) | Magma_Goldb.jpg | 1052x646 | images/01-Magma_Goldb.jpg | https://fa.behkooshan.ir/?jet_download=852192fa9c417e360f4b32814b9231785e922131, https://behkooshan.ir/?jet_download=852192fa9c417e360f4b32814b9231785e922131 |
| malibu-red | new texture file | Malibu-Red.jpg | 1370x877 |  | https://fa.behkooshan.ir/?jet_download=bb2888a8f66233d3a176ebdd17727f96bdc93fb9, https://behkooshan.ir/?jet_download=bb2888a8f66233d3a176ebdd17727f96bdc93fb9 |
| mercury-black | texture now held (same picture as a product image) | mercury-black.jpg | 1052x646 | images/01-mercury-black.jpg | https://fa.behkooshan.ir/?jet_download=7f9b8e49da1e09a638580e9df235b70da50577fa, https://behkooshan.ir/?jet_download=7f9b8e49da1e09a638580e9df235b70da50577fa |
| meteorus | texture now held (same picture as a product image) | ChatGPT-Image-Dec-23-2025-10_44_38-AM.jpg | 1492x859 | images/01-ChatGPT-Image-Dec-23-2025-10_44_38-AM.jpg | https://fa.behkooshan.ir/?jet_download=ac9d2dfb849685fc07dc69495e2788015e5f60f4, https://behkooshan.ir/?jet_download=db292ce9ce311cc4c65b75a261733043272f89ce |
| midnight-gray | new texture file | Midnight-Gray.jpg | 1672x856 |  | https://fa.behkooshan.ir/?jet_download=7a952f1a3607a91f9645d70e47061c3200fe611c, https://behkooshan.ir/?jet_download=7a952f1a3607a91f9645d70e47061c3200fe611c |
| milky-way | new texture file | Milky-Way.jpg | 1745x1080 |  | https://fa.behkooshan.ir/?jet_download=ae9e919d7f7fd693904e25ee6f55236e35b7f184, https://behkooshan.ir/?jet_download=5e9111bced37b1696e2a167f1de918d9a7e6f00f |
| mozzarella | texture now held (same picture as a new product image) | Mozzarella-m.jpg | 1052x646 |  | https://fa.behkooshan.ir/?jet_download=0beeeacb78f419959e99c8470fd95d570d300738, https://behkooshan.ir/?jet_download=43ec4ba436b3c2a7a7949fbf4ef8ba93130b22f2 |
| naica-quartzite | new texture file | Naica-Quartzite.jpg | 1435x898 |  | https://fa.behkooshan.ir/?jet_download=bab91698befa95e40fcd040c459db7682cd8a680, https://behkooshan.ir/?jet_download=bab91698befa95e40fcd040c459db7682cd8a680 |
| namibia-white | texture now held (same picture as a new product image) | Namibia.jpg | 1880x1080 |  | https://fa.behkooshan.ir/?jet_download=fb09400e41c364145ac109a12ff4339253165cde |
| native-black | new texture file | Native-Black.jpg | 1563x904 |  | https://fa.behkooshan.ir/?jet_download=e2a6d7f54e4f2a2dc6fc4c20e35ec73f496d74d3, https://behkooshan.ir/?jet_download=e2a6d7f54e4f2a2dc6fc4c20e35ec73f496d74d3 |
| negresco | texture now held (same picture as a product image) | Negresco-m.jpg | 1052x646 | images/01-Negresco-m.jpg | https://fa.behkooshan.ir/?jet_download=b47f4b932c5a9d381fc09be01bad1b872634e812, https://behkooshan.ir/?jet_download=b47f4b932c5a9d381fc09be01bad1b872634e812 |
| new-galaxy | texture now held (same picture as a product image) | new_galaxy.jpg | 1052x646 | images/01-new_galaxy.jpg | https://fa.behkooshan.ir/?jet_download=9b20fb21804e3ca45ec52c1ea71e23669750107e, https://behkooshan.ir/?jet_download=9b20fb21804e3ca45ec52c1ea71e23669750107e |
| new-patagonia | texture now held (same picture as a new product image) | New-Patagonia-1.jpg | 1920x1077 |  | https://fa.behkooshan.ir/?jet_download=f68217446a892fdb78e67f74c8392f14bfbbb68e, https://behkooshan.ir/?jet_download=b2cec35fc5ee07b50e84fefef7345f600b73be20 |
| nysa | texture now held (same picture as a product image) | 49031-001.jpg | 1920x786 | images/01-49031-001.jpg | https://fa.behkooshan.ir/?jet_download=bf607ab63f6487c4fff9d85416ca18b580d6ceaa, https://behkooshan.ir/?jet_download=cdfbaebf75c607946d2df0d97577abd7ae8724e4 |
| oyster-quartz | new texture file | oyster_7VmxiLrLXyB3TH59ttHN.jpg | 1052x646 |  | https://fa.behkooshan.ir/?jet_download=a664b68cb246d7c03d73433e00a4dc03a85ba4a5, https://behkooshan.ir/?jet_download=a664b68cb246d7c03d73433e00a4dc03a85ba4a5 |
| patagonia-green | new texture file | Patagonia-Green.jpg | 1407x904 |  | https://fa.behkooshan.ir/?jet_download=0356be7c1c24a6dd5d2251637d0b169e2662a1d6, https://behkooshan.ir/?jet_download=0356be7c1c24a6dd5d2251637d0b169e2662a1d6 |
| patagonia-pink | new texture file | Patagonia-Pink-scaled-1.jpg | 1669x1080 |  | https://fa.behkooshan.ir/?jet_download=586a8ad4d5374c2c6fdc9776d7c4fcdf8a8b327c, https://behkooshan.ir/?jet_download=aa7f4626deb64d4b17682d1d4375fc98a556994e |
| patagonia-tourmaline | new texture file | Patagonia-troumaline.jpg | 1455x877 |  | https://fa.behkooshan.ir/?jet_download=7d4b65da60bda4c495db1b755ee5b607e0825f14, https://behkooshan.ir/?jet_download=7d4b65da60bda4c495db1b755ee5b607e0825f14 |
| purple-rain | new texture file | Purple-Rain_68877950ee21a_1753708880_compressed.jpeg | 1920x1081 |  | https://fa.behkooshan.ir/?jet_download=d72e315ca42567828737fe1241d8e306c0dbdb8d, https://behkooshan.ir/?jet_download=d5edd9202d7d735239bde3a1a8db32da680278fb |
| quartzite-levanto | new texture file | 254_1__-024-scaled.jpg | 1920x1042 |  | https://fa.behkooshan.ir/?jet_download=b795a0a020d2f9c206de937bf4a8065bd5855d8c, https://behkooshan.ir/?jet_download=3f34b1a2f0338cb2798086f08f90b7bc84dc419f |
| river-noire | texture now held (same picture as a product image) | 4643-004-scaled.jpg | 1771x1080 | images/02-4643-004-scaled.jpg | https://fa.behkooshan.ir/?jet_download=a8f64ff0f159f99ef90728911be36551103138ff |
| river-noire | new texture file | 4643-005-scaled.jpg | 1804x1080 |  | https://behkooshan.ir/?jet_download=2a1bd30d5ddf812d22c897fad2ef32bcd95d3aa8 |
| river-stone | texture now held (same picture as a product image) | River-Stone.jpg | 1920x1189 | images/01-River-Stone.jpg | https://behkooshan.ir/?jet_download=bb566360e56f400e50c468f25abd13df68e3587e |
| rosso-fantastico | texture now held (same picture as a new product image) | Rosso-Fantastic.jpg | 1920x1229 |  | https://behkooshan.ir/?jet_download=bd97681b067c261d648d26220c0a457c5ea27ebe |
| rosso-levanto | texture now held (same picture as a new product image) | Rosso-Levanto.jpg | 1920x1016 |  | https://fa.behkooshan.ir/?jet_download=fd928d0469b290632f0fd1745d9e488436d9d477 |
| serpentine | new texture file | Serpentine.jpg | 1637x886 |  | https://fa.behkooshan.ir/?jet_download=7005f6b9d5dc29c555822f5d9f2f0225cde474d7, https://behkooshan.ir/?jet_download=7005f6b9d5dc29c555822f5d9f2f0225cde474d7 |
| silver-fusion | texture now held (same picture as a product image) | silver_fusion.jpg | 1052x646 | images/01-silver_fusion.jpg | https://fa.behkooshan.ir/?jet_download=152403071df148e604d6968352a9a4fb06f27867, https://behkooshan.ir/?jet_download=152403071df148e604d6968352a9a4fb06f27867 |
| t-rex | new texture file | 3878X1-001-scaled.jpg | 1920x1046 |  | https://fa.behkooshan.ir/?jet_download=42a923724630809b18b4cf07589fad2456920d08, https://behkooshan.ir/?jet_download=0e115e2562ae4b4609daf9c263eab5b5fddc1c13 |
| taj-mahal | new texture file | Taj-Mahal.jpg | 1419x898 |  | https://fa.behkooshan.ir/?jet_download=0d474e49fac801a7463896b879fc1bb38cf30ca2, https://behkooshan.ir/?jet_download=0d474e49fac801a7463896b879fc1bb38cf30ca2 |
| titanium-mc | texture now held (same picture as a product image) | titanium_mc.jpg | 1052x646 | images/01-titanium_mc-1.jpg | https://fa.behkooshan.ir/?jet_download=32ead4941b5ba73b9fbb7f185a75eeaf651e6d5a, https://behkooshan.ir/?jet_download=32ead4941b5ba73b9fbb7f185a75eeaf651e6d5a |
| venetian-granite | texture now held (same picture as a product image) | 4615-007.jpg | 1738x1080 | images/01-4615-007.jpg | https://fa.behkooshan.ir/?jet_download=ae4c721f582d557fc85b1a0d2ef632ab202c4f56, https://behkooshan.ir/?jet_download=9022a04b7c9ae5151401cedb2e58a21ff5e0b1b5 |
| verde-imperial | texture now held (same picture as a product image) | verde-imperial.jpg | 1052x646 | images/01-verde-imperial.jpg | https://fa.behkooshan.ir/?jet_download=baeab86ecfad3f9952ddd0d9687a5a3084c850ff, https://behkooshan.ir/?jet_download=baeab86ecfad3f9952ddd0d9687a5a3084c850ff |
| via-lattea | new texture file | Via-Lattea.jpg | 1327x898 |  | https://fa.behkooshan.ir/?jet_download=85d49f59f5859ff983f88b6eb6b84e1a999a4dc6, https://behkooshan.ir/?jet_download=85d49f59f5859ff983f88b6eb6b84e1a999a4dc6 |

Texture links on the live pages whose file could not be fetched (added to `missing_textures`): `bianco-vena` (fa), `bianco-vena` (en), `calacatta-rhino` (fa), `calacatta-rhino` (en), `calacatta-viola` (fa), `calacatta-viola` (en), `cristallo-rosa` (fa), `cristallo-rosa` (en), `pumpkin-viola` (fa), `pumpkin-viola` (en), `verde-atlantic` (fa), `verde-atlantic` (en).

Entries of `missing_textures` now resolved, because the live file is held: 73 links on 42 products (`alaska-white`, `bellatrix`, `black-horse`, `black-zebra`, `casper`, `cohiba`, `colonial`, `dalmata`, `dark-golden-lightning`, `delicate`, `dover-blue`, `elegant-green`, `emerald-quartzite`, `evolution-green`, `gando`, `infinity-gold`, `jasmin`, `jet-black`, `kojin`, `kosmus-gold`, `lemurian-labradorite`, `lumix-wow`, `magma-gold`, `malibu-red`, `mercury-black`, `meteorus`, `midnight-gray`, `milky-way`, `naica-quartzite`, `native-black`, `negresco`, `new-galaxy`, `oyster-quartz`, `patagonia-green`, `patagonia-pink`, `patagonia-tourmaline`, `serpentine`, `silver-fusion`, `taj-mahal`, `titanium-mc`, `verde-imperial`, `via-lattea`).

Unchanged: 183 live pictures and 36 live textures are the same as the research's.

The patch adds 24 image files and 37 texture files, 13.8 MB (plus 8 new product.json files), all taken from `images/<slug>/images/` and `images/<slug>/textures/` next to this report. `images/<slug>/originals/` holds the 9 full-size uploads that the size rule keeps out of the research, for reference only; the patch does not copy them.

### The size rule

No stored picture exceeds 2560 px on its long edge or 3 MB (the research's convention, as for the project photos). Nine
live uploads are larger (4.1 to 12.9 MB, up to 6737 px). For each, the largest copy the site itself has within both
limits was taken from either site's media library: in every case the WordPress `2048x2048` size variant (the sites'
`-scaled` copies are smaller, 1738 to 1920 px). The stored file's own URL, size, bytes, SHA-1 and `resolution`
(`resized-2048xNNNN`) are recorded, and the upload itself in `original_upload` {url, width, height, bytes, sha1,
format}, exactly as the project photos do:

| slug | original upload | stored | how |
|---|---|---|---|
| belvedere | 3776_-025.jpg 6737x3353, 7.3 MB | 02-3776_-025-2048x1019.jpg (already in the research) | `original_upload` added; kind listing -> main |
| milky-way | Milky-Way.jpg 6065x3753, 11.0 MB | 01-Milky-Way-2048x1267.jpg (already in the research) | `original_upload` added |
| quartzite-levanto | 254_1__-024.jpg 6561x3561, 9.1 MB | 01-254_1__-024-2048x1112.jpg (already in the research) | `original_upload` added; kind listing -> main |
| river-noire | 4643-005.jpg 5865x3513, 8.7 MB | 01-4643-005-2048x1227.jpg (already in the research) | `original_upload` added; kind listing -> main |
| t-rex | 3878X1-001.jpg 5889x3209, 7.8 MB | 02-3878X1-001-2048x1116.jpg (already in the research) | `original_upload` added; kind listing -> main |
| river-noire | 4643-004.jpg 5905x3601, 8.9 MB | new 4643-004-2048x1249.jpg | replaces 02-4643-004-scaled.jpg 1771x1080 (kept, `superseded`) |
| venetian-granite | 4615-007.jpg 5873x3649, 12.9 MB | new 4615-007-2048x1272.jpg | replaces 01-4615-007.jpg 1738x1080 (kept, `superseded`) |
| dolce-vita | 4037-004-1.jpg 6473x3745, 4.1 MB | new 4037-004-1-2048x1185.jpg | replaces 01-4037-004_..._compressed.jpg 1729x997 (kept, `superseded`) |
| nysa | 49031-001.jpg 4633x1897, 3.1 MB | new 49031-001-2048x839.jpg | replaces 01-49031-001.jpg 1920x786 (kept, `superseded`) |

Four of the five "already in the research" copies are pixel-identical to the live site's own 2048 px files (checked);
the Milky Way one came through the old CDN and differs from it by 0.02/255 on average. **No texture file is over 3 MB**
(the largest is 0.73 MB, the longest edge 1920 px), so every texture is stored as the site serves it.


## Uncertain

* **Black Fantasy = Black Tempest** is certain on the site's own evidence (same post id 4276, same photographs, same
  texture link), but the research had kept them apart; `black-fantasy/` must be removed by hand.
* **Twelve texture links could not be fetched**: those of 5 new products (`bianco-vena`, `calacatta-rhino`,
  `calacatta-viola`, `pumpkin-viola`, `verde-atlantic`) and of `cristallo-rosa`, on both sites. The proxy answers them with
  a redirect to the unreachable origin (every other texture works), perhaps because these downloads are WebP files.
  They are listed in `missing_textures`; each product's only upload is its one WebP image, so the texture is probably
  that file, but this is not verified.
* **Conflicts between the two sites remain on the live site** and are noted in each product, with the research's rules
  (each language keeps its own site's type/origin; colour from the Persian site; category from the origin):
  colour black-diamond, black-tempest, kosmus-a, spectrolite-blue, verde-fantastic, volga-blue; type lumix-wow,
  naica-quartzite; origin naica-quartzite; category dover-blue, elegant-brown, grand-antique; and the hidden stone-type
  attribute disagrees with the displayed type on black-diamond, copper-dune, dalmata, emerald-quartzite, oyster-quartz,
  turquoise, verde-fantastic.
* **Delicate** has a hidden custom attribute "Dimension: 256 mm * 700 mm" in the Store API (both sites) that its page
  does not display. It is in a note, not in specs; it is the only dimension on the whole site.
* **T.Rex**: the Persian site still has both posts (5376 "T Rex" and 6777 "T.Rex"); the English site now has only post
  6613, at `/product/t-rex/`. They stay merged, as before.
* The **Persian names of the 8 new products** are my transliterations (flagged): کالاکاتا ویولا, بیانکو ونا,
  پامپکین ویولا, کالاکاتا راینو, بلیسیمو ورده, ورده آتلانتیک, نامیبیا وایت, روسو لوانتو.
* **Meteorus**: the live main image is still `ChatGPT-Image-Dec-23-2025-10_44_38-AM.jpg` (see its note).
* **Lumix Wow**: the English site's product gallery holds `Lumix.webp`, a backlit onyx interior rather than a slab; it
  is already in the research as a project photo and is left as it is.
* The other agent's note on `black-tempest` ("Only the URL /product/black-tempest/ is known from the Wayback Machine
  ... neither page was archived, so no specs exist ...") mentions projects, so the patch leaves it; its "no specs
  exist" part is no longer true and can be deleted by hand.

## What the patch does

`apply_live_sync.py` (with `sync_data.json` and `images/` beside it). `--root DIR` patches a copy; `--dry-run` reports only.

* Sets, per product, what the live site decides: `name` (only `name.en`, and only where it followed the site's title:
  `jasmin` -> "Jasmine"), `category`, `category_label`, `specs`, `urls` (current first, then former), `site_names`,
  `site_post_ids`, `site_dates`, `translated`, `translated_fields`, and a new key `listed_on_live_site` {checked, fa, en};
  `merged_into` on `black-fantasy`.
* Adds pictures as `images/NN-<site file name>`, NN being the next free number in that folder at the time it runs, and
  textures as `textures/NN-<file name>` or, where the texture is the same picture as a product image, as a pointer to
  that file (the research's convention). New records have `archived_url: null` and `retrieved_url`, `retrieved_at`,
  `retrieved_via`, `site_files` and, where applicable, `original_upload`, the same fields the project photos use.
* Marks, never removes: a picture the site no longer shows becomes kind `former` (`former_kind`, `former_note`); a
  smaller copy of a picture now stored larger becomes kind `superseded`; a texture no longer linked gets a `former_note`.
  `derive-products.py` shows neither kind.
* `missing_textures`: removes links whose file is now held, adds the 12 live links that could not be fetched, and adds
  `live_check` to archived links the live pages no longer use (new-patagonia, purple-rain, river-blanche).
* Notes: drops notes the live site has made untrue, adds notes for every change; never drops a note that mentions
  projects.
* Recomputes `index.json` (102 entries).
* Never deletes a file or a product; never touches `projects`, any image of kind `project`, an existing
  `original_upload` or `missing_images`; reads and rewrites each product.json keeping every key and the key order;
  a second run changes nothing.

Tested on a fresh export of research/ at git HEAD (13306ec): 103 files changed, 69 added (61 image/texture files plus
8 product.json), 13.8 MB, nothing deleted, no existing image or texture file changed; in all 94 existing products
`projects`, the project image records, the 50 existing `original_upload` blocks and `missing_images` are identical; no key
lost, key order kept; every image/texture record's width, height, bytes and SHA-1 match its file; no stored image over
2560 px or 3 MB; a second run changes 0 files; `tools/derive-products.py` (HEAD) runs on the patched copy in a sandbox
(own media/ and data/): 100 products, 286 photographs, 101 textures.

Then: delete `research/products/black-fantasy/`, run `python3 tools/derive-products.py` and `node tools/build-products.mjs`.

## Proposed README text

Replace the "Collected on" bullet and add a paragraph after the project-photo paragraph in "Where the data came from":

> * Collected on **2026-09-23** from Wayback Machine captures (June 2025 to February 2026), then **checked against the
>   live site on 2026-09-24 and updated to it** (see LIVE-SYNC.md).
>
> **Live site (2026-09-24).** The product data was then checked against the live site through the same proxy, requesting
> each page with its own language as target so that the text is the site's own (verified against the r.jina.ai reader
> and against the archived text): the WordPress REST product list and the WooCommerce Store API (97 English and 99
> Persian products, complete), the media library, every product page, the Quarry page, every "Texture Download" and every
> image. What the live site shows takes precedence over the archive: names, type, origin, category, colour attribute,
> URLs, post ids, dates, images and textures; every product records `listed_on_live_site`. Records taken from the live
> site have `archived_url: null` and `retrieved_url` / `retrieved_at` / `retrieved_via`; pictures larger than 2560 px or
> 3 MB are stored as the site's 2048 px copy with the upload in `original_upload`. Pictures the site no longer shows are
> kept as kind `former`, smaller copies of a picture now stored larger as kind `superseded`; `derive-products.py` shows
> neither. The English site's uploads were re-saved by an image optimiser, so pictures were compared by decoded pixels
> and the Persian site's (unmodified) file is kept; texture file names come from the media library. The live site added
> 8 products (see their notes), renamed Black Fantasy to Black Tempest (continued in `black-tempest/`), and no longer
> lists River Blanche (kept). The Wayback sources below remain the provenance of everything the live site no longer shows.

In "What could not be retrieved", replace the "Live site: unreachable" item with: "**Live site:** reached on 2026-09-24
through the translate proxy; 12 texture links (6 products, both sites) could not be relayed and are in
`missing_textures`." and replace the texture item's lists with: "94 products have their texture download (66 separate
files, 36 pointing to a product image file); 9 products still have unfetched links in `missing_textures`."

Counts after the patch (and after removing `black-fantasy`): **101 folders** (99 live products + `river-blanche` + the
Quarry page); categories domestic 37, imported 63, quarry 1; types Granite 78, Quartzite 11, Marble 11, Miscellaneous 1
(before removal: Quartzite 12, imported 64, 102 folders); 381 image records before removal (main 104, listing 78,
project 171, former 6, superseded 8, quarry 13, legacy 1), 59 with `original_upload`; the colour attribute from the site
for 71 products; image files about 72 MB (after the patch, before removal). Recount after removing `black-fantasy`.



## Applied (2026-09-24)

The patch was run on the research by the main session, with these decisions:

* `black-fantasy/` is kept, not deleted: it carries `merged_into: "black-tempest"` and `tools/derive-products.py` leaves it out, so the stone is listed once, as Black Tempest, and the archived record stays. The README counts above that assume its removal are one folder, one quartzite and one imported product lower than the research now holds.
* `river-blanche/` is kept; `derive-products.py` leaves out a stone neither live site lists.
* The one Calacatta Viola project photo (`Calacatta-Viola-1.webp`, identical on both sites) was attached to the new `calacatta-viola` product.
* The eight new products' Persian names are transliterations, as every Persian name in the research is: the Persian site writes every stone name in Latin script.
