# mf-progression

A single-page Magic Find upgrade planner for Hypixel SkyBlock after the 0.27.3 Magic Find Rework. It lists every Magic Find source, ranks the ones you can buy by coins per Magic Find point, and shows what a budget gets you.

## Run it

Needs Node.js 20 or newer.

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
npm run build      # type-check and build to dist/
```

## Deploy to Cloudflare Workers

The built `dist/` folder is served as static assets by a Worker (see `wrangler.jsonc`).

```bash
npx wrangler login
npm run deploy
```

`npm run cf:dev` serves the built site locally through Wrangler.

## Use

- **Load a player:** enter a player name (or UUID) and your own Hypixel API key from [developer.hypixel.net](https://developer.hypixel.net). Combat level, pet score, slayer levels and Booster Cookie status are filled in. The player needs the Skills and Slayer API settings on. The key is kept only in your browser and sent only to `api.hypixel.net`.
- **Pick an activity:** Anything, Slayer bosses, Diana, Lava fishing, Sharks or Ghosts. Each adds the sources that only work there.
- **Tick what you own and fix prices:** the buy list re-sorts by coins per MF. Set a budget to see what fits.

Settings are saved in your browser's local storage.

## How Magic Find works after the rework

Drops = base chance × (1 + MF / 100), on every mob drop. Past 100% the extra becomes a chance to double the drop, and the stat caps at 500. Every point is worth the same, so the best upgrade is always the cheapest point you do not have yet.

Full source list, values and references: [docs/MECHANICS.md](docs/MECHANICS.md).

## Project layout

- `src/data/sources.ts`: every Magic Find source, activity, progress stat and toggle
- `src/lib/planner.ts`: buy order, running totals and budget
- `src/lib/hypixel.ts`: name to UUID, profile and Bazaar requests, reading profile fields
- `src/store.ts`: saved settings (browser local storage)
- `src/components/`: the page sections

## Status

Values follow Release Candidate #2 (12 Nov 2026). The update is scheduled for the 17 Nov 2026 maintenance, so numbers and prices may still change. Not yet loaded from the API: bestiary, account upgrades, pet levels, owned items and attribute shard levels (enter these by hand).

## APIs used

- Name to UUID: playerdb.co, mc-api.io, api.ashcon.app (first that answers)
- Hypixel API: `/v2/skyblock/profiles` (needs a key), `/v2/skyblock/bazaar` (no key)

Not affiliated with Hypixel or Mojang.
