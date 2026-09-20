/**
 * Generates the catalogue pages from data/products.json.
 *
 *   node tools/build-catalogue.mjs
 *
 * The output is committed, so deployment stays a plain file upload with no
 * build step. This script exists so a product is one JSON entry rather than
 * two hand-copied HTML files that drift apart.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const LOCALES = {
  fa: {
    dir: "rtl",
    outDir: "products",
    depth: 1,
    logo: "lockup-fa",
    preload: ["fonts/rokh/Rokh-Regular.woff2", "fonts/rokh/Rokh-Bold.woff2"],
    switchTo: { code: "en", chip: "EN", name: "English" },
    brand: "بهکوشان",
    company: "شرکت فرآورسنگ بهکوشان",
    address: "تهران، شهرک صنعتی شمس‌آباد، کوچه سنبل ۵، پلاک ۲۸۶",
    home: "خانه",
    products: "محصولات",
    skip: "رفتن به محتوای اصلی",
    homeAria: "بهکوشان، صفحه نخست",
    navAria: "ناوبری اصلی",
    crumbAria: "مسیر صفحه",
    indexTitle: "محصولات",
    indexLede: "سنگ ساختمانی بریده و پرداخت‌شده در کارخانه شمس‌آباد. برای قیمت و موجودی تماس بگیرید.",
    sampleNotice:
      "این فهرست نمونه است. نام سنگ‌ها و معادن واقعی‌اند، اما پرداخت، ابعاد، گرید و کد محصول جای‌نگهدارند و باید با ارقام خود بهکوشان جایگزین شوند.",
    specsTitle: "مشخصات فنی",
    relatedTitle: "سنگ‌های دیگر",
    quote: "درخواست قیمت",
    sheet: "دریافت برگه فنی",
    mainCaption: "جای تصویر اصلی محصول",
    detailCaption: "سه تصویر جزئیات: بافت نزدیک، لبه برش‌خورده، نمونه اجراشده",
  },
  en: {
    dir: "ltr",
    outDir: "en/products",
    depth: 2,
    logo: "lockup",
    preload: ["fonts/tt-firs-neue/TTFirsNeue-VarRoman.woff2"],
    switchTo: { code: "fa", chip: "FA", name: "فارسی" },
    brand: "Behkooshan",
    company: "Behkooshan Stone Processing",
    address: "No 10 (286), 5th Sonbol, Zakariya St., Shams Abad Industrial Zone, Tehran, Iran",
    home: "Home",
    products: "Products",
    skip: "Skip to main content",
    homeAria: "Behkooshan, home",
    navAria: "Main",
    crumbAria: "Breadcrumb",
    indexTitle: "Products",
    indexLede: "Building stone cut and finished at the Shams Abad works. Get in touch for pricing and availability.",
    sampleNotice:
      "This listing is sample data. The stone names and quarries are real, but finishes, slab sizes, grades and product codes are placeholders and have to be replaced with Behkooshan's own figures.",
    specsTitle: "Specifications",
    relatedTitle: "Other stone",
    quote: "Request a quote",
    sheet: "Download data sheet",
    mainCaption: "Primary product image slot",
    detailCaption: "Three detail shots: close grain, a cut edge, one installed example",
  },
};

/** Guide component sheet: a placeholder names the asset that belongs in it. */
const SLOT_MAIN = "slab photograph · 2000 × 1500";
const SLOT_DETAIL = "detail · 800 × 800";

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/** Path from a page at this locale's depth back to the repository root. */
const up = (locale) => "../".repeat(LOCALES[locale].depth);

/** The same page in the other language. */
const counterpart = (locale, file) =>
  locale === "fa" ? `${up("fa")}en/products/${file}` : `${up("en")}products/${file}`;

function head(locale, { title, description, file }) {
  const L = LOCALES[locale];
  const u = up(locale);
  const faHref = locale === "fa" ? `./${file}` : counterpart("en", file);
  const enHref = locale === "en" ? `./${file}` : counterpart("fa", file);

  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">

  <link rel="icon" href="${u}assets/logos/logo-mark.svg" type="image/svg+xml">
  <link rel="alternate" hreflang="fa" href="${faHref}">
  <link rel="alternate" hreflang="en" href="${enHref}">

${L.preload.map((f) => `  <link rel="preload" href="${u}assets/${f}" as="font" type="font/woff2" crossorigin>`).join("\n")}

${["fonts", "tokens", "site", "shapes", "product"]
  .map((n) => `  <link rel="stylesheet" href="${u}assets/css/${n}.css">`)
  .join("\n")}
</head>`;
}

function header(locale, file, { current }) {
  const L = LOCALES[locale];
  const u = up(locale);

  return `  <header class="site-header">
    <div class="shell site-header__inner">
      <a class="site-header__logo" href="${u}" aria-label="${esc(L.homeAria)}">
        <span class="bk-logo bk-logo--${L.logo}"></span>
      </a>

      <nav class="site-nav" aria-label="${esc(L.navAria)}">
        <a href="./"${current === "products" ? ' aria-current="page"' : ""}>${esc(L.products)}</a>
      </nav>

      <a class="lang-switch" href="${counterpart(locale, file)}" lang="${L.switchTo.code}"
         aria-label="${esc(L.switchTo.name)}">${L.switchTo.chip}</a>
    </div>
  </header>`;
}

function footer(locale) {
  const L = LOCALES[locale];
  const latin = locale === "fa" ? ' lang="en"' : "";

  return `  <footer class="site-footer">
    <div class="shell site-footer__inner">
      <p>${esc(L.address)}</p>
      <p class="tagline"${latin}>Beautifully Strong</p>
      <p><a href="https://behkooshan.ir"${latin}>behkooshan.ir</a></p>
    </div>
  </footer>`;
}

function breadcrumb(locale, trail) {
  const items = trail
    .map((t) =>
      t.href
        ? `        <li><a href="${t.href}">${esc(t.label)}</a></li>`
        : `        <li aria-current="page">${esc(t.label)}</li>`
    )
    .join("\n");

  return `      <nav class="breadcrumb" aria-label="${esc(LOCALES[locale].crumbAria)}">
        <ol>
${items}
        </ol>
      </nav>`;
}

/**
 * Striped placeholder field. Replace the whole element with an <img> once the
 * photography exists; the label states exactly what belongs in the slot.
 */
const mediaSlot = ({ ratio, label, bare = false, indent, extraClass = "" }) => {
  const pad = " ".repeat(indent);
  const classes = ["media-slot", bare ? "media-slot--bare" : "", extraClass].filter(Boolean).join(" ");
  return `${pad}<div class="${classes}" style="--slot-ratio: ${ratio}">
${pad}  <span class="media-slot__label">${esc(label)}</span>
${pad}</div>`;
};

function card(locale, product, categories, { href, indent }) {
  const pad = " ".repeat(indent);
  const p = product[locale];

  return `${pad}<li class="card">
${pad}  <a href="${href}">
${mediaSlot({ ratio: "4 / 3", label: SLOT_MAIN, indent: indent + 4 })}
${pad}    <p class="card__name">${esc(p.name)}</p>
${pad}    <p class="card__type label">${esc(categories[product.category][locale])}</p>
${pad}  </a>
${pad}</li>`;
}

function indexPage(locale, data) {
  const L = LOCALES[locale];
  const cards = data.products
    .map((product) => card(locale, product, data.categories, { href: `./${product.slug}.html`, indent: 8 }))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${L.dir}">
${head(locale, { title: `${L.indexTitle} | ${L.brand}`, description: L.indexLede, file: "index.html" })}
<body>
  <a class="skip-link" href="#main">${esc(L.skip)}</a>

${header(locale, "index.html", { current: "products" })}

  <main class="page" id="main">
    <div class="shell">

${breadcrumb(locale, [{ label: L.home, href: up(locale) }, { label: L.products }])}

      <h1>${esc(L.indexTitle)}</h1>
      <p>${esc(L.indexLede)}</p>

      <div class="notice">
        <p>${esc(L.sampleNotice)}</p>
      </div>

      <ul class="card-grid">
${cards}
      </ul>

    </div>
  </main>

${footer(locale)}
</body>
</html>
`;
}

function detailPage(locale, product, data) {
  const L = LOCALES[locale];
  const p = product[locale];
  const file = `${product.slug}.html`;

  const specs = data.specOrder
    .map(
      (key) => `          <dl class="spec">
            <dt>${esc(data.specLabels[key][locale])}</dt>
            <dd>${esc(p.specs[key])}</dd>
          </dl>`
    )
    .join("\n");

  const thumbs = [1, 2, 3]
    .map(() => mediaSlot({ ratio: "1 / 1", label: SLOT_DETAIL, bare: true, indent: 12 }))
    .join("\n");

  const related = data.products
    .filter((other) => other.slug !== product.slug)
    .slice(0, 3)
    .map((other) => card(locale, other, data.categories, { href: `./${other.slug}.html`, indent: 8 }))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${L.dir}">
${head(locale, { title: `${p.name} | ${L.brand}`, description: p.lede, file })}
<body>
  <a class="skip-link" href="#main">${esc(L.skip)}</a>

${header(locale, file, { current: "products" })}

  <main class="page" id="main">
    <div class="shell">

${breadcrumb(locale, [
  { label: L.home, href: up(locale) },
  { label: L.products, href: "./" },
  { label: p.name },
])}

      <div class="product">

        <div class="product__head">
          <span class="product__type eyebrow">${esc(data.categories[product.category][locale])}</span>
          <h1>${esc(p.name)}</h1>
        </div>

        <div class="product__gallery">
          <figure>
            <!-- SLOT: ${esc(p.name)}, 4:3, 2000x1500. Replace this div with an <img>. -->
${mediaSlot({ ratio: "4 / 3", label: SLOT_MAIN, indent: 12 })}
            <figcaption class="product__caption">${esc(L.mainCaption)}</figcaption>
          </figure>

          <div class="product__thumbs">
            <!-- SLOT: three detail shots, 1:1, 800x800. -->
${thumbs}
          </div>
          <p class="product__caption">${esc(L.detailCaption)}</p>
        </div>

        <div class="product__body">
          <p class="product__lede">${esc(p.lede)}</p>

          <div class="product__actions">
            <a class="button" href="#">${esc(L.quote)} <span class="button__arrow" aria-hidden="true">&rarr;</span></a>
            <a class="button button--quiet" href="#">${esc(L.sheet)}</a>
          </div>
        </div>

      </div>

      <section class="specs" aria-labelledby="specs-title">
        <h2 class="specs__title" id="specs-title">${esc(L.specsTitle)}</h2>

        <div class="spec-grid">
${specs}
        </div>
      </section>

      <section class="related" aria-labelledby="related-title">
        <h2 id="related-title">${esc(L.relatedTitle)}</h2>

        <ul class="card-grid">
${related}
        </ul>
      </section>

    </div>
  </main>

${footer(locale)}
</body>
</html>
`;
}

const data = JSON.parse(await readFile(join(ROOT, "data/products.json"), "utf8"));
let written = 0;

for (const locale of Object.keys(LOCALES)) {
  const outDir = join(ROOT, LOCALES[locale].outDir);
  await mkdir(outDir, { recursive: true });

  await writeFile(join(outDir, "index.html"), indexPage(locale, data));
  written++;

  for (const product of data.products) {
    await writeFile(join(outDir, `${product.slug}.html`), detailPage(locale, product, data));
    written++;
  }
}

console.log(`${written} pages written from ${data.products.length} products`);
