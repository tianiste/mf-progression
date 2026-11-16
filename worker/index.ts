import { readBundle, refreshPrices } from './prices'

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'X-Content-Type-Options': 'nosniff',
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/prices') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: JSON_HEADERS })
      }
      const bundle = await readBundle(env)
      if (!bundle) {
        // First request after a deploy: start filling the bundle, answer "loading" for now.
        ctx.waitUntil(refreshPrices(env).catch(() => undefined))
        return new Response(JSON.stringify({ error: 'prices_loading', message: 'Prices are still loading. Try again in a minute.' }), {
          status: 503,
          headers: { ...JSON_HEADERS, 'Retry-After': '60', 'Cache-Control': 'no-store' },
        })
      }
      return new Response(JSON.stringify(bundle), { headers: { ...JSON_HEADERS, 'Cache-Control': 'public, max-age=60' } })
    }
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: JSON_HEADERS })
    }
    return env.ASSETS.fetch(request)
  },

  async scheduled(_controller, env, ctx): Promise<void> {
    ctx.waitUntil(refreshPrices(env).then((log) => console.log(`prices: ${log}`)))
  },
} satisfies ExportedHandler<Env>
