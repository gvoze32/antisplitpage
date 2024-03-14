// ==UserScript==
// @name         Anti Split Page
// @namespace    gvoze32/antisplitpage
// @version      2.6
// @description  Change split page mode to show all page
// @author       gvoze32
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
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

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
        { host: 'inews', param: '/all', articleUrlPattern: /\/\w+\/\w+/ }
    ];

    const site = sites.find(site => urlName.includes(site.host) && site.articleUrlPattern.test(urlPathname));

    if (site && !window.location.href.endsWith(site.param)) {
        const desiredUrl = `${urlPathname}${site.param}`;
        window.location.replace(desiredUrl);
    }
})();
