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
var stringPathName = window.location.href.toString()

if (stringPathName.indexOf("tribun") != -1) {
    if (window.location.href.toString().indexOf("?page=all") != -1) return false;
    var pathLama = window.location.pathname;
    if (!/\?page=all$/.test(pathLama)) {
    var pathBaru = pathLama + "?page=all";
    window.location.replace(pathBaru);
    }
 } else if (stringPathName.indexOf("detik") != -1) {
    if (window.location.href.toString().indexOf("?single=1") != -1) return false;
    var pathLamadua = window.location.pathname;
    if (!/\?single=1$/.test(pathLamadua)) {
    var pathBarudua = pathLamadua + "?single=1";
    window.location.replace(pathBarudua);
    }
} else if (stringPathName.indexOf("grid") != -1) {
    if (window.location.href.toString().indexOf("?page=all") != -1) return false;
    var pathLamatiga = window.location.pathname;
    if (!/\?page=all$/.test(pathLamatiga)) {
    var pathBarutiga = pathLamatiga + "?page=all";
    window.location.replace(pathBarutiga);
    }
} else if (stringPathName.indexOf("kompas") != -1) {
    if (window.location.href.toString().indexOf("?page=all") != -1) return false;
    var pathLamaempat = window.location.pathname;
    if (!/\?page=all$/.test(pathLamaempat)) {
    var pathBaruempat = pathLamaempat + "?page=all";
    window.location.replace(pathBaruempat);
    }
}