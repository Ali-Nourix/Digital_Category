/**
 * Generates every page that is driven by data: the catalogue from
 * data/products.json and the About page from data/about.json.
 *
 *   node tools/build-site.mjs
 *
 * The output is committed, so deployment stays a plain file upload with no
 * build step. This script exists so a page is one JSON entry rather than two
 * hand-copied HTML files that drift apart, and so every page shares exactly
 * one header and one footer.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const LOCALES = {
  fa: {
    dir: "rtl",
    logo: "lockup-fa",
    preload: ["fonts/rokh/Rokh-Regular.woff2", "fonts/rokh/Rokh-Bold.woff2"],
    switchTo: { code: "en", chip: "EN", name: "English" },
    brand: "به‌کوشان",
    address: "تهران، شهرک صنعتی شمس‌آباد، کوچه سنبل ۵، پلاک ۲۸۶",
    home: "خانه",
    products: "محصولات",
    about: "درباره ما",
    skip: "رفتن به محتوای اصلی",
    homeAria: "به‌کوشان، صفحه نخست",
    navAria: "ناوبری اصلی",
    crumbAria: "مسیر صفحه",
    indexTitle: "محصولات",
    indexLede: "سنگ ساختمانی بریده و پرداخت‌شده در کارخانه شمس‌آباد. برای قیمت و موجودی تماس بگیرید.",
    sampleNotice:
      "این فهرست نمونه است. نام سنگ‌ها و معادن واقعی‌اند، اما پرداخت، ابعاد، گرید و کد محصول جای‌نگهدارند و باید با ارقام خود به‌کوشان جایگزین شوند.",
    specsTitle: "مشخصات فنی",
    relatedTitle: "سنگ‌های دیگر",
    quote: "درخواست قیمت",
    sheet: "دریافت برگه فنی",
    mainCaption: "جای تصویر اصلی محصول",
    detailCaption: "سه تصویر جزئیات: بافت نزدیک، لبه برش‌خورده، نمونه اجراشده",
  },
  en: {
    dir: "ltr",
    logo: "lockup",
    preload: ["fonts/tt-firs-neue/TTFirsNeue-VarRoman.woff2"],
    switchTo: { code: "fa", chip: "FA", name: "فارسی" },
    brand: "Behkooshan",
    address: "No 10 (286), 5th Sonbol, Zakariya St., Shams Abad Industrial Zone, Tehran, Iran",
    home: "Home",
    products: "Products",
    about: "About",
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

/**
 * Everything a page needs to resolve its own relative paths.
 *
 * Two bases, and mixing them up sends a reader into the wrong language:
 *   root  reaches the repository root, where assets live.
 *   home  reaches this language's own home, which is / for Persian and
 *         /en/ for English. Navigation and breadcrumbs use this one.
 */
function context(locale, section) {
  const inSection = section ? 1 : 0;
  const root = "../".repeat((locale === "en" ? 1 : 0) + inSection);
  const home = "../".repeat(inSection) || "./";
  const segment = section ? `${section}/` : "";

  return {
    locale,
    section,
    L: LOCALES[locale],
    root,
    home,
    /** The same page in the other language. */
    other: (file) => (locale === "fa" ? `${root}en/${segment}${file}` : `${root}${segment}${file}`),
  };
}

function head(ctx, { title, description, file, css }) {
  const { L, root } = ctx;
  const faHref = ctx.locale === "fa" ? `./${file}` : ctx.other(file);
  const enHref = ctx.locale === "en" ? `./${file}` : ctx.other(file);

  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">

  <link rel="icon" href="${root}assets/logos/favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#0f5a3b">
  <link rel="alternate" hreflang="fa" href="${faHref}">
  <link rel="alternate" hreflang="en" href="${enHref}">

${L.preload.map((f) => `  <link rel="preload" href="${root}assets/${f}" as="font" type="font/woff2" crossorigin>`).join("\n")}

${["fonts", "tokens", "site", "shapes", ...css]
  .map((n) => `  <link rel="stylesheet" href="${root}assets/css/${n}.css">`)
  .join("\n")}

  <!-- Marks the document as scripted before anything paints, so the reveal's
       hidden starting state only ever applies where the script can undo it. -->
  <script>document.documentElement.classList.add("js")</script>
</head>`;
}

/**
 * The one script on the site. Deferred, so it never blocks the paint, and
 * nothing on the page depends on it having run.
 */
const scripts = (ctx) => `  <script src="${ctx.root}assets/js/reveal.js" defer></script>`;

/**
 * The lockup drops to the bare mark below 640px, where two nav labels and the
 * language chip stop fitting beside it on one line. The guide reserves the
 * mark for exactly this: "favicon, footer, small spaces".
 */
function header(ctx, { file, current }) {
  const { L, home } = ctx;
  const mark = (page) => (current === page ? ' aria-current="page"' : "");

  return `  <header class="site-header">
    <div class="shell site-header__inner">
      <a class="site-header__logo" href="${home}" aria-label="${esc(L.homeAria)}">
        <span class="bk-logo bk-logo--mark site-header__mark"></span>
        <span class="bk-logo bk-logo--${L.logo} site-header__lockup"></span>
      </a>

      <nav class="site-nav" aria-label="${esc(L.navAria)}">
        <a href="${home}products/"${mark("products")}>${esc(L.products)}</a>
        <a href="${home}about.html"${mark("about")}>${esc(L.about)}</a>
      </nav>

      <a class="lang-switch" href="${ctx.other(file)}" lang="${L.switchTo.code}"
         aria-label="${esc(L.switchTo.name)}">${L.switchTo.chip}</a>
    </div>
  </header>`;
}

/**
 * The footer is the site's green panel, and a green panel carrying one large
 * shape tone on tone is the only way the stationery ever uses a shape. So
 * that is where the one shape on any page lives.
 */
function footer(ctx) {
  const latin = ctx.locale === "fa" ? ' lang="en"' : "";

  return `  <footer class="site-footer">
    <span class="bk-shape bk-shape--03 site-footer__shape" aria-hidden="true"></span>
    <div class="shell site-footer__inner">
      <p>${esc(ctx.L.address)}</p>
      <p class="tagline"${latin}>Beautifully Strong</p>
      <p><a href="https://behkooshan.ir"${latin}>behkooshan.ir</a></p>
    </div>
  </footer>`;
}

function breadcrumb(ctx, trail) {
  const items = trail
    .map((t) =>
      t.href
        ? `        <li><a href="${t.href}">${esc(t.label)}</a></li>`
        : `        <li aria-current="page">${esc(t.label)}</li>`
    )
    .join("\n");

  return `      <nav class="breadcrumb" aria-label="${esc(ctx.L.crumbAria)}">
        <ol>
${items}
        </ol>
      </nav>`;
}

/**
 * Striped placeholder field. Replace the whole element with an <img> once the
 * photography exists; the label states exactly what belongs in the slot.
 */
const mediaSlot = ({ ratio, label, bare = false, indent }) => {
  const pad = " ".repeat(indent);
  const classes = bare ? "media-slot media-slot--bare" : "media-slot";
  return `${pad}<div class="${classes}" style="--slot-ratio: ${ratio}">
${pad}  <span class="media-slot__label">${esc(label)}</span>
${pad}</div>`;
};

function card(ctx, product, categories, { href, indent }) {
  const pad = " ".repeat(indent);
  const p = product[ctx.locale];

  return `${pad}<li class="card reveal">
${pad}  <a href="${href}">
${mediaSlot({ ratio: "4 / 3", label: SLOT_MAIN, indent: indent + 4 })}
${pad}    <p class="card__name">${esc(p.name)}</p>
${pad}    <p class="card__type label">${esc(categories[product.category][ctx.locale])}</p>
${pad}  </a>
${pad}</li>`;
}

function catalogueIndex(locale, data) {
  const ctx = context(locale, "products");
  const { L, home, root } = ctx;
  const cards = data.products
    .map((product) => card(ctx, product, data.categories, { href: `./${product.slug}.html`, indent: 8 }))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${L.dir}">
${head(ctx, { title: `${L.indexTitle} | ${L.brand}`, description: L.indexLede, file: "index.html", css: ["product"] })}
<body>
  <a class="skip-link" href="#main">${esc(L.skip)}</a>

${header(ctx, { file: "index.html", current: "products" })}

  <main class="page" id="main">
    <div class="shell">

${breadcrumb(ctx, [{ label: L.home, href: home }, { label: L.products }])}

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

${footer(ctx)}

${scripts(ctx)}
</body>
</html>
`;
}

function productPage(locale, product, data) {
  const ctx = context(locale, "products");
  const { L, home, root } = ctx;
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
    .map((other) => card(ctx, other, data.categories, { href: `./${other.slug}.html`, indent: 8 }))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${L.dir}">
${head(ctx, { title: `${p.name} | ${L.brand}`, description: p.lede, file, css: ["product"] })}
<body>
  <a class="skip-link" href="#main">${esc(L.skip)}</a>

${header(ctx, { file, current: "products" })}

  <main class="page" id="main">
    <div class="shell">

${breadcrumb(ctx, [{ label: L.home, href: home }, { label: L.products, href: "./" }, { label: p.name }])}

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

      <section class="specs reveal" aria-labelledby="specs-title">
        <h2 class="specs__title" id="specs-title">${esc(L.specsTitle)}</h2>

        <div class="spec-grid">
${specs}
        </div>
      </section>

      <section class="related reveal" aria-labelledby="related-title">
        <h2 id="related-title">${esc(L.relatedTitle)}</h2>

        <ul class="card-grid">
${related}
        </ul>
      </section>

    </div>
  </main>

${footer(ctx)}

${scripts(ctx)}
</body>
</html>
`;
}

/**
 * About page.
 *
 * The cover photograph sits flush under the header, before anything else on
 * the page. Everything after it is one repeating unit: a hairline, a heading
 * on the start edge, and its content in the wider column beside it. Five
 * sections use that same unit, so the page reads as one grid rather than as
 * a stack of differently shaped blocks. The history photograph spans both
 * columns at the top of its own section.
 *
 * No decorative shape appears here. The stationery only ever places a shape
 * on a green panel, and the one green panel on this page is the footer.
 */
function aboutPage(locale, about) {
  const ctx = context(locale, null);
  const { L, home, root } = ctx;
  const a = about[locale];
  const paragraphs = (list, indent) =>
    list.map((text) => `${" ".repeat(indent)}<p>${esc(text)}</p>`).join("\n");

  const advantages = a.advantages.items
    .map((item) => `          <li>${esc(item)}</li>`)
    .join("\n");

  const whyStoneItems = a.whyStone.items
    .map(
      (item) => `            <div class="feature">
              <p class="feature__term">${esc(item.term)}</p>
              <p class="feature__desc">${esc(item.desc)}</p>
            </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${L.dir}">
${head(ctx, { title: `${a.title} | ${L.brand}`, description: a.description, file: "about.html", css: ["product", "about"] })}
<body>
  <a class="skip-link" href="#main">${esc(L.skip)}</a>

${header(ctx, { file: "about.html", current: "about" })}

  <main class="page page--flush" id="main">

    <figure class="about__cover bleed fade-b">
      <img src="${root}${about.cover.src}" alt="${esc(about.cover.alt[locale])}"
           width="${about.cover.width}" height="${about.cover.height}" fetchpriority="high">
    </figure>

    <div class="shell">

${breadcrumb(ctx, [{ label: L.home, href: home }, { label: a.title }])}

      <div class="about__head reveal">
        <span class="about__eyebrow">${esc(a.eyebrow)}</span>
        <h1>${esc(a.title)}</h1>
      </div>

      <section class="about__section reveal" aria-labelledby="intro-title">
        <h2 id="intro-title">${esc(a.intro.title)}</h2>
        <div class="about__prose">
${paragraphs(a.intro.paragraphs, 10)}
        </div>
      </section>

      <section class="about__section reveal" aria-labelledby="history-title">
        <figure class="about__figure fade-b">
          <img src="${root}${about.history.src}" alt="${esc(about.history.alt[locale])}"
               width="${about.history.width}" height="${about.history.height}" loading="lazy">
        </figure>

        <h2 id="history-title">${esc(a.history.title)}</h2>
        <div class="about__prose">
${paragraphs(a.history.paragraphs, 10)}
        </div>
      </section>

      <section class="about__section reveal" aria-labelledby="advantages-title">
        <h2 id="advantages-title">${esc(a.advantages.title)}</h2>
        <ul class="advantages__list">
${advantages}
        </ul>
      </section>

      <section class="about__section reveal" aria-labelledby="why-stone-title">
        <h2 id="why-stone-title">${esc(a.whyStone.title)}</h2>
        <div class="about__prose">
          <div class="features__grid">
${whyStoneItems}
          </div>
${paragraphs(a.whyStone.paragraphs, 10)}
        </div>
      </section>

      <section class="about__section reveal" aria-labelledby="timeless-title">
        <h2 id="timeless-title">${esc(a.timeless.title)}</h2>
        <div class="about__prose">
          <p>${esc(a.timeless.paragraph)}</p>
        </div>
      </section>

    </div>
  </main>

${footer(ctx)}

${scripts(ctx)}
</body>
</html>
`;
}

const products = JSON.parse(await readFile(join(ROOT, "data/products.json"), "utf8"));
const about = JSON.parse(await readFile(join(ROOT, "data/about.json"), "utf8"));
let written = 0;

for (const locale of Object.keys(LOCALES)) {
  const base = locale === "en" ? join(ROOT, "en") : ROOT;
  const catalogue = join(base, "products");
  await mkdir(catalogue, { recursive: true });

  await writeFile(join(catalogue, "index.html"), catalogueIndex(locale, products));
  written++;

  for (const product of products.products) {
    await writeFile(join(catalogue, `${product.slug}.html`), productPage(locale, product, products));
    written++;
  }

  await writeFile(join(base, "about.html"), aboutPage(locale, about));
  written++;
}

console.log(`${written} pages written from ${products.products.length} products`);
