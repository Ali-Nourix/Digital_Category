/* ==========================================================================
   Behkooshan: collect everything from the website, in the browser

   Run this in the browser's console on the site itself (fa.behkooshan.ir,
   then behkooshan.ir), from a connection that can reach it. It gathers:

     - every sitemap, and every page listed in them (products, projects,
       pages), saved as the HTML the site served
     - what the site's own APIs say about its products and media:
       the WooCommerce Store API, the WordPress REST API and the media
       library, every page of each
     - every photograph, texture download and file those pages and APIs
       point to, at the original size where one exists, not only the
       resized copies the pages show
     - manifest.json: every address tried, what came back and where it was
       saved; errors.txt: everything that failed, so nothing is silently
       left out

   and saves it as one zip (or several, if it grows past PART_MB), named
   after the site and the date. Nothing is sent anywhere: the zip is saved
   by the browser on this computer.

   The instructions, in Persian, are in docs/COLLECT.md.
   ========================================================================== */

(async function behkooshanCollect() {
  "use strict";

  /* ------------------------------------------------------------ settings */

  var DOWNLOAD_MEDIA_LIBRARY = true; // every file in the media library, not only those pages use
  var PARALLEL = 4;                  // requests at a time; lower it if the site starts refusing
  var TIMEOUT_MS = 60000;            // per request
  var RETRIES = 2;
  var PART_MB = 450;                 // a zip is closed and saved at about this size

  var ORIGIN = location.origin;
  var HOST = location.hostname;
  var STAMP = new Date().toISOString().slice(0, 10);
  var FILE_EXT = /\.(jpe?g|png|webp|gif|svg|avif|bmp|tiff?|pdf|zip|rar|mp4|webm|mov|dwg|dxf|psd|ai|eps|css|js|woff2?|ttf|otf|eot)$/i;

  /* ----------------------------------------------------------- the panel */

  var panel = document.createElement("div");
  panel.setAttribute("dir", "rtl");
  panel.style.cssText =
    "position:fixed;z-index:2147483647;inset-block-start:12px;inset-inline-end:12px;" +
    "width:340px;padding:16px 18px;background:#184b36;color:#fff;font:14px/1.7 Tahoma,sans-serif;" +
    "box-shadow:0 12px 40px rgba(0,0,0,.35)";
  panel.innerHTML =
    '<div style="font-weight:bold;margin-bottom:6px">جمع‌آوری اطلاعات سایت به‌کوشان</div>' +
    '<div data-line="phase">در حال شروع…</div>' +
    '<div data-line="pages"></div><div data-line="files"></div><div data-line="bytes"></div><div data-line="errors"></div>' +
    '<button type="button" data-stop style="margin-top:10px;padding:6px 12px;border:1px solid #fff;background:none;color:#fff;cursor:pointer;font:inherit">' +
    "توقف و ساخت زیپ با آنچه تا حالا جمع شده</button>";
  document.body.appendChild(panel);

  var stopped = false;
  panel.querySelector("[data-stop]").onclick = function () {
    stopped = true;
    this.disabled = true;
    this.textContent = "در حال بستن…";
  };

  var stats = { pagesDone: 0, pagesAll: 0, filesDone: 0, filesAll: 0, bytes: 0, errors: 0 };

  function show(phase) {
    if (phase) panel.querySelector('[data-line="phase"]').textContent = phase;
    panel.querySelector('[data-line="pages"]').textContent = "صفحه‌ها: " + stats.pagesDone + " از " + stats.pagesAll;
    panel.querySelector('[data-line="files"]').textContent = "فایل‌ها: " + stats.filesDone + " از " + stats.filesAll;
    panel.querySelector('[data-line="bytes"]').textContent = "حجم: " + (stats.bytes / 1048576).toFixed(1) + " مگابایت";
    panel.querySelector('[data-line="errors"]').textContent = "خطا: " + stats.errors;
  }

  /* ---------------------------------------------------------------- zip */

  // A plain zip writer: stored, not compressed (photographs are compressed
  // already), UTF-8 names, one archive at a time closed at PART_MB.
  var CRC = (function () {
    var table = new Uint32Array(256);
    for (var n = 0; n < 256; n += 1) {
      var c = n;
      for (var k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    var c = 0xffffffff;
    for (var i = 0; i < bytes.length; i += 1) c = CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  var encoder = new TextEncoder();
  var part = null;
  var partNumber = 0;
  var savedParts = [];

  function newPart() {
    partNumber += 1;
    part = { chunks: [], central: [], offset: 0, count: 0 };
  }

  function dosTime(d) {
    return {
      time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
      date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
    };
  }

  function addToZip(name, bytes) {
    if (!part) newPart();
    if (part.offset + bytes.length > PART_MB * 1048576 && part.count > 0) {
      closePart();
      newPart();
    }
    var nameBytes = encoder.encode(name);
    var crc = crc32(bytes);
    var t = dosTime(new Date());
    var head = new DataView(new ArrayBuffer(30));
    head.setUint32(0, 0x04034b50, true);
    head.setUint16(4, 20, true);
    head.setUint16(6, 0x0800, true);
    head.setUint16(8, 0, true);
    head.setUint16(10, t.time, true);
    head.setUint16(12, t.date, true);
    head.setUint32(14, crc, true);
    head.setUint32(18, bytes.length, true);
    head.setUint32(22, bytes.length, true);
    head.setUint16(26, nameBytes.length, true);
    head.setUint16(28, 0, true);

    var entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(8, 0x0800, true);
    entry.setUint16(10, 0, true);
    entry.setUint16(12, t.time, true);
    entry.setUint16(14, t.date, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, bytes.length, true);
    entry.setUint32(24, bytes.length, true);
    entry.setUint16(28, nameBytes.length, true);
    entry.setUint32(42, part.offset, true);

    part.chunks.push(new Uint8Array(head.buffer), nameBytes, bytes);
    part.central.push(new Uint8Array(entry.buffer), nameBytes);
    part.offset += 30 + nameBytes.length + bytes.length;
    part.count += 1;
  }

  function closePart() {
    if (!part || !part.count) return;
    var size = part.central.reduce(function (s, c) { return s + c.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, part.count, true);
    end.setUint16(10, part.count, true);
    end.setUint32(12, size, true);
    end.setUint32(16, part.offset, true);
    var blob = new Blob(part.chunks.concat(part.central, [new Uint8Array(end.buffer)]), { type: "application/zip" });
    var name = "behkooshan-" + HOST + "-" + STAMP + "-part" + partNumber + ".zip";
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 60000);
    savedParts.push(name + " (" + (blob.size / 1048576).toFixed(1) + " MB)");
    part = null;
  }

  function addText(name, text) {
    addToZip(name, encoder.encode(text));
  }

  /* ------------------------------------------------------------ fetching */

  var manifest = { site: ORIGIN, collected: new Date().toISOString(), userAgent: navigator.userAgent, pages: [], api: [], files: [] };
  var errors = [];

  function wait(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  async function get(url, options) {
    var last = null;
    for (var attempt = 0; attempt <= RETRIES; attempt += 1) {
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
      try {
        var sameOrigin = new URL(url).origin === ORIGIN;
        var res = await fetch(url, Object.assign({
          signal: ctrl.signal,
          credentials: sameOrigin ? "include" : "omit",
          mode: sameOrigin ? "same-origin" : "cors",
          redirect: "follow",
          cache: "no-cache",
        }, options || {}));
        clearTimeout(timer);
        if (res.status === 429 || res.status >= 500) {
          last = new Error("HTTP " + res.status);
          await wait(1500 * (attempt + 1));
          continue;
        }
        return res;
      } catch (e) {
        clearTimeout(timer);
        last = e;
        await wait(800 * (attempt + 1));
      }
    }
    throw last;
  }

  async function pool(items, worker) {
    var index = 0;
    async function run() {
      while (index < items.length && !stopped) {
        var item = items[index];
        index += 1;
        await worker(item);
      }
    }
    var runners = [];
    for (var i = 0; i < PARALLEL; i += 1) runners.push(run());
    await Promise.all(runners);
  }

  /* --------------------------------------------------------- where to save */

  var usedNames = new Set();

  function safe(part) {
    return part.replace(/[<>:"\\|?*\x00-\x1f]/g, "_").slice(0, 150);
  }

  function pathFor(folder, url, fallbackExt) {
    var u = new URL(url);
    var path = decodeURIComponent(u.pathname).split("/").filter(Boolean).map(safe).join("/");
    if (!path || url.endsWith("/")) path = (path ? path + "/" : "") + "index" + (fallbackExt || ".html");
    else if (!/\.[a-z0-9]{2,5}$/i.test(path) && fallbackExt) path += fallbackExt;
    if (u.search) {
      var q = safe(u.search.slice(1)).replace(/[=&]/g, "-");
      path = path.replace(/(\.[a-z0-9]{2,5})?$/i, function (ext) { return "__" + q + (ext || fallbackExt || ""); });
    }
    var name = folder + "/" + u.hostname + "/" + path;
    var n = 2;
    var base = name;
    while (usedNames.has(name)) {
      name = base.replace(/(\.[a-z0-9]{2,5})?$/i, function (ext) { return "-" + n + (ext || ""); });
      n += 1;
    }
    usedNames.add(name);
    return name;
  }

  /* ------------------------------------------------------------ discovery */

  var pageUrls = new Set();
  var fileUrls = new Map(); // url -> first page it was seen on

  function absolute(raw, base) {
    try {
      var cleaned = String(raw).trim().replace(/\\\//g, "/").replace(/&amp;/g, "&");
      if (!cleaned || cleaned.startsWith("data:") || cleaned.startsWith("blob:") || cleaned.startsWith("javascript:")) return null;
      var u = new URL(cleaned, base || ORIGIN);
      u.hash = "";
      return u.href;
    } catch (e) {
      return null;
    }
  }

  function isFile(url) {
    try {
      var u = new URL(url);
      if (u.search.indexOf("jet_download=") !== -1) return true;
      if (u.pathname.indexOf("/wp-content/uploads/") !== -1) return true;
      return u.origin === ORIGIN && FILE_EXT.test(u.pathname);
    } catch (e) {
      return false;
    }
  }

  // The original upload behind a resized copy: WordPress names its sizes
  // name-300x221.jpg and its big-image copies name-scaled.jpg.
  function originals(url) {
    var out = [];
    var m = url.match(/^(.*\/wp-content\/uploads\/.+?)-(\d{2,5})x(\d{2,5})(\.[a-z0-9]+)(\?.*)?$/i);
    if (m) out.push(m[1] + m[4]);
    var s = url.match(/^(.*\/wp-content\/uploads\/.+?)-scaled(\.[a-z0-9]+)(\?.*)?$/i);
    if (s) out.push(s[1] + s[2]);
    // A CDN copy (exactdn, jetpack) is also asked for from the site itself.
    try {
      var u = new URL(url);
      if (u.origin !== ORIGIN && u.pathname.indexOf("/wp-content/uploads/") !== -1) out.push(ORIGIN + u.pathname);
    } catch (e) {}
    return out;
  }

  function addFile(url, seenOn) {
    if (!url || !isFile(url)) return;
    if (!fileUrls.has(url) || /^guess/.test(fileUrls.get(url))) fileUrls.set(url, seenOn);
    originals(url).forEach(function (u) {
      if (!fileUrls.has(u)) fileUrls.set(u, "guess from " + url);
    });
  }

  function harvest(html, pageUrl) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("a[href]").forEach(function (a) {
      var u = absolute(a.getAttribute("href"), pageUrl);
      if (!u) return;
      if (isFile(u)) addFile(u, pageUrl);
      else if (new URL(u).origin === ORIGIN && /\/(product|products|projects?|_project|shop|product-category)\//.test(new URL(u).pathname)) pageUrls.add(u.split("?")[0]);
    });
    doc.querySelectorAll("[src],[data-src],[data-lazy-src],[data-bg],[data-background],[poster]").forEach(function (el) {
      ["src", "data-src", "data-lazy-src", "data-bg", "data-background", "poster"].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (v) addFile(absolute(v, pageUrl), pageUrl);
      });
    });
    doc.querySelectorAll("[srcset],[data-srcset],[data-lazy-srcset]").forEach(function (el) {
      ["srcset", "data-srcset", "data-lazy-srcset"].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (!v) return;
        v.split(",").forEach(function (item) {
          addFile(absolute(item.trim().split(/\s+/)[0], pageUrl), pageUrl);
        });
      });
    });
    // The stylesheets, scripts and fonts the page loads, so the zip holds the
    // page as it looks and not only its words and pictures.
    doc.querySelectorAll('meta[property="og:image"],meta[name="twitter:image"],link[rel~="icon"],link[rel="preload"],link[rel~="stylesheet"]').forEach(function (el) {
      addFile(absolute(el.getAttribute("content") || el.getAttribute("href"), pageUrl), pageUrl);
    });
    // Anything else that looks like a file: inline styles, Elementor's JSON
    // settings, lazy loaders with their own attributes.
    var re = /(https?:)?(\\?\/\\?\/[^"'\s<>()]+?)?(\\?\/wp-content\\?\/uploads\\?\/[^"'\s<>()]+?\.(?:jpe?g|png|webp|gif|svg|avif|pdf|zip|mp4))/gi;
    var m;
    while ((m = re.exec(html))) {
      addFile(absolute((m[1] || "") + (m[2] || "") + m[3], pageUrl), pageUrl);
    }
    var jet = /[?&]jet_download=([a-f0-9]+)/gi;
    while ((m = jet.exec(html))) {
      addFile(ORIGIN + "/?jet_download=" + m[1], pageUrl);
    }
  }

  async function sitemaps() {
    var queue = ["/sitemap_index.xml", "/wp-sitemap.xml", "/sitemap.xml", "/product-sitemap.xml", "/page-sitemap.xml", "/projects-sitemap.xml", "/project-sitemap.xml", "/_project-sitemap.xml", "/post-sitemap.xml", "/product_cat-sitemap.xml"].map(function (p) { return ORIGIN + p; });
    var seen = new Set();
    while (queue.length && !stopped) {
      var url = queue.shift();
      if (seen.has(url)) continue;
      seen.add(url);
      try {
        var res = await get(url);
        var text = await res.text();
        manifest.api.push({ url: url, status: res.status });
        if (!res.ok || text.indexOf("<loc>") === -1) continue;
        addText(pathFor("sitemaps", url, ".xml"), text);
        var locs = Array.from(text.matchAll(/<loc>\s*(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?\s*<\/loc>/g)).map(function (m) { return m[1].trim(); });
        locs.forEach(function (loc) {
          if (/sitemap[^/]*\.xml/i.test(loc)) queue.push(loc);
          else if (isFile(loc)) addFile(loc, url);
          else if (new URL(loc).origin === ORIGIN) pageUrls.add(loc);
        });
        Array.from(text.matchAll(/<image:loc>\s*(?:<!\[CDATA\[)?([^<\]]+)/g)).forEach(function (m) { addFile(m[1].trim(), url); });
      } catch (e) {
        manifest.api.push({ url: url, error: String(e) });
      }
    }
  }

  // Every page of a paginated JSON API, until it runs out or repeats.
  async function api(path, perPage) {
    var all = [];
    var previous = "";
    for (var page = 1; page <= 400 && !stopped; page += 1) {
      var url = ORIGIN + path + (path.indexOf("?") === -1 ? "?" : "&") + "per_page=" + perPage + "&page=" + page;
      var res;
      try {
        res = await get(url, { headers: { Accept: "application/json" } });
      } catch (e) {
        manifest.api.push({ url: url, error: String(e) });
        break;
      }
      var text = await res.text();
      manifest.api.push({ url: url, status: res.status, bytes: text.length });
      if (!res.ok) break;
      if (text === previous) break;
      previous = text;
      addText(pathFor("api", url, ".json"), text);
      var data;
      try { data = JSON.parse(text); } catch (e) { break; }
      if (!Array.isArray(data) || !data.length) break;
      all = all.concat(data);
      var total = Number(res.headers.get("X-WP-TotalPages") || 0);
      if ((total && page >= total) || data.length < perPage) break;
    }
    return all;
  }

  async function single(path) {
    var url = ORIGIN + path;
    try {
      var res = await get(url, { headers: { Accept: "application/json" } });
      var text = await res.text();
      manifest.api.push({ url: url, status: res.status, bytes: text.length });
      if (res.ok) addText(pathFor("api", url, ".json"), text);
      return res.ok ? JSON.parse(text) : null;
    } catch (e) {
      manifest.api.push({ url: url, error: String(e) });
      return null;
    }
  }

  function filesInJson(value, seenOn) {
    if (typeof value === "string") {
      if (/^https?:\/\//.test(value) && isFile(value)) addFile(value, seenOn);
      else if (/^https?:\/\//.test(value) && new URL(value).origin === ORIGIN && /\/(product|projects?|_project)\//.test(value)) pageUrls.add(value);
      return;
    }
    if (value && typeof value === "object") Object.keys(value).forEach(function (k) { filesInJson(value[k], seenOn); });
  }

  /* ------------------------------------------------------------- the run */

  try {
    show("خواندن نقشهٔ سایت…");
    await sitemaps();

    show("خواندن API محصولات…");
    await single("/wp-json/");
    var types = await single("/wp-json/wp/v2/types");
    var store = await api("/wp-json/wc/store/v1/products", 100);
    filesInJson(store, "store api");
    filesInJson(await api("/wp-json/wc/store/v1/products/categories", 100), "store api");
    filesInJson(await single("/wp-json/wc/store/v1/products/attributes"), "store api");

    // Every post type the site exposes, products and projects among them.
    var restBases = ["product", "pages", "posts", "projects", "project", "_project", "bk_product"];
    if (types) Object.keys(types).forEach(function (k) { if (types[k].rest_base) restBases.push(types[k].rest_base); });
    restBases = Array.from(new Set(restBases)).filter(function (b) { return b !== "media" && b !== "attachment"; });
    for (var i = 0; i < restBases.length && !stopped; i += 1) {
      var items = await api("/wp-json/wp/v2/" + restBases[i], 100);
      filesInJson(items, "rest " + restBases[i]);
      items.forEach(function (it) { if (it && it.link && new URL(it.link).origin === ORIGIN) pageUrls.add(it.link); });
    }
    filesInJson(await api("/wp-json/wp/v2/product_cat", 100), "rest product_cat");

    if (DOWNLOAD_MEDIA_LIBRARY) {
      show("خواندن کتابخانهٔ رسانه…");
      var media = await api("/wp-json/wp/v2/media", 100);
      media.forEach(function (m) {
        if (m.source_url) addFile(m.source_url, "media library");
      });
    }

    // The front page and the listing pages, whatever the sitemaps said. These
    // are guesses: one that is not there is not an error.
    var guessed = new Set();
    ["/", "/products/", "/shop/", "/projects/", "/about-us/", "/contact-us/"].forEach(function (p) {
      if (!pageUrls.has(ORIGIN + p)) guessed.add(ORIGIN + p);
      pageUrls.add(ORIGIN + p);
    });

    show("خواندن صفحه‌ها…");
    var donePages = new Set();
    // Pages found while reading pages are read too, until there are no new ones.
    for (var round = 0; round < 4 && !stopped; round += 1) {
      var todo = Array.from(pageUrls).filter(function (u) { return !donePages.has(u); });
      if (!todo.length) break;
      stats.pagesAll = pageUrls.size;
      await pool(todo, async function (url) {
        donePages.add(url);
        try {
          var res = await get(url);
          var html = await res.text();
          var file = pathFor("pages", url, ".html");
          if (res.ok) {
            addText(file, html);
            harvest(html, url);
          }
          manifest.pages.push({ url: url, status: res.status, file: res.ok ? file : null });
          if (!res.ok && !(res.status === 404 && guessed.has(url))) { errors.push("page " + res.status + " " + url); stats.errors += 1; }
        } catch (e) {
          manifest.pages.push({ url: url, error: String(e) });
          errors.push("page " + url + " " + e);
          stats.errors += 1;
        }
        stats.pagesDone += 1;
        stats.pagesAll = pageUrls.size;
        stats.filesAll = fileUrls.size;
        show();
      });
    }

    // In rounds: a stylesheet names fonts and background pictures of its own,
    // which are only known once it has been read, and are fetched next round.
    show("دانلود عکس‌ها و فایل‌ها…");
    var fetched = new Set();
    for (var round = 0; round < 4 && !stopped; round += 1) {
    var files = Array.from(fileUrls.keys()).filter(function (u) { return !fetched.has(u); });
    if (!files.length) break;
    files.forEach(function (u) { fetched.add(u); });
    stats.filesAll = fileUrls.size;
    await pool(files, async function (url) {
      try {
        var res = await get(url);
        if (!res.ok) {
          manifest.files.push({ url: url, status: res.status, seen_on: fileUrls.get(url) });
          // A missing "original" guessed from a resized name is expected; only
          // what a page or the library pointed at counts as a failure.
          if (!/^guess/.test(fileUrls.get(url) || "")) { errors.push("file " + res.status + " " + url); stats.errors += 1; }
        } else {
          var type = res.headers.get("Content-Type") || "";
          var disposition = res.headers.get("Content-Disposition") || "";
          var named = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
          var ext = type.indexOf("jpeg") !== -1 ? ".jpg" : type.indexOf("png") !== -1 ? ".png" : type.indexOf("webp") !== -1 ? ".webp" : type.indexOf("pdf") !== -1 ? ".pdf" : type.indexOf("zip") !== -1 ? ".zip" : "";
          var bytes = new Uint8Array(await res.arrayBuffer());
          if (type.indexOf("css") !== -1 || /\.css$/i.test(new URL(url).pathname)) {
            var css = new TextDecoder().decode(bytes);
            Array.from(css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)).forEach(function (m) {
              if (!/^data:/i.test(m[1])) addFile(absolute(m[1], url), url);
            });
          }
          var file = named
            ? pathFor("files", ORIGIN + "/downloads/" + encodeURIComponent(decodeURIComponent(named[1])), ext)
            : pathFor("files", url, ext);
          addToZip(file, bytes);
          stats.bytes += bytes.length;
          manifest.files.push({ url: url, status: res.status, type: type, bytes: bytes.length, file: file, filename: named ? decodeURIComponent(named[1]) : null, seen_on: fileUrls.get(url) });
        }
      } catch (e) {
        manifest.files.push({ url: url, error: String(e), seen_on: fileUrls.get(url) });
        errors.push("file " + url + " " + e);
        stats.errors += 1;
      }
      stats.filesDone += 1;
      show();
    });
    }
  } catch (e) {
    errors.push("stopped by an error: " + (e && e.stack || e));
  }

  show("ساختن زیپ…");
  manifest.parts = partNumber;
  manifest.stopped_early = stopped;
  addText("manifest.json", JSON.stringify(manifest, null, 1));
  addText("errors.txt", errors.join("\n") || "no errors");
  closePart();

  panel.querySelector('[data-line="phase"]').textContent =
    "تمام شد. " + savedParts.length + " فایل زیپ ذخیره شد. همه را برای ما بفرستید.";
  var stop = panel.querySelector("[data-stop]");
  stop.disabled = false;
  stop.textContent = "بستن";
  stop.onclick = function () { panel.remove(); };
  console.log("Behkooshan collection finished:", savedParts, "errors:", errors.length);
})();
