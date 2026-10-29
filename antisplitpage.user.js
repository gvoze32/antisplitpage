// ==UserScript==
// @name         Anti Split Page
// @namespace    gvoze32/antisplitpage
// @version      4.0.0
// @description  Show split (paginated) news articles on a single page
// @author       gvoze32
// @homepageURL  https://github.com/gvoze32/antisplitpage
// @supportURL   https://github.com/gvoze32/antisplitpage/issues
// @updateURL    https://raw.githubusercontent.com/gvoze32/antisplitpage/master/antisplitpage.user.js
// @downloadURL  https://raw.githubusercontent.com/gvoze32/antisplitpage/master/antisplitpage.user.js
// @icon         https://raw.githubusercontent.com/gvoze32/antisplitpage/master/icons/icon-128.png
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
// @match        *://*.antaranews.com/*
// @match        *://*.kompas.tv/*
// @match        *://*.parapuan.co/*
// @match        *://*.juara.net/*
// @match        *://*.hops.id/*
// @match        *://*.zonajakarta.com/*
// @match        *://*.jatimnetwork.com/*
// @match        *://*.indozone.id/*
// @match        *://*.intipseleb.com/*
// @match        *://*.fajar.co.id/*
// @match        *://*.investor.id/*
// @match        *://*.idxchannel.com/*
// @match        *://*.ayobandung.com/*
// @match        *://*.j-cast.com/*
// @match        *://*.heise.de/*
// @match        *://*.kitguru.net/*
// @match        *://*.mydrivers.com/*
// @match        *://*.jpnn.com/*
// @match        *://*.genpi.co/*
// @match        *://*.liputan6.com/*
// @match        *://*.jabarekspres.com/*
// @match        *://*.news.yahoo.co.jp/*
// @match        *://*.president.jp/*
// @match        *://*.diamond.jp/*
// @match        *://*.bunshun.jp/*
// @match        *://*.gendai.media/*
// @match        *://*.jbpress.ismedia.jp/*
// @match        *://*.itmedia.co.jp/*
// @match        *://*.golem.de/*
// @match        *://*.purepc.pl/*
// @match        *://*.hexus.net/*
// @match        *://*.tomshardware.com/*
// @match        *://*.phoronix.com/*
// @match        *://*.hothardware.com/*
// @match        *://*.servethehome.com/*
// ==/UserScript==

(() => {
  "use strict";

  // --- src/rules.js ---
  // URL strategies used by the site list (src/sites.js).

  // ---------------------------------------------------------------------------
  // Redirect strategies: given the current URL (a mutable copy), return the
  // site's own "show all pages" URL, or null when it is already applied.
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

  // ---------------------------------------------------------------------------
  // Pagers (merge method): `parse` maps a URL to { article, n }, where `article`
  // identifies the article regardless of page; `build` returns the URL of page n.
  // Both receive a mutable URL copy.
  // ---------------------------------------------------------------------------

  // "?key=N" (page 1 = no key). `encode`/`decode` map page numbers to the
  // parameter value for sites that don't use plain numbers.
  const queryPager = (key, encode = String, decode = Number) => ({
    parse(url) {
      const value = url.searchParams.get(key);
      return { article: url.origin + url.pathname, n: (value !== null && decode(value)) || 1 };
    },
    build(url, n) {
      url.searchParams.delete(key);
      // Appended raw: searchParams would encode "0,1" as "0%2C1", which some
      // servers reject.
      if (n !== 1) url.search += `${url.search ? "&" : "?"}${key}=${encode(n)}`;
      return url;
    },
  });

  const QUERY_PAGER = queryPager("page");

  // ".../slug/" or ".../slug" is page 1, ".../slug/N/" or ".../slug/N" is page N.
  // `slash`: whether page URLs end with "/" (WordPress) or not (Phoronix, Tom's
  // Hardware, which reject the other form). N has at most two digits, so a
  // trailing numeric article id is not mistaken for a page number.
  const PAGE_SEGMENT = /\/(\d{1,2})\/?$/;
  const articlePath = (path) => path.replace(PAGE_SEGMENT, "").replace(/\/$/, "");

  const pathPager = (slash) => ({
    parse: (url) => ({
      article: url.origin + articlePath(url.pathname),
      n: Number(url.pathname.match(PAGE_SEGMENT)?.[1]) || 1,
    }),
    build(url, n) {
      url.pathname = `${articlePath(url.pathname)}${n === 1 ? "" : `/${n}`}${slash ? "/" : ""}`;
      return url;
    },
  });

  // WordPress <!--nextpage-->.
  const PATH_PAGER = pathPager(true);

  // ".../news010.html" is page 1, ".../news010<sep>N.html" is page N (ITmedia: "_").
  // N has at most two digits, so a trailing article id ("…-2610-214450.html" on
  // golem.de) is not mistaken for a page number.
  const htmlSuffixPager = (sep) => {
    const re = new RegExp(`^(.*?)(?:${sep}(\\d{1,2}))?\\.html$`);
    return {
      parse(url) {
        const m = url.pathname.match(re);
        return { article: url.origin + (m ? m[1] : url.pathname), n: Number(m?.[2]) || 1 };
      },
      build(url, n) {
        const base = url.pathname.match(re)?.[1];
        if (base !== undefined) url.pathname = `${base}${n === 1 ? "" : `${sep}${n}`}.html`;
        return url;
      },
    };
  };

  // --- src/sites.js ---
  // Supported sites. Hosts match the hostname and all its subdomains.
  //
  // REDIRECT_SITES: the site has its own "show all pages" URL.
  //   article - tested against location.pathname; only article pages redirect
  //   to      - strategy from rules.js building the show-all URL, applied at
  //             document-start; or
  //   link    - CSS selector of the site's own "show all" link, followed once the
  //             page is parsed (for sites where few articles are split)
  //
  // MERGE_SITES: no show-all URL; pages 1..N are fetched and merged in place.
  //   body   - article container, replaced with the merged content
  //   strip  - removed from every fetched page body
  //   repeat - removed from every fetched page body except the first
  //   hide   - removed from the live page after merging
  //   pager  - page URL scheme from rules.js, defaults to QUERY_PAGER ("?page=N")


  const REDIRECT_SITES = [
    // Indonesia
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

    // Japan
    { host: "j-cast.com", article: /^\/\d{4}\/\d{2}\/\d+\.html$/, to: query("p", "all") },

    // Germany
    { host: "heise.de", article: /-\d{6,}\.html$/, link: 'a[href*="?seite=all"]' },

    // United Kingdom
    // "View All Pages" is an <option> of the page-jump <select>, only on split reviews.
    { host: "kitguru.net", article: /^\/.+\//, link: 'select.contentjumpddl option[value$="/all/1/"]' },

    // China
    // "全文" link on split articles only; "_all.htm" is a 404 for unsplit ones.
    { host: "mydrivers.com", article: /^\/1\/\d+\/\d+(?:_\d+)?\.htm$/, link: ".m-page a[href*='_all.htm']" },
  ];

  const MERGE_SITES = [
    // Indonesia
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

    // Japan
    {
      host: "news.yahoo.co.jp",
      body: "article .article_body",
      strip: "script, style",
      // Pager and "next page" teaser use hashed class names.
      hide: "article > div:has(a[href*='?page='])",
    },
    {
      host: "president.jp",
      body: "section.article-body",
      strip: ".noticelist, .gliaplayer-container, .ad-rectangle, script",
      hide: ".article-above-pagination, .c-pagination",
    },
    {
      host: "diamond.jp",
      body: "section.article-body",
      strip: "#guideframetext, .guideframe, script",
      hide: "nav.article-nav",
    },
    {
      host: "bunshun.jp",
      body: "div.article-body",
      strip:
        ".ad-banner, .direct-access-info, .next-article-area, #article-photo-link, #twitter-share-btn, #read-to-end, .btn-link-photopage",
      hide: "div.pagination, a.goto-next",
    },
    {
      host: "gendai.media",
      body: ".gendai-articleContents",
      strip: ".in-article-ad-slot, script",
      hide: "article nav:has(a[href*='?page='])",
    },
    {
      host: "jbpress.ismedia.jp",
      body: ".article-body",
      strip: ".m-article-index, script",
      hide: ".m-pager",
    },
    {
      // The pager sits inside the body, so it is stripped rather than hidden.
      host: "itmedia.co.jp",
      body: "#cmsBody",
      strip:
        ".ctrl, #start, #notice, #endlinkConnection, .cmsToc, nav, #masterSocialbuttonTop, #ArticleText, #cmsMark, #article_bottom_ad, #BelowArtSpecialLinkITS, #cmsCopyright, #ulCommentWidget, #ulCommentWidgetAnnounce, #InRead, #ArticleBottomTarget, [id^='PC_'], [id^='logly-lift'], script",
      pager: htmlSuffixPager("_"),
    },

    // Germany
    {
      host: "golem.de",
      body: "article.go-article",
      strip: "nav.go-pagination, .go-index--pagination, .go-ad-slot, .go-teaser-block--career",
      // Gallery and article footer repeat on every page.
      repeat: ".go-gallery, .go-article-footer__button-bar, ul.go-alink-list",
      hide: "nav.go-pagination, .go-index--pagination",
      pager: htmlSuffixPager("-"),
    },

    // Poland
    {
      // Page N is "?page=0,<N-1>".
      host: "purepc.pl",
      body: "div.node div.content",
      strip: "ul.pager",
      repeat: "#PageMenuList, #PageMenuList2",
      hide: "ul.pager",
      pager: queryPager("page", (n) => `0,${n - 1}`, (v) => Number(v.split(",")[1]) + 1),
    },

    // United Kingdom
    {
      host: "hexus.net",
      body: "#articlecontent",
      strip: "select#articlepager, .prevnext, script",
    },

    // United States
    {
      host: "tomshardware.com",
      body: "#article-body",
      strip: ".ad-unit, .jwcarousel__hook, .slice-container.newsletter-inbodyContent-slice, .newsletter-form__wrapper, script",
      // Price comparison widget ends every page.
      repeat: "aside.ecom-root, [class*=price-comparison]",
      hide: ".box.pagination, .box.article.pagination",
      pager: pathPager(false),
    },
    {
      host: "phoronix.com",
      body: "article.full .content",
      // Share widgets (Facebook/X iframes) end every page.
      strip: "iframe, .fb-like, [class*=twitter], [id*=twitter]",
      hide: ".pagination, #phx_article_page_selector",
      pager: pathPager(false),
    },
    {
      host: "hothardware.com",
      body: ".cn-body",
      strip: ".cn-index-ap",
      hide: ".cn-pagenav, .cn-index-ap",
    },
    {
      host: "servethehome.com",
      body: ".td-post-content",
      strip: ".td-a-rec, .page-nav",
      hide: ".page-nav",
      pager: PATH_PAGER,
    },
  ];

  // --- src/core.js ---
  // Pure logic: site lookup, redirect targets, page URL discovery.


  // Guards against a bogus "?page=99999" link triggering thousands of fetches.
  const MAX_PAGES = 30;

  const onHost = (site, hostname) =>
    hostname === site.host || hostname.endsWith(`.${site.host}`);

  const findRedirectSite = (url) =>
    REDIRECT_SITES.find((s) => onHost(s, url.hostname) && s.article.test(url.pathname));

  // The show-all URL for the article at `href` when it can be built from the URL
  // alone (`to` sites), or null.
  function redirectTarget(href) {
    const url = new URL(href);
    return findRedirectSite(url)?.to?.(url)?.href ?? null;
  }

  const findMergeSite = (hostname) => MERGE_SITES.find((s) => onHost(s, hostname));

  const pagerOf = (site) => site.pager ?? QUERY_PAGER;

  // Highest page of the article at `href` linked from `links` (or `href` itself).
  // Pagers are often windowed ("1 2 3 … 9"), so callers feed in links from every
  // fetched page until this stops growing.
  function lastPage(pager, href, links) {
    const here = pager.parse(new URL(href));
    let last = here.n;
    for (const link of links) {
      if (!URL.canParse(link, href)) continue;
      const { article, n } = pager.parse(new URL(link, href));
      if (article === here.article && Number.isInteger(n) && n > last) last = n;
    }
    return Math.min(last, MAX_PAGES);
  }

  function pageUrl(pager, href, n) {
    const url = new URL(href);
    url.hash = "";
    return pager.build(url, n).href;
  }

  // --- src/main.js ---
  // Entry point: runs at document-start on every matched page.


  const TAG = "AntiSplitPage:";

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

  function redirect(target, pending) {
    if (target === pending) {
      console.warn(TAG, "site bounced back from", target, "- not redirecting again");
      return;
    }
    try {
      sessionStorage.setItem(PENDING_KEY, target);
    } catch {
      // Storage unavailable: redirect without loop protection.
    }
    console.log(TAG, "redirecting to", target);
    // replace() keeps the split URL out of history, so Back is not trapped.
    location.replace(target);
  }

  async function fetchPage(site, url, isFirst) {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    // res.text() always decodes UTF-8; Shift_JIS/EUC-JP sites often declare their
    // charset only in a <meta> tag, which the live page's characterSet reflects.
    const charset = /charset=["']?([\w-]+)/i.exec(res.headers.get("content-type") ?? "")?.[1];
    const html = new TextDecoder(charset ?? document.characterSet).decode(await res.arrayBuffer());
    const doc = new DOMParser().parseFromString(html, "text/html");
    const body = doc.querySelector(site.body);
    if (!body) throw new Error(`"${site.body}" not found in ${url}`);
    const links = Array.from(doc.querySelectorAll("a[href]"), (a) => a.getAttribute("href"))
      .filter((link) => URL.canParse(link, url))
      .map((link) => new URL(link, url).href);
    const remove = isFirst || !site.repeat ? site.strip : `${site.strip}, ${site.repeat}`;
    for (const el of body.querySelectorAll(remove)) el.remove();
    return { body, links };
  }

  async function merge(site) {
    const live = document.querySelector(site.body);
    if (!live) return;
    const pager = pagerOf(site);
    const href = location.href;
    let last = lastPage(pager, href, Array.from(document.querySelectorAll("a[href]"), (a) => a.href));
    if (last < 2) return;

    // Fetch until no fetched page links to a later one (windowed pagers).
    // Any failed page aborts the merge: a partial article with its pagination
    // removed would silently hide content.
    const bodies = [];
    while (bodies.length < last) {
      const batch = Array.from({ length: last - bodies.length }, (_, i) => bodies.length + i + 1);
      const pages = await Promise.all(batch.map((n) => fetchPage(site, pageUrl(pager, href, n), n === 1)));
      for (const page of pages) {
        bodies.push(page.body);
        last = Math.max(last, lastPage(pager, href, page.links));
      }
    }

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
    console.log(TAG, "merged", bodies.length, "pages");
  }

  function whenReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function followShowAllLink(selector, pending) {
    // An <a href>, or an <option value> of a page-jump <select>.
    const link = document.querySelector(selector);
    const href = link?.href || link?.value;
    if (!href || !URL.canParse(href, location.href)) return;
    const target = new URL(href, location.href);
    const here = new URL(location.href);
    target.hash = here.hash = "";
    if (target.href !== here.href) redirect(target.href, pending);
  }

  function run() {
    const pending = takePending();
    const target = redirectTarget(location.href);
    if (target) {
      redirect(target, pending);
      return;
    }
    const linkSite = findRedirectSite(new URL(location.href));
    if (linkSite?.link) {
      whenReady(() => followShowAllLink(linkSite.link, pending));
      return;
    }
    const site = findMergeSite(location.hostname);
    if (site) {
      whenReady(() =>
        merge(site).catch((err) => console.error(TAG, "merge failed, page left untouched:", err)),
      );
    }
  }

  run();
})();
