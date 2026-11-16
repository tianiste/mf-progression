// Magic Find sources after the 0.27.3 rework (Release Candidate #2 values).
// See docs/MECHANICS.md for references and dates.

export type ActivityId = 'all' | 'slayer' | 'diana' | 'lava' | 'shark' | 'ghost'

export interface Activity {
  id: ActivityId
  name: string
  note: string
}

export const ACTIVITIES: Activity[] = [
  { id: 'all', name: 'Anything', note: 'Only sources that work on every mob.' },
  { id: 'slayer', name: 'Slayer bosses', note: 'Adds slayer-level Magic Find and slayer-only items. Aatrox counts double here.' },
  { id: 'diana', name: 'Diana (Mythological)', note: 'Adds Griffin, crown, fleece and Daedalus Blade sources.' },
  { id: 'lava', name: 'Lava fishing', note: 'Adds Magmatic and Lava Sea Creature sources.' },
  { id: 'shark', name: 'Sharks', note: 'Adds Shark-only sources.' },
  { id: 'ghost', name: 'Ghosts', note: 'Adds the Sorrow Armor Gravekeeper bonus.' },
]

export type ChipKind = 'seasonal' | 'event' | 'no market yet' | 'verify price' | 'old estimate'

export interface Source {
  id: string
  act: ActivityId
  name: string
  mf: number
  /** Cost in coins. null = no known price, the user fills it in. */
  cost: number | null
  note: string
  /** id of the tier this one upgrades; it can never be bought before that tier. */
  need?: string
  chip?: ChipKind
  /**
   * Equipment slot it takes. Only one item per slot counts, so a helmet that gives less than the
   * helmet you already have adds nothing.
   */
  slot?: Slot
  /** Which item the upgrade goes on, if that matters; per activity where it differs. */
  goesOn?: string | Partial<Record<ActivityId, string>>
  /** Only counts against this mob type; listed only when the picked mob has it. */
  mobType?: string
  /** Generic row shown only while no mob is picked. */
  onlyWithoutMob?: boolean
  /** Does not work on these mob types. */
  notForTypes?: string[]
}

export type Slot = 'helmet' | 'petItem'
export const SLOT_NAME: Record<Slot, string> = { helmet: 'helmet', petItem: 'pet item' }

const LOOTING_ON: Partial<Record<ActivityId, string>> = {
  all: 'the weapon you kill with (sword, longsword, bow, fishing rod, drill, pickaxe, axe or Gemstone Gauntlet)',
  slayer: 'your slayer weapon',
  diana: 'your Daedalus Blade, which also gives Magic Find from Mythological Bestiary',
  lava: 'the weapon or rod you kill Lava Sea Creatures with',
  shark: 'the weapon or rod you kill Sharks with',
  ghost: 'the weapon you kill Ghosts with',
}

/** Where a source goes for the chosen activity, or undefined when it doesn't matter. */
export function goesOn(s: Source, act: ActivityId): string | undefined {
  if (!s.goesOn) return undefined
  return typeof s.goesOn === 'string' ? s.goesOn : (s.goesOn[act] ?? s.goesOn.all)
}

export const SOURCES: Source[] = [
  { id: 'loot5', act: 'all', name: 'Looting V on your weapon', mf: 15, cost: 0, goesOn: LOOTING_ON, note: 'Enchanting table, XP only (needs Enchanting III). Old Looting, Luck and Chance convert to it.' },
  { id: 'loot6', act: 'all', need: 'loot5', name: 'Looting VI', mf: 5, cost: 245_000, chip: 'seasonal', goesOn: LOOTING_ON, note: '+20 total. 25 North Stars from Einary (about 9.8k per star before the update).' },
  { id: 'loot7', act: 'all', need: 'loot6', name: 'Looting VII', mf: 5, cost: null, chip: 'no market yet', goesOn: LOOTING_ON, note: '+25 total. 0.5% Sphinx drop. Temporary source.' },
  { id: 'cinder', act: 'all', name: 'Cinderbat Shard attribute to level 10', mf: 5, cost: 864_000, note: 'Legendary shard: 24 to max, +0.5 per level.' },
  { id: 'stew', act: 'all', notForTypes: ['Mythological', 'Pest', 'Timid', 'Spooky'], name: 'Witch stew for your mob type', mf: 1, cost: 10_000, chip: 'event', note: '10k coins each during Year of the Witch. +1 to +3 on one mob type (not Mythological, Pest, Timid or Spooky), one stew per type.' },
  { id: 'typeshard', act: 'all', onlyWithoutMob: true, name: 'Mob-type shard for your target', mf: 5, cost: null, note: '+5 on one mob type, for example Black Widow (Arthropod), Drowned (Undead), Wild Hog (Animal), Hideyho (Elusive), Parakeet (Airborne). Most are Rare shards: 48 to max.' },
  { id: 'dgift', act: 'all', name: 'Divine Gift ×5', mf: 5, cost: 125_000_000, chip: 'verify price', note: 'Now a consumable, +1 each, max 5, Regalia Room. Priced here at the old 25M book price. Old Divine Gift books refund 1, 2 or 4.' },
  { id: 'pulseR', act: 'all', name: 'Pulse Ring (Rare)', mf: 1, cost: 7_500_000, chip: 'old estimate', note: 'Ring values doubled: 0.5 / 1 / 1.5 / 2 by rarity.' },
  { id: 'pulseE', act: 'all', need: 'pulseR', name: 'Pulse Ring to Epic', mf: 0.5, cost: 36_500_000, chip: 'old estimate', note: '17 more Thunder in a Bottle.' },
  { id: 'pulseL', act: 'all', need: 'pulseE', name: 'Pulse Ring to Legendary', mf: 0.5, cost: 156_000_000, chip: 'old estimate', note: '80 more bottles. Worst value on the list.' },
  { id: 'anguish', act: 'all', name: 'Anguish Artifact', mf: 1.5, cost: null, note: 'Halved from +3. Talisman +0.5, Ring +1.' },
  { id: 'shelf', act: 'all', name: "Diana's Bookshelf", mf: 1, cost: 75_000_000, note: '75M in the Regalia Room, then drop 6 Chimera I yourself.' },
  { id: 'cake', act: 'all', name: 'Century Cake of the Next Dungeon Floor', mf: 1, cost: null, note: 'Temporary buff when eaten.' },
  { id: 'beacon', act: 'all', name: 'Private Island Beacon, max tier', mf: 3, cost: null, note: 'Halved: +0.5 per tier, +3 at the top.' },
  { id: 'ladder', act: 'all', name: "Necron's Ladder", mf: 1, cost: null, note: 'Needs 3 Necron Handle drops while holding it.' },
  { id: 'clover', act: 'all', name: 'Clover Helmet', mf: 5, cost: null, slot: 'helmet', note: "Kept as a helmet for now, flat +5. Shen's Auction item." },
  { id: 'shuriken', act: 'all', name: 'Extremely Real Shuriken', mf: 5, cost: null, note: '+5 on the mob you tag with it.' },
  { id: 'shard_undead', act: 'all', mobType: 'Undead', name: 'Drowned Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Undead mobs. Rare shard: 48 to max.' },
  { id: 'shard_arthropod', act: 'all', mobType: 'Arthropod', name: 'Black Widow Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Arthropod mobs. Rare shard: 48 to max.' },
  { id: 'shard_animal', act: 'all', mobType: 'Animal', name: 'Wild Hog Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Animal mobs. Rare shard: 48 to max.' },
  { id: 'shard_elusive', act: 'all', mobType: 'Elusive', name: 'Hideyho Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Elusive mobs. Rare shard: 48 to max.' },
  { id: 'shard_airborne', act: 'all', mobType: 'Airborne', name: 'Parakeet Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Airborne mobs. Rare shard: 48 to max.' },
  { id: 'shard_frozen', act: 'all', mobType: 'Frozen', name: 'Billygoat Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Frozen mobs. Rare shard: 48 to max.' },
  { id: 'shard_subterranean', act: 'all', mobType: 'Subterranean', name: 'Chuckwalla Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Subterranean mobs. Rare shard: 48 to max.' },
  { id: 'shard_cubic', act: 'all', mobType: 'Cubic', name: 'Hivethief Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Cubic mobs. Rare shard: 48 to max.' },
  { id: 'shard_construct', act: 'all', mobType: 'Construct', name: 'Wiki Tiki Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Construct mobs. Rare shard: 48 to max.' },
  { id: 'shard_aquatic', act: 'all', mobType: 'Aquatic', name: 'Giant Water Bug Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Aquatic mobs. Rare shard: 48 to max.' },
  { id: 'shard_critter', act: 'all', mobType: 'Critter', name: 'Hewver Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Critter mobs. Rare shard: 48 to max.' },
  { id: 'shard_woodland', act: 'all', mobType: 'Woodland', name: 'Hideonfloor Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Woodland mobs. Rare shard: 48 to max.' },
  { id: 'shard_arcane', act: 'all', mobType: 'Arcane', name: 'Hideonwall Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Arcane mobs. Rare shard: 48 to max.' },
  { id: 'jar', act: 'all', name: 'Celestial Mason Jar', mf: 1, cost: null, note: 'Cut from 3 to 1.' },

  { id: 'wolffur', act: 'slayer', name: 'Wolf Fur Mixin', mf: 5, cost: null, note: '+5 on Slayer bosses.' },
  { id: 'haban', act: 'slayer', name: 'Habanero Tactics V', mf: 5, cost: null, goesOn: 'your slayer weapon', note: 'Counts only with a slayer weapon against Slayer bosses. Level IV gives +4.' },

  { id: 'minoshard', act: 'diana', mobType: 'Mythological', name: 'Minotaur Shard attribute to level 10', mf: 5, cost: null, note: '+5 on Mythological mobs. Rare shard: 48 to max.' },
  { id: 'fish', act: 'diana', name: 'Four-Eyed Fish on Griffin', mf: 5, cost: null, slot: 'petItem', goesOn: 'your Griffin pet, which must be the active pet', note: 'Pet item. Was +13.' },
  { id: 'greed', act: 'diana', name: 'Crown of Greed', mf: 5, cost: null, slot: 'helmet', note: '+5 on Mythological mobs (was +10).' },
  { id: 'avarice', act: 'diana', need: 'greed', name: 'Crown of Avarice, full counter', mf: 5, cost: null, slot: 'helmet', note: 'Upgrade of the Crown of Greed (crafted from it). +1 per counter digit, +10 at max, so +5 over Greed.' },
  { id: 'fleece', act: 'diana', name: 'Golden Fleece', mf: 5, cost: null, note: '+5 on Mythological mobs.' },
  { id: 'favor', act: 'diana', name: "Diana's Favor (Carnival shop)", mf: 3, cost: null, note: 'Bought with Carnival tickets.' },

  { id: 'lavashard', act: 'lava', mobType: 'Magmatic', name: 'Lava Flame Shard attribute to level 10', mf: 5, cost: null, note: '+0.5 per level on Magmatic mobs, +5 at 10. Rare shard: 48 to max.' },
  { id: 'magma4', act: 'lava', name: 'Magma Lord Armor 4/5, no helmet', mf: 7.5, cost: null, note: "Chestplate, leggings, boots and the Magma Lord Necklace. Lord's Blessing on Lava Sea Creatures: +7.5 at 4 pieces, +10 at 5." },
  { id: 'magma5', act: 'lava', need: 'magma4', name: 'Magma Lord Helmet (5/5)', mf: 2.5, cost: null, slot: 'helmet', note: 'The fifth piece adds +2.5. A Clover Helmet gives +5 instead, so 4/5 with a Clover Helmet (+12.5) beats 5/5 (+10).' },
  { id: 'odger', act: 'lava', name: "Odger's Diamond Tooth", mf: 4, cost: null, note: '+1 to +4 on Magmatic mobs by tier.' },
  { id: 'bobbinL', act: 'lava', name: "Bobbin' Time V", mf: 5, cost: null, goesOn: 'your fishing rod', note: 'Scales with nearby fishing players; +5 is a typical party. The wiki lists up to +20.' },

  { id: 'sharktooth', act: 'shark', name: 'Razor-sharp Shark Tooth Necklace', mf: 5, cost: null, note: 'Top of the Shark Tooth Necklace line, +1 to +5 by tier.' },
  { id: 'denture', act: 'shark', name: 'Denture Collector (Carnival shop)', mf: 3, cost: null, note: '+1 / 2 / 3.' },
  { id: 'bobbinS', act: 'shark', name: "Bobbin' Time V", mf: 5, cost: null, goesOn: 'your fishing rod', note: 'Scales with nearby fishing players; +5 is a typical party. The wiki lists up to +20.' },

  { id: 'sorrow', act: 'ghost', name: 'Sorrow Armor, full Gravekeeper bonus', mf: 10, cost: null, slot: 'helmet', note: 'Gravekeeper: +5 / 7.5 / 10 on Ghosts. Base Magic Find removed. How many pieces each tier needs is not confirmed yet.' },
]

export type BossId = 'zombie' | 'spider' | 'wolf' | 'enderman' | 'blaze' | 'vampire'

export const BOSSES: { id: BossId; name: string }[] = [
  { id: 'zombie', name: 'Revenant Horror' },
  { id: 'spider', name: 'Tarantula Broodfather' },
  { id: 'wolf', name: 'Sven Packmaster' },
  { id: 'enderman', name: 'Voidgloom Seraph' },
  { id: 'blaze', name: 'Inferno Demonlord' },
  { id: 'vampire', name: 'Riftstalker Bloodfiend (Rift)' },
]

export type ProgressId = 'combat' | 'pet' | 'acct' | 'best' | 'codex' | 'slv' | 'griffin' | 'myth' | 'mega'

export interface ProgressStat {
  id: ProgressId
  name: string
  max: number
  act: ActivityId
  hint: string
  /** Magic Find given at value v. `boss` is the selected slayer boss. */
  mf: (v: number, boss: BossId) => number
}

export function combatMF(level: number): number {
  let t = 0
  for (let i = 1; i <= level; i++) t += i <= 10 ? 0.1 : i <= 20 ? 0.2 : i <= 30 ? 0.3 : i <= 40 ? 0.4 : 0.5
  return t
}

const PET_SCORE_STEPS = [10, 25, 50, 75, 100, 130, 175, 225, 275, 325, 375, 450, 500]
export function petMF(score: number): number {
  return PET_SCORE_STEPS.filter((x) => score >= x).length
}

export function slayerMF(level: number, boss: BossId): number {
  if (boss === 'vampire') return level >= 5 ? 6 : level
  return level >= 9 ? 10 : level
}

export const PROGRESS: ProgressStat[] = [
  { id: 'combat', name: 'Combat level', max: 60, act: 'all', mf: combatMF, hint: 'up to +20 at 60' },
  { id: 'pet', name: 'Pet Score', max: 999, act: 'all', mf: petMF, hint: 'up to +13 at 500' },
  { id: 'acct', name: 'Account upgrade tier (Elizabeth)', max: 5, act: 'all', mf: (v) => v, hint: '+1 per tier' },
  { id: 'best', name: 'Bestiary MF on this mob', max: 75, act: 'all', mf: (v) => v, hint: '+45 at tier 15, +75 at 25' },
  { id: 'codex', name: "Beastslayer's Codex Mythic (1 = yes)", max: 1, act: 'all', mf: (v) => v, hint: '+1 at Bestiary Milestone 300' },
  { id: 'slv', name: 'Slayer level for this boss', max: 9, act: 'slayer', mf: slayerMF, hint: '+1 per level, +2 at the top (9, or 5 in the Rift)' },
  { id: 'griffin', name: 'Griffin level (Legendary+)', max: 100, act: 'diana', mf: (v) => v * 0.1, hint: 'King of Kings, up to +10, only as the active pet' },
  { id: 'myth', name: 'Mythological Bestiary tiers', max: 230, act: 'diana', mf: (v) => v * 0.1, hint: 'Daedalus Blade, +0.1 per tier (doubled when fragged)' },
  { id: 'mega', name: 'Megalodon level', max: 100, act: 'shark', mf: (v) => v * 0.1, hint: 'Blood Scent, up to +10, only as the active pet' },
]

export type ToggleId = 'cookie' | 'godpot' | 'aatrox'

export const TOGGLES: { id: ToggleId; name: string; mf: (act: ActivityId) => number }[] = [
  { id: 'cookie', name: 'Booster Cookie active (+10, about 14.5M per 4 days)', mf: () => 10 },
  { id: 'godpot', name: 'God Potion active (+10, about 1.7M)', mf: () => 10 },
  { id: 'aatrox', name: 'Aatrox Pathfinder is active (+20, +40 on Slayer bosses)', mf: (a) => (a === 'slayer' ? 40 : 20) },
]

export const MF_CAP = 500
