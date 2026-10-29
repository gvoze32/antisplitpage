<img src="icons/icon-128.png" width="64" align="right" alt="">

# Anti Split Page

Shows split (paginated) news articles on a single page. Available as a browser extension for Chrome and Firefox, or as a userscript.

## Install

Use **one** of these.

### Userscript (all browsers)

1. Install a userscript manager: [Tampermonkey](https://www.tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/)
   or [FireMonkey](https://addons.mozilla.org/firefox/addon/firemonkey/).
2. Open **[antisplitpage.user.js](https://raw.githubusercontent.com/gvoze32/antisplitpage/master/antisplitpage.user.js)**,
   then click **Install**.

Updates arrive automatically through the manager.

### Chrome, Edge, Brave, Opera

1. Download `antisplitpage-chrome-<version>.zip` from [Releases](https://github.com/gvoze32/antisplitpage/releases/latest), then unzip it.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked**, then choose the unzipped folder.

### Firefox 140+

1. Download `antisplitpage-firefox-<version>.zip` from [Releases](https://github.com/gvoze32/antisplitpage/releases/latest), then unzip it.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on**, then pick `manifest.json` from the unzipped folder.

A temporary add-on is removed when Firefox restarts. A permanent install needs the add-on signed through
[AMO](https://addons.mozilla.org/developers/).

### Updating the extension

Click the extension icon, then **Check for updates**. If a newer version exists, download it and load it the
same way you installed it.

## How it works

- **Redirect**: on sites with their own "show all" URL (e.g. `?page=all`), article pages are redirected to it before the page renders. Where only a few articles are split (heise, KitGuru), the article's own "view all pages" link is followed instead, so unsplit articles don't reload. The split URL is replaced in history, so Back still works.
- **Merge**: on sites without one, every page is fetched and the article bodies are joined in place, separated by a line. Pages hidden behind "…" in the pager are included. If any page fails to load, the article is left as-is.

## Supported sites

| Country | Redirect | Merge |
|---|---|---|
| 🇮🇩 Indonesia | Tribunnews, Grid, Kompas, Detik, Kontan, Kompasiana, Motorplus-online, Gridoto, Suara, iNews, Viva, Jawapos, Jagodangdut, Sahijab, 100kpj, tvOnenews, Bolasport, Suaramerdeka, Pikiran-rakyat, IDN Times, Okezone, Disway, Antaranews, Kompas.tv, Parapuan, Juara, Intipseleb, IDX Channel, Investor.id, Hops, Zonajakarta, Jatimnetwork, Indozone, Fajar, Ayobandung | JPNN, GenPI, Liputan6, Jabar Ekspres |
| 🇯🇵 Japan | J-CAST | Yahoo! News Japan, PRESIDENT Online, Diamond Online, Bunshun Online, Gendai, JBpress, ITmedia |
| 🇩🇪 Germany | heise online | Golem.de |
| 🇵🇱 Poland | | PurePC |
| 🇬🇧 United Kingdom | KitGuru | HEXUS |
| 🇺🇸 United States | | Tom's Hardware, Phoronix, HotHardware, ServeTheHome |
| 🇨🇳 China | MyDrivers (快科技) | |

Subdomains are included (e.g. regional `*.tribunnews.com`, `bola.kompas.com`).

### Checked, no page split

- 🇮🇩 Tempo, CNN Indonesia, Bisnis, Medcom, Beritasatu, Sindonews, Merdeka, Media Indonesia, Katadata, Mojok, CNBC Indonesia, Republika, Tirto, VOI, Kapanlagi, Bola.com, Bola.net, Fimela, Dream, Harian Jogja, Popbela, Popmama, Akurat, Era, RMOL, Metrotvnews, Hipwee, Warta Ekonomi, Inilah
- 🇯🇵 Mainichi, Newsweek Japan, ASCII, Nikkan Sports, Oricon, Smart FLASH, Mynavi News, zakzak, 4Gamer, Gizmodo Japan
- 🇩🇪🇦🇹🇨🇭 FAZ, Spiegel, Welt, t-online, Focus, Stern, CHIP, Notebookcheck, NZZ, Der Standard
- 🇵🇱🇨🇿 Benchmark.pl, iDNES, CNews.cz
- 🇪🇺 Le Monde, Le Figaro, Clubic, Les Numériques, Jeuxvideo.com, Corriere, Everyeye, Multiplayer.it, El Mundo, Xataka, HardZone, 3DJuegos, io-tech, The Guardian, BBC, Eurogamer, Trusted Reviews, Tweakers (single page by default)
- 🌎 TechSpot, PC Gamer, Legit Reviews, IGN, UOL, Infobae, Clarín, NDTV, Times of India
- 🌏 IT之家, Sina, PConline, ETtoday, UDN, Liberty Times, Dong-A Ilbo, VnExpress, GenK, Thairath, Sanook

## Build from source

```sh
npm run build    # node build.mjs: needs Node 20+ and zip
npm run check    # userscript up to date with src/, unit tests
```

The extensions go to `dist/` and the userscript to `antisplitpage.user.js` (generated, committed so its update URL serves the latest build).

```
src/rules.js   redirect strategies and pagers (URL schemes)
src/sites.js   the site list (format documented at the top)
src/core.js    pure logic: site lookup, redirect target, page discovery
src/main.js    runtime: redirect / fetch-and-merge
extension/     popup (version, update check)
icons/         icon.svg (source) and rendered PNGs
test/          node --test
```

To add a site, add an entry to `src/sites.js`, plus a redirect case in `test/core.test.mjs` for redirect sites, then run the build.

To release a new version:

1. Bump `version` in `package.json`.
2. Run the build.
3. Commit and push.
4. Run `gh release create v<version> dist/antisplitpage-*-<version>.zip antisplitpage.user.js`.
