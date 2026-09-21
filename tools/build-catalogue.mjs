/**
 * Build the two catalogue documents from data/catalogue.json.
 *
 *   node tools/build-catalogue.mjs
 *
 * Writes index.html (Persian, rtl) and en/index.html (English, ltr). The two
 * are separate files on purpose: only one language is ever on screen, the
 * direction is set on <html> rather than switched at runtime, and the page
 * works with no JavaScript at all. The switch in the bar is a plain link,
 * and script keeps a fragment on it so it lands on the section being read.
 *
 * Section order is the order of the array in the data file, which is the
 * order of the printed pages.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..");

const data = JSON.parse(readFileSync(resolve(repo, "data/catalogue.json"), "utf8"));
const images = JSON.parse(readFileSync(resolve(repo, "assets/images/manifest.json"), "utf8"));

/* -------------------------------------------------------------------- text */

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Escape, then turn the data file's **runs** into the print's bold. */
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

/**
 * Split a heading into words the stylesheet can write one at a time. Each
 * word is a masked box with the glyphs inside it, so they rise into place
 * rather than fading. Spaces stay between the boxes so the line still wraps.
 * A newline in the source becomes a hard break, which is how the print sets
 * the section titles.
 */
function words(text) {
  let n = 0;
  return String(text)
    .split("\n")
    .map((line) =>
      line
        .trim()
        .split(/\s+/)
        .map((word) => `<span class="word" style="--w:${n++}"><span>${rich(word)}</span></span>`)
        .join(" ")
    )
    .join("<br>\n        ");
}

/* ------------------------------------------------------------------ images */

/** Widths the derivation actually produced, so no srcset names a missing file. */
function srcset(ctx, slug) {
  const entry = images[slug];
  if (!entry) throw new Error(`no image derived for "${slug}"`);
  return entry.widths.map((w) => `${ctx.root}assets/images/${slug}-${w}.webp ${w}w`).join(", ");
}

function picture(ctx, slug, { alt, sizes, eager = false, indent = "" }) {
  const entry = images[slug];
  const pad = " ".repeat(indent);
  const widest = entry.widths[entry.widths.length - 1];
  const focus = entry.focus && entry.focus !== "50% 50%";
  return [
    `${pad}<img`,
    `${pad}  src="${ctx.root}assets/images/${slug}-${entry.widths[0]}.webp"`,
    `${pad}  srcset="${srcset(ctx, slug)}"`,
    `${pad}  sizes="${sizes}"`,
    `${pad}  width="${entry.width}" height="${entry.height}"`,
    // What the viewer shows. The page may only ever need the 400px step of
    // a small figure; opened full screen it wants the largest there is.
    `${pad}  data-full="${ctx.root}assets/images/${slug}-${widest}.webp"`,
    // Which part of the picture has to survive the crop. Only written where
    // the subject is off centre; see the focus table in derive-images.py.
    ...(focus ? [`${pad}  style="object-position: ${entry.focus}"`] : []),
    `${pad}  alt="${esc(alt)}"`,
    `${pad}  loading="${eager ? "eager" : "lazy"}" decoding="async"${eager ? ' fetchpriority="high"' : ""}>`,
  ].join("\n");
}

/**
 * A photograph that opens in the viewer. The button covers the figure, so
 * the photograph itself is the target, and it carries the label rather than
 * the image, which keeps the alt text describing the picture.
 */
function opener(ctx, alt, indent = "") {
  const pad = " ".repeat(indent);
  return `${pad}<button class="lb-open" type="button">
${pad}  <span class="u-visually-hidden">${esc(ctx.site.openImage)}: ${esc(alt)}</span>
${pad}</button>`;
}

/* ---------------------------------------------------------------- sections */

/** A counter per section, so the stagger restarts at every band. */
function stagger() {
  let i = 0;
  return () => ` class="reveal" style="--i:${i++}"`;
}

function paragraphs(copy, step, extra = "") {
  return copy.map((p) => `        <p${step()}>${rich(p)}</p>`).join("\n");
}

function list(items, step) {
  return [
    `        <ul class="list"${step()}>`,
    ...items.map((item) => `          <li>${rich(item)}</li>`),
    `        </ul>`,
  ].join("\n");
}

const RENDER = {
  cover(ctx, sec, copy) {
    // The logotype is the document's heading, the way it is on the printed
    // cover, so the h1 is the mark rather than a line of text hidden behind
    // it. Its accessible name is the title of the catalogue.
    return `      <div class="shell cover">
        <h1 class="cover__mark">
          <span class="bk-logo ${ctx.lockup}" role="img" aria-label="${esc(ctx.site.title)}"></span>
        </h1>
        <p class="cover__line" lang="en">${esc(copy.line)}</p>
        <span class="cover__rule" aria-hidden="true"></span>
      </div>`;
  },

  divider(ctx, sec, copy) {
    const step = stagger();
    return `      <div class="divider">
        <div class="divider__green" aria-hidden="true"></div>
        <div class="divider__face">
          <h2 class="divider__title">${words(copy.title)}</h2>${
            copy.subtitle
              ? `\n          <p class="divider__subtitle"${step()}>${rich(copy.subtitle)}</p>`
              : ""
          }
        </div>
      </div>`;
  },

  feature(ctx, sec, copy) {
    const step = stagger();
    const classes = ["feature"];
    if (sec.flip) classes.push("feature--flip");
    if (sec.lead) classes.push("feature--lead");
    if (sec.mono) classes.push("feature--mono");

    const figure = `        <figure class="feature__figure place zoomable" data-zoom>
${picture(ctx, sec.image, {
  alt: copy.alt,
  sizes: sec.lead ? "(min-width: 60rem) 84rem, 100vw" : "(min-width: 60rem) 49rem, 100vw",
  eager: ctx.eager(),
  indent: 10,
})}
${opener(ctx, copy.alt, 10)}
        </figure>`;

    const text = [
      copy.title ? `          <h2 class="title headline">${words(copy.title)}</h2>` : "",
      copy.heading ? `          <h3 class="heading"${step()}>${rich(copy.heading)}</h3>` : "",
      `          <div class="prose${sec.lead ? " lede" : ""}">`,
      copy.body.map((p) => `            <p${step()}>${rich(p)}</p>`).join("\n"),
      `          </div>`,
    ]
      .filter(Boolean)
      .join("\n");

    // Not inside a shell: the photograph column runs off the window edge,
    // and the text column carries the shell's outer margin itself.
    return `      <div class="${classes.join(" ")}">
${figure}
        <div class="feature__text">
          <div class="feature__inner">
${text}
          </div>
        </div>
      </div>`;
  },

  columns(ctx, sec, copy) {
    const blocks = copy.blocks
      .map((block) => {
        const step = stagger();
        const parts = [`          <div class="columns__block">`];
        parts.push(`            <h2 class="title headline">${words(block.title)}</h2>`);
        if (block.list) {
          parts.push(`            <ul class="list"${step()}>`);
          block.list.forEach((item) => parts.push(`              <li>${rich(item)}</li>`));
          parts.push(`            </ul>`);
        }
        if (block.body) {
          parts.push(`            <div class="prose">`);
          block.body.forEach((p) => parts.push(`              <p${step()}>${rich(p)}</p>`));
          parts.push(`            </div>`);
        }
        parts.push(`          </div>`);
        return parts.join("\n");
      })
      .join("\n");

    const band = sec.images
      .map(
        (fig) => `          <figure class="place zoomable cut" data-zoom>
${picture(ctx, fig.image, {
  alt: fig[ctx.lang],
  sizes: "(min-width: 48rem) 25vw, 50vw",
  indent: 12,
})}
${opener(ctx, fig[ctx.lang], 12)}
          </figure>`
      )
      .join("\n");

    return `      <div class="shell">
        <div class="columns__text">
${blocks}
        </div>
        <div class="band">
${band}
        </div>
      </div>`;
  },

  plate(ctx, sec, copy) {
    return `      <figure class="plate place zoomable${sec.mono ? " plate--mono" : ""}" data-zoom>
${picture(ctx, sec.image, { alt: copy.alt, sizes: "100vw", indent: 8 })}
${opener(ctx, copy.alt, 8)}
      </figure>`;
  },

  people(ctx, sec, copy) {
    const step = stagger();
    const lede = copy.lede.map((p) => `          <p>${rich(p)}</p>`).join("\n");

    const people = copy.people
      .map((person, i) => {
        const slug = sec.portraits[i];
        const inner = stagger();
        const portrait = slug
          ? `          <div class="person__portrait zoomable cut" data-zoom>
${picture(ctx, slug, {
  alt: person.name,
  sizes: "(min-width: 48rem) 152px, 136px",
  indent: 12,
})}
${opener(ctx, person.name, 12)}
          </div>`
          : "";
        return `        <div class="person${slug ? "" : " person--no-portrait"}">
${portrait}
          <div class="person__body">
            <h3 class="person__name"${inner()}>${rich(person.name)}</h3>
            <div class="prose person__bio"><p${inner()}>${rich(person.bio)}</p></div>
          </div>
        </div>`;
      })
      .join("\n");

    return `      <div class="shell">
        <h2 class="tag"${step()}>${rich(copy.tag)}</h2>
        <div class="people__lede lede"${step()}>
${lede}
        </div>
        <div class="people__list">
${people}
        </div>
      </div>`;
  },

  slabs(ctx, sec, copy) {
    const left = stagger();
    const right = stagger();

    const first = [
      `          <div class="prose">`,
      copy.intro.map((p) => `            <p${left()}>${rich(p)}</p>`).join("\n"),
      `          </div>`,
      copy.introList
        ? [
            `          <ul class="list"${left()}>`,
            ...copy.introList.map((item) => `            <li>${rich(item)}</li>`),
            `          </ul>`,
          ].join("\n")
        : "",
      copy.introAfter
        ? [
            `          <div class="prose">`,
            copy.introAfter.map((p) => `            <p${left()}>${rich(p)}</p>`).join("\n"),
            `          </div>`,
          ].join("\n")
        : "",
      `          <div class="slabs__benefits">`,
      copy.benefits
        .map(
          (b) => `            <div class="benefit"${left()}>
              <h3 class="benefit__title">${rich(b.title)}</h3>
              <p>${rich(b.body)}</p>
            </div>`
        )
        .join("\n"),
      `          </div>`,
    ]
      .filter(Boolean)
      .join("\n");

    const second = [
      `          <h2 class="title headline">${words(copy.environment.title)}</h2>`,
      `          <div class="prose">`,
      copy.environment.body.map((p) => `            <p${right()}>${rich(p)}</p>`).join("\n"),
      `          </div>`,
      `          <p class="slabs__uses-intro"${right()}>${rich(copy.usesIntro)}</p>`,
      [
        `          <ul class="list"${right()}>`,
        ...copy.uses.map((item) => `            <li>${rich(item)}</li>`),
        `          </ul>`,
      ].join("\n"),
      `          <p class="pull"${right()}>${rich(copy.quote)}</p>`,
      `          <h2 class="title headline">${words(copy.extra.title)}</h2>`,
      `          <div class="prose">`,
      copy.extra.body.map((p) => `            <p${right()}>${rich(p)}</p>`).join("\n"),
      `          </div>`,
    ].join("\n");

    return `      <div class="shell">
        <div class="slabs">
          <div class="slabs__col">
${first}
          </div>
          <div class="slabs__col">
${second}
          </div>
        </div>
      </div>`;
  },

  stone(ctx, sec, copy) {
    const step = stagger();
    const figures = sec.images
      .map(
        (fig) => `            <figure class="place zoomable cut" data-zoom>
${picture(ctx, fig.image, {
  alt: fig[ctx.lang],
  sizes: "(min-width: 60rem) 30vw, 50vw",
  indent: 14,
})}
${opener(ctx, fig[ctx.lang], 14)}
            </figure>`
      )
      .join("\n");

    return `      <div class="shell">
        <div class="stone${sec.flip ? " stone--flip" : ""}">
          <div class="stone__text">
            <h2 class="title headline">${words(copy.title)}</h2>
            <div class="prose">
${copy.body.map((p) => `              <p${step()}>${rich(p)}</p>`).join("\n")}
            </div>
          </div>
          <div class="stone__figures">
${figures}
          </div>
        </div>
      </div>`;
  },
};

const FLUSH = new Set(["divider", "plate"]);

function section(ctx, sec) {
  const copy = sec[ctx.lang];
  const classes = ["sec", `sec--${sec.kind}`];
  if (FLUSH.has(sec.kind)) classes.push("sec--flush");

  return `    <section class="${classes.join(" ")}" id="${sec.id}" data-section
             aria-label="${esc(copy.nav)}">
${RENDER[sec.kind](ctx, sec, copy)}
    </section>`;
}

/* -------------------------------------------------------------------- page */

function contents(ctx) {
  const items = data.sections
    .map((sec) => `          <li><a href="#${sec.id}">${esc(sec[ctx.lang].nav)}</a></li>`)
    .join("\n");

  return `  <dialog class="contents" id="contents" aria-label="${esc(ctx.site.contents)}">
    <div class="contents__inner">
      <div class="contents__head">
        <button class="chip" type="button" data-contents-close>${esc(ctx.site.contentsClose)}</button>
      </div>
      <ol class="contents__list">
${items}
      </ol>
    </div>
  </dialog>`;
}

/**
 * The viewer. One dialog for the whole document; lightbox.js fills it from
 * whichever photograph was clicked. The glyphs are typographic rather than
 * drawn: a plus, a minus and a multiplication sign carry these three
 * controls without adding an icon set to a page that needs none.
 */
function lightbox(ctx) {
  const s = ctx.site;
  return `  <dialog class="lb" id="lightbox" aria-label="${esc(s.openImage)}">
    <div class="lb__stage">
      <img class="lb__img" alt="">
    </div>

    <div class="lb__bar lb__bar--top">
      <div class="lb__tools">
        <button class="lb__btn" type="button" data-lb-zoom="-1" aria-label="${esc(s.zoomOut)}">&#8722;</button>
        <button class="lb__btn" type="button" data-lb-zoom="1" aria-label="${esc(s.zoomIn)}">+</button>
        <button class="lb__btn" type="button" data-lb-close aria-label="${esc(s.closeImage)}">&#10005;</button>
      </div>
    </div>

    <div class="lb__bar lb__bar--bottom">
      <p class="lb__meta">
        <span class="lb__counter" data-template="${esc(s.counter)}"></span>
        <span class="lb__caption"></span>
      </p>
      <div class="lb__tools">
        <button class="lb__btn" type="button" data-lb-step="-1" aria-label="${esc(s.prevImage)}">&#8249;</button>
        <button class="lb__btn" type="button" data-lb-step="1" aria-label="${esc(s.nextImage)}">&#8250;</button>
      </div>
    </div>
  </dialog>`;
}

function document_(lang) {
  const site = data.site[lang];
  const other = lang === "fa" ? "en" : "fa";
  const root = lang === "fa" ? "" : "../";
  let eagerLeft = 1;

  const ctx = {
    lang,
    root,
    site,
    lockup: lang === "fa" ? "bk-logo--lockup-fa" : "bk-logo--lockup",
    // Only the first photograph in the document is worth pre-empting the
    // lazy loader for; everything else is below the fold by definition.
    eager: () => (eagerLeft-- > 0),
  };

  const body = data.sections.map((sec) => section(ctx, sec)).join("\n\n");

  return `<!DOCTYPE html>
<html lang="${site.lang}" dir="${site.dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(site.title)}</title>
  <meta name="description" content="${esc(site.description)}">
  <meta name="theme-color" content="#184b36">
  <meta name="color-scheme" content="light">

  <link rel="icon" href="${root}assets/logos/favicon.svg" type="image/svg+xml">
  <link rel="canonical" href="${data.site.url}/${lang === "fa" ? "" : "en/"}">
  <link rel="alternate" hreflang="fa" href="${data.site.url}/">
  <link rel="alternate" hreflang="en" href="${data.site.url}/en/">
  <link rel="alternate" hreflang="x-default" href="${data.site.url}/">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(site.title)}">
  <meta property="og:description" content="${esc(site.description)}">
  <meta property="og:locale" content="${lang === "fa" ? "fa_IR" : "en_US"}">

${
  lang === "fa"
    ? `  <link rel="preload" href="${root}assets/fonts/rokh/Rokh-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${root}assets/fonts/rokh/Rokh-Bold.woff2" as="font" type="font/woff2" crossorigin>`
    : `  <link rel="preload" href="${root}assets/fonts/tt-firs-neue/TTFirsNeue-VarRoman.woff2" as="font" type="font/woff2" crossorigin>`
}

  <link rel="stylesheet" href="${root}assets/css/fonts.css">
  <link rel="stylesheet" href="${root}assets/css/tokens.css">
  <link rel="stylesheet" href="${root}assets/css/shapes.css">
  <link rel="stylesheet" href="${root}assets/css/catalogue.css">

  <script>document.documentElement.classList.add("js");</script>
</head>
<body>

  <a class="skip" href="#cover">${esc(site.skip)}</a>

  <header class="bar">
    <div class="shell bar__inner">
      <a class="bar__logo" href="#cover" aria-label="${esc(site.top)}">
        <span class="bk-logo ${ctx.lockup}"></span>
      </a>

      <div class="bar__end">
        <button class="chip" type="button" data-contents-open hidden>${esc(site.contents)}</button>
        <a class="chip" href="${lang === "fa" ? "en/" : "../"}" lang="${other}"
           data-lang-swap
           hreflang="${other}" aria-label="${esc(site.otherLabel)}">${esc(site.other)}</a>
      </div>
    </div>

    <span class="progress" aria-hidden="true"></span>
  </header>

${contents(ctx)}

${lightbox(ctx)}

  <main class="doc" id="doc">

${body}

  </main>

  <footer class="foot">
    <span class="bk-shape bk-shape--03 foot__shape" aria-hidden="true"></span>

    <div class="shell foot__inner">
      <div class="foot__brand">
        <span class="bk-logo ${ctx.lockup}" role="img" aria-label="${esc(data.site.brand)}"></span>
        <p class="foot__site"><a href="${data.site.url}" lang="en">behkooshan.ir</a></p>
      </div>

      <div>
        <h2 class="foot__title">${esc(site.contactTitle)}</h2>
        <address class="foot__contact">
          <span class="foot__address">${esc(site.address)}</span>
${site.phones
  .map(
    (phone) =>
      `          <a class="foot__tel" href="tel:${esc(phone.tel)}" dir="ltr">${esc(phone.label)}</a>`
  )
  .join("\n")}
        </address>

        <div class="foot__social">
${data.site.social
  .map(
    (link) => `          <a href="${esc(link.href)}" rel="me noopener" target="_blank"
             aria-label="${esc(link.name)}">
            <span class="bk-icon bk-icon--${link.icon}" aria-hidden="true"></span>
          </a>`
  )
  .join("\n")}
        </div>
      </div>
    </div>
  </footer>

  <script src="${root}assets/js/catalogue.js" defer></script>
  <script src="${root}assets/js/lightbox.js" defer></script>
</body>
</html>
`;
}

for (const lang of ["fa", "en"]) {
  const out = lang === "fa" ? resolve(repo, "index.html") : resolve(repo, "en/index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, document_(lang));
  console.log(`${lang}  ${out.replace(repo + "/", "")}`);
}

console.log(`${data.sections.length} sections, printed pages 1 to 40`);
