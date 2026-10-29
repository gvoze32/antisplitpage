// ==UserScript==
// @name         Anti Split Page
// @namespace    gvoze32/antisplitpage
// @version      3.2.0
// @description  Show split (paginated) Indonesian news articles on a single page
// @author       gvoze32
// @homepageURL  https://github.com/gvoze32/antisplitpage
// @supportURL   https://github.com/gvoze32/antisplitpage/issues
// @updateURL    https://raw.githubusercontent.com/gvoze32/antisplitpage/master/antisplitpage.user.js
// @downloadURL  https://raw.githubusercontent.com/gvoze32/antisplitpage/master/antisplitpage.user.js
// @icon         https://cdn-icons-png.flaticon.com/512/6455/6455714.png
// @grant        none
// @run-at       document-start
// @noframes
// @match        *://*.tribunnews.com/*
// @match        *://*.grid.id/*
// @match        *://*.kompas.com/*
// @match        *://*.detik.com/*
// @match        *://*.kontan.co.id/*
// @match        *://*.kompasiana.com/*
// @match        *://*.motorplus-online.com/*
// @match        *://*.gridoto.com/*
// @match        *://*.suara.com/*
// @match        *://*.inews.id/*
// @match        *://*.viva.co.id/*
// @match        *://*.jawapos.com/*
// @match        *://*.jagodangdut.com/*
// @match        *://*.sahijab.com/*
// @match        *://*.100kpj.com/*
// @match        *://*.tvonenews.com/*
// @match        *://*.bolasport.com/*
// @match        *://*.suaramerdeka.com/*
// @match        *://*.pikiran-rakyat.com/*
// @match        *://*.idntimes.com/*
// @match        *://*.okezone.com/*
// @match        *://*.disway.id/*
// @match        *://*.jpnn.com/*
// @match        *://*.genpi.co/*
// @match        *://*.antaranews.com/*
// @match        *://*.kompas.tv/*
// @match        *://*.parapuan.co/*
// @match        *://*.juara.net/*
// @match        *://*.intipseleb.com/*
// @match        *://*.idxchannel.com/*
// @match        *://*.investor.id/*
// @match        *://*.hops.id/*
// @match        *://*.zonajakarta.com/*
// @match        *://*.jatimnetwork.com/*
// @match        *://*.indozone.id/*
// @match        *://*.fajar.co.id/*
// @match        *://*.liputan6.com/*
// @match        *://*.ayobandung.com/*
// @match        *://*.jabarekspres.com/*
// ==/UserScript==

(() => {
  "use strict";

  const TAG = "AntiSplitPage:";

  // ---------------------------------------------------------------------------
  // Method 1: redirect to the site's own "show all pages" URL.
  // Each `to` returns the URL to redirect to, or null when already applied.
  // ---------------------------------------------------------------------------

  const query = (key, value) => (url) => {
    if (url.searchParams.get(key) === value) return null;
    url.searchParams.set(key, value);
    return url;
  };

  // Replaces an optional trailing "/<page number>" with `suffix`.
  const pathSuffix = (suffix) => (url) => {
    if (url.pathname.endsWith(suffix)) return null;
    url.pathname = url.pathname.replace(/(?:\/\d+)?\/?$/, suffix);
    return url;
  };

  const PAGE_ALL = query("page", "all");

  // "/<category>/<numeric id>/<slug>", shared by many CMSes (PRMN, KG, MNC, ...).
  const ID_SLUG = /^\/(?!tag\/)[\w-]+\/\d+\/[\w-]+/;

  const REDIRECT_SITES = [
    { host: "tribunnews.com", article: /^\/[\w-]+\/(?:\d{4}\/\d{2}\/\d{2}|\d+)\//, to: PAGE_ALL },
    { host: "grid.id", article: /\/read\/\d+/, to: PAGE_ALL },
    { host: "kompas.com", article: /\/read\/\d{4}\/\d{2}\/\d{2}/, to: PAGE_ALL },
    { host: "detik.com", article: /\/\w+\/d-\d+/, to: query("single", "1") },
    { host: "kontan.co.id", article: /^\/news\/[\w-]+/, to: PAGE_ALL },
    { host: "kompasiana.com", article: /^\/[\w.-]+\/[0-9a-f]{24}\//, to: PAGE_ALL },
    { host: "motorplus-online.com", article: /\/read\/\d{9}/, to: PAGE_ALL },
    { host: "gridoto.com", article: /\/read\/\d{9}/, to: PAGE_ALL },
    { host: "suara.com", article: /\/\w+\/\d{4}\/\d{2}\/\d{2}/, to: PAGE_ALL },
    { host: "inews.id", article: /^\/[\w-]+\/[\w-]+\/[\w-]*-[\w-]*/, to: pathSuffix("/all") },
    { host: "viva.co.id", article: /\/\w+\/\d+/, to: PAGE_ALL },
    { host: "jawapos.com", article: /\/\d+\//, to: PAGE_ALL },
    { host: "jagodangdut.com", article: /\/\w+\/\d+/, to: PAGE_ALL },
    { host: "sahijab.com", article: /\/\w+\/\d+/, to: PAGE_ALL },
    { host: "100kpj.com", article: /\/\w+\/\d+/, to: PAGE_ALL },
    { host: "tvonenews.com", article: /\/\w+\/\d+/, to: PAGE_ALL },
    { host: "bolasport.com", article: /\/read\/\d+/, to: PAGE_ALL },
    { host: "suaramerdeka.com", article: /\/\w+\/\d+/, to: PAGE_ALL },
    { host: "pikiran-rakyat.com", article: /\/pr-\d+/, to: PAGE_ALL },
    { host: "idntimes.com", article: /\/\w+\/\w+\/[-a-z0-9]+/, to: PAGE_ALL },
    { host: "okezone.com", article: /^\/read\/\d{4}\/\d{2}\/\d{2}\//, to: PAGE_ALL },
    { host: "disway.id", article: /^\/read\/\d+\//, to: PAGE_ALL },
    { host: "antaranews.com", article: ID_SLUG, to: PAGE_ALL },
    { host: "kompas.tv", article: ID_SLUG, to: PAGE_ALL },
    { host: "parapuan.co", article: ID_SLUG, to: PAGE_ALL },
    { host: "juara.net", article: ID_SLUG, to: PAGE_ALL },
    { host: "hops.id", article: ID_SLUG, to: PAGE_ALL },
    { host: "zonajakarta.com", article: ID_SLUG, to: PAGE_ALL },
    { host: "jatimnetwork.com", article: ID_SLUG, to: PAGE_ALL },
    { host: "indozone.id", article: ID_SLUG, to: PAGE_ALL },
    { host: "intipseleb.com", article: /^\/[\w-]+\/\d+-/, to: PAGE_ALL },
    { host: "fajar.co.id", article: /^\/\d{4}\/\d{2}\/\d{2}\/[\w-]+/, to: PAGE_ALL },
    { host: "investor.id", article: ID_SLUG, to: pathSuffix("/all") },
    { host: "idxchannel.com", article: /^\/[\w-]+\/[\w-]+-[\w-]+(?:\/\d+)?\/?$/, to: pathSuffix("/all") },
    { host: "ayobandung.com", article: ID_SLUG, to: PAGE_ALL },
  ];

  // ---------------------------------------------------------------------------
  // Method 2: fetch every page and merge the article bodies in place,
  // for sites without a "show all" URL.
  //   body   - article container, replaced with the merged content
  //   strip  - removed from every fetched page body
  //   repeat - removed from every fetched page body except the first
  //   hide   - removed from the live page after merging
  //   pager  - page URL scheme, defaults to "?page=N"
  // ---------------------------------------------------------------------------

  // A pager maps a URL to { article, n } (`article` identifies the article
  // regardless of page) and builds the URL of page n.
  const QUERY_PAGER = {
    parse: (url) => ({ article: url.origin + url.pathname, n: Number(url.searchParams.get("page")) || 1 }),
    build(url, n) {
      if (n === 1) url.searchParams.delete("page");
      else url.searchParams.set("page", String(n));
      return url;
    },
  };

  // WordPress <!--nextpage-->: ".../slug/" is page 1, ".../slug/N/" is page N.
  const PAGE_SEGMENT = /\/(\d+)\/?$/;
  const articlePath = (path) => path.replace(PAGE_SEGMENT, "").replace(/\/?$/, "/");
  const PATH_PAGER = {
    parse: (url) => ({
      article: url.origin + articlePath(url.pathname),
      n: Number(url.pathname.match(PAGE_SEGMENT)?.[1]) || 1,
    }),
    build(url, n) {
      url.pathname = articlePath(url.pathname) + (n === 1 ? "" : `${n}/`);
      return url;
    },
  };

  const MERGE_SITES = [
    {
      host: "jpnn.com",
      body: 'div[itemprop="articleBody"]',
      strip: ".baca-juga",
      hide: ".pagination",
    },
    {
      host: "genpi.co",
      body: 'div[itemprop="articleBody"] .col-md-10',
      strip: '.baca-juga, .mnmd-pagination, p.text-center[style*="margin-top:-35px"]',
      repeat: ".entry-thumb",
    },
    {
      // "?page=all" exists in the pager but returns 404.
      host: "liputan6.com",
      body: ".article-content-body",
      strip: ".article-raw-content",
      hide: ".gatewayPagination, .article-paging-pagination, .read-page-box-pagination",
    },
    {
      host: "jabarekspres.com",
      body: ".entry-content",
      strip: ".read-also",
      hide: ".post-nav-links",
      pager: PATH_PAGER,
    },
  ];

  // Guards against a bogus "?page=99999" link triggering thousands of fetches.
  const MAX_PAGES = 30;

  // Remembers the last redirect target so a server that strips the parameter
  // and bounces us back cannot cause a redirect loop.
  const PENDING_KEY = "antisplitpage:pending";

  function takePending() {
    try {
      const pending = sessionStorage.getItem(PENDING_KEY);
      sessionStorage.removeItem(PENDING_KEY);
      return pending;
    } catch {
      return null;
    }
  }

  function redirect(site, pending) {
    const target = site.to(new URL(location.href));
    if (!target) return;
    if (target.href === pending) {
      console.warn(TAG, "site bounced back from", target.href, "- not redirecting again");
      return;
    }
    try {
      sessionStorage.setItem(PENDING_KEY, target.href);
    } catch {
      // Storage unavailable: redirect without loop protection.
    }
    console.log(TAG, "redirecting to", target.href);
    // replace() keeps the split URL out of history, so Back is not trapped.
    location.replace(target.href);
  }

  function pageCount(pager) {
    const here = pager.parse(new URL(location.href));
    let max = here.n;
    for (const a of document.querySelectorAll("a[href]")) {
      const { article, n } = pager.parse(new URL(a.href, location.href));
      if (article === here.article && Number.isInteger(n) && n > max) max = n;
    }
    return Math.min(max, MAX_PAGES);
  }

  function pageUrl(pager, n) {
    const url = new URL(location.href);
    url.hash = "";
    return pager.build(url, n).href;
  }

  async function fetchBody(site, url, isFirst) {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    const body = doc.querySelector(site.body);
    if (!body) throw new Error(`"${site.body}" not found in ${url}`);
    const remove = isFirst || !site.repeat ? site.strip : `${site.strip}, ${site.repeat}`;
    for (const el of body.querySelectorAll(remove)) el.remove();
    return body;
  }

  async function merge(site) {
    const live = document.querySelector(site.body);
    if (!live) return;
    const pager = site.pager ?? QUERY_PAGER;
    const count = pageCount(pager);
    if (count < 2) return;

    const urls = Array.from({ length: count }, (_, i) => pageUrl(pager, i + 1));
    console.log(TAG, `merging ${count} pages`, urls);
    // Any failed page aborts the merge: a partial article with its pagination
    // removed would silently hide content.
    const bodies = await Promise.all(urls.map((url, i) => fetchBody(site, url, i === 0)));

    const nodes = [];
    bodies.forEach((body, i) => {
      if (i > 0) {
        const hr = document.createElement("hr");
        hr.style.cssText = "margin: 2em 0; border: 0; border-top: 1px solid #ccc;";
        nodes.push(hr);
      }
      nodes.push(...body.childNodes);
    });
    live.replaceChildren(...nodes);
    if (site.hide) for (const el of document.querySelectorAll(site.hide)) el.remove();
    console.log(TAG, "merged", count, "pages");
  }

  function whenReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  const { hostname, pathname } = location;
  const onHost = (site) => hostname === site.host || hostname.endsWith(`.${site.host}`);
  const pending = takePending();

  const redirectSite = REDIRECT_SITES.find((site) => onHost(site) && site.article.test(pathname));
  if (redirectSite) {
    redirect(redirectSite, pending);
    return;
  }

  const mergeSite = MERGE_SITES.find(onHost);
  if (mergeSite) {
    whenReady(() =>
      merge(mergeSite).catch((err) =>
        console.error(TAG, "merge failed, page left untouched:", err),
      ),
    );
  }
})();
