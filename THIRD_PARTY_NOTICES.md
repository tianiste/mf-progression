# Third-party notices

Luckledger's own code and content (the logo, the brand files, the fallback star icon) are this project's. The item icons in `public/icons/` and some data come from others and stay theirs:

## Hypixel SkyBlock textures

`public/icons/hypixel/*.png` come from the official Hypixel SkyBlock Resource Pack (downloaded from the URL that the Hypixel API endpoint `/v2/resources/packs` lists). `public/icons/heads/*.png` are item player-head skins from the Hypixel API items resource (`/v2/resources/skyblock/items`), drawn as small isometric cubes by `scripts/import-icons.mjs`.

Copyright © 2026 Hypixel Inc. Used under the Hypixel SkyBlock Resource Pack License 1.0, which allows Hypixel-related websites to use the pack's assets as long as access is not sold or charged for. Luckledger is free, does not claim these textures as its own, and is not affiliated with or endorsed by Hypixel.

## Minecraft textures

`public/icons/minecraft/*.png` are taken from the official Minecraft 26.3 client (`assets/minecraft/textures`). © Mojang Studios. Used for a few item icons on this free, non-commercial fan site, following the Minecraft Usage Guidelines. Luckledger is not an official Minecraft product and is not approved by or associated with Mojang or Microsoft.

## NotEnoughUpdates-REPO

Attribute shard data (rarities and shards needed per level, used for the shard costs), Bestiary brackets and caps (`src/data/bestiary.json`, trimmed), pet levelling tables (`src/data/pet-levels.json`, trimmed) and the attribute shard head skins come from [NotEnoughUpdates-REPO](https://github.com/NotEnoughUpdates/NotEnoughUpdates-REPO) at commit `10f61150886e2c4a7151aeed0c2172bc0e4d2eca` (`constants/attribute_shards.json`, `constants/bestiary.json`, `constants/pets.json`, `items/ATTRIBUTE_SHARD_*.json`). The skins themselves are Hypixel's art.

> MIT License
>
> Copyright (c) 2020 Moulberry
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## SkyCrypt

Heads are drawn as isometric cubes the way [SkyCrypt](https://github.com/SkyCryptWebsite/SkyCrypt) (MIT License, Copyright (c) 2019-present Lea Seibert and other contributors) draws them; the renderer in `scripts/import-icons.mjs` is this project's own code. No SkyCrypt resource-pack files are used: the community packs in SkyCrypt are shared with SkyCrypt by their authors and are not covered by its MIT License.

## Community resource packs

FurfSky Reborn and other community packs are **not** included. `scripts/import-icons.mjs --furfsky <pack>` can use FurfSky Reborn textures, but only after the FurfSky Reborn team has given Luckledger permission; the permission given to SkyProgression does not cover this site.

## Market data

Auction House prices come from [SkyCofl](https://sky.coflnet.com) and are credited on the page wherever they appear. Bazaar prices come from the Hypixel API.

## Pixelify Sans

The wordmark and display text use Pixelify Sans (Copyright 2021 The Pixelify Sans Project Authors, <https://github.com/eifetx/Pixelify-Sans>), under the SIL Open Font License 1.1. The page loads it from Google Fonts; the logo files contain outlines of it.
