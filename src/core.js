// Pure logic: site lookup, redirect targets, page URL discovery.

import { QUERY_PAGER } from "./rules.js";
import { REDIRECT_SITES, MERGE_SITES } from "./sites.js";

// Guards against a bogus "?page=99999" link triggering thousands of fetches.
export const MAX_PAGES = 30;

export const onHost = (site, hostname) =>
  hostname === site.host || hostname.endsWith(`.${site.host}`);

export const findRedirectSite = (url) =>
  REDIRECT_SITES.find((s) => onHost(s, url.hostname) && s.article.test(url.pathname));

// The show-all URL for the article at `href` when it can be built from the URL
// alone (`to` sites), or null.
export function redirectTarget(href) {
  const url = new URL(href);
  return findRedirectSite(url)?.to?.(url)?.href ?? null;
}

export const findMergeSite = (hostname) => MERGE_SITES.find((s) => onHost(s, hostname));

export const pagerOf = (site) => site.pager ?? QUERY_PAGER;

// Highest page of the article at `href` linked from `links` (or `href` itself).
// Pagers are often windowed ("1 2 3 … 9"), so callers feed in links from every
// fetched page until this stops growing.
export function lastPage(pager, href, links) {
  const here = pager.parse(new URL(href));
  let last = here.n;
  for (const link of links) {
    if (!URL.canParse(link, href)) continue;
    const { article, n } = pager.parse(new URL(link, href));
    if (article === here.article && Number.isInteger(n) && n > last) last = n;
  }
  return Math.min(last, MAX_PAGES);
}

export function pageUrl(pager, href, n) {
  const url = new URL(href);
  url.hash = "";
  return pager.build(url, n).href;
}
