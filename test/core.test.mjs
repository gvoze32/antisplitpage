import { test } from "node:test";
import assert from "node:assert/strict";
import { redirectTarget, findMergeSite, pagerOf, lastPage, pageUrl, MAX_PAGES } from "../src/core.js";
import { REDIRECT_SITES, MERGE_SITES } from "../src/sites.js";
import { PATH_PAGER, htmlSuffixPager } from "../src/rules.js";

// Every page URL of the article at `href`, as the merge would fetch them.
const pageUrls = (site, href, links) => {
  const pager = pagerOf(site);
  return Array.from({ length: lastPage(pager, href, links) }, (_, i) => pageUrl(pager, href, i + 1));
};

// [article URL, expected redirect target or null]
const REDIRECTS = [
  ["https://www.tribunnews.com/regional/7903720/slug", "https://www.tribunnews.com/regional/7903720/slug?page=all"],
  ["https://www.tribunnews.com/nasional/7903690/x?page=2#c", "https://www.tribunnews.com/nasional/7903690/x?page=all#c"],
  ["https://jateng.tribunnews.com/gebrakan-sang-pemimpin/kabinet-merah-putih", null],
  ["https://bola.kompas.com/read/2026/10/29/05431548/slug", "https://bola.kompas.com/read/2026/10/29/05431548/slug?page=all"],
  ["https://www.kompasiana.com/user/6ae1e8d0c925c4160f610ac2/slug", "https://www.kompasiana.com/user/6ae1e8d0c925c4160f610ac2/slug?page=all"],
  // A kompas.com pattern must not leak onto kompasiana.com (substring host).
  ["https://www.kompasiana.com/read/2026/10/29/123/x", null],
  ["https://news.detik.com/berita/d-8728268/slug", "https://news.detik.com/berita/d-8728268/slug?single=1"],
  ["https://notdetik.example.com/x/d-123/?ref=detik.com", null],
  ["https://www.inews.id/news/nasional/kpk-usut-dugaan", "https://www.inews.id/news/nasional/kpk-usut-dugaan/all"],
  ["https://www.inews.id/news/nasional/kpk-usut-dugaan/2", "https://www.inews.id/news/nasional/kpk-usut-dugaan/all"],
  ["https://www.inews.id/regional/lampung", null], // category: /all is a 404
  ["https://www.antaranews.com/berita/5818283/slug", "https://www.antaranews.com/berita/5818283/slug?page=all"],
  ["https://www.antaranews.com/tag/762/konflik", null],
  ["https://www.idxchannel.com/economics/the-fed-tahan/2", "https://www.idxchannel.com/economics/the-fed-tahan/all"],
  ["https://www.idxchannel.com/idxc-live/video-1/analisis-saham", null],
  ["https://www.ayobandung.com/topik-khusus/detail/18155/liputan-khusus", null],
  ["https://www.jpnn.com/news/slug", null], // merge site
];

test("redirects article pages to the show-all URL and leaves other pages alone", () => {
  for (const [url, want] of REDIRECTS) assert.equal(redirectTarget(url), want, url);
});

test("redirect targets are final (no second redirect, no loop)", () => {
  for (const [url, want] of REDIRECTS) if (want) assert.equal(redirectTarget(want), null, want);
});

test("no site redirects its homepage", () => {
  for (const { host } of REDIRECT_SITES) assert.equal(redirectTarget(`https://www.${host}/`), null, host);
});

test("each host has exactly one rule", () => {
  const hosts = [...REDIRECT_SITES, ...MERGE_SITES].map((s) => s.host);
  assert.deepEqual(hosts.filter((h, i) => hosts.indexOf(h) !== i), []);
});

test("merge sites match subdomains but not lookalike hosts", () => {
  assert.equal(findMergeSite("m.jpnn.com")?.host, "jpnn.com");
  assert.equal(findMergeSite("notjpnn.com"), undefined);
});

const jpnn = findMergeSite("www.jpnn.com");
const A = "https://www.jpnn.com/news/demo";

test("pageUrls includes pages hidden behind an ellipsis", () => {
  const links = [A, `${A}?page=2`, `${A}?page=4`, `${A}?page=4`];
  assert.deepEqual(pageUrls(jpnn, A, links), [A, `${A}?page=2`, `${A}?page=3`, `${A}?page=4`]);
});

test("pageUrls ignores page links of other articles", () => {
  const links = ["https://www.genpi.co/x?page=9", "https://www.jpnn.com/news/other?page=7"];
  assert.deepEqual(pageUrls(jpnn, A, links), [A]);
});

test("pageUrls starting from a later page still begins at page 1", () => {
  assert.deepEqual(pageUrls(jpnn, `${A}?page=2#top`, [`${A}?page=1`]), [A, `${A}?page=2`]);
});

test("pageUrls caps runaway page numbers", () => {
  assert.equal(pageUrls(jpnn, A, [`${A}?page=99999`]).length, MAX_PAGES);
});

test("path pager builds WordPress /N/ pages from any entry page", () => {
  const site = { pager: PATH_PAGER };
  const base = "https://jabarekspres.com/berita/2026/10/28/slug/";
  const want = [base, `${base}2/`, `${base}3/`];
  assert.deepEqual(pageUrls(site, base, [`${base}3/`, "https://jabarekspres.com/berita/2026/10/28/"]), want);
  assert.deepEqual(pageUrls(site, `${base}2/`, [base, `${base}3/`]), want);
});

test("html suffix pager builds ITmedia _N.html pages from any entry page", () => {
  const site = { pager: htmlSuffixPager("_") };
  const p = (s) => `https://www.itmedia.co.jp/business/articles/2610/28/news010${s}.html`;
  const other = "https://www.itmedia.co.jp/business/articles/2610/28/news011_9.html";
  assert.deepEqual(pageUrls(site, p(""), [p("_3"), other]), [p(""), p("_2"), p("_3")]);
  assert.deepEqual(pageUrls(site, p("_2"), [p(""), p("_3")]), [p(""), p("_2"), p("_3")]);
});

test("purepc pager maps page N to ?page=0,N-1", () => {
  const site = findMergeSite("www.purepc.pl");
  const a = "https://www.purepc.pl/test-dysku-ssd";
  const want = [a, `${a}?page=0,1`, `${a}?page=0,2`];
  assert.deepEqual(pageUrls(site, a, [`${a}?page=0,0`, `${a}?page=0,2`]), want);
  assert.deepEqual(pageUrls(site, `${a}?page=0,1`, [a, `${a}?page=0,2`]), want);
});

test("html suffix pager does not read a trailing article id as a page number", () => {
  const site = findMergeSite("www.golem.de");
  const a = "https://www.golem.de/news/leica-sl3-p-im-test-2610-214450";
  const want = [`${a}.html`, `${a}-2.html`, `${a}-3.html`, `${a}-4.html`];
  assert.deepEqual(pageUrls(site, `${a}.html`, [`${a}-2.html`, `${a}-4.html`]), want);
  assert.deepEqual(pageUrls(site, `${a}-3.html`, [`${a}.html`, `${a}-4.html`]), want);
});

test("slashless path pager builds Phoronix /N pages without a trailing slash", () => {
  const site = findMergeSite("www.phoronix.com");
  const a = "https://www.phoronix.com/review/ubuntu-2610-arrow-lake";
  const want = [a, `${a}/2`, `${a}/3`];
  assert.deepEqual(pageUrls(site, a, [`${a}/3`, "https://www.phoronix.com/review/other/9"]), want);
  assert.deepEqual(pageUrls(site, `${a}/2`, [a, `${a}/3`]), want);
});
