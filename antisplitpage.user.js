// ==UserScript==
// @name         Anti Split Page
// @namespace    gvoze32/antisplitpage
// @version      2.7.5
// @description  Change split page mode to show all page
// @author       gvoze32
// @homepageURL  https://github.com/gvoze32/antisplitpage
// @supportURL   https://github.com/gvoze32/antisplitpage/issues
// @icon         https://cdn-icons-png.flaticon.com/512/6455/6455714.png
// @require      https://code.jquery.com/jquery-3.6.0.min.js
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
// ==/UserScript==

(function() {
    'use strict';

    // USING METHOD 1
    const urlName = window.location.href.toString();
    const urlPathname = window.location.pathname;

    const sites = [
        { host: 'tribunnews', param: '?page=all', articleUrlPattern: /\/\w+\/\d{4}\/\d{2}\/\d{2}/ },
        { host: 'grid', param: '?page=all', articleUrlPattern: /\/read\/\d{6}/ },
        { host: 'kompas', param: '?page=all', articleUrlPattern: /\/read\/\d{4}\/\d{2}\/\d{2}/ },
        { host: 'detik', param: '?single=1', articleUrlPattern: /\/\w+\/d-\d+/ },
        { host: 'kontan', param: '?page=all', articleUrlPattern: /\/\w+\/news\/\w+/ },
        { host: 'kompasiana', param: '?page=all', articleUrlPattern: /\/\w+\/\d{8}/ },
        { host: 'motorplus-online', param: '?page=all', articleUrlPattern: /\/read\/\d{9}/ },
        { host: 'gridoto', param: '?page=all', articleUrlPattern: /\/read\/\d{9}/ },
        { host: 'suara', param: '?page=all', articleUrlPattern: /\/\w+\/\d{4}\/\d{2}\/\d{2}/ },
        { host: 'inews', param: '/all', articleUrlPattern: /\/\w+\/\w+/ },
        { host: 'viva', param: '?page=all', articleUrlPattern: /\/\w+\/\d+/ },
      	{ host: 'jawapos', param: '?page=all', articleUrlPattern: /\/\d+\//},
      	{ host: 'jagodangdut', param: '?page=all', articleUrlPattern: /\/\w+\/\d+/},
      	{ host: 'sahijab', param: '?page=all', articleUrlPattern: /\/\w+\/\d+/},
      	{ host: '100kpj', param: '?page=all', articleUrlPattern: /\/\w+\/\d+/},
        { host: 'tvonenews', param: '?page=all', articleUrlPattern: /\/\w+\/\d+/},
        { host: 'bolasport', param: '?page=all', articleUrlPattern: /\/read\/\d+/}
    ];

    const site = sites.find(site => urlName.includes(site.host) && site.articleUrlPattern.test(urlPathname));

    if (site && !window.location.href.endsWith(site.param)) {
        const desiredUrl = `${urlPathname}${site.param}`;
        window.location.replace(desiredUrl);
    }

    // USING METHOD 2
    let currentUrl = window.location.href;
    let articleBodySelector = '';
    let removeSelectors = '';
    let removeElements = '';
    let mode = 1;

    if (urlName.includes('jpnn.com')) {
        console.log('URL mengandung Jpnn.com');
        articleBodySelector = 'div[itemprop="articleBody"]';
        removeSelectors = '.baca-juga';
        removeElements = '.pagination'
        mode = 1;
    } else if (urlName.includes('okezone.com')) {
        console.log('URL mengandung Okezone.com');
        articleBodySelector = 'div[itemprop="articleBody"]';
        removeSelectors = '#bacajuga';
        removeElements = '#rctiplus, .box-gnews, .paging, .detads-bottom, .detail-tag, .video-wrap, .iframe-banner, p[style="font-weight:bold;text-align:center;"]'
        mode = 1;
    } else if (urlName.includes('mojok.co')) {
        console.log('URL mengandung Mojok.co');
        articleBodySelector = '.content-inner';
        removeSelectors = '.jnews_inline_related_post_wrapper, .jnews_inline_related_post, .jeg_post_tags, .post-modified-info, p:has(a[href*="/2"])';
        removeElements = '.jeg_pagelinks, .jeg_pagination, .jeg_pagenav_1, .jeg_alignleft, .no_navtext'
        mode = 2;
    } else if (urlName.includes('genpi.co')) {
        console.log('URL mengandung Genpi.co');
        articleBodySelector = 'div[itemprop="articleBody';
        removeSelectors = '.baca-juga';
        removeElements = '.pagination, .p.text-center:contains("Silakan baca konten menarik lainnya dari GenPI.co di Google News")'
        mode = 1;
    } else {
        console.log('Situs tidak didukung');
    }

    function getArticleBody(url) {
        return new Promise((resolve, reject) => {
          $.get(url, function(data) {
            let $articleBody = $(data).find(articleBodySelector);
            $articleBody.find(removeSelectors).remove();
            let articleBody = $articleBody.html();
            resolve(articleBody);
          }).fail(function() {
            reject('Error mengambil article body');
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
              }
          }
          pageUrls.push(url);
          currentPage++;

          if (mode == 1) {
              nextPageLink = $(`a[href*="?page=${currentPage}"]`);
          } else if (mode == 2) {
              nextPageLink = $(`a[href*="/${currentPage}/"]`);
          }

          if (!nextPageLink || nextPageLink.length === 0) {
              break;
          }
      }

      Promise.all(pageUrls.map(url => getArticleBody(url)))
        .then(articleBodies => {
          const combinedBody = articleBodies.join('<br><br>');
          const $articleContainer = $(articleBodySelector);
          $articleContainer.html(combinedBody);
          $(removeElements).remove();
        })
        .catch(error => console.error(error));
    }
})();
