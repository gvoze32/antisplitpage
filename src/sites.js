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

import { query, pathSuffix, PAGE_ALL, ID_SLUG, PATH_PAGER, pathPager, queryPager, htmlSuffixPager } from "./rules.js";

export const REDIRECT_SITES = [
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

export const MERGE_SITES = [
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
