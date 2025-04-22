// ==UserScript==
// @name         Anti Split Page
// @namespace    gvoze32/antisplitpage
// @version      2.8.3
// @description  Change split page mode to show all page
// @author       gvoze32
// @homepageURL  https://github.com/gvoze32/antisplitpage
// @supportURL   https://github.com/gvoze32/antisplitpage/issues
// @updateURL    https://raw.githubusercontent.com/gvoze32/antisplitpage/master/antisplitpage.user.js
// @downloadURL  https://raw.githubusercontent.com/gvoze32/antisplitpage/master/antisplitpage.user.js
// @icon         https://cdn-icons-png.flaticon.com/512/6455/6455714.png
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @grant        none
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
// @match        *://*.jpnn.com/*
// @match        *://*.okezone.com/*
// @match        *://*.mojok.co/*
// @match        *://*.genpi.co/*
// @match        *://*.suaramerdeka.com/*
// @match        *://*.pikiran-rakyat.com/*
// @match        *://*.disway.id/*
// @match        *://*.idntimes.com/*
// ==/UserScript==

(function () {
  "use strict";

  // --- Method 1: Redirect ---
  const urlName = window.location.href.toString();
  const urlPathname = window.location.pathname;
  const urlSearch = window.location.search;
  const urlParams = new URLSearchParams(urlSearch);

  const sites = [
    {
      host: "tribunnews",
      param: "?page=all",
      articleUrlPattern: /\/\w+\/\d{4}\/\d{2}\/\d{2}/,
    },
    { host: "grid", param: "?page=all", articleUrlPattern: /\/read\/\d+/ },
    {
      host: "kompas",
      param: "?page=all",
      articleUrlPattern: /\/read\/\d{4}\/\d{2}\/\d{2}/,
    },
    { host: "detik", param: "?single=1", articleUrlPattern: /\/\w+\/d-\d+/ },
    {
      host: "kontan",
      param: "?page=all",
      articleUrlPattern: /\/\w+\/news\/\w+/,
    },
    {
      host: "kompasiana",
      param: "?page=all",
      articleUrlPattern: /\/\w+\/\d{8}/,
    },
    {
      host: "motorplus-online",
      param: "?page=all",
      articleUrlPattern: /\/read\/\d{9}/,
    },
    { host: "gridoto", param: "?page=all", articleUrlPattern: /\/read\/\d{9}/ },
    {
      host: "suara",
      param: "?page=all",
      articleUrlPattern: /\/\w+\/\d{4}\/\d{2}\/\d{2}/,
    },
    { host: "inews", param: "/all", articleUrlPattern: /\/\w+\/\w+/ },
    { host: "viva", param: "?page=all", articleUrlPattern: /\/\w+\/\d+/ },
    { host: "jawapos", param: "?page=all", articleUrlPattern: /\/\d+\// },
    {
      host: "jagodangdut",
      param: "?page=all",
      articleUrlPattern: /\/\w+\/\d+/,
    },
    { host: "sahijab", param: "?page=all", articleUrlPattern: /\/\w+\/\d+/ },
    { host: "100kpj", param: "?page=all", articleUrlPattern: /\/\w+\/\d+/ },
    { host: "tvonenews", param: "?page=all", articleUrlPattern: /\/\w+\/\d+/ },
    { host: "bolasport", param: "?page=all", articleUrlPattern: /\/read\/\d+/ },
    {
      host: "suaramerdeka",
      param: "?page=all",
      articleUrlPattern: /\/\w+\/\d+/,
    },
    {
      host: "pikiran-rakyat",
      param: "?page=all",
      articleUrlPattern: /\/pr-\d+/,
    },
    {
      host: "idntimes",
      param: "?page=all",
      articleUrlPattern: /\/\w+\/\w+\/[-a-z0-9]+/,
    },
  ];

  const site = sites.find(
    (site) =>
      urlName.includes(site.host) && site.articleUrlPattern.test(urlPathname)
  );

  let shouldRedirect = false;
  if (site) {
    if (site.param.startsWith("?")) {
      const paramKey = site.param.substring(1).split("=")[0];
      const paramValue = site.param.substring(1).split("=")[1];
      if (urlParams.get(paramKey) !== paramValue) {
        shouldRedirect = true;
      }
    } else if (site.param.startsWith("/")) {
      if (!urlPathname.endsWith(site.param)) {
        if (!(site.param === "/" && urlPathname.endsWith("/"))) {
          shouldRedirect = true;
        }
      }
    }
  }

  if (shouldRedirect) {
    let desiredUrl;
    if (site.param.startsWith("?")) {
      const newParams = new URLSearchParams(urlSearch);
      const paramKey = site.param.substring(1).split("=")[0];
      const paramValue = site.param.substring(1).split("=")[1];
      newParams.set(paramKey, paramValue);
      desiredUrl =
        urlPathname + "?" + newParams.toString() + window.location.hash;
    } else if (site.param.startsWith("/")) {
      if (urlPathname.endsWith("/")) {
        desiredUrl =
          urlPathname.slice(0, -1) +
          site.param +
          urlSearch +
          window.location.hash;
      } else {
        desiredUrl =
          urlPathname + site.param + urlSearch + window.location.hash;
      }
    }

    if (desiredUrl) {
      console.log(`AntiSplitPage: Redirecting to ${desiredUrl}`);
      window.location.assign(desiredUrl);
    }
  }

  // --- Method 2: Merge Content ---
  let currentUrl = window.location.href;
  let articleBodySelector = "";
  let removeSelectors = "";
  let removeElements = "";
  let mode = 0;

  if (urlName.includes("jpnn.com")) {
    console.log("AntiSplitPage: Matched jpnn.com (Mode 1)");
    articleBodySelector = 'div[itemprop="articleBody"]';
    removeSelectors = ".baca-juga, .pagination";
    removeElements = ".pagination";
    mode = 1;
  } else if (urlName.includes("okezone.com")) {
    console.log("AntiSplitPage: Matched okezone.com (Mode 1)");
    articleBodySelector = 'div[itemprop="articleBody"]';
    removeSelectors =
      '#bacajuga, #rctiplus, .box-gnews, .paging, .detads-bottom, .detail-tag, .video-wrap, .iframe-banner, p[style*="font-weight:bold"], .reporter';
    removeElements =
      '#rctiplus, .box-gnews, .paging, .detads-bottom, .detail-tag, .video-wrap, .iframe-banner, p[style*="font-weight:bold"]';
    mode = 1;
  } else if (urlName.includes("mojok.co")) {
    console.log("AntiSplitPage: Matched mojok.co (Mode 2)");
    articleBodySelector = ".content-inner";
    removeSelectors =
      '.jnews_inline_related_post_wrapper, .jnews_inline_related_post, .jeg_post_tags, .post-modified-info, p:has(a[href*="/2"]), .jeg_pagelinks, .jeg_pagination, .jeg_pagenav_1, .jeg_alignleft, .no_navtext';
    removeElements =
      ".jeg_pagelinks, .jeg_pagination, .jeg_pagenav_1, .jeg_alignleft, .no_navtext";
    mode = 2;
  } else if (urlName.includes("genpi.co")) {
    console.log("AntiSplitPage: Matched genpi.co (Mode 1)");
    articleBodySelector = 'div[itemprop="articleBody"]';
    removeSelectors =
      '.baca-juga, .pagination, p.text-center[style*="margin-top:-35px"]';
    removeElements = '.pagination, p.text-center[style*="margin-top:-35px"]';
    mode = 1;
  } else if (urlName.includes("disway.id")) {
    console.log("AntiSplitPage: Matched disway.id (Mode 3)");
    articleBodySelector = "div.post.text-black-1";
    removeSelectors =
      '.ads-slot, p:has(strong > a[href*="disway.id/read"]), .text-center[style*="background-color:#f2f2f2"], .text-center > .row > .pagination';
    removeElements = ".text-center > .row > .pagination, .ads-slot";
    mode = 3;
  } else {
    mode = 0;
  }

  function getArticleBody(url) {
    return new Promise((resolve, reject) => {
      $.get(url, function (data) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        const articleBodyNode = doc.querySelector(articleBodySelector);

        if (articleBodyNode) {
          articleBodyNode
            .querySelectorAll(removeSelectors)
            .forEach((el) => el.remove());
          let articleHtml = articleBodyNode.innerHTML.trim();
          resolve(articleHtml);
        } else {
          console.warn(
            `AntiSplitPage: Article body selector "${articleBodySelector}" not found on ${url}`
          );
          resolve("");
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error(
          `AntiSplitPage: Error fetching ${url}: ${textStatus}`,
          errorThrown
        );
        resolve("");
      });
    });
  }

  if (mode > 0 && $(articleBodySelector).length > 0) {
    console.log(
      `AntiSplitPage: Running Method 2 (Mode ${mode}) for ${window.location.hostname}`
    );

    let pageUrls = [];
    let paginationLinks = [];
    if (mode === 1) {
      paginationLinks = $('a[href*="?page="]')
        .map((i, a) => $(a).attr("href"))
        .get();
    } else if (mode === 2) {
      paginationLinks = $('a[href*="/"]')
        .filter((i, a) => /\/\d+\/?$/.test($(a).attr("href")))
        .map((i, a) => $(a).attr("href"))
        .get();
    } else if (mode === 3) {
      paginationLinks = $("ul.pagination a[data-ci-pagination-page]")
        .map((i, a) => $(a).attr("href"))
        .get();
    }

    let uniqueAbsoluteUrls = [
      ...new Set(
        paginationLinks.map((url) => new URL(url, window.location.origin).href)
      ),
    ];

    let baseUrl = currentUrl;
    try {
      let currentUrlParsed = new URL(currentUrl);
      if (mode === 1) {
        currentUrlParsed.searchParams.delete("page");
        baseUrl =
          currentUrlParsed.origin +
          currentUrlParsed.pathname +
          currentUrlParsed.search +
          currentUrlParsed.hash;
      } else if (mode === 2) {
        baseUrl =
          currentUrl.replace(/\/\d+\/?$/, "") +
          currentUrlParsed.search +
          currentUrlParsed.hash;
      } else if (mode === 3) {
        baseUrl =
          currentUrl.replace(/\/\d+$/, "") +
          currentUrlParsed.search +
          currentUrlParsed.hash;
      }
      baseUrl = baseUrl.replace(/\/$/, "");
    } catch (e) {
      console.error("AntiSplitPage: Error normalizing base URL", e);
    }

    let baseIncluded = uniqueAbsoluteUrls.some((url) => {
      try {
        let parsed = new URL(url);
        let urlBase = url;
        if (mode === 1) {
          parsed.searchParams.delete("page");
          urlBase =
            parsed.origin + parsed.pathname + parsed.search + parsed.hash;
        } else if (mode === 2) {
          urlBase = url.replace(/\/\d+\/?$/, "") + parsed.search + parsed.hash;
        } else if (mode === 3) {
          urlBase = url.replace(/\/\d+$/, "") + parsed.search + parsed.hash;
        }
        return urlBase.replace(/\/$/, "") === baseUrl;
      } catch (e) {
        return false;
      }
    });

    if (!baseIncluded) {
      uniqueAbsoluteUrls.push(
        baseUrl + (window.location.search || "") + window.location.hash
      );
    }

    pageUrls = uniqueAbsoluteUrls.sort((a, b) => {
      let pageA = 1,
        pageB = 1;
      try {
        const urlA = new URL(a);
        const urlB = new URL(b);
        if (mode === 1) {
          pageA = parseInt(urlA.searchParams.get("page") || "1");
          pageB = parseInt(urlB.searchParams.get("page") || "1");
        } else if (mode === 2) {
          pageA = parseInt(urlA.pathname.match(/\/(\d+)\/?$/)?.[1] || "1");
          pageB = parseInt(urlB.pathname.match(/\/(\d+)\/?$/)?.[1] || "1");
        } else if (mode === 3) {
          let offsetA = parseInt(urlA.pathname.match(/\/(\d+)$/)?.[1] || "0");
          let offsetB = parseInt(urlB.pathname.match(/\/(\d+)$/)?.[1] || "0");
          pageA = offsetA === 0 ? 1 : offsetA / 15 + 1;
          pageB = offsetB === 0 ? 1 : offsetB / 15 + 1;
        }
      } catch (e) {
        console.error(
          "AntiSplitPage: Error parsing page number for sorting:",
          a,
          b,
          e
        );
      }
      return pageA - pageB;
    });

    pageUrls = [...new Set(pageUrls)];

    console.log("AntiSplitPage: Detected page URLs:", pageUrls);

    if (pageUrls.length > 1) {
      Promise.all(pageUrls.map((url) => getArticleBody(url)))
        .then((articleBodies) => {
          const validBodies = articleBodies.filter(
            (body) => body && body.trim().length > 0
          );
          if (validBodies.length > 0) {
            const combinedBody = validBodies.join(
              '<hr style="margin: 2em 0; border-top: 1px solid #ccc;">'
            );
            const $articleContainer = $(articleBodySelector);
            $articleContainer.html(combinedBody);
            $(removeElements).remove();
            console.log("AntiSplitPage: Content combined successfully.");
          } else {
            console.warn(
              "AntiSplitPage: No valid article bodies found after fetching. Check selectors/network."
            );
            $(removeElements).remove();
          }
        })
        .catch((error) => {
          console.error("AntiSplitPage: Error combining pages:", error);
          $(removeElements).remove();
        });
    } else if ($(articleBodySelector).length > 0) {
      console.log(
        "AntiSplitPage: No pagination detected or only one page. Cleaning current page."
      );
      $(articleBodySelector).find(removeSelectors).remove();
      $(removeElements).remove();
    }
  }
})();
