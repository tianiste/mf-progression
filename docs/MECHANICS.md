# Magic Find mechanics and sources (0.27.3 rework)

Checked on 18 Nov 2026 against the 0.27.3 release notes (https://hypixel.net/threads/hypixel-skyblock-0-27-3-magic-find-rework-accessory-bag-revamp-and-more.6169127/, released 17 Nov 2026) and Hypixel's published per-boss slayer drop spreadsheets linked from them. Earlier checks used the Alpha wiki and the Release Candidate 1 and 2 threads.

## Payback time

One Magic Find point adds 1% of each drop's base chance (overflow past 100% becomes a chance to double, so the expected count stays linear). Per kill, a point is worth 1% of the mob's expected drop value: sum of chance × quantity × price, divided by 100. An upgrade that adds G points earns G × that × kills per hour, and pays for itself after cost ÷ that many hours.

Drop tables (`shared/mobs.ts`) come from the release notes (Mythological Ritual, Crimson Isle, Fishing Festival and Dwarven Mines tables) and Hypixel's published slayer spreadsheets (Revenant V, Tarantula V, Sven IV, Voidgloom IV, Inferno IV). Slayers now roll every drop on each kill. Ranges use the midpoint. The release settles the earlier disputes: Mythic Inquisitor Chimera I 2.5%, Mythic Champion Minos Relic 0.15%, Lord Jawbus Magma Lord Fragment 50%, Thunder 4 Silver Magmafish, Thunder Shard 50%, Flash I 4%. Runes, dyes, potions and skins are left out (no tradeable item id); the Ghost's 1M coin drop is the wiki's.

## Bestiary

Bestiary Magic Find is assumed to be +3 per tier on that family (the Alpha wiki lists +3 to +75; the release notes do not restate it). Tiers come from `bestiary.kills` in the profile with NotEnoughUpdates-REPO brackets and caps.

## Equipment rules the planner follows

- One helmet counts at a time: Clover Helmet, Crown of Greed or Avarice, Magma Lord Helmet and Sorrow armor compete for the helmet slot.
- One pet is active, so Griffin (King of Kings, Four-Eyed Fish) and Megalodon (Blood Scent) only count while that pet is equipped.
- Looting counts only on the item you kill with. It can go on swords, longswords, bows, fishing rods, drills, pickaxes, axes and the Gemstone Gauntlet (needs Enchanting III). Habanero Tactics counts only with a slayer weapon against Slayer bosses; Bobbin' Time goes on the fishing rod.

Research notes behind the calculator. Values match the 0.27.3 release (17 Nov 2026). Prices are Bazaar/AH snapshots from 16 Nov 2026 unless noted; the site uses live prices.

## Mechanics after the rework

- Drops = base chance x (1 + MF/100). Applies to ALL mob drops now, not only drops under 5%.
- Above 100% the overflow is a chance to double the drop (not +1).
- MF cap: 500 (was 900).
- Loot share uses your own MF, not the killer's.
- Every MF point is worth the same +1% of base, so the best upgrade is always the cheapest point not yet owned.
- Removed as MF sources: all pets' base MF (Golden Dragon, Goblin, Jade Dragon, Rat, Spider/Tarantula, Grandma Wolf, Mammoth, Mithril Golem), enrichments, Sorrow base MF, End cloaks, Lucky Clover, Lucky Dice, Legion, Jerry Candy, Dragon Horn, Superior armor, Entropy Suppressor, Rift Necklace, Miner's Blessing, Slayer Energy Drink, Hatcessories, SkyBlock levels (added then removed during alpha), Bucket of Dye (now dye chance), Nutcracker "Chilly" bonus (removed in RC2).
- Minos Relic, Hephaestus Relic, Chimera: unchanged, but no longer matter for MF because pets have none.

## MF sources (0.27.3 release)

### Work on every mob

| Source | MF | How / cost |
|---|---|---|
| Looting I-V | 2.5 / 5 / 7.5 / 10 / 15 | Enchanting table, XP only. Luck and Chance merged into Looting. Goes on swords, bows, rods, drills/pickaxes, axes. |
| Looting VI | 20 | 25 North Stars from Einary (seasonal). About 9.4-9.8k per North Star before the update, so about 245k. |
| Looting VII | 25 | Sphinx drop, 0.25% (Legendary Griffin) / 0.5% (Mythic). Temporary source. No market price yet. |
| Cinderbat Shard attribute | +0.5 per level, +5 at level 10 | 24 shards total. Bazaar id SHARD_CINDER_BAT, about 27k each on 16 Nov (about 650k to max). |
| Combat skill | +0.1/level (1-10), +0.2 (11-20), +0.3 (21-30), +0.4 (31-40), +0.5 (41-60). +20 at 60 | Grind |
| Pet Score | +1 to +13 at 10/25/50/75/100/130/175/225/275/325/375/450/500 | Grind/buy pets |
| Bestiary | per mob family, +45 at tier 15, +60 at 20, +75 at 25 | Grind |
| Booster Cookie | +10 (was +15) | About 14-15.4M per 4 days |
| God Potion / MF Potion IV | +10 (tiers 2.5/5/7.5/10) | God Potion about 1.6-1.75M (older AH data) |
| MF account upgrade (Elizabeth) | +1 to +5 | Cost not researched |
| Divine Gift | +1 each, max 5 | Now a consumable from the Regalia Room. New price unconfirmed; old book was 25M. Old books refund 1/2/4 via /reclaim. |
| Pulse Ring | 0.5 / 1 / 1.5 / 2 by rarity | Old guide estimates: Rare 7.5M, Epic 44M, Legendary 200M total. Dated. |
| Anguish Talisman/Ring/Artifact | 0.5 / 1 / 1.5 | Price not researched |
| Private Island Beacon | +0.5 per tier, +3 max | |
| Diana's Bookshelf | +1 | 75M in Regalia Room + drop 6 Chimera I |
| Necron's Ladder | +1 | 3 Necron Handle drops |
| Century Cake of the Next Dungeon Floor | +1 | Temporary |
| Beastslayer's Codex (Mythic) | +1 | Bestiary Milestone 300 |
| Clover Helmet | +5 flat | Kept at its live behaviour for this release; its rework comes with the Pet Luck revamp. |
| Extremely Real Shuriken | +5 on tagged mob | |
| Celestial Mason Jar | +1 (was 3) | |
| Witch stews (Year of the Witch) | +1 to +3 on one mob type each (not Mythological, Pest, Timid, Spooky) | 10k coins each, event only |
| Mayor Aatrox Pathfinder | +20, doubled on Slayer bosses | Mayor |
| Mayor Jerry Statspocalypse | +10% | Mayor |

### Mob-type attribute shards (+5 on that type unless noted)

Lava Flame (Magmatic), Minotaur (Mythological), Black Widow (Arthropod), Drowned (Undead), Wild Hog (Animal), Hideyho (Elusive), Parakeet (Airborne), Billygoat (Frozen), Chuckwalla (Subterranean), Hivethief (Cubic), Wiki Tiki (Construct), Giant Water Bug (Aquatic), Hewver (Critter), Hideonfloor (Woodland), Hideonwall (Arcane), Giant Isopod (on Fishing Islands), Silkbreeze (on Foraging Islands).

Bazaar unit prices on 16 Nov 2026 (coins per shard, instant buy): Drowned 12.0k, Hideyho 11.2k, Silkbreeze 13.6k, Parakeet 19.9k, Billygoat 24.8k, Cinderbat 27.3k, Hivethief 31.4k, Wiki Tiki 50.6k, Lava Flame 55.9k, Chuckwalla 60.5k, Minotaur 91.6k, Hideonwall 103k, Hideonfloor 104k, Giant Water Bug 109k, Giant Isopod 120k, Hewver 182k, Wild Hog 253k, Black Widow 510k. Each mob-type shard gives +0.5 per level, +5 at level 10 (the Alpha wiki lists Lava Flame as +0.5 to +5, not +10). Shards needed for level 10 by rarity, from NotEnoughUpdates-REPO `attribute_levelling`: Common 106, Uncommon 64, Rare 48, Epic 32, Legendary 24. Cinderbat is Legendary; Minotaur, Lava Flame and most mob-type shards are Rare; Silkbreeze and Giant Isopod (`SHARD_GIANT_ISOPOD`) are Epic.

### Slayer bosses

- Slayer level: +1 per level 1-8, +2 at level 9 (so +10) on that boss. Rift (vampire): +1 at levels 1-4, +2 at 5 (so +6).
- Wolf Fur Mixin: +5. Habanero Tactics IV/V: +4/+5, slayer weapons vs slayer bosses only.
- Slayer drop tables were rewritten; all drops roll on kill and are MF-affected. Several 10% drops were cut to 5%.

### Diana (Mythological)

Griffin "King of Kings" +0.1 to +10, Four-Eyed Fish +5 (was 13), Crown of Greed +5, Crown of Avarice +1 per counter digit (max +10; it is crafted from the Crown of Greed, and both are helmets), Golden Fleece +5, Diana's Favor (Carnival shop) +1 to +3, Daedalus Blade +0.1 per Mythological Bestiary tier (+0.2 fragged), Minotaur Shard +5.

### Fishing and others

- Lava: Magma Lord "Lord's Blessing" 2.5/5/7.5/10 on Lava Sea Creatures, a tiered set bonus over five pieces including the Magma Lord Necklace (RC2: 5/5 is +10, 4/5 plus a Clover Helmet is +12.5). Odger's tooth line +1 to +4 on Magmatic, Lava Flame Shard +5.
- Sharks: Shark Tooth line, renamed Talisman/Ring/Artifact/Relic/Heirloom in the release, +1 to +5, Megalodon "Blood Scent" +0.1 to +10, Denture Collector +1/2/3.
- Bobbin' Time: +0.6/0.8/1 Magic Find on Sea Creatures per nearby bobber, max 5 (so +5 at level V with five bobbers). The planner assumes +5.
- Animals: Researcher Ribery's line (Applicant's Statement, Student's Studies, Master's Thesis, PhD's Grimoire) +1/2/3/4 on Animal mobs.
- Tarantula: Shriveled Bracelet +5 on Arachne, the Broodmother and the Tarantula Broodfather.
- Automatons: Mole pet "Magnetic Nose" +0.1 to +10 (not in the planner).
- Ghosts: Sorrow Armor no longer gives base MF; its "Gravekeeper" tiered bonus gives 5/7.5/10 on Ghosts. Pieces needed per tier are not confirmed.
- Animals: Researcher Ribery's accessory line +1 to +4.
- Automatons: Mole "Magnetic Nose" +0.1 to +10.
- Shriveled Bracelet: +5 on Arachne, Broodmother, Tarantula Broodfather.

## Recommended path (cheapest MF first)

1. Looting V on the weapon: +15, XP only.
2. Free grind: Combat level, Pet Score, Bestiary on the target mob, slayer level.
3. Witch stew for the mob type (event only): +1 for 10k.
4. Looting VI: +5 more for about 245k (about 49k per MF).
5. Cinderbat Shard to level 10: +5 for about 650k (about 130k per MF).
6. Upkeep: Booster Cookie +10, God Potion +10.
7. Pulse Ring (Rare): +1 for about 7.5M.
8. Divine Gift x5: +5, about 25M per MF if the price holds.
9. Diana's Bookshelf: +1 for 75M plus drops.
10. Pulse Ring to Epic then Legendary: +0.5 each, about 73M and 312M per MF. Worst value.

Steps 1-5 give about +25 MF for under 1M coins. After that the cost per point jumps about 40x. For mob-specific farming, the matching attribute shard is likely the next best buy. Wait for a market price on Looting VII.

## Sources

- https://hypixel.net/threads/november-12-0-27-3-release-candidate-2.6171435/
- https://hypixel.net/threads/november-10-0-27-3-release-candidate.6171140/
- https://hypixel.net/threads/november-10-magic-find-rework-testing-6-accessory-bag-revamp-economy-changes-testing-3.6170932/
- https://hypixel.net/threads/november-3-magic-find-rework-testing-5-accessory-bag-revamp-economy-changes-testing-2.6168638/
- https://hypixel.net/threads/october-27-magic-find-rework-testing-4.6166283/
- https://hypixel.net/threads/october-23-magic-find-rework-testing-3-faq.6165335/
- https://hypixel.net/threads/october-22-magic-find-rework-testing-2.6164761/
- https://hypixel.net/threads/october-15-magic-find-rework-ghost-visitors.6162638/
- https://status.hypixel.net/
- https://hypixel.net/threads/hypixel-skyblock-0-27-3-magic-find-rework-accessory-bag-revamp-and-more.6169127/
- https://hypixelskyblock.minecraft.wiki/w/Magic_Find/Alpha
- https://hypixelskyblock.minecraft.wiki/w/Looting/Alpha
- https://hypixelskyblock.minecraft.wiki/w/Divine_Gift/Alpha
- https://hypixelskyblock.minecraft.wiki/w/Cinderbat_Shard
- https://skyblockprogress.com/shards
- https://skyblock.finance/flips/north-stars
