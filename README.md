# Luckledger

![Luckledger](brand/export/luckledger-horizontal.png)

Luckledger is a Magic Find upgrade planner for Hypixel SkyBlock after the 0.27.3 Magic Find Rework. It lists every Magic Find source, ranks the ones you can buy by coins per Magic Find point, and shows what a budget gets you.

## Run it

Needs Node.js 20 or newer.

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
npm run build      # type-check and build to dist/
```

For live Auction House prices during development, also run the price Worker in a second terminal:

```bash
npm run dev:api    # Worker on http://localhost:8787; the dev server forwards /api to it
```

Without it the page falls back to Bazaar prices fetched straight from Hypixel.

## Deploy to Cloudflare Workers

The built `dist/` folder is served as static assets by a Worker (see `wrangler.jsonc`).

```bash
npx wrangler login
npm run deploy
```

`npm run cf:dev` builds the site and serves it through Wrangler, with `/api/prices` included. The first deploy creates the `PRICES` KV namespace.

## Prices

A Worker (`worker/`) keeps one price bundle in Workers KV and serves it at `/api/prices`. A cron trigger every five minutes refreshes:

- **Bazaar** instant-buy prices from the Hypixel API, at most every 9 minutes.
- **Auction House** prices from [SkyCofl](https://sky.coflnet.com) (`/api/item/price/<id>/current`, or `/bin?Rarity=` for one rarity), up to 10 per run, about one request a second to stay inside Coflnet's limits. A price that could not be refreshed for 24 hours is dropped.

Which item prices each Magic Find source is in `shared/price-spec.ts`. Sources without a market (event shops, Carnival tickets, island upgrades) keep their fixed estimate, and anything typed into the list wins over a live price.

## Use

- **Load a player:** enter a player name (or UUID) and your own Hypixel API key from [developer.hypixel.net](https://developer.hypixel.net). Combat level, pet score, slayer levels and Booster Cookie status are filled in. The player needs the Skills and Slayer API settings on. The key is kept only in your browser and sent only to `api.hypixel.net`.
- **Pick an activity:** Anything, Slayer bosses, Diana, Lava fishing, Sharks or Ghosts. Each adds the sources that only work there.
- **Tick what you own and fix prices:** the buy list re-sorts by coins per MF. Set a budget to see what fits.

Settings are saved in your browser's local storage.

## How Magic Find works after the rework

Drops = base chance × (1 + MF / 100), on every mob drop. Past 100% the extra becomes a chance to double the drop, and the stat caps at 500. Every point is worth the same, so the best upgrade is always the cheapest point you do not have yet.

Full source list, values and references: [docs/MECHANICS.md](docs/MECHANICS.md).

## Brand

The mark is a ranked ledger: three rows getting longer (pricier) downward, with the cheapest row ending in the Magic Find star. The full logo kit (symbol, small-size cut, lockups, one-colour versions, web icons, presentation board) is in `brand/`; see [brand/GUIDELINES.md](brand/GUIDELINES.md) for colours, clear space and usage. `brand/concepts/` keeps the other two directions that were considered.

## Project layout

- `src/data/sources.ts`: every Magic Find source, activity, progress stat and toggle
- `src/lib/planner.ts`: buy order, running totals and budget
- `src/lib/hypixel.ts`: name to UUID, profile and Bazaar requests, reading profile fields
- `src/store.ts`: saved settings (browser local storage)
- `src/lib/prices.ts`: loads the price bundle (or Bazaar-only prices) and turns it into a cost per source
- `src/components/`: the page sections
- `shared/price-spec.ts`: item ids and quantities that price each source
- `worker/`: the Cloudflare Worker (static site, `/api/prices`, price cron)

## Status

Values follow Release Candidate #2 (12 Nov 2026). The update is scheduled for the 17 Nov 2026 maintenance, so numbers and prices may still change. Not yet loaded from the API: bestiary, account upgrades, pet levels, owned items and attribute shard levels (enter these by hand).

## APIs used

- Name to UUID: playerdb.co, mc-api.io, api.ashcon.app (first that answers)
- Hypixel API: `/v2/skyblock/profiles` (needs a key), `/v2/skyblock/bazaar` (no key)
- SkyCofl (Coflnet) item prices, from the Worker only

Not affiliated with Hypixel or Mojang.
