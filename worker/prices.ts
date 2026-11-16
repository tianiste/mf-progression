import type { Part, PriceBundle, Quote } from '../shared/price-spec'
import { quoteKey, wantedQuotes } from '../shared/price-spec'

/*
  The price bundle is rebuilt by the cron trigger in small steps so each run stays inside the free plan
  (10 ms CPU, 50 subrequests): the Bazaar at most every 9 minutes, scanned with one regular expression
  instead of parsing 3+ MB of JSON, plus a few Coflnet quotes per run, paced about one per second
  (Coflnet allows 30 requests per 10 s and 100 per minute per IP).
*/

export const USER_AGENT = 'Luckledger (github.com/tianiste/mf-progression)'
const BUNDLE_KEY = 'bundle'
const BAZAAR_EVERY_MS = 9 * 60_000
const AH_EVERY_MS = 30 * 60_000
const AH_PER_RUN = 14
const AH_GAP_MS = 1_100
/** A quote that could not be refreshed for this long is dropped, so the page shows the default instead of a stale price. */
const DROP_AFTER_MS = 24 * 3600_000

interface Stored extends PriceBundle {
  /** When each quote was last attempted (ms), including attempts that found no listing. */
  tried: Record<string, number>
}

function empty(): Stored {
  return { version: 1, updatedAt: '', bazaarAt: '', quotes: {}, tried: {} }
}

async function get(url: string, timeoutMs = 15_000): Promise<Response> {
  return fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(timeoutMs) })
}

/**
 * Lowest sell offer (instant-buy price) per wanted product. Hypixel's naming is inverted: `buy_summary` holds
 * sell offers, so its first entry is what an instant buy pays. Products list sell_summary, then buy_summary.
 */
export function scanBazaar(text: string, wanted: Set<string>): Map<string, number> {
  const out = new Map<string, number>()
  const re = /"product_id":"([^"]+)"|"buy_summary":\[(?:\{"amount":\d+,"pricePerUnit":([0-9.eE+-]+))?/g
  let current: string | null = null
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m[1] !== undefined) current = wanted.has(m[1]) ? m[1] : null
    else if (current) {
      out.set(current, m[2] ? Number(m[2]) : 0)
      current = null
    }
  }
  return out
}

async function refreshBazaar(b: Stored, ids: string[]): Promise<void> {
  const response = await get('https://api.hypixel.net/v2/skyblock/bazaar')
  if (response.status !== 200) throw new Error(`bazaar ${response.status}`)
  const text = await response.text()
  const updated = /"lastUpdated":(\d+)/.exec(text.slice(0, 200))
  const at = new Date(updated ? Number(updated[1]) : Date.now()).toISOString()
  const found = scanBazaar(text, new Set(ids))
  for (const id of ids) {
    const buy = found.get(id)
    if (buy === undefined) continue
    b.quotes[id] = { buy, market: 'bazaar', at }
    b.tried[id] = Date.now()
  }
  b.bazaarAt = at
}

/** No listing (204/404) or an unknown tag (400 item_not_found) means no quote, not an outage. */
const noQuote = (status: number) => status === 204 || status === 404 || status === 400

async function auctionQuote(p: Part): Promise<Quote | null> {
  const at = new Date().toISOString()
  if (p.rarity) {
    const r = await get(`https://sky.coflnet.com/api/item/price/${encodeURIComponent(p.id)}/bin?Rarity=${encodeURIComponent(p.rarity)}`, 10_000)
    if (r.status !== 200) return noQuote(r.status) ? null : Promise.reject(new Error(`coflnet ${r.status}`))
    const lowest = Number(((await r.json()) as { lowest?: number }).lowest ?? 0)
    return lowest > 0 ? { buy: lowest, market: 'ah', at } : null
  }
  const r = await get(`https://sky.coflnet.com/api/item/price/${encodeURIComponent(p.id)}/current?minAgeSeconds=120`, 10_000)
  if (r.status !== 200) return noQuote(r.status) ? null : Promise.reject(new Error(`coflnet ${r.status}`))
  const body = (await r.json()) as { buy?: number; available?: number; updatedAt?: string }
  const buy = Number(body.buy ?? 0)
  return buy > 0 && Number(body.available ?? 0) > 0 ? { buy, market: 'ah', at: body.updatedAt ?? at } : null
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function refreshAuctions(b: Stored, parts: Part[]): Promise<number> {
  const now = Date.now()
  const due = parts
    .filter((p) => now - (b.tried[quoteKey(p)] ?? 0) > AH_EVERY_MS)
    .sort((x, y) => (b.tried[quoteKey(x)] ?? 0) - (b.tried[quoteKey(y)] ?? 0))
    .slice(0, AH_PER_RUN)
  let done = 0
  for (const [i, p] of due.entries()) {
    if (i > 0) await sleep(AH_GAP_MS)
    const key = quoteKey(p)
    try {
      const q = await auctionQuote(p)
      if (q) b.quotes[key] = q
      else delete b.quotes[key]
      b.tried[key] = Date.now()
      done++
    } catch {
      // Coflnet busy or down: keep the previous quote and retry on a later run.
    }
  }
  return done
}

/** One cron step. Returns a short summary for the log. */
export async function refreshPrices(env: Env): Promise<string> {
  const stored = await env.PRICES.get<Stored>(BUNDLE_KEY, 'json')
  const b = stored?.version === 1 ? stored : empty()
  const { bazaar, ah } = wantedQuotes()
  let log = ''
  if (Date.now() - Date.parse(b.bazaarAt || '1970-01-01') > BAZAAR_EVERY_MS) {
    try {
      await refreshBazaar(b, bazaar)
      log += 'bazaar ok, '
    } catch (e) {
      log += `bazaar failed (${e instanceof Error ? e.message : e}), `
    }
  }
  log += `${await refreshAuctions(b, ah)} auction quotes`
  const now = Date.now()
  for (const key of Object.keys(b.quotes)) if (now - (b.tried[key] ?? 0) > DROP_AFTER_MS) delete b.quotes[key]
  b.updatedAt = new Date().toISOString()
  await env.PRICES.put(BUNDLE_KEY, JSON.stringify(b))
  return log
}

/** The bundle for the page, without the refresh bookkeeping. null while the first refresh has not finished. */
export async function readBundle(env: Env): Promise<PriceBundle | null> {
  const b = await env.PRICES.get<Stored>(BUNDLE_KEY, { type: 'json', cacheTtl: 60 })
  if (!b) return null
  return { version: 1, updatedAt: b.updatedAt, bazaarAt: b.bazaarAt, quotes: b.quotes }
}
