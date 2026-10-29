// URL strategies used by the site list (src/sites.js).

// ---------------------------------------------------------------------------
// Redirect strategies: given the current URL (a mutable copy), return the
// site's own "show all pages" URL, or null when it is already applied.
// ---------------------------------------------------------------------------

export const query = (key, value) => (url) => {
  if (url.searchParams.get(key) === value) return null;
  url.searchParams.set(key, value);
  return url;
};

// Replaces an optional trailing "/<page number>" with `suffix`.
export const pathSuffix = (suffix) => (url) => {
  if (url.pathname.endsWith(suffix)) return null;
  url.pathname = url.pathname.replace(/(?:\/\d+)?\/?$/, suffix);
  return url;
};

export const PAGE_ALL = query("page", "all");

// "/<category>/<numeric id>/<slug>", shared by many CMSes (PRMN, KG, MNC, ...).
export const ID_SLUG = /^\/(?!tag\/)[\w-]+\/\d+\/[\w-]+/;

// ---------------------------------------------------------------------------
// Pagers (merge method): `parse` maps a URL to { article, n }, where `article`
// identifies the article regardless of page; `build` returns the URL of page n.
// Both receive a mutable URL copy.
// ---------------------------------------------------------------------------

// "?key=N" (page 1 = no key). `encode`/`decode` map page numbers to the
// parameter value for sites that don't use plain numbers.
export const queryPager = (key, encode = String, decode = Number) => ({
  parse(url) {
    const value = url.searchParams.get(key);
    return { article: url.origin + url.pathname, n: (value !== null && decode(value)) || 1 };
  },
  build(url, n) {
    url.searchParams.delete(key);
    // Appended raw: searchParams would encode "0,1" as "0%2C1", which some
    // servers reject.
    if (n !== 1) url.search += `${url.search ? "&" : "?"}${key}=${encode(n)}`;
    return url;
  },
});

export const QUERY_PAGER = queryPager("page");

// ".../slug/" or ".../slug" is page 1, ".../slug/N/" or ".../slug/N" is page N.
// `slash`: whether page URLs end with "/" (WordPress) or not (Phoronix, Tom's
// Hardware, which reject the other form). N has at most two digits, so a
// trailing numeric article id is not mistaken for a page number.
const PAGE_SEGMENT = /\/(\d{1,2})\/?$/;
const articlePath = (path) => path.replace(PAGE_SEGMENT, "").replace(/\/$/, "");

export const pathPager = (slash) => ({
  parse: (url) => ({
    article: url.origin + articlePath(url.pathname),
    n: Number(url.pathname.match(PAGE_SEGMENT)?.[1]) || 1,
  }),
  build(url, n) {
    url.pathname = `${articlePath(url.pathname)}${n === 1 ? "" : `/${n}`}${slash ? "/" : ""}`;
    return url;
  },
});

// WordPress <!--nextpage-->.
export const PATH_PAGER = pathPager(true);

// ".../news010.html" is page 1, ".../news010<sep>N.html" is page N (ITmedia: "_").
// N has at most two digits, so a trailing article id ("…-2610-214450.html" on
// golem.de) is not mistaken for a page number.
export const htmlSuffixPager = (sep) => {
  const re = new RegExp(`^(.*?)(?:${sep}(\\d{1,2}))?\\.html$`);
  return {
    parse(url) {
      const m = url.pathname.match(re);
      return { article: url.origin + (m ? m[1] : url.pathname), n: Number(m?.[2]) || 1 };
    },
    build(url, n) {
      const base = url.pathname.match(re)?.[1];
      if (base !== undefined) url.pathname = `${base}${n === 1 ? "" : `${sep}${n}`}.html`;
      return url;
    },
  };
};
