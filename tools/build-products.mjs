#!/usr/bin/env node
/* ==========================================================================
   Behkooshan products: the build

   Reads data/products.json (written by tools/derive-products.py) and writes
   the whole site as plain HTML, in two readings, as the digital catalogue
   is written:

     index.html                          upright, Persian
     en/index.html                       upright, English
     wide/index.html                     sideways, Persian
     wide/en/index.html                  sideways, English
     <any of those>product/<slug>/       one stone, in the same reading

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
    views: { flow: "نمای عمودی", wide: "نمای افقی" },
    viewLabels: { flow: "دیدن در نمای عمودی", wide: "دیدن در نمای افقی" },
    skip: "رفتن به سنگ‌ها",
    toStart: "بازگشت به ابتدا",
    search: "نام سنگ",
    searchHint: "فارسی یا لاتین",
    type: "نوع",
    origin: "مبدا",
    colour: "رنگ",
    clear: "پاک کردن فیلترها",
    none: "سنگی با این نام یا این فیلترها پیدا نشد.",
    stones: (n) => `${num("fa", n)} سنگ`,
    groups: { domestic: "سنگ‌های داخلی", imported: "سنگ‌های وارداتی" },
    types: { granite: "گرانیت", quartzite: "کوارتزیت", marble: "مرمر", other: "سایر" },
    origins: { domestic: "داخلی", imported: "وارداتی" },
    colours: { white: "سفید", cream: "کرم", grey: "خاکستری", black: "مشکی", green: "سبز", blue: "آبی", pink: "صورتی" },
    back: "همه سنگ‌ها",
    specs: "مشخصات",
    specType: "نوع",
    specOrigin: "کشور مبدا",
    specCategory: "دسته‌بندی",
    specColour: "رنگ",
    quarry: "معدن",
    download: "دانلود تکسچر",
    textureMeta: (t) => [
      `فایل <span lang="en">${t.format === "PNG" ? "PNG" : "JPG"}</span>`,
      `${num("fa", t.width)} × ${num("fa", t.height)} پیکسل`,
      size("fa", t.bytes),
    ],
    noTexture: "فایل تکسچر این سنگ هنوز منتشر نشده است.",
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
    views: { flow: "Upright", wide: "Sideways" },
    viewLabels: { flow: "Read in the upright view", wide: "Read in the sideways view" },
    skip: "Skip to the stones",
    toStart: "Back to the start",
    search: "Stone name",
    searchHint: "Latin or Persian",
    type: "Type",
    origin: "Origin",
    colour: "Colour",
    clear: "Clear filters",
    none: "No stone matches that name or those filters.",
    stones: (n) => `${n} ${n === 1 ? "stone" : "stones"}`,
    groups: { domestic: "Domestic stones", imported: "Imported stones" },
    types: { granite: "Granite", quartzite: "Quartzite", marble: "Marble", other: "Other" },
    origins: { domestic: "Domestic", imported: "Imported" },
    colours: { white: "White", cream: "Cream", grey: "Grey", black: "Black", green: "Green", blue: "Blue", pink: "Pink" },
    back: "All stones",
    specs: "Specification",
    specType: "Type",
    specOrigin: "Origin",
    specCategory: "Category",
    specColour: "Colour",
    quarry: "Quarry",
    download: "Download texture",
    textureMeta: (t) => [
      `${t.format === "PNG" ? "PNG" : "JPG"} file`,
      `${t.width} × ${t.height} pixels`,
      size("en", t.bytes),
    ],
    noTexture: "The texture file for this stone has not been published yet.",
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

/** A title set one word at a time, as the catalogue's titles are. */
function words(text) {
  return String(text)
    .split(/\s+/)
    .map((w, i) => `<span class="word" style="--w:${i}"><span>${esc(w)}</span></span>`)
    .join(" ");
}

function write(rel, html) {
  const target = join(ROOT, rel);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
}

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

function middle(prefix, photo) {
  return `${prefix}${photo.base}-${photo.widths[Math.min(1, photo.widths.length - 1)]}.webp`;
}

/** The stone's own picture: the slab surface, or else the first photograph. */
function lead(p) {
  return p.photos.find((ph) => ph.kind === "main" || ph.kind === "listing") || p.photos[0] || null;
}

function collator(lang) {
  const c = new Intl.Collator(lang === "fa" ? "fa" : "en", { sensitivity: "base" });
  return (a, b) => c.compare(a.name[lang], b.name[lang]);
}

/* ---------------------------------------------------------------- where */

/* A page is one reading (upright or sideways) in one language. Its folder
   decides how far up the site's root is, and every link is written from
   there. */
function baseOf(mode, lang) {
  return (mode === "wide" ? "wide/" : "") + (lang === "en" ? "en/" : "");
}

function upTo(folder) {
  return "../".repeat(folder.split("/").filter(Boolean).length);
}

function site(page) {
  const { mode, lang, prefix } = page;
  return {
    listing: (m = mode, l = lang) => prefix + baseOf(m, l) || "./",
    product: (slug, m = mode, l = lang) => `${prefix}${baseOf(m, l)}product/${slug}/`,
    catalogue: () => `${prefix}${CATALOGUE}${mode === "wide" ? "wide/" : ""}${lang === "en" ? "en/" : ""}`,
  };
}

/* --------------------------------------------------------------- shell */

function head(page, { title, description, preloadImage }) {
  const { lang, prefix, mode } = page;
  const t = T[lang];
  const fonts = lang === "fa"
    ? ["assets/fonts/rokh/Rokh-Regular.woff2", "assets/fonts/rokh/Rokh-Bold.woff2"]
    : ["assets/fonts/tt-firs-neue/TTFirsNeue-VarRoman.woff2"];
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${t.dir}" data-axis="${mode === "wide" ? "inline" : "block"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#184b36">
  <meta name="color-scheme" content="light">
  <link rel="icon" href="${prefix}assets/logos/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="${prefix}assets/logos/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="${prefix}assets/logos/apple-touch-icon.png">
${fonts.filter((f) => existsSync(join(ROOT, f))).map((f) => `  <link rel="preload" href="${prefix}${f}" as="font" type="font/woff2" crossorigin>`).join("\n")}
${preloadImage ? `  <link rel="preload" as="image" imagesrcset="${preloadImage.srcset}" imagesizes="${preloadImage.sizes}" fetchpriority="high">\n` : ""}  <link rel="stylesheet" href="${prefix}assets/css/fonts.css">
  <link rel="stylesheet" href="${prefix}assets/css/tokens.css">
  <link rel="stylesheet" href="${prefix}assets/css/shapes.css">
  <link rel="stylesheet" href="${prefix}assets/css/products.css">${
  mode === "wide" ? `\n  <link rel="stylesheet" href="${prefix}assets/css/products-wide.css">` : ""
}
  <script>document.documentElement.classList.add("js");</script>
</head>`;
}

function bar(page, { otherLang, otherView, home }) {
  const { lang, mode } = page;
  const t = T[lang];
  const other = mode === "wide" ? "flow" : "wide";
  return `  <a class="skip" href="#stones">${t.skip}</a>

  <header class="bar">
    <div class="shell bar__inner">
      <a class="bar__logo" href="${home}" aria-label="${esc(t.home)}">
        <span class="bk-logo ${lang === "fa" ? "bk-logo--lockup-fa" : "bk-logo--lockup"}"></span>
      </a>

      <div class="bar__end">
        <a class="chip" href="${site(page).catalogue()}" aria-label="${esc(t.catalogueLabel)}">${t.catalogue}</a>
        <a class="chip" href="${otherView}" data-view-swap aria-label="${esc(t.viewLabels[other])}">${t.views[other]}</a>
        <a class="chip" href="${otherLang}" lang="${t.other}" hreflang="${t.other}" aria-label="${esc(t.otherLabel)}">${t.otherName}</a>
      </div>
    </div>

    <span class="progress" aria-hidden="true"></span>
  </header>`;
}

function foot(page) {
  const { lang, mode } = page;
  const t = T[lang];
  return `  <footer class="foot"${mode === "wide" ? ' role="contentinfo"' : ""}>
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

      <a class="to-start" href="#top" data-to-start>
        <span class="icon icon--${mode === "wide" ? (lang === "fa" ? "to-right" : "to-left") : "to-top"}" aria-hidden="true"></span>${t.toStart}
      </a>
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
      <div class="lb__thumbs" data-lb-thumbs hidden></div>
      <div class="lb__foot">
        <p class="lb__counter" data-template="${l.counter}"></p>
        <div class="lb__tools">
          <button class="lb__btn" type="button" data-lb-step="-1" aria-label="${l.prev}">&#8249;</button>
          <button class="lb__btn" type="button" data-lb-step="1" aria-label="${l.next}">&#8250;</button>
        </div>
      </div>
    </div>
  </dialog>`;
}

/** The page's closing: the footer, which sideways is the last panel of the
    track and so has to be inside it, then the scripts. */
function close(page, { scripts, extra = "" }) {
  const wide = page.mode === "wide";
  return `${wide ? `${foot(page)}\n  </main>\n` : `  </main>\n\n${foot(page)}\n`}
${extra}
${scripts.map((s) => `  <script src="${page.prefix}assets/js/${s}" defer></script>`).join("\n")}
</body>
</html>
`;
}

/* ----------------------------------------------------------- the tile */

const TILE_SIZES = "(min-width: 90rem) 18rem, (min-width: 64rem) 23vw, (min-width: 40rem) 31vw, 47vw";
const FEATURE_SIZES = "(min-width: 64rem) 46vw, (min-width: 40rem) 62vw, 94vw";

/* Sideways a stone's width comes from the height of the window on a
   spread (products-wide.css: a quarter of it, near enough) and from half
   its width on a card; the quarry is two of them. */
const SPREAD = "(min-width: 60rem) and (min-height: 38rem)";
const WIDE_TILE_SIZES = `${SPREAD} 26vh, calc(50vw - 2.5rem)`;
const WIDE_FEATURE_SIZES = `${SPREAD} calc(52vh + 2rem), calc(100vw - 2.5rem)`;

function tile(page, p, { eager = false, feature = false } = {}) {
  const { lang } = page;
  const t = T[lang];
  const photo = feature ? p.photos.find((ph) => ph.kind === "quarry") || lead(p) : lead(p);
  const meta = [t.types[typeOf(p)], p.origin?.[lang]].filter(Boolean).map(plain);

  // Where the stone is from, on the brand's tag in the corner of its
  // photograph. The quarry is a domestic one.
  const from = `<span class="stone__tag">${t.origins[originOf(p)]}</span>`;
  const picture = photo
    ? `<span class="stone__photo"><img src="${middle(page.prefix, photo)}"
               srcset="${srcset(page.prefix, photo)}"
               sizes="${page.mode === "wide" ? (feature ? WIDE_FEATURE_SIZES : WIDE_TILE_SIZES) : feature ? FEATURE_SIZES : TILE_SIZES}"
               width="${photo.width}" height="${photo.height}"
               alt="" ${eager ? 'loading="eager"' : 'loading="lazy"'} decoding="async">${from}</span>`
    : `<span class="stone__none"><span class="bk-shape bk-shape--07" aria-hidden="true"></span>${from}</span>`;

  return `        <li class="stone${feature ? " stone--feature" : ""}"
            data-type="${typeOf(p)}" data-origin="${originOf(p)}" data-colours="${esc(p.colours.join(" "))}"
            data-names="${esc(searchText(p))}">
          <a class="stone__link" href="${site(page).product(p.slug)}">
            <span class="stone__frame cut place">
              ${picture}
            </span>
            <span class="stone__text reveal" style="--i:1">
              <span class="stone__name">${esc(plain(p.name[lang]))}</span>
              <span class="stone__meta">${esc(meta.join(lang === "fa" ? "، " : ", "))}</span>
            </span>
          </a>
        </li>`;
}

/* ------------------------------------------------------------ listing */

function chips(group, values, labels, withSwatch = false) {
  return values
    .map(
      (v) => `              <button class="pick${withSwatch ? " pick--colour" : ""}" type="button" data-${group}="${v}" aria-pressed="false">${
        withSwatch ? `<span class="pick__swatch pick__swatch--${v}" aria-hidden="true"></span>` : ""
      }${labels[v]}</button>`
    )
    .join("\n");
}

const BAND = products.filter((p) => p.surface).sort((a, b) => a.surface.order - b.surface.order);
/* The band runs from edge to edge of the window upright and on a card, and
   takes the first half and more of a spread sideways (products-wide.css). */
const bandSizes = (mode) => (mode === "wide" ? "(min-width: 60rem) and (min-height: 38rem) 56vw, 100vw" : "100vw");

/* The band at the head of the listing: the stones' own surfaces, one after
   another, each laid over the last from the leading edge the way the
   catalogue lays its photographs onto the page, with the name of the stone
   it is showing under it. The first is in the page; the rest are listed for
   the script, which fetches each only as its turn comes. The picture is
   hidden from assistive technology: the name under it is a link to the
   stone, and every stone it shows is in the grid. */
function hero(page) {
  if (!BAND.length) return "";
  const { lang, mode } = page;
  const links = site(page);
  const slides = BAND.map((p) => ({
    srcset: srcset(page.prefix, p.surface),
    src: largest(page.prefix, p.surface),
    name: plain(p.name[lang]),
    href: links.product(p.slug),
  }));
  const first = BAND[0].surface;
  return `      <div class="hero" data-hero data-sizes="${bandSizes(mode)}"
           data-slides="${esc(JSON.stringify(slides))}">
        <div class="hero__frame" aria-hidden="true">
          <img class="hero__img hero__img--first" src="${largest(page.prefix, first)}" srcset="${srcset(page.prefix, first)}" sizes="${bandSizes(mode)}"
               width="${first.width}" height="${first.height}" alt="" fetchpriority="high" decoding="async">
        </div>
        <a class="hero__name" href="${slides[0].href}" data-hero-link>
          <span class="hero__title" data-hero-title>${words(slides[0].name)}</span>
        </a>
      </div>`;
}

function listing(mode, lang) {
  const base = baseOf(mode, lang);
  const page = { mode, lang, prefix: upTo(base) };
  const t = T[lang];
  const links = site(page);
  const sort = collator(lang);
  const quarry = products.filter((p) => p.category === "quarry");
  const byOrigin = (o) => products.filter((p) => p.category !== "quarry" && originOf(p) === o).sort(sort);

  let n = 0;
  const groups = ORIGINS.map((o) => {
    const items = [...(o === "domestic" ? quarry : []), ...byOrigin(o)];
    const tiles = items
      .map((p) => {
        n += 1;
        return tile(page, p, { eager: n <= 6, feature: p.category === "quarry" });
      })
      .join("\n");
    return `    <section class="group" data-group="${o}" aria-labelledby="group-${o}">
      <div class="shell group__inner">
        <h2 class="group__title headline${mode === "wide" ? " divider" : ""}" id="group-${o}"><span class="group__name">${words(t.groups[o])}</span> <span class="group__count" data-count>${num(lang, items.length)}</span></h2>
        <ol class="stones" role="list">
${tiles}
        </ol>
      </div>
    </section>`;
  }).join("\n\n");

  const html = `${head(page, {
    title: t.title,
    description: t.description,
    preloadImage: BAND[0] && { srcset: srcset(page.prefix, BAND[0].surface), sizes: bandSizes(mode) },
  })}
<body class="page page--list">

${bar(page, { otherLang: links.listing(mode, t.other), otherView: links.listing(mode === "wide" ? "flow" : "wide"), home: "./" })}

  <main id="stones"${mode === "wide" ? ' class="track"' : ""}>
    <div class="intro">
${hero(page)}

      <div class="intro__body">
        <div class="shell intro__inner">
          <h1 class="intro__title">${words(t.heading)}</h1>
        </div>

      <form class="filters" role="search" data-filters data-lang="${lang}" onsubmit="return false">
        <div class="shell filters__inner">
          <div class="filters__search reveal" style="--i:0">
            <label class="filters__label" for="q">${t.search}</label>
            <div class="search">
              <span class="icon icon--search search__icon" aria-hidden="true"></span>
              <input class="search__input" id="q" name="q" type="search" autocomplete="off" spellcheck="false"
                     enterkeyhint="search" aria-describedby="q-hint">
            </div>
            <span class="u-visually-hidden" id="q-hint">${t.searchHint}</span>
          </div>

          <div class="facets" id="facets" data-facets>
            <fieldset class="facet reveal" style="--i:1">
              <legend class="filters__label">${t.type}</legend>
              <div class="facet__picks">
${chips("type", TYPES, t.types)}
              </div>
            </fieldset>

            <fieldset class="facet reveal" style="--i:2">
              <legend class="filters__label">${t.origin}</legend>
              <div class="facet__picks">
${chips("origin", ORIGINS, t.origins)}
              </div>
            </fieldset>

            <fieldset class="facet facet--colour reveal" style="--i:3">
              <legend class="filters__label">${t.colour}</legend>
              <div class="facet__picks">
${chips("colour", COLOURS, t.colours, true)}
              </div>
            </fieldset>
          </div>

          <div class="filters__status reveal" style="--i:4">
            <p class="filters__count" aria-live="polite" data-total>${t.stones(products.length)}</p>
            <button class="filters__clear" type="button" data-clear hidden>${t.clear}</button>
          </div>
        </div>
      </form>
      </div>
    </div>

    <template data-words>${JSON.stringify({
      stones: lang === "fa" ? "% سنگ" : "% stones",
      one: lang === "fa" ? "% سنگ" : "% stone",
      filters: lang === "fa" ? "فیلترها" : "Filters",
      back: lang === "fa" ? "بازگشت به جست‌وجو و فیلترها" : "Back to the search and filters",
    })}</template>

${groups}

    <div class="shell empty reveal" data-empty hidden>
      <p class="empty__text">${t.none}</p>
      <button class="chip" type="button" data-clear>${t.clear}</button>
    </div>

${close(page, { scripts: ["products.js", ...(mode === "wide" ? ["products-wide.js"] : [])] })}`;
  write(`${base}index.html`, html);
}

/* ------------------------------------------------------------ product */

/** The research's prose: a short line with no full stop is a heading. */
function prose(text) {
  const lines = String(text || "").split(/\n+/).map((l) => plain(l)).filter(Boolean);
  // Each block arrives as the catalogue's paragraphs do, the first few one
  // after another when they reach the screen together.
  return lines
    .map((line, i) => {
      const heading = line.length < 40 && !/[.،؛:]$/.test(line) && !/[.]\s/.test(line);
      const at = `style="--i:${Math.min(i, 3)}"`;
      return heading ? `<h3 class="about__heading reveal" ${at}>${esc(line)}</h3>` : `<p class="reveal" ${at}>${esc(line)}</p>`;
    })
    .join("\n          ");
}

function specRows(lang, p) {
  const t = T[lang];
  const rows = [[t.specType, t.types[typeOf(p)]]];
  if (p.origin?.[lang]) rows.push([t.specOrigin, p.origin[lang]]);
  rows.push([t.specCategory, p.category === "quarry" ? t.quarry : t.origins[originOf(p)]]);

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
  const swatches = p.colours.map((c) => `<span class="swatch"><span class="pick__swatch pick__swatch--${c}" aria-hidden="true"></span>${t.colours[c]}</span>`);
  const free = typeof said === "string" ? `<span class="spec__note">${esc(plain(said))}</span>` : "";
  return swatches.length || free
    ? `            <div class="spec">
              <dt class="spec__label">${t.specColour}</dt>
              <dd class="spec__value spec__value--swatches">${swatches.join("")}${free}</dd>
            </div>`
    : "";
}

function product(mode, lang, p) {
  const base = `${baseOf(mode, lang)}product/${p.slug}/`;
  const page = { mode, lang, prefix: upTo(base) };
  const t = T[lang];
  const name = plain(p.name[lang]);
  const kind = typeOf(p);
  const links = site(page);
  const wide = mode === "wide";

  const photos = p.photos.map((ph) => ({
    ...ph,
    label: ph.kind === "project" ? t.inPlace(name) : ph.kind === "quarry" ? name : t.surface(name),
  }));
  const main = photos[0];
  const leadSizes = wide ? "(min-width: 60rem) 60vw, 100vw" : "(min-width: 64rem) 56vw, 100vw";
  const restSizes = wide ? "(min-width: 60rem) 45vw, 100vw" : "(min-width: 64rem) 27vw, 50vw";

  const gallery = photos.length
    ? `        <div class="plates">
${photos
  .map(
    (ph, i) => `          <figure class="plate${i === 0 ? " plate--lead" : ""}${wide ? "" : " cut"} place zoomable" data-zoom style="--ratio: ${ph.width} / ${ph.height}">
            <img src="${middle(page.prefix, ph)}"
                 srcset="${srcset(page.prefix, ph)}"
                 sizes="${i === 0 ? leadSizes : restSizes}"
                 width="${ph.width}" height="${ph.height}"
                 data-full="${largest(page.prefix, ph)}"
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
    ? `          <div class="get reveal" style="--i:3">
            <a class="get__button" href="${page.prefix}${texture.file}" download="${esc(p.slug)}-texture.${texture.format === "PNG" ? "png" : "jpg"}">
              <span class="icon icon--download" aria-hidden="true"></span>${t.download}
            </a>
            <ul class="get__meta" role="list">
${t.textureMeta(texture).filter(Boolean).map((line) => `              <li>${line}</li>`).join("\n")}
            </ul>
          </div>`
    : `          <p class="get get--none reveal" style="--i:3">${t.noTexture}</p>`;

  const description = p.description?.[lang]
    ? `    <section class="about" aria-labelledby="about">
      <div class="shell about__inner">
        <h2 class="section-title headline" id="about">${words(t.about)}</h2>
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
    ? `    <section class="related" aria-labelledby="related">
      <div class="shell related__inner">
        <h2 class="section-title headline" id="related">${words(t.related)}</h2>
        <ol class="stones stones--row" role="list">
${related.map((q) => tile(page, q)).join("\n")}
        </ol>
      </div>
    </section>`
    : "";

  const html = `${head(page, {
    title: `${name} | ${t.title}`,
    description: `${name}: ${[t.types[kind], p.origin?.[lang]].filter(Boolean).map(plain).join(lang === "fa" ? "، " : ", ")}.`,
    preloadImage: main && { srcset: srcset(page.prefix, main), sizes: leadSizes },
  })}
<body class="page page--stone">

${bar(page, {
  otherLang: links.product(p.slug, mode, t.other),
  otherView: links.product(p.slug, wide ? "flow" : "wide"),
  home: links.listing(),
})}

  <main id="stones"${wide ? ' class="track"' : ""}>
    <article class="stone-page">
      <div class="shell stone-page__inner">
${gallery}

        <div class="card">
          <a class="card__back reveal" style="--i:0" href="${links.listing()}">${t.back}</a>
          <h1 class="card__name headline">${words(name)}</h1>

          <h2 class="u-visually-hidden">${t.specs}</h2>
          <dl class="specs reveal" style="--i:2">
${specRows(lang, p).map(([k, v]) => `            <div class="spec">
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

${close(page, {
  extra: photos.length ? lightbox(lang) : "",
  scripts: ["products.js", ...(photos.length ? ["lightbox.js"] : []), ...(wide ? ["products-wide.js"] : [])],
})}`;
  write(`${base}index.html`, html);
}

/* --------------------------------------------------------------- build */

for (const dir of ["product", "en", "wide"]) rmSync(join(ROOT, dir), { recursive: true, force: true });

let pages = 0;
for (const mode of ["flow", "wide"]) {
  for (const lang of ["fa", "en"]) {
    listing(mode, lang);
    pages += 1;
    for (const p of products) {
      product(mode, lang, p);
      pages += 1;
    }
  }
}

console.log(`${products.length} stones, ${pages} pages`);
