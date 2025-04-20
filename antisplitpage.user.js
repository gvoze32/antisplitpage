// ==UserScript==
// @name         Anti Split Page
// @namespace    gvoze32/antisplitpage
// @version      2.8.1
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
    // Updated grid pattern to match /read/ followed by any number of digits
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
  ];

  const site = sites.find(
    (site) =>
      urlName.includes(site.host) && site.articleUrlPattern.test(urlPathname)
  );

  // Refined check for Method 1 redirection
  let shouldRedirect = false;
  if (site) {
    if (site.param.startsWith("?")) {
      // Check query parameters
      const paramKey = site.param.substring(1).split("=")[0];
      const paramValue = site.param.substring(1).split("=")[1];
      if (urlParams.get(paramKey) !== paramValue) {
        shouldRedirect = true;
      }
    } else if (site.param.startsWith("/")) {
      // Check if pathname ends with the parameter (like /all)
      if (!urlPathname.endsWith(site.param)) {
        // Avoid redirecting if the pathname already ends with a slash and param is just '/'
        if (!(site.param === "/" && urlPathname.endsWith("/"))) {
          shouldRedirect = true;
        }
      }
    }
  }

  if (shouldRedirect) {
    let desiredUrl;
    // Construct the target URL based on parameter type
    if (site.param.startsWith("?")) {
      const newParams = new URLSearchParams(urlSearch);
      const paramKey = site.param.substring(1).split("=")[0];
      const paramValue = site.param.substring(1).split("=")[1];
      newParams.set(paramKey, paramValue);
      // Keep existing hash if present
      desiredUrl =
        urlPathname + "?" + newParams.toString() + window.location.hash;
    } else if (site.param.startsWith("/")) {
      // Handle path-based parameters like /all
      if (urlPathname.endsWith("/")) {
        // Avoid double slash if pathname already ends with /
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
  let mode = 1;

  if (urlName.includes("jpnn.com")) {
    console.log("URL mengandung Jpnn.com");
    articleBodySelector = 'div[itemprop="articleBody"]';
    removeSelectors = ".baca-juga";
    removeElements = ".pagination";
    mode = 1;
  } else if (urlName.includes("okezone.com")) {
    console.log("URL mengandung Okezone.com");
    articleBodySelector = 'div[itemprop="articleBody"]';
    removeSelectors = "#bacajuga";
    removeElements =
      '#rctiplus, .box-gnews, .paging, .detads-bottom, .detail-tag, .video-wrap, .iframe-banner, p[style="font-weight:bold;text-align:center;"]';
    mode = 1;
  } else if (urlName.includes("mojok.co")) {
    console.log("URL mengandung Mojok.co");
    articleBodySelector = ".content-inner";
    removeSelectors =
      '.jnews_inline_related_post_wrapper, .jnews_inline_related_post, .jeg_post_tags, .post-modified-info, p:has(a[href*="/2"])';
    removeElements =
      ".jeg_pagelinks, .jeg_pagination, .jeg_pagenav_1, .jeg_alignleft, .no_navtext";
    mode = 2;
  } else if (urlName.includes("genpi.co")) {
    console.log("URL mengandung Genpi.co");
    articleBodySelector = 'div[itemprop="articleBody';
    removeSelectors = ".baca-juga";
    removeElements =
      '.pagination, p.text-center[style="margin-top:-35px;font-size:small"]';
    mode = 1;
  } else if (urlName.includes("disway.id")) {
    console.log("URL mengandung Disway.id");
    articleBodySelector = "div.post.text-black-1";
    removeSelectors =
      'h1.text-black, .post-info, .ads-slot, p:has(strong > a[href*="disway.id/read"]), .text-center[style*="background-color:#f2f2f2"], p.bottom-15:has(small), .text-center > .row > .pagination, p:has(strong > a[href*="disway.id/read"])';
    removeElements = ".text-center > .row > .pagination, .ads-slot";
    mode = 3;
  } else {
    console.log("Situs tidak didukung");
  }

  function getArticleBody(url) {
    return new Promise((resolve, reject) => {
      $.get(url, function (data) {
        let $articleBody = $(data).find(articleBodySelector);
        $articleBody.find(removeSelectors).remove();
        let articleBody = $articleBody.html();
        resolve(articleBody);
      }).fail(function () {
        reject("Error mengambil article body");
      });
    });
  }

  if ($(articleBodySelector).length > 0) {
    let pageUrls = [];
    let currentPage = 1;

    let nextPageLink;

    while (true) {
      let url = currentUrl;
      if (currentPage > 1) {
        if (mode == 1) {
          url += `?page=${currentPage}`;
        } else if (mode == 2) {
          url += `${currentPage}/`;
        } else if (mode == 3) {
          url += `/offset/${currentPage * 15}`;
        }
      }
      pageUrls.push(url);
      currentPage++;

      if (mode == 1) {
        nextPageLink = $(`a[href*="?page=${currentPage}"]`);
      } else if (mode == 2) {
        nextPageLink = $(`a[href*="/${currentPage}/"]`);
      } else if (mode == 3) {
        nextPageLink = $(`a[href*="/offset/${currentPage * 15}"]`);
      }

      if (!nextPageLink || nextPageLink.length === 0) {
        break;
      }
    }

    Promise.all(pageUrls.map((url) => getArticleBody(url)))
      .then((articleBodies) => {
        const combinedBody = articleBodies.join("<br><br>");
        const $articleContainer = $(articleBodySelector);
        $articleContainer.html(combinedBody);
        $(removeElements).remove();
      })
      .catch((error) => console.error(error));
  }
})();
