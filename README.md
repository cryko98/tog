# MOG TOAD — $TOG

Official site for **MOG TOAD ($TOG)**, a Solana memecoin.
Static site — no build step, no dependencies. Deploys to Vercel as-is.

## Editing the links (the only file you need to touch)

Open `assets/js/main.js` and edit the `CONFIG` block at the very top:

```js
const CONFIG = {
  CA:        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // real contract address
  X_URL:     '',                              // 'https://x.com/yourhandle'
  BUY_URL:   '',                              // 'https://jup.ag/swap/SOL-<CA>'
  CHART_URL: '',                              // 'https://dexscreener.com/solana/<pair>'
  TELEGRAM:  ''
};
```

Everything on the page reads from here — nav, hero, contract boxes, footer, the final CTA.
While a URL is left empty, that link shows a small yellow "soon" dot and pops a toast
instead of going nowhere.

## Structure

```
index.html                the whole page
tog.png                   logo master (1024×1024) — every icon is generated from it
favicon.ico               multi-size icon (16/32/48)
site.webmanifest          PWA icons + theme colour
vercel.json               clean URLs + asset caching headers
robots.txt
assets/
  css/style.css           design system + every animation
  js/main.js              CONFIG + all interactions
  img/tog-sm|md|hero.jpg  logo at the three sizes the page actually uses
      icon-*.png          generated favicons / app icons
      og-image.png        1200×630 social share card
      memes/mog-NN.jpg    22 memes, 1024px — used by the lightbox
      memes/thumb/        500px versions — used by the wall and the archive grid
  _source/                original 2.5 MB meme renders (git-ignored)
```

### Adding more memes

Drop the full-size files in `assets/_source/`, then re-run the resize step —
or just export a 1024px JPEG into `assets/img/memes/` and a 500px one into
`assets/img/memes/thumb/` using the next free `mog-NN.jpg` number. Add a
`<button class="tile" data-lb="NN">` to the archive grid in `index.html` and the
lightbox picks it up automatically.

## Deploy to Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Other**. Build command: *(empty)*. Output directory: `./`
3. Deploy.

## Local preview

Any static server works, e.g.:

```bash
python -m http.server 3000
```

Then open `http://localhost:3000`.

## Design notes

Colours are lifted straight from the logo: low-poly toad greens (`#7ede2f`),
the electric blue backdrop (`#1226e0`), and the rainbow visor gradient
(pink → orange → yellow → green → cyan → blue) which is used for every accent,
heading fill and progress bar.

Effects: animated low-poly triangle mesh on canvas that reacts to the cursor,
3D tilt on the hero toad, scramble-in headings, scroll reveals, count-ups,
rainbow scroll rail, custom cursor, and an interactive Mog Meter.
Everything collapses gracefully under `prefers-reduced-motion`.

Easter egg: click the hero toad five times.

## Disclaimer

$TOG is a meme coin with no intrinsic value or expectation of financial return.
Nothing on the site is financial advice.
