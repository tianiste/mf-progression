import type { ActivityId, Source } from '../data/sources'
import { MF_CAP, PROGRESS, SOURCES, TOGGLES } from '../data/sources'
import type { State } from '../store'

export const appliesTo = (act: ActivityId) => (x: { act: ActivityId }) => x.act === 'all' || x.act === act

/** Price of a source in coins: user override, then live price, then default. null = unknown. */
export function costOf(s: Source, state: State, liveCost: Record<string, number>): number | null {
  const p = state.price[s.id]
  if (p !== undefined) return p * 1e6
  return liveCost[s.id] ?? s.cost
}

/** Magic Find the player already has for the chosen activity. */
export function baseMF(state: State): number {
  const on = appliesTo(state.act)
  let t = 0
  for (const p of PROGRESS.filter(on)) t += p.mf(Math.min(p.max, state.prog[p.id] ?? 0), state.boss)
  for (const g of TOGGLES) if (state.tog[g.id]) t += g.mf(state.act)
  for (const s of SOURCES.filter(on)) if (state.own[s.id]) t += s.mf
  return t
}

/** Unowned sources, cheapest coins per MF first, unpriced last, upgrade tiers after their base tier. */
export function buyOrder(state: State, liveCost: Record<string, number>): Source[] {
  const on = appliesTo(state.act)
  const todo = SOURCES.filter((s) => on(s) && !state.own[s.id])
  const cost = (s: Source) => costOf(s, state, liveCost)
  const priced = todo.filter((s) => cost(s) !== null).sort((a, b) => cost(a)! / a.mf - cost(b)! / b.mf)
  const blank = todo.filter((s) => cost(s) === null)
  const list = [...priced, ...blank]
  // A tier cannot come before the tier it upgrades: move it to just after that tier.
  for (let pass = 0; pass < list.length; pass++) {
    for (let i = 0; i < list.length; i++) {
      const s = list[i]!
      if (!s.need) continue
      const j = list.findIndex((x) => x.id === s.need)
      if (j > i) {
        list.splice(i, 1)
        list.splice(j, 0, s)
      }
    }
  }
  return list
}

export interface PlanRow {
  source: Source
  cost: number | null
  coinsPerMF: number | null
  /** Running MF after buying this row (capped), null when unpriced. */
  runningMF: number | null
  runningCost: number | null
  inBudget: boolean
}

export interface Plan {
  now: number
  rows: PlanRow[]
  budgetMF: number
  budgetCost: number
  everything: number
}

export function plan(state: State, liveCost: Record<string, number>): Plan {
  const now = baseMF(state)
  const budget = state.budget * 1e6
  let mf = now
  let spent = 0
  let budgetMF = now
  let budgetCost = 0
  let stopped = false
  const rows: PlanRow[] = buyOrder(state, liveCost).map((s) => {
    const c = costOf(s, state, liveCost)
    if (c === null) return { source: s, cost: null, coinsPerMF: null, runningMF: null, runningCost: null, inBudget: false }
    let inBudget = false
    spent += c
    mf += s.mf
    if (!stopped && spent <= budget) {
      budgetMF = mf
      budgetCost = spent
      inBudget = true
    } else stopped = true
    return { source: s, cost: c, coinsPerMF: c / s.mf, runningMF: Math.min(MF_CAP, mf), runningCost: spent, inBudget }
  })
  const on = appliesTo(state.act)
  const everything = now + SOURCES.filter((s) => on(s) && !state.own[s.id]).reduce((t, s) => t + s.mf, 0)
  return { now, rows, budgetMF, budgetCost, everything }
}
