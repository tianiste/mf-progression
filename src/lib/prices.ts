import type { PriceBundle, Quote } from '../../shared/price-spec'
import { PRICE_SPECS, quoteKey, wantedQuotes } from '../../shared/price-spec'
import { coins } from './format'
import { live } from '../store'

/** Where the current prices came from. */
export type PriceOrigin = 'worker' | 'bazaar-only'

/** Prices from our Worker; if it isn't there (local file, static hosting), Bazaar prices straight from Hypixel. */
async function fetchBundle(): Promise<{ bundle: PriceBundle; origin: PriceOrigin }> {
  try {
    const r = await fetch('/api/prices', { headers: { Accept: 'application/json' } })
    if (r.ok && (r.headers.get('content-type') ?? '').includes('json')) {
      const bundle = (await r.json()) as PriceBundle
      if (bundle?.version === 1 && bundle.quotes) return { bundle, origin: 'worker' }
    }
  } catch {
    // no Worker here; fall through
  }
  return { bundle: await bazaarOnly(), origin: 'bazaar-only' }
}

async function bazaarOnly(): Promise<PriceBundle> {
  const r = await fetch('https://api.hypixel.net/v2/skyblock/bazaar')
  if (!r.ok) throw new Error('Bazaar HTTP ' + r.status)
  const j = (await r.json()) as {
    lastUpdated?: number
    products?: Record<string, { buy_summary?: { pricePerUnit: number }[] }>
  }
  const at = new Date(j.lastUpdated ?? Date.now()).toISOString()
  const quotes: Record<string, Quote> = {}
  for (const id of wantedQuotes().bazaar) {
    const p = j.products?.[id]
    // Hypixel's buy_summary holds sell offers: its first entry is the instant-buy price.
    if (p) quotes[id] = { buy: p.buy_summary?.[0]?.pricePerUnit ?? 0, market: 'bazaar', at }
  }
  return { version: 1, updatedAt: at, bazaarAt: at, quotes }
}

const MARKET_NAME = { bazaar: 'Bazaar', ah: 'Auction House' } as const

/** Turns the bundle into a cost and a one-line explanation per source. Sources without a full quote keep their default. */
export function applyBundle(bundle: PriceBundle, origin: PriceOrigin): void {
  const cost: Record<string, number> = {}
  const detail: Record<string, string> = {}
  const market: Record<string, 'bazaar' | 'ah'> = {}
  for (const [id, spec] of Object.entries(PRICE_SPECS)) {
    const quotes = spec.parts.map((p) => bundle.quotes[quoteKey(p)])
    const where = MARKET_NAME[spec.parts[0]!.market]
    if (quotes.some((q) => !q || q.buy <= 0)) {
      const missingAh = origin === 'bazaar-only' && spec.parts.some((p) => p.market === 'ah')
      detail[id] = missingAh ? '' : `No ${spec.label} for sale on the ${where} right now; using the estimate.`
      continue
    }
    if (spec.qtyUnknown) {
      detail[id] = `${coins(quotes[0]!.buy)} per shard on the ${where}. Shards needed to max are not known yet, so set the total yourself.`
      continue
    }
    const total = spec.parts.reduce((t, p, i) => t + p.qty * quotes[i]!.buy, 0)
    const one = spec.parts.length === 1 && spec.parts[0]!.qty > 1 ? ` (${coins(quotes[0]!.buy)} each)` : ''
    cost[id] = Math.round(total)
    market[id] = spec.parts[0]!.market
    detail[id] = `Live: ${spec.label}${one}, ${coins(total)} on the ${where}.`
  }
  live.cost = cost
  live.detail = detail
  live.market = market
  live.quotes = bundle.quotes
  live.prices = { origin, updatedAt: bundle.updatedAt, error: '' }
}

export async function loadPrices(): Promise<void> {
  try {
    const { bundle, origin } = await fetchBundle()
    applyBundle(bundle, origin)
  } catch (e) {
    live.prices = { origin: null, updatedAt: '', error: e instanceof Error ? e.message : String(e) }
  }
}
