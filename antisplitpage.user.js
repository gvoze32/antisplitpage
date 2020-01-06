// ==UserScript==
// @name         Anti Split Page
// @namespace    gvoze32/antisplitpage
// @version      1.0
// @description  Change split page mode to show all page
// @author       gvoze32
// @grant        none
// @match        *://*.tribunnews.com/*
// @match        *://*.grid.id/*
// @run-at       document-start
// ==/UserScript==

if (window.location.href.toString().indexOf("?page=all") != -1) return false;
var oldUrlPath= window.location.pathname;
    if ( ! /\?page=all$/.test (oldUrlPath) ) {
    var newURL= oldUrlPath + "?page=all";
        window.location.replace (newURL);
}
