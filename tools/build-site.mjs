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
    indexLede: "اسلب گرانیت و کوارتزیت، بریده با مولتی‌وایر در کارخانه شمس‌آباد.",
    specsTitle: "مشخصات فنی",
    relatedTitle: "سنگ‌های دیگر",
    quote: "درخواست قیمت",
    galleryTitle: "تصاویر",
    searchLabel: "جست‌وجوی نام سنگ",
    searchPlaceholder: "مثلاً گرانیت",
    filterAria: "فیلتر محصولات",
    clear: "پاک کردن فیلترها",
    all: "همه",
    /** `%` is replaced with the live number of matching products. */
    count: "% محصول",
    countOne: "۱ محصول",
    empty: "هیچ سنگی با این جست‌وجو پیدا نشد.",
    emptyHint: "نام دیگری بزنید یا فیلترها را پاک کنید.",
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
    indexLede: "Granite and quartzite slabs, Multiwire cut at the Shams Abad works.",
    specsTitle: "Specifications",
    relatedTitle: "Other stone",
    quote: "Request a quote",
    galleryTitle: "Gallery",
    searchLabel: "Search by stone name",
    searchPlaceholder: "Granite, for example",
    filterAria: "Filter products",
    clear: "Clear filters",
    all: "All",
    /** `%` is replaced with the live number of matching products. */
    count: "% products",
    countOne: "1 product",
    empty: "No stone matches that search.",
    emptyHint: "Try another name, or clear the filters.",
  },
};

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
function context(locale, section, data) {
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

    /**
     * A facet value, in this page's language. Throws on an unknown value
     * rather than printing the raw key, so a typo in products.json fails the
     * build instead of shipping `granite` into a Persian page.
     */
    facetLabel(key, value) {
      const facet = data.facets.find((f) => f.key === key);
      const option = facet && facet.options.find((o) => o.value === value);
      if (!option) throw new Error(`Unknown facet value: ${key}=${value}`);
      return option.label[locale];
    },
  };
}

/** Paragraphs from a list of strings, indented to sit in the surrounding markup. */
const paragraphs = (list, indent) =>
  list.map((t) => `${" ".repeat(indent)}<p>${esc(t)}</p>`).join("\n");

/**
 * Persian pages count in Persian digits. The catalogue tally is the only
 * number the site generates itself; everything else comes from the data
 * already written in the right script.
 */
const num = (locale, n) =>
  locale === "fa" ? String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]) : String(n);

/** "3 products", with the one case spelled out rather than bracketed. */
const count = (ctx, n) =>
  n === 1 ? ctx.L.countOne : ctx.L.count.replace("%", num(ctx.locale, n));

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
 * Page scripts. All deferred, so none blocks the paint, and no page depends on
 * any of them having run: without them the reveal never hides anything and the
 * catalogue is a plain list of every product.
 */
const scripts = (ctx, extra = []) =>
  ["reveal", ...extra]
    .map((name) => `  <script src="${ctx.root}assets/js/${name}.js" defer></script>`)
    .join("\n");

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
      <a class="site-header__logo" href="${home}" aria-label="${esc(L.homeAria)}"${mark("home")}>
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
 * One product image. Width and height are always written out so the browser
 * reserves the box before the file arrives and the page never jumps.
 */
function picture(ctx, image, { className, sizes, eager = false, indent }) {
  const pad = " ".repeat(indent);
  const loading = eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"';

  return `${pad}<img class="${className}" src="${ctx.root}${image.src}"
${pad}     alt="${esc(image.alt[ctx.locale])}"
${pad}     width="${image.width}" height="${image.height}" sizes="${sizes}"${loading}>`;
}

/**
 * A catalogue tile.
 *
 * Each facet is written onto the element as a data attribute rather than kept
 * in a parallel array in the script, so the filter reads its truth from the
 * same DOM the reader sees and the two can never disagree. With scripting off
 * the tile is still just a link.
 */
function card(ctx, product, { href, indent, eager = false }) {
  const pad = " ".repeat(indent);
  const p = product[ctx.locale];
  const facets = Object.entries(product.facets)
    .map(([key, values]) => ` data-${key}="${esc(values.join(" "))}"`)
    .join("");

  // The stone type, but only when it says something the name does not. A tile
  // reading "Granite" over "Granite" is just the same word twice.
  const type = ctx.facetLabel("type", product.facets.type[0]);
  const meta =
    type === p.name ? "" : `\n${pad}      <span class="card__meta">${esc(type)}</span>`;

  return `${pad}<li class="card reveal" data-name="${esc(p.name.toLowerCase())}"${facets}>
${pad}  <a class="card__link" href="${href}">
${pad}    <span class="card__media">
${picture(ctx, product.images.main, {
  className: "card__img",
  sizes: "(min-width: 62rem) 22rem, (min-width: 34rem) 44vw, 88vw",
  eager,
  indent: indent + 6,
})}
${pad}    </span>
${pad}    <span class="card__body">
${pad}      <span class="card__name">${esc(p.name)}</span>${meta}
${pad}    </span>
${pad}  </a>
${pad}</li>`;
}

/**
 * The filter bar: a name search, then one radio group per facet in the data.
 *
 * Radios rather than custom chips, because a radio group already carries the
 * "pick one of these, arrow between them" semantics a filter needs, and it
 * survives with scripting off. The input is hidden from sight but not from the
 * keyboard; its label is the thing you see and click.
 *
 * The groups are generated from data.facets, so giving a product an origin or
 * a finish later is a data edit and this function does not change.
 */
function filterBar(ctx, data, { indent }) {
  const pad = " ".repeat(indent);
  const { L, locale } = ctx;

  const groups = data.facets
    .map((facet) => {
      const options = [{ value: "", label: { [locale]: L.all } }, ...facet.options];
      const choices = options
        .map((option, i) => {
          const id = `f-${facet.key}-${option.value || "all"}`;
          return `${pad}      <div class="filter__choice">
${pad}        <input type="radio" id="${id}" name="${facet.key}" value="${esc(option.value)}"${i === 0 ? " checked" : ""}>
${pad}        <label for="${id}">${esc(option.label[locale])}</label>
${pad}      </div>`;
        })
        .join("\n");

      return `${pad}  <fieldset class="filter__group">
${pad}    <legend class="filter__legend">${esc(facet.label[locale])}</legend>
${pad}    <div class="filter__choices">
${choices}
${pad}    </div>
${pad}  </fieldset>`;
    })
    .join("\n");

  return `${pad}<form class="filter" id="catalogue-filter" aria-label="${esc(L.filterAria)}">
${pad}  <div class="filter__search">
${pad}    <label class="filter__legend" for="catalogue-search">${esc(L.searchLabel)}</label>
${pad}    <input class="filter__input" type="search" id="catalogue-search" name="q"
${pad}           autocomplete="off" placeholder="${esc(L.searchPlaceholder)}">
${pad}  </div>

${groups}

${pad}  <button type="reset" class="filter__clear" hidden>${esc(L.clear)}</button>
${pad}</form>`;
}

function catalogueIndex(locale, data) {
  const ctx = context(locale, "products", data);
  const { L, home } = ctx;

  const cards = data.products
    .map((product, i) => card(ctx, product, { href: `./${product.slug}.html`, indent: 8, eager: i < 2 }))
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

      <div class="catalogue__head">
        <h1>${esc(L.indexTitle)}</h1>
        <p>${esc(L.indexLede)}</p>
      </div>

${filterBar(ctx, data, { indent: 6 })}

      <div class="catalogue__status" role="status">
        <p class="catalogue__count" id="catalogue-count" data-one="${esc(L.countOne)}">${esc(count(ctx, data.products.length))}</p>

        <div class="catalogue__empty" id="catalogue-empty" hidden>
          <p class="catalogue__empty-title">${esc(L.empty)}</p>
          <p>${esc(L.emptyHint)}</p>
        </div>
      </div>

      <ul class="card-grid" id="catalogue-grid">
${cards}
      </ul>

    </div>
  </main>

${footer(ctx)}

${scripts(ctx, ["catalogue"])}
</body>
</html>
`;
}

function productPage(locale, product, data) {
  const ctx = context(locale, "products", data);
  const { L, home } = ctx;
  const p = product[locale];
  const file = `${product.slug}.html`;

  const specs = data.specOrder
    .filter((key) => p.specs[key])
    .map(
      (key) => `          <div class="spec">
            <dt>${esc(data.specLabels[key][locale])}</dt>
            <dd>${esc(p.specs[key])}</dd>
          </div>`
    )
    .join("\n");

  const gallery = product.images.gallery
    .map(
      (image) => `          <figure class="gallery__item">
${picture(ctx, image, { className: "gallery__img", sizes: "(min-width: 62rem) 28rem, 88vw", indent: 12 })}
          </figure>`
    )
    .join("\n");

  // A product whose copy has not arrived yet says so, in the same panel the
  // site uses for any other standing caveat. It never gets invented prose.
  const body = p.body.length
    ? `          <div class="product__prose">
${p.body.map((t) => `            <p>${esc(t)}</p>`).join("\n")}
          </div>`
    : `          <div class="notice">
            <p>${esc(p.pending)}</p>
          </div>`;

  const related = data.products
    .filter((other) => other.slug !== product.slug)
    .map((other) => card(ctx, other, { href: `./${other.slug}.html`, indent: 10 }))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${L.dir}">
${head(ctx, { title: `${p.name} | ${L.brand}`, description: p.body[0] || L.indexLede, file, css: ["product"] })}
<body>
  <a class="skip-link" href="#main">${esc(L.skip)}</a>

${header(ctx, { file, current: "products" })}

  <main class="page" id="main">
    <div class="shell">

${breadcrumb(ctx, [{ label: L.home, href: home }, { label: L.products, href: "./" }, { label: p.name }])}

      <div class="product">

        <figure class="product__hero">
${picture(ctx, product.images.main, {
  className: "product__img",
  sizes: "(min-width: 62rem) 32rem, 92vw",
  eager: true,
  indent: 10,
})}
        </figure>

        <div class="product__head">
          <h1>${esc(p.name)}</h1>

${body}

          <p class="product__actions">
            <a class="button" href="${home}about.html">${esc(L.quote)} <span class="button__arrow" aria-hidden="true">&rarr;</span></a>
          </p>
        </div>

      </div>

      <section class="specs reveal" aria-labelledby="specs-title">
        <h2 class="specs__title" id="specs-title">${esc(L.specsTitle)}</h2>

        <dl class="spec-grid">
${specs}
        </dl>
      </section>

      <section class="gallery reveal" aria-labelledby="gallery-title">
        <h2 class="gallery__title" id="gallery-title">${esc(L.galleryTitle)}</h2>

        <div class="gallery__grid">
${gallery}
        </div>
      </section>

      <section class="related reveal" aria-labelledby="related-title">
        <h2 class="related__title" id="related-title">${esc(L.relatedTitle)}</h2>

        <ul class="card-grid card-grid--related">
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
 * Home page: the works photographed, then the company's own introduction.
 *
 * The introduction is three full paragraphs, far more than a hero can carry,
 * so the page does not pretend otherwise. The cover and the company name take
 * the top and the prose sits below in the same grid unit the About page uses,
 * so the two read as one system rather than two designs.
 */
function homePage(locale, data) {
  const ctx = context(locale, null);
  const { L, root, home } = ctx;
  const h = data[locale];

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${L.dir}">
${head(ctx, { title: `${L.brand} | ${h.title}`, description: h.description, file: "index.html", css: ["about"] })}
<body>
  <a class="skip-link" href="#main">${esc(L.skip)}</a>

${header(ctx, { file: "index.html", current: "home" })}

  <main class="page page--flush" id="main">

    <figure class="about__cover bleed fade-b">
      <img src="${root}${data.cover.src}" alt="${esc(data.cover.alt[locale])}"
           width="${data.cover.width}" height="${data.cover.height}" fetchpriority="high">
    </figure>

    <div class="shell">

      <div class="about__head reveal">
        <h1>${esc(h.title)}</h1>
      </div>

      <section class="about__section about__section--single reveal" aria-label="${esc(h.title)}">
        <div class="about__prose">
${paragraphs(h.intro, 10)}

          <p class="home__cta">
            <a class="button" href="${home}products/">${esc(h.cta)} <span class="button__arrow" aria-hidden="true">&rarr;</span></a>
          </p>
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

const read = async (name) => JSON.parse(await readFile(join(ROOT, "data", name), "utf8"));

const [products, about, home] = await Promise.all([
  read("products.json"),
  read("about.json"),
  read("home.json"),
]);

let written = 0;

for (const locale of Object.keys(LOCALES)) {
  const base = locale === "en" ? join(ROOT, "en") : ROOT;
  const catalogue = join(base, "products");
  await mkdir(catalogue, { recursive: true });

  await writeFile(join(base, "index.html"), homePage(locale, home));
  written++;

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
