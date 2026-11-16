import { reactive, watch } from 'vue'
import type { ActivityId, BossId, ProgressId, ToggleId } from './data/sources'
import { ACTIVITIES, BOSSES, SOURCES } from './data/sources'

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
}

const STORAGE_KEY = 'mfpath'

function defaults(): State {
  return { act: 'all', own: {}, price: {}, prog: {}, tog: { cookie: true }, budget: 50, boss: 'zombie', slayers: {}, name: '', key: '' }
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

/** Live prices (coins) and notes that replace the defaults, e.g. from the Bazaar. */
export const live = reactive<{ cost: Record<string, number>; note: Record<string, string> }>({ cost: {}, note: {} })

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
