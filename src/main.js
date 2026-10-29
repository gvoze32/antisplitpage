// Entry point: runs at document-start on every matched page.

import { redirectTarget, findRedirectSite, findMergeSite, pagerOf, lastPage, pageUrl } from "./core.js";

const TAG = "AntiSplitPage:";

// Remembers the last redirect target so a server that strips the parameter
// and bounces us back cannot cause a redirect loop.
const PENDING_KEY = "antisplitpage:pending";

function takePending() {
  try {
    const pending = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return pending;
  } catch {
    return null;
  }
}

function redirect(target, pending) {
  if (target === pending) {
    console.warn(TAG, "site bounced back from", target, "- not redirecting again");
    return;
  }
  try {
    sessionStorage.setItem(PENDING_KEY, target);
  } catch {
    // Storage unavailable: redirect without loop protection.
  }
  console.log(TAG, "redirecting to", target);
  // replace() keeps the split URL out of history, so Back is not trapped.
  location.replace(target);
}

async function fetchPage(site, url, isFirst) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  // res.text() always decodes UTF-8; Shift_JIS/EUC-JP sites often declare their
  // charset only in a <meta> tag, which the live page's characterSet reflects.
  const charset = /charset=["']?([\w-]+)/i.exec(res.headers.get("content-type") ?? "")?.[1];
  const html = new TextDecoder(charset ?? document.characterSet).decode(await res.arrayBuffer());
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.querySelector(site.body);
  if (!body) throw new Error(`"${site.body}" not found in ${url}`);
  const links = Array.from(doc.querySelectorAll("a[href]"), (a) => a.getAttribute("href"))
    .filter((link) => URL.canParse(link, url))
    .map((link) => new URL(link, url).href);
  const remove = isFirst || !site.repeat ? site.strip : `${site.strip}, ${site.repeat}`;
  for (const el of body.querySelectorAll(remove)) el.remove();
  return { body, links };
}

async function merge(site) {
  const live = document.querySelector(site.body);
  if (!live) return;
  const pager = pagerOf(site);
  const href = location.href;
  let last = lastPage(pager, href, Array.from(document.querySelectorAll("a[href]"), (a) => a.href));
  if (last < 2) return;

  // Fetch until no fetched page links to a later one (windowed pagers).
  // Any failed page aborts the merge: a partial article with its pagination
  // removed would silently hide content.
  const bodies = [];
  while (bodies.length < last) {
    const batch = Array.from({ length: last - bodies.length }, (_, i) => bodies.length + i + 1);
    const pages = await Promise.all(batch.map((n) => fetchPage(site, pageUrl(pager, href, n), n === 1)));
    for (const page of pages) {
      bodies.push(page.body);
      last = Math.max(last, lastPage(pager, href, page.links));
    }
  }

  const nodes = [];
  bodies.forEach((body, i) => {
    if (i > 0) {
      const hr = document.createElement("hr");
      hr.style.cssText = "margin: 2em 0; border: 0; border-top: 1px solid #ccc;";
      nodes.push(hr);
    }
    nodes.push(...body.childNodes);
  });
  live.replaceChildren(...nodes);
  if (site.hide) for (const el of document.querySelectorAll(site.hide)) el.remove();
  console.log(TAG, "merged", bodies.length, "pages");
}

function whenReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}

function followShowAllLink(selector, pending) {
  // An <a href>, or an <option value> of a page-jump <select>.
  const link = document.querySelector(selector);
  const href = link?.href || link?.value;
  if (!href || !URL.canParse(href, location.href)) return;
  const target = new URL(href, location.href);
  const here = new URL(location.href);
  target.hash = here.hash = "";
  if (target.href !== here.href) redirect(target.href, pending);
}

function run() {
  const pending = takePending();
  const target = redirectTarget(location.href);
  if (target) {
    redirect(target, pending);
    return;
  }
  const linkSite = findRedirectSite(new URL(location.href));
  if (linkSite?.link) {
    whenReady(() => followShowAllLink(linkSite.link, pending));
    return;
  }
  const site = findMergeSite(location.hostname);
  if (site) {
    whenReady(() =>
      merge(site).catch((err) => console.error(TAG, "merge failed, page left untouched:", err)),
    );
  }
}

run();
