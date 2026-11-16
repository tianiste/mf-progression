import { reactive, watch } from 'vue'
import type { ActivityId, BossId, ProgressId, ToggleId } from './data/sources'
import { ACTIVITIES, BOSSES, SOURCES } from './data/sources'
import { MOBS } from '../shared/mobs'
import type { Quote } from '../shared/price-spec'
import { BESTIARY_MF_PER_TIER } from './lib/progress'

export interface State {
  act: ActivityId
  own: Record<string, boolean>
  /** Price override per source in millions of coins. Missing = use the default/live price. */
  price: Record<string, number>
  prog: Partial<Record<ProgressId, number>>
  tog: Partial<Record<ToggleId, boolean>>
  /** Budget in millions of coins. */
  budget: number
  boss: BossId
  slayers: Partial<Record<BossId, number>>
  name: string
  key: string
  /** Picked mob id from shared/mobs.ts, '' for none. */
  mob: string
  /** Kills per hour per mob id, set by the player. */
  kph: Record<string, number>
  /** Bestiary tier per family, read from the API. */
  bestiary: Record<string, number>
}

const STORAGE_KEY = 'mfpath'

function defaults(): State {
  return { act: 'all', own: {}, price: {}, prog: {}, tog: { cookie: true }, budget: 50, boss: 'zombie', slayers: {}, name: '', key: '', mob: '', kph: {}, bestiary: {} }
}

const num = (v: unknown): number | undefined => {
  if (v === '' || v === null || v === undefined) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function numberMap<K extends string>(raw: unknown): Partial<Record<K, number>> {
  const out: Partial<Record<K, number>> = {}
  if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw)) {
      const n = num(v)
      if (n !== undefined) out[k as K] = n
    }
  }
  return out
}

function boolMap<K extends string>(raw: unknown): Partial<Record<K, boolean>> {
  const out: Partial<Record<K, boolean>> = {}
  if (raw && typeof raw === 'object') for (const [k, v] of Object.entries(raw)) out[k as K] = v === true
  return out
}

/** Loads saved state. Older saves stored numbers as strings; they are converted here. */
function load(): State {
  const s = defaults()
  let raw: Record<string, unknown> | null = null
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    raw = null
  }
  if (!raw || typeof raw !== 'object') return s
  if (ACTIVITIES.some((a) => a.id === raw.act)) s.act = raw.act as ActivityId
  if (BOSSES.some((b) => b.id === raw.boss)) s.boss = raw.boss as BossId
  s.own = boolMap(raw.own) as Record<string, boolean>
  s.price = numberMap(raw.price) as Record<string, number>
  s.prog = numberMap(raw.prog)
  s.slayers = numberMap(raw.slayers)
  if (raw.tog && typeof raw.tog === 'object') s.tog = boolMap(raw.tog)
  s.budget = num(raw.budget) ?? s.budget
  if (typeof raw.name === 'string') s.name = raw.name
  if (typeof raw.key === 'string') s.key = raw.key
  if (typeof raw.mob === 'string' && MOBS.some((m) => m.id === raw.mob)) s.mob = raw.mob
  s.kph = numberMap(raw.kph) as Record<string, number>
  s.bestiary = numberMap(raw.bestiary) as Record<string, number>
  return s
}

export const state = reactive<State>(load())

watch(
  state,
  (s) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } catch {
      /* storage blocked: settings just won't persist */
    }
  },
  { deep: true },
)

/** Live market prices that replace the default costs (see src/lib/prices.ts). */
export interface LiveState {
  /** Live cost in coins per source id; missing = use the default price. */
  cost: Record<string, number>
  /** One-line explanation of the live price (or why there is none) per source id. */
  detail: Record<string, string>
  /** Which market a live cost came from. */
  market: Record<string, 'bazaar' | 'ah'>
  /** Raw quotes from the price bundle (drop items included), by quote key. */
  quotes: Record<string, Quote>
  prices: { origin: 'worker' | 'bazaar-only' | null; updatedAt: string; error: string }
}

export const live = reactive<LiveState>({
  cost: {},
  detail: {},
  market: {},
  quotes: {},
  prices: { origin: null, updatedAt: '', error: '' },
})

/** Ticking a tier also ticks the tiers it builds on; unticking one unticks the tiers above it. */
export function setOwned(id: string, owned: boolean): void {
  state.own[id] = owned
  if (owned) {
    let s = SOURCES.find((x) => x.id === id)
    while (s?.need) {
      state.own[s.need] = true
      const need: string = s.need
      s = SOURCES.find((x) => x.id === need)
    }
  } else {
    let changed = true
    while (changed) {
      changed = false
      for (const s of SOURCES) {
        if (s.need && !state.own[s.need] && state.own[s.id]) {
          state.own[s.id] = false
          changed = true
        }
      }
    }
  }
}

/**
 * Picks the mob being farmed (or none): switches to its activity, its slayer boss and slayer level, and fills
 * Bestiary Magic Find from the tier read from the API when there is one.
 */
export function pickMob(id: string): void {
  const mob = MOBS.find((m) => m.id === id)
  state.mob = mob ? mob.id : ''
  if (!mob) return
  state.act = mob.act
  if (mob.boss) {
    state.boss = mob.boss
    const lvl = state.slayers[mob.boss]
    if (lvl !== undefined) state.prog.slv = lvl
  }
  const tier = mob.bestiary ? state.bestiary[mob.bestiary] : undefined
  if (tier !== undefined) state.prog.best = tier * BESTIARY_MF_PER_TIER
}

/** Changing the activity tab drops a picked mob from another activity. */
export function pickActivity(act: ActivityId): void {
  state.act = act
  const mob = MOBS.find((m) => m.id === state.mob)
  if (mob && mob.act !== act) state.mob = ''
}
