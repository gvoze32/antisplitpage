// ==UserScript==
// @name         Anti Split Page
// @namespace    gvoze32/antisplitpage
// @version      2.7.3
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
    // START JPNN.COM
    function getArticleBody(url) {
        return new Promise((resolve, reject) => {
          $.get(url, function(data) {
            let $articleBody = $(data).find('div[itemprop="articleBody"]');
            $articleBody.find('.baca-juga').remove();
            let articleBody = $articleBody.html();
            resolve(articleBody);
          }).fail(function() {
            reject('Error mengambil article body');
          });
        });
      }

    let currentUrl = window.location.href;
    if (urlName.includes('jpnn.com') && $('div[itemprop="articleBody"]').length > 0) {
      console.log('URL mengandung jpnn.com');
      console.log('Element articleBody ditemukan');
      let pageUrls = [];
      let currentPage = 1;
  
      while (true) {
        let url = currentUrl;
        if (currentPage > 1) {
          url += `?page=${currentPage}`;
        }
        pageUrls.push(url);
        currentPage++;
  
        let nextPageLink = $(`a[href*="?page=${currentPage}"]`);
        if (nextPageLink.length === 0) {
          break;
        }
      }
  
      Promise.all(pageUrls.map(url => getArticleBody(url)))
        .then(articleBodies => {
          const combinedBody = articleBodies.join('<br><br>');
          const $articleContainer = $('div[itemprop="articleBody"]');
          $articleContainer.html(combinedBody);
          $('.pagination').remove();
        })
        .catch(error => console.error(error));
    }
})();