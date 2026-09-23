#!/usr/bin/env node
/* ==========================================================================
   Behkooshan products: the build

   Reads data/products.json (written by tools/derive-products.py) and writes
   the whole site as plain HTML:

     index.html                     the stones, Persian
     en/index.html                  the stones, English
     product/<slug>/index.html      one stone, Persian
     en/product/<slug>/index.html   one stone, English

   Every page is complete without its script: the grid is written out in
   full, every photograph has its size on the tag, and the filters are the
   only thing the script adds. Every link is relative, so the site works
   from any folder it is published in.

       node tools/build-products.mjs
   ========================================================================== */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
/* A stone the research knows only by name (no photograph, no type, no
   origin) is left out until it has something to show. Black Tempest is the
   one: its page was never archived. It stays in the research. */
const products = JSON.parse(readFileSync(join(ROOT, "data/products.json"), "utf8"))
  .filter((p) => p.photos.length || p.category);

/* Where the digital catalogue lives, relative to this site's root. The two
   are published side by side, the catalogue at the top and this one in its
   products/ folder. */
const CATALOGUE = "../";

/* --------------------------------------------------------------- words */

const T = {
  fa: {
    dir: "rtl",
    other: "en",
    otherName: "English",
    otherLabel: "خواندن به انگلیسی",
    title: "محصولات به‌کوشان",
    heading: "محصولات",
    description: "سنگ‌های به‌کوشان: گرانیت، کوارتزیت و مرمر، با جست‌وجوی نام، فیلتر رنگ و نوع و دانلود تکسچر هر سنگ.",
    home: "محصولات به‌کوشان، همه سنگ‌ها",
    catalogue: "کاتالوگ",
    catalogueLabel: "کاتالوگ دیجیتال به‌کوشان",
    skip: "رفتن به سنگ‌ها",
    search: "نام سنگ",
    searchHint: "فارسی یا لاتین",
    type: "نوع",
    origin: "مبدا",
    colour: "رنگ",
    filters: "فیلترها",
    filterRows: "نوع، مبدا و رنگ",
    clear: "پاک کردن فیلترها",
    close: "بستن",
    none: "سنگی با این نام یا این فیلترها پیدا نشد.",
    stones: (n) => `${num("fa", n)} سنگ`,
    groups: { domestic: "سنگ‌های داخلی", imported: "سنگ‌های وارداتی" },
    types: { granite: "گرانیت", quartzite: "کوارتزیت", marble: "مرمر", other: "سایر" },
    origins: { domestic: "داخلی", imported: "وارداتی" },
    colours: { white: "سفید", cream: "کرم", grey: "خاکستری", black: "مشکی", green: "سبز", blue: "آبی", pink: "صورتی" },
    intro: (c) => `${num("fa", c.all)} سنگ؛ ${num("fa", c.domestic)} داخلی و ${num("fa", c.imported)} وارداتی.`,
    back: "همه سنگ‌ها",
    specs: "مشخصات",
    specType: "نوع",
    specOrigin: "کشور مبدا",
    specCategory: "دسته‌بندی",
    specColour: "رنگ",
    download: "دانلود تکسچر",
    textureMeta: (t) => `فایل <span lang="en">${t.format === "PNG" ? "PNG" : "JPG"}</span>، ${num("fa", t.width)} در ${num("fa", t.height)} پیکسل، ${size("fa", t.bytes)}`,
    noTexture: "فایل تکسچر این سنگ هنوز منتشر نشده است.",
    photos: "تصاویر",
    installed: "در اجرا",
    about: "دربارهٔ معدن",
    related: "سنگ‌های هم‌رنگ",
    zoom: (name) => `دیدن بزرگ‌تر: ${name}`,
    noPhoto: "تصویری از این سنگ منتشر نشده است.",
    lb: { label: "دیدن بزرگ‌تر", zoomOut: "کوچک‌نمایی", zoomIn: "بزرگ‌نمایی", close: "بستن تصویر", prev: "تصویر قبلی", next: "تصویر بعدی", counter: "% از %" },
    contact: "اطلاعات تماس",
    address: "تهران، شهرک صنعتی شمس‌آباد، خیابان زکریا، کوچه سنبل ۵، پلاک ۲۸۶ (۱۰)",
    tels: ["۰۲۱ ۵۳۹۱۴", "۰۹۱۲۱۹۰۰۱۲۴"],
    surface: (name) => `سطح اسلب ${name}`,
    inPlace: (name) => `${name} در اجرا`,
    quarry: (name) => `${name}`,
  },
  en: {
    dir: "ltr",
    other: "fa",
    otherName: "فارسی",
    otherLabel: "Read in Persian",
    title: "Behkooshan stones",
    heading: "Products",
    description: "Behkooshan's granites, quartzites and marbles, searchable by name, filtered by colour and type, with each stone's texture to download.",
    home: "Behkooshan stones, all stones",
    catalogue: "Catalogue",
    catalogueLabel: "The Behkooshan digital catalogue",
    skip: "Skip to the stones",
    search: "Stone name",
    searchHint: "Latin or Persian",
    type: "Type",
    origin: "Origin",
    colour: "Colour",
    filters: "Filters",
    filterRows: "Type, origin, colour",
    clear: "Clear filters",
    close: "Close",
    none: "No stone matches that name or those filters.",
    stones: (n) => `${n} ${n === 1 ? "stone" : "stones"}`,
    groups: { domestic: "Domestic stones", imported: "Imported stones" },
    types: { granite: "Granite", quartzite: "Quartzite", marble: "Marble", other: "Other" },
    origins: { domestic: "Domestic", imported: "Imported" },
    colours: { white: "White", cream: "Cream", grey: "Grey", black: "Black", green: "Green", blue: "Blue", pink: "Pink" },
    intro: (c) => `${c.all} stones, ${c.domestic} from Iran and ${c.imported} imported.`,
    back: "All stones",
    specs: "Specification",
    specType: "Type",
    specOrigin: "Origin",
    specCategory: "Category",
    specColour: "Colour",
    download: "Download texture",
    textureMeta: (t) => `${t.format === "PNG" ? "PNG" : "JPG"} file, ${t.width} by ${t.height} pixels, ${size("en", t.bytes)}`,
    noTexture: "The texture file for this stone has not been published yet.",
    photos: "Photographs",
    installed: "Installed",
    about: "About the quarry",
    related: "Stones of the same colour",
    zoom: (name) => `View larger: ${name}`,
    noPhoto: "No photograph of this stone has been published.",
    lb: { label: "View larger", zoomOut: "Zoom out", zoomIn: "Zoom in", close: "Close photograph", prev: "Previous photograph", next: "Next photograph", counter: "% of %" },
    contact: "Contact",
    address: "No 10 (286), 5th Sonbol, Zakariya St., Shams Abad Industrial Zone, Tehran, Iran",
    tels: ["021 53914", "09121900124"],
    surface: (name) => `${name}, slab surface`,
    inPlace: (name) => `${name}, installed`,
    quarry: (name) => `${name}`,
  },
};

const TEL_HREFS = ["tel:+982153914", "tel:+989121900124"];
const TYPES = ["granite", "quartzite", "marble", "other"];
const ORIGINS = ["domestic", "imported"];
const COLOURS = ["white", "cream", "grey", "black", "green", "blue", "pink"];

/* ------------------------------------------------------------- helpers */

function num(lang, n) {
  return lang === "fa" ? Number(n).toLocaleString("fa-IR", { useGrouping: false }) : String(n);
}

function size(lang, bytes) {
  if (!bytes) return "";
  const mb = bytes / 1048576;
  if (mb >= 1) {
    const v = mb.toFixed(1);
    return lang === "fa" ? `${Number(v).toLocaleString("fa-IR")} مگابایت` : `${v} MB`;
  }
  const kb = Math.round(bytes / 1024);
  return lang === "fa" ? `${num("fa", kb)} کیلوبایت` : `${kb} KB`;
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Every dash the research carries as a separator becomes a plain hyphen. */
function plain(value) {
  return String(value ?? "").replace(/\s*[–—]\s*/g, " - ").trim();
}

function write(rel, html) {
  const target = join(ROOT, rel);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
}

/** What a stone is filed under: its type, and domestic or imported. */
function typeOf(p) {
  return TYPES.includes(p.type) ? p.type : "other";
}

function originOf(p) {
  return p.category === "imported" ? "imported" : "domestic";
}

/** Search text: every name the stone has gone by, in both scripts. */
function searchText(p) {
  const names = [p.name.fa, p.name.en, p.site_name?.fa, p.site_name?.en, ...(p.legacy_names || [])];
  return [...new Set(names.filter(Boolean))].join(" | ");
}

function srcset(prefix, photo) {
  return photo.widths.map((w) => `${prefix}${photo.base}-${w}.webp ${w}w`).join(", ");
}

function largest(prefix, photo) {
  return `${prefix}${photo.base}-${photo.widths[photo.widths.length - 1]}.webp`;
}

/** The stone's own picture: the slab surface, or else the first photograph. */
function lead(p) {
  return p.photos.find((ph) => ph.kind === "main" || ph.kind === "listing") || p.photos[0] || null;
}

function collator(lang) {
  const c = new Intl.Collator(lang === "fa" ? "fa" : "en", { sensitivity: "base" });
  return (a, b) => c.compare(a.name[lang], b.name[lang]);
}

/* --------------------------------------------------------------- shell */

function head(lang, { title, description, prefix, preloadImage }) {
  const t = T[lang];
  const fonts = lang === "fa"
    ? [`${prefix}assets/fonts/rokh/Rokh-Regular.woff2`, `${prefix}assets/fonts/rokh/Rokh-Bold.woff2`]
    : [`${prefix}assets/fonts/tt-firs-neue/TTFirsNeue-VarRoman.woff2`];
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${t.dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#184b36">
  <meta name="color-scheme" content="light">
  <link rel="icon" href="${prefix}assets/logos/favicon.svg" type="image/svg+xml">
${fonts.filter((f) => existsSync(join(ROOT, f.slice(prefix.length)))).map((f) => `  <link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join("\n")}
${preloadImage ? `  <link rel="preload" as="image" imagesrcset="${preloadImage.srcset}" imagesizes="${preloadImage.sizes}" fetchpriority="high">\n` : ""}  <link rel="stylesheet" href="${prefix}assets/css/fonts.css">
  <link rel="stylesheet" href="${prefix}assets/css/tokens.css">
  <link rel="stylesheet" href="${prefix}assets/css/shapes.css">
  <link rel="stylesheet" href="${prefix}assets/css/products.css">
  <script>document.documentElement.classList.add("js");</script>
</head>`;
}

function bar(lang, { prefix, otherHref, homeHref }) {
  const t = T[lang];
  return `  <a class="skip" href="#stones">${t.skip}</a>

  <header class="bar">
    <div class="shell bar__inner">
      <a class="bar__logo" href="${homeHref}" aria-label="${esc(t.home)}">
        <span class="bk-logo ${lang === "fa" ? "bk-logo--lockup-fa" : "bk-logo--lockup"}"></span>
      </a>

      <div class="bar__end">
        <a class="chip" href="${prefix}${CATALOGUE}${lang === "en" ? "en/" : ""}" aria-label="${esc(t.catalogueLabel)}">${t.catalogue}</a>
        <a class="chip" href="${otherHref}" lang="${t.other}" hreflang="${t.other}" aria-label="${esc(t.otherLabel)}">${t.otherName}</a>
      </div>
    </div>
  </header>`;
}

function foot(lang) {
  const t = T[lang];
  return `  <footer class="foot">
    <div class="shell foot__inner">
      <div class="foot__brand">
        <span class="bk-logo ${lang === "fa" ? "bk-logo--lockup-fa" : "bk-logo--lockup"}" role="img" aria-label="Behkooshan"></span>
        <p class="foot__site"><a href="https://behkooshan.ir" lang="en">behkooshan.ir</a></p>
      </div>

      <div>
        <h2 class="foot__title">${t.contact}</h2>
        <address class="foot__contact">
          <span class="foot__address">${t.address}</span>
          <span class="foot__tels">
${t.tels.map((n, i) => `            <a class="foot__tel" href="${TEL_HREFS[i]}" dir="ltr">${n}</a>`).join("\n")}
          </span>
        </address>

        <div class="foot__social">
          <a href="https://telegram.me/behkooshan" rel="me noopener" target="_blank" aria-label="Telegram">
            <span class="bk-icon bk-icon--telegram" aria-hidden="true"></span>
          </a>
          <a href="https://api.whatsapp.com/send?phone=+989121900124" rel="me noopener" target="_blank" aria-label="WhatsApp">
            <span class="bk-icon bk-icon--whatsapp" aria-hidden="true"></span>
          </a>
          <a href="https://www.instagram.com/behkooshan" rel="me noopener" target="_blank" aria-label="Instagram">
            <span class="bk-icon bk-icon--instagram" aria-hidden="true"></span>
          </a>
        </div>
      </div>
    </div>
  </footer>`;
}

function lightbox(lang) {
  const l = T[lang].lb;
  return `  <dialog class="lb" id="lightbox" aria-label="${l.label}">
    <div class="lb__stage">
      <img class="lb__img" alt="">
    </div>

    <div class="lb__bar lb__bar--top">
      <div class="lb__tools">
        <button class="lb__btn" type="button" data-lb-zoom="-1" aria-label="${l.zoomOut}">&#8722;</button>
        <button class="lb__btn" type="button" data-lb-zoom="1" aria-label="${l.zoomIn}">+</button>
        <button class="lb__btn" type="button" data-lb-close aria-label="${l.close}">&#10005;</button>
      </div>
    </div>

    <div class="lb__bar lb__bar--bottom">
      <p class="lb__counter" data-template="${l.counter}"></p>
      <div class="lb__tools">
        <button class="lb__btn" type="button" data-lb-step="-1" aria-label="${l.prev}">&#8249;</button>
        <button class="lb__btn" type="button" data-lb-step="1" aria-label="${l.next}">&#8250;</button>
      </div>
    </div>
  </dialog>`;
}

/* ----------------------------------------------------------- the tile */

const TILE_SIZES = "(min-width: 90rem) 18rem, (min-width: 64rem) 23vw, (min-width: 40rem) 31vw, 47vw";

function tile(lang, p, { prefix, eager = false, priority = false, feature = false }) {
  const t = T[lang];
  const other = lang === "fa" ? "en" : "fa";
  const photo = feature ? p.photos.find((ph) => ph.kind === "quarry") || lead(p) : lead(p);
  const href = `${prefix}${lang === "en" ? "en/" : ""}product/${p.slug}/`;
  const kind = typeOf(p);
  const origin = originOf(p);
  const meta = [t.types[kind], p.origin?.[lang]].filter(Boolean).map(plain);

  const picture = photo
    ? `<img src="${prefix}${photo.base}-${photo.widths[Math.min(1, photo.widths.length - 1)]}.webp"
               srcset="${srcset(prefix, photo)}"
               sizes="${feature ? "(min-width: 64rem) 46vw, (min-width: 40rem) 62vw, 94vw" : TILE_SIZES}"
               width="${photo.width}" height="${photo.height}"
               alt="" ${eager ? 'loading="eager"' : 'loading="lazy"'} decoding="async"${priority ? ' fetchpriority="high"' : ""}>`
    : `<span class="stone__none"><span class="bk-shape bk-shape--07" aria-hidden="true"></span></span>`;

  return `        <li class="stone${feature ? " stone--feature" : ""}"
            data-type="${kind}" data-origin="${origin}" data-colours="${esc(p.colours.join(" "))}"
            data-names="${esc(searchText(p))}">
          <a class="stone__link" href="${href}">
            <span class="stone__frame cut">
              ${picture}
            </span>
            <span class="stone__name">${esc(plain(p.name[lang]))}</span>
            <span class="stone__alt" lang="${other}" dir="${T[other].dir}">${esc(plain(p.name[other]))}</span>
            <span class="stone__meta">${esc(meta.join(lang === "fa" ? "، " : ", "))}</span>
          </a>
        </li>`;
}

/* ------------------------------------------------------------ listing */

function counts() {
  const c = { all: products.length, domestic: 0, imported: 0 };
  for (const p of products) c[originOf(p)] += 1;
  return c;
}

function chips(lang, group, values, labels, withSwatch = false) {
  return values
    .map(
      (v) => `            <button class="pick${withSwatch ? " pick--colour" : ""}" type="button" data-${group}="${v}" aria-pressed="false">${
        withSwatch ? `<span class="pick__swatch pick__swatch--${v}" aria-hidden="true"></span>` : ""
      }${labels[v]}</button>`
    )
    .join("\n");
}

function listing(lang) {
  const t = T[lang];
  const prefix = lang === "en" ? "../" : "";
  const sort = collator(lang);
  const c = counts();

  const quarry = products.filter((p) => p.category === "quarry");
  const byOrigin = (o) => products.filter((p) => p.category !== "quarry" && originOf(p) === o).sort(sort);

  let n = 0;
  const groups = ORIGINS.map((o) => {
    const items = [...(o === "domestic" ? quarry : []), ...byOrigin(o)];
    const tiles = items
      .map((p) => {
        n += 1;
        return tile(lang, p, { prefix, eager: n <= 6, priority: n <= 2, feature: p.category === "quarry" });
      })
      .join("\n");
    return `    <section class="group" data-group="${o}" aria-labelledby="group-${o}">
      <div class="shell">
        <h2 class="group__title" id="group-${o}">${t.groups[o]} <span class="group__count" data-count>${num(lang, items.length)}</span></h2>
        <ol class="stones" role="list">
${tiles}
        </ol>
      </div>
    </section>`;
  }).join("\n\n");

  const first = [...quarry, ...byOrigin("domestic")].map((p) => p.category === "quarry" ? p.photos.find((ph) => ph.kind === "quarry") || lead(p) : lead(p)).filter(Boolean)[0];

  const html = `${head(lang, {
    title: t.title,
    description: t.description,
    prefix,
    preloadImage: first && { srcset: srcset(prefix, first), sizes: "(min-width: 64rem) 46vw, (min-width: 40rem) 62vw, 94vw" },
  })}
<body class="page page--list">

${bar(lang, { prefix, otherHref: lang === "fa" ? "en/" : "../", homeHref: "./" })}

  <main id="stones">
    <div class="shell intro">
      <h1 class="intro__title">${t.heading}</h1>
      <p class="intro__lede">${t.intro(c)}</p>
    </div>

    <form class="filters" role="search" data-filters
          data-stones-one="${esc(t.stones(1))}" data-lang="${lang}" onsubmit="return false">
      <div class="shell filters__inner">
        <div class="filters__search">
          <label class="filters__label" for="q">${t.search}</label>
          <div class="search">
            <span class="icon icon--search search__icon" aria-hidden="true"></span>
            <input class="search__input" id="q" name="q" type="search" autocomplete="off" spellcheck="false"
                   enterkeyhint="search" aria-describedby="q-hint">
          </div>
          <span class="u-visually-hidden" id="q-hint">${t.searchHint}</span>
        </div>

        <button class="chip filters__toggle" type="button" aria-expanded="false" aria-controls="facets" data-facets-toggle>
          ${t.filterRows}<span class="filters__active" data-active hidden></span>
        </button>

        <div class="facets" id="facets" data-facets>
          <fieldset class="facet">
            <legend class="filters__label">${t.type}</legend>
            <div class="facet__picks">
${chips(lang, "type", TYPES, t.types)}
            </div>
          </fieldset>

          <fieldset class="facet">
            <legend class="filters__label">${t.origin}</legend>
            <div class="facet__picks">
${chips(lang, "origin", ORIGINS, t.origins)}
            </div>
          </fieldset>

          <fieldset class="facet facet--colour">
            <legend class="filters__label">${t.colour}</legend>
            <div class="facet__picks">
${chips(lang, "colour", COLOURS, t.colours, true)}
            </div>
          </fieldset>
        </div>

        <div class="filters__status">
          <p class="filters__count" aria-live="polite" data-total>${t.stones(c.all)}</p>
          <button class="filters__clear" type="button" data-clear hidden>${t.clear}</button>
        </div>
      </div>
    </form>

    <template data-words>${JSON.stringify({ stones: lang === "fa" ? "% سنگ" : "% stones", one: lang === "fa" ? "% سنگ" : "% stone" })}</template>

${groups}

    <div class="shell empty" data-empty hidden>
      <p class="empty__text">${t.none}</p>
      <button class="chip" type="button" data-clear>${t.clear}</button>
    </div>
  </main>

${foot(lang)}

  <script src="${prefix}assets/js/products.js" defer></script>
</body>
</html>
`;
  write(lang === "en" ? "en/index.html" : "index.html", html);
}

/* ------------------------------------------------------------ product */

/** The research's prose: a short line with no full stop is a heading. */
function prose(text) {
  const lines = String(text || "").split(/\n+/).map((l) => plain(l)).filter(Boolean);
  return lines
    .map((line) => {
      const heading = line.length < 40 && !/[.،؛:]$/.test(line) && !/[.]\s/.test(line);
      return heading ? `<h3 class="about__heading">${esc(line)}</h3>` : `<p>${esc(line)}</p>`;
    })
    .join("\n          ");
}

function specRows(lang, p) {
  const t = T[lang];
  const rows = [];
  const kind = typeOf(p);
  rows.push([t.specType, t.types[kind]]);
  if (p.origin?.[lang]) rows.push([t.specOrigin, p.origin[lang]]);
  rows.push([t.specCategory, p.category === "quarry" ? (lang === "fa" ? "معدن" : "Quarry") : t.origins[originOf(p)]]);

  // Anything else the site said about the stone, as it said it.
  const known = lang === "fa" ? ["نوع", "کشور مبدا", "دسته‌بندی", "رنگ"] : ["Type", "Origin", "Category", "Colour"];
  for (const [k, v] of Object.entries(p.specs?.[lang] || {})) {
    if (known.includes(k) || v == null || typeof v === "object") continue;
    rows.push([k, v]);
  }
  return rows;
}

function colourRow(lang, p) {
  const t = T[lang];
  const said = p.specs?.[lang]?.[lang === "fa" ? "رنگ" : "Colour"];
  const words = p.colours.map((c) => `<span class="swatch"><span class="pick__swatch pick__swatch--${c}" aria-hidden="true"></span>${t.colours[c]}</span>`);
  const free = typeof said === "string" ? `<span class="spec__note">${esc(plain(said))}</span>` : "";
  return words.length || free ? `          <div class="spec">
            <dt class="spec__label">${t.specColour}</dt>
            <dd class="spec__value spec__value--swatches">${words.join("")}${free}</dd>
          </div>` : "";
}

function product(lang, p) {
  const t = T[lang];
  const other = lang === "fa" ? "en" : "fa";
  const prefix = lang === "en" ? "../../../" : "../../";
  const listHref = lang === "en" ? "../../" : "../../";
  const otherHref = lang === "en" ? `../../../product/${p.slug}/` : `../../en/product/${p.slug}/`;
  const name = plain(p.name[lang]);
  const kind = typeOf(p);

  const photos = p.photos.map((ph) => ({
    ...ph,
    label: ph.kind === "project" ? t.inPlace(name) : ph.kind === "quarry" ? t.quarry(name) : t.surface(name),
  }));
  const main = photos[0];
  const sizes = "(min-width: 64rem) 56vw, 100vw";

  const gallery = photos.length
    ? `        <div class="plates">
${photos
  .map(
    (ph, i) => `          <figure class="plate${i === 0 ? " plate--lead" : ""} cut zoomable" data-zoom>
            <img src="${prefix}${ph.base}-${ph.widths[Math.min(1, ph.widths.length - 1)]}.webp"
                 srcset="${srcset(prefix, ph)}"
                 sizes="${i === 0 ? sizes : "(min-width: 64rem) 27vw, 50vw"}"
                 width="${ph.width}" height="${ph.height}"
                 data-full="${largest(prefix, ph)}"
                 alt="${esc(ph.label)}"
                 ${i === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async">
            <button class="lb-open" type="button"><span class="u-visually-hidden">${esc(t.zoom(ph.label))}</span></button>
          </figure>`
  )
  .join("\n")}
        </div>`
    : `        <div class="plates">
          <div class="plate plate--lead plate--none">
            <span class="bk-shape bk-shape--07" aria-hidden="true"></span>
            <p class="plate__none">${t.noPhoto}</p>
          </div>
        </div>`;

  const texture = p.textures[0];
  const download = texture
    ? `          <div class="get">
            <a class="get__button" href="${prefix}${texture.file}" download="${esc(p.slug)}-texture.${texture.format === "PNG" ? "png" : "jpg"}">
              <span class="icon icon--download" aria-hidden="true"></span>${t.download}
            </a>
            <p class="get__meta">${t.textureMeta(texture)}</p>
          </div>`
    : `          <p class="get get--none">${t.noTexture}</p>`;

  const description = p.description?.[lang]
    ? `      <section class="about" aria-labelledby="about">
        <div class="shell about__inner">
          <h2 class="section-title" id="about">${t.about}</h2>
          <div class="about__text">
          ${prose(p.description[lang])}
          </div>
        </div>
      </section>`
    : "";

  // The stones of the same colour, the same kind first.
  const colour = p.colours[0];
  const related = colour
    ? products
        .filter((q) => q.slug !== p.slug && q.category !== "quarry" && q.colours[0] === colour && lead(q))
        .sort((a, b) => (typeOf(b) === kind) - (typeOf(a) === kind) || collator(lang)(a, b))
        .slice(0, 4)
    : [];
  const relatedHtml = related.length
    ? `      <section class="related" aria-labelledby="related">
        <div class="shell">
          <h2 class="section-title" id="related">${t.related}</h2>
          <ol class="stones stones--row" role="list">
${related.map((q) => tile(lang, q, { prefix })).join("\n")}
          </ol>
        </div>
      </section>`
    : "";

  const html = `${head(lang, {
    title: `${name} | ${t.title}`,
    description: `${name}: ${[t.types[kind], p.origin?.[lang]].filter(Boolean).map(plain).join(lang === "fa" ? "، " : ", ")}.`,
    prefix,
    preloadImage: main && { srcset: srcset(prefix, main), sizes },
  })}
<body class="page page--stone">

${bar(lang, { prefix, otherHref, homeHref: listHref })}

  <main id="stones">
    <article class="stone-page">
      <div class="shell stone-page__inner">
${gallery}

        <div class="card">
          <a class="card__back" href="${listHref}">${t.back}</a>
          <h1 class="card__name">${esc(name)}</h1>
          <p class="card__alt" lang="${other}" dir="${T[other].dir}">${esc(plain(p.name[other]))}</p>

          <h2 class="u-visually-hidden">${t.specs}</h2>
          <dl class="specs">
${specRows(lang, p).map(([k, v]) => `          <div class="spec">
            <dt class="spec__label">${esc(plain(k))}</dt>
            <dd class="spec__value">${esc(plain(v))}</dd>
          </div>`).join("\n")}
${colourRow(lang, p)}
          </dl>

${download}
        </div>
      </div>
    </article>

${description}

${relatedHtml}
  </main>

${foot(lang)}

${photos.length ? lightbox(lang) : ""}

  <script src="${prefix}assets/js/products.js" defer></script>
${photos.length ? `  <script src="${prefix}assets/js/lightbox.js" defer></script>` : ""}
</body>
</html>
`;
  write(`${lang === "en" ? "en/" : ""}product/${p.slug}/index.html`, html);
}

/* --------------------------------------------------------------- build */

for (const dir of ["product", "en"]) rmSync(join(ROOT, dir), { recursive: true, force: true });

for (const lang of ["fa", "en"]) {
  listing(lang);
  for (const p of products) product(lang, p);
}

console.log(`${products.length} stones, ${products.length * 2 + 2} pages`);
