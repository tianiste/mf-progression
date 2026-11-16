// Farming mobs: mob types (for attribute shards and Witch stews), Bestiary family, and drop tables for payback time.
// Shared by the page and the Worker (which prices the drop items).
//
// Drop chances are percent per kill before Magic Find. Sources, checked 2026-11-16:
//   W  = Hypixel SkyBlock wiki (reflects 0.27.2), R1/R2 = 0.27.3 Release Candidate 1/2 threads.
// The rework's per-boss slayer tables were only in spreadsheets we could not read, so slayer tables are the wiki's
// with the RC2 changes applied where RC2 lists them. Rare dyes and runes are left out (no tradeable item id found).

import type { Market } from './price-spec'

export type MobActivity = 'slayer' | 'diana' | 'lava' | 'shark' | 'ghost'
export type SlayerBoss = 'zombie' | 'spider' | 'wolf' | 'enderman' | 'blaze' | 'vampire'

export interface Drop {
  /** SkyBlock item id, or COINS for a coin drop (priced at qty coins). */
  id: string
  qty: number
  /** Percent per kill, before Magic Find. */
  chance: number
  market: Market | 'coins'
  /** Where the number comes from. */
  src: 'W' | 'R1' | 'R2'
  /** Set when sources disagree. */
  conflict?: string
}

export interface Mob {
  id: string
  name: string
  act: MobActivity
  /** Slayer boss this mob is, so the slayer level and boss picker follow it. */
  boss?: SlayerBoss
  types: string[]
  /** Family name in src/data/bestiary.json, if the mob has a Bestiary. */
  bestiary?: string
  /** A starting guess for kills per hour; every player should set their own. */
  killsPerHour: number
  drops: Drop[]
  /** Shown with the payback numbers. */
  dataNote: string
}

const bz = (id: string, qty: number, chance: number, src: Drop['src'] = 'W', conflict?: string): Drop => ({
  id, qty, chance, market: 'bazaar', src, ...(conflict ? { conflict } : {}),
})
const ah = (id: string, qty: number, chance: number, src: Drop['src'] = 'W', conflict?: string): Drop => ({
  id, qty, chance, market: 'ah', src, ...(conflict ? { conflict } : {}),
})

export const MOBS: Mob[] = [
  {
    id: 'revenant', name: 'Revenant Horror V', act: 'slayer', boss: 'zombie', types: ['Undead'], killsPerHour: 30,
    drops: [],
    dataNote: 'The wiki only gives drop weights for Revenant Horror, not chances, so there is no payback estimate yet.',
  },
  {
    id: 'tarantula', name: 'Tarantula Broodfather V', act: 'slayer', boss: 'spider', types: ['Arthropod'], killsPerHour: 30,
    drops: [
      bz('TARANTULA_WEB', 64, 100), bz('TARANTULA_SILK', 2, 5, 'R2'), bz('TOXIC_ARROW_POISON', 64, 5, 'R2'),
      bz('TARANTULA_CATALYST', 1, 0.42), bz('ENCHANTMENT_BANE_OF_ARTHROPODS_6', 1, 0.35), bz('FLY_SWATTER', 1, 0.21),
      ah('TARANTULA_TALISMAN', 1, 0.21), bz('SPIDER_CATALYST', 1, 1, 'R2'), bz('VIAL_OF_VENOM', 1, 0.14),
      ah('SHRIVELED_WASP', 1, 0.14), ah('DIGESTED_MOSQUITO', 1, 0.071), bz('ENSNARED_SNAIL', 1, 0.042),
      ah('PRIMORDIAL_EYE', 1, 0.014),
    ],
    dataNote: 'Wiki chances, with the RC2 cuts to Tarantula Silk, Toxic Arrow Poison and Spider Catalyst.',
  },
  {
    id: 'sven', name: 'Sven Packmaster IV', act: 'slayer', boss: 'wolf', types: ['Animal'], killsPerHour: 40,
    drops: [
      bz('WOLF_TOOTH', 57, 100), bz('HAMSTER_WHEEL', 4.5, 5, 'R2'), bz('ENCHANTMENT_CRITICAL_6', 1, 0.41),
      bz('FURBALL', 1, 0.82), ah('RED_CLAW_EGG', 1, 0.04), ah('GRIZZLY_BAIT', 1, 0.06), ah('OVERFLUX_CAPACITOR', 1, 0.04),
    ],
    dataNote: 'Wiki chances (some rows list two tiers; the lower one is used), with the RC2 cut to Hamster Wheel.',
  },
  {
    id: 'voidgloom', name: 'Voidgloom Seraph IV', act: 'slayer', boss: 'enderman', types: ['Ender'], killsPerHour: 25,
    drops: [
      bz('NULL_SPHERE', 130, 100), bz('TWILIGHT_ARROW_POISON', 62, 12.7), bz('NULL_ATOM', 1, 4.94),
      bz('ENCHANTMENT_MANA_STEAL_1', 1, 4.23), bz('TRANSMISSION_TUNER', 1, 2.12), bz('ENCHANTMENT_SMARTY_PANTS_1', 1, 1.76),
      bz('HAZMAT_ENDERMAN', 1, 1.55), bz('SUMMONING_EYE', 1, 0.56), ah('SINFUL_DICE', 1, 0.46),
      ah('ETHERWARP_MERGER', 1, 0.42), ah('POCKET_ESPRESSO_MACHINE', 1, 0.39), ah('HANDY_BLOOD_CHALICE', 1, 0.18),
      ah('JUDGEMENT_CORE', 1, 0.056), ah('EXCEEDINGLY_RARE_ENDER_ARTIFACT_UPGRADER', 1, 0.028), bz('ENDSTONE_IDOL', 1, 0.014),
    ],
    dataNote: 'Wiki chances; the release candidates list no Voidgloom changes.',
  },
  {
    id: 'inferno', name: 'Inferno Demonlord IV', act: 'slayer', boss: 'blaze', types: ['Infernal'], killsPerHour: 15,
    drops: [
      bz('DERELICT_ASHE', 80, 100, 'R2', 'wiki shows 110-155'), bz('ENCHANTED_BLAZE_POWDER', 28, 5, 'R2'),
      bz('ARROW_BUNDLE_MAGMA', 1, 5, 'R2'), bz('KELVIN_INVERTER', 1, 2.5, 'R2'), bz('MANA_DISINTEGRATOR', 2, 3.69),
      bz('SCORCHED_BOOKS', 2, 2.11), ah('ARCHFIEND_DICE', 1, 1, 'R2'), ah('HIGH_CLASS_ARCHFIEND_DICE', 1, 0.26),
      ah('WILSON_ENGINEERING_PLANS', 1, 0.09), bz('SUBZERO_INVERTER', 1, 0.09), bz('FLAWED_OPAL_GEM', 320, 2.9),
      bz('SCORCHED_POWER_CRYSTAL', 1, 3.48),
    ],
    dataNote: 'Wiki chances with the RC2 changes (Derelict Ashe 64-96, cuts to Blaze Powder, Magma Arrows, Kelvin Inverter, Archfiend Dice).',
  },
  {
    id: 'inquisitor', name: 'Minos Inquisitor', act: 'diana', types: ['Mythological', 'Humanoid', 'Elusive'],
    bestiary: 'Minos Inquisitor', killsPerHour: 4,
    drops: [
      bz('ANCIENT_CLAW', 32, 100), bz('ENCHANTED_GOLD', 32, 50, 'R1'), bz('ENCHANTED_ANCIENT_CLAW', 2, 50, 'R1'),
      bz('ENCHANTMENT_ULTIMATE_CHIMERA_1', 1, 2.5, 'R1', 'wiki 1.25%; RC2 says Chimera was not changed'),
    ],
    dataNote: 'Mythic Inquisitor, RC1 chances. The Chimera chance is disputed (wiki 1.25%, RC1 2.5%).',
  },
  {
    id: 'champion', name: 'Minos Champion', act: 'diana', types: ['Mythological', 'Humanoid'],
    bestiary: 'Minos Champion', killsPerHour: 10,
    drops: [
      bz('ANCIENT_CLAW', 14, 100), bz('ENCHANTED_GOLD', 14, 50, 'R1'),
      ah('MINOS_RELIC', 1, 0.15, 'R1', 'wiki 0.04%; RC2 says Minos Relic was not changed'),
    ],
    dataNote: 'Mythic Champion, RC1 chances. The Minos Relic chance is disputed (wiki 0.04%, RC1 0.15%).',
  },
  {
    id: 'thunder', name: 'Thunder', act: 'lava', types: ['Magmatic', 'Arcane', 'Elusive'], bestiary: 'Thunder', killsPerHour: 4,
    drops: [
      bz('MAGMA_FISH_SILVER', 12, 100), bz('THUNDER_SHARDS', 1, 100, 'W', 'RC1 lists a shard at 50% instead'),
      bz('ENCHANTMENT_ULTIMATE_FLASH_1', 1, 4, 'R2'),
    ],
    dataNote: 'RC2 Flash chance; Thunder Fragment from the wiki (RC1 differs).',
  },
  {
    id: 'jawbus', name: 'Lord Jawbus', act: 'lava', types: ['Magmatic', 'Construct', 'Elusive'], bestiary: 'Lord Jawbus', killsPerHour: 1,
    drops: [
      bz('MAGMA_FISH_SILVER', 16, 100), bz('MAGMA_LORD_FRAGMENT', 1, 50, 'R1', 'wiki 100%'),
      bz('BOBBIN_SCRIPTURES', 1, 2.5, 'R1'), bz('RADIOACTIVE_VIAL', 1, 1.25, 'R2'),
    ],
    dataNote: 'RC1/RC2 chances. The Magma Lord Fragment chance is disputed (wiki 100%, RC1 50%).',
  },
  {
    id: 'gws', name: 'Great White Shark', act: 'shark', types: ['Aquatic', 'Animal', 'Elusive'], bestiary: 'Great White Shark', killsPerHour: 10,
    drops: [
      bz('SHARK_FIN', 16, 100), bz('GREAT_WHITE_SHARK_TOOTH', 1, 7.5, 'R2'), bz('ENCHANTED_SHARK_FIN', 1, 5, 'R1'),
    ],
    dataNote: 'RC1/RC2 chances. Fishing Festival only. The Legendary Megalodon pet (1%) is not priced yet.',
  },
  {
    id: 'ghost', name: 'Ghost', act: 'ghost', types: ['Arcane', 'Subterranean'], bestiary: 'Ghost', killsPerHour: 300,
    drops: [
      bz('VOLTA', 1, 1, 'R1'), bz('SORROW', 1, 0.4, 'R1'), bz('PLASMA', 1, 0.4, 'R1'), ah('GHOST_BOOTS', 1, 0.02, 'R1'),
      { id: 'COINS', qty: 1_000_000, chance: 0.01, market: 'coins', src: 'W' },
    ],
    dataNote: 'RC1 chances (raised from the wiki values).',
  },
]

/** Mob type -> the attribute shard that gives +5 Magic Find against it (NEU-REPO attribute_shards.json). */
export const TYPE_SHARD: Record<string, string> = {
  Undead: 'SHARD_DROWNED',
  Arthropod: 'SHARD_BLACK_WIDOW',
  Animal: 'SHARD_WILD_HOG',
  Elusive: 'SHARD_HIDEYHO',
  Airborne: 'SHARD_PARAKEET',
  Frozen: 'SHARD_BILLYGOAT',
  Subterranean: 'SHARD_CHUCKWALLA',
  Cubic: 'SHARD_HIVETHIEF',
  Construct: 'SHARD_WIKI_TIKI',
  Aquatic: 'SHARD_GIANT_WATER_BUG',
  Critter: 'SHARD_HEWVER',
  Woodland: 'SHARD_HIDEONFLOOR',
  Arcane: 'SHARD_HIDEONWALL',
  Magmatic: 'SHARD_LAVA_FLAME',
  Mythological: 'SHARD_MINOTAUR',
}

/** Every drop item the Worker should price. */
export function dropQuotes(): { id: string; market: Market }[] {
  const seen = new Map<string, Market>()
  for (const m of MOBS) for (const d of m.drops) if (d.market !== 'coins') seen.set(d.id, d.market)
  return [...seen].map(([id, market]) => ({ id, market }))
}
