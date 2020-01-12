// ==UserScript==
// @name         Anti Split Page
// @namespace    gvoze32/antisplitpage
// @version      2.2.2
// @description  Change split page mode to show all page
// @author       gvoze32
// @grant        none
// @match        *://*.tribunnews.com/*
// @match        *://*.grid.id/*
// @match        *://*.kompas.com/*
// @match        *://*.detik.com/*
// @run-at       document-start
// ==/UserScript==

var urlName = window.location.href.toString()

if (urlName.indexOf("tribun") != -1) {
    if (urlName.indexOf("?page=all") != -1) return false;
    var oldPath = window.location.pathname;
    if (!/\?page=all$/.test(oldPath)) {
    var newPath = oldPath + "?page=all";
    window.location.replace(newPath);
    }
} else if (urlName.indexOf("grid") != -1) {
    if (urlName.indexOf("?page=all") != -1) return false;
    var oldPath2 = window.location.pathname;
    if (!/\?page=all$/.test(oldPath2)) {
    var newPath2 = oldPath2 + "?page=all";
    window.location.replace(newPath2);
    }
} else if (urlName.indexOf("kompas") != -1) {
    if (urlName.indexOf("?page=all") != -1) return false;
    var oldPath3 = window.location.pathname;
    if (!/\?page=all$/.test(oldPath3)) {
    var newPath3 = oldPath3 + "?page=all";
    window.location.replace(newPath3);
    }
} else if (urlName.indexOf("detik") != -1) {
    if (urlName.indexOf("?single=1") != -1) return false;
    var oldPath4 = window.location.pathname;
    if (!/\?single=1$/.test(oldPath4)) {
    var newPath4 = oldPath4 + "?single=1";
    window.location.replace(newPath4);
	}
}
