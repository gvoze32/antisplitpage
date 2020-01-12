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
// @match        *://*.kontan.co.id/*
// @match        *://*.kompasiana.com/*
// @match        *://*.motorplus-online.com/*
// @match        *://*.gridoto.com/*
// @match        *://*.suara.com/*
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
} else if (urlName.indexOf("kontan") != -1) {
    if (urlName.indexOf("?page=all") != -1) return false;
    var oldPath5 = window.location.pathname;
    if (!/\?page=all$/.test(oldPath5)) {
    var newPath5 = oldPath5 + "?page=all";
    window.location.replace(newPath5);
    }
}
} else if (urlName.indexOf("kompasiana") != -1) {
    if (urlName.indexOf("?page=all") != -1) return false;
    var oldPath6 = window.location.pathname;
    if (!/\?page=all$/.test(oldPath6)) {
    var newPath6 = oldPath6 + "?page=all";
    window.location.replace(newPath6);
    }
}
} else if (urlName.indexOf("motorplus-online") != -1) {
    if (urlName.indexOf("?page=all") != -1) return false;
    var oldPath7 = window.location.pathname;
    if (!/\?page=all$/.test(oldPath7)) {
    var newPath7 = oldPath7 + "?page=all";
    window.location.replace(newPath7);
    }
}
} else if (urlName.indexOf("gridoto") != -1) {
    if (urlName.indexOf("?page=all") != -1) return false;
    var oldPath8 = window.location.pathname;
    if (!/\?page=all$/.test(oldPath8)) {
    var newPath8 = oldPath8 + "?page=all";
    window.location.replace(newPath8);
    }
}
} else if (urlName.indexOf("suara") != -1) {
    if (urlName.indexOf("?page=all") != -1) return false;
    var oldPath9 = window.location.pathname;
    if (!/\?page=all$/.test(oldPath9)) {
    var newPath9 = oldPath9 + "?page=all";
    window.location.replace(newPath9);
    }
}
