Show split (paginated) Indonesian news articles on a single page.

### Install

First you need to install either one of these user-script add-ons for your browser:

- [FireMonkey](https://addons.mozilla.org/en-US/firefox/addon/firemonkey) for Firefox
- [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) for Chrome

Then open [this](https://raw.githubusercontent.com/gvoze32/antisplitpage/master/antisplitpage.user.js) to show Install dialog.

### How it works

- **Redirect**: on sites with a built-in "show all" URL (e.g. `?page=all`), article pages are redirected to it before the page renders. The split URL is replaced in history, so Back still works.
- **Merge**: on sites without one, every `?page=N` is fetched and the article bodies are joined in place. If any page fails to load, the article is left as-is.

### Supported Sites

#### Redirect

- Tribunnews.com
- Grid.id
- Kompas.com
- Detik.com
- Kontan.co.id
- Kompasiana.com
- Motorplus-online.com
- Gridoto.com
- Suara.com
- Inews.id
- Viva.co.id
- Jawapos.com
- Jagodangdut.com
- Sahijab.com
- 100kpj.com
- Tvonenews.com
- Bolasport.com
- Suaramerdeka.com
- Pikiran-rakyat.com
- Idntimes.com
- Okezone.com
- Disway.id
- Antaranews.com
- Kompas.tv
- Parapuan.co
- Juara.net
- Intipseleb.com
- Idxchannel.com
- Investor.id
- Hops.id
- Zonajakarta.com
- Jatimnetwork.com
- Indozone.id
- Fajar.co.id

#### Merge

- Jpnn.com
- Genpi.co
- Liputan6.com

### Safe sites (no page split)

- Tempo.co
- Cnnindonesia.com
- Bisnis.com
- Medcom.id
- Beritasatu.com
- Sindonews.com
- Merdeka.com
- Mediaindonesia.com
- Katadata.co.id
- Mojok.co
- Cnbcindonesia.com
- Republika.co.id
- Tirto.id
- Voi.id
- Kapanlagi.com
- Bola.com
- Bola.net
- Fimela.com
- Dream.co.id
- Harianjogja.com
- Popbela.com
- Popmama.com
- Akurat.co
- Era.id
- Rmol.id
- Metrotvnews.com
- Hipwee.com
- Wartaekonomi.co.id
