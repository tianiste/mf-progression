<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { live, state } from './store'
import { plan } from './lib/planner'
import { loadPrices } from './lib/prices'
import { mobById, mobValue } from './lib/payback'
import { ago } from './lib/format'
import BrandMark from './components/BrandMark.vue'
import NextBuy from './components/NextBuy.vue'
import PlayerLookup from './components/PlayerLookup.vue'
import ActivityTabs from './components/ActivityTabs.vue'
import ProgressPanel from './components/ProgressPanel.vue'
import BuyList from './components/BuyList.vue'
import MaxPanel from './components/MaxPanel.vue'

const result = computed(() => plan(state, live.cost))
const value = computed(() => {
  const mob = state.mob ? mobById(state.mob) : undefined
  return mob ? mobValue(mob, live.quotes, state.kph[mob.id] ?? mob.killsPerHour) : null
})

// Prices refresh on load and every five minutes while the page is open.
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  void loadPrices()
  timer = setInterval(() => void loadPrices(), 5 * 60_000)
})
onUnmounted(() => clearInterval(timer))

const priceLine = computed(() => {
  const p = live.prices
  if (p.error) return `Prices didn't load (${p.error}); using estimates.`
  if (!p.origin) return 'Loading prices…'
  if (p.origin === 'bazaar-only')
    return `Bazaar prices ${ago(p.updatedAt)}. No Auction House prices here.`
  return `Prices ${ago(p.updatedAt)}.`
})
</script>

<template>
  <header class="top wrap">
    <a class="brand" href="/">
      <BrandMark :size="34" />
      <span>Luckledger</span>
    </a>
    <p class="status">
      Updated for 0.27.3 (17 Nov).
    </p>
  </header>

  <section class="hero wrap">
    <div class="pitch">
      <h1>Cheapest Magic Find first.</h1>
      <p>
        Every point is +1% drops. Tick what you own, set a budget.
      </p>
    </div>
    <NextBuy :plan="result" :value="value" />
  </section>

  <div class="layout wrap">
    <aside class="setup" aria-label="Your setup">
      <PlayerLookup />
      <ActivityTabs :value="value" />
      <ProgressPanel />
    </aside>
    <main>
      <BuyList :plan="result" :value="value" />
      <MaxPanel />
    </main>
  </div>

  <footer class="foot wrap">
    <p>Drop chance × (1 + MF/100), on every drop. Cap 500.</p>
    <p class="fine">
      {{ priceLine }}
      <template v-if="live.prices.origin === 'worker'">
        AH data: <a href="https://sky.coflnet.com" rel="noopener">SkyCofl</a>.
      </template>
    </p>
    <p class="fine">Not affiliated with Hypixel or Mojang.</p>
  </footer>
</template>

<style scoped>
.top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 24px;
  padding-top: 20px;
  padding-bottom: 20px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
  text-decoration: none;
  font-family: var(--pixel);
  font-weight: 700;
  font-size: 26px;
  letter-spacing: 0.01em;
}
.status {
  font-size: 13px;
  color: var(--muted);
  max-width: 52ch;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 520px);
  gap: 40px;
  align-items: center;
  padding-top: 32px;
  padding-bottom: 48px;
}
.pitch h1 {
  font-size: clamp(32px, 4.4vw, 52px);
  line-height: 1.08;
  font-weight: 700;
  letter-spacing: -0.015em;
  text-wrap: balance;
  max-width: 14ch;
}
.pitch p {
  margin-top: 18px;
  color: var(--muted);
  font-size: 17px;
  max-width: 46ch;
}
@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-top: 8px;
    padding-bottom: 32px;
  }
}

.layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}
.setup {
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .setup {
    position: static;
    max-height: none;
    overflow: visible;
  }
}

.foot {
  margin-top: 64px;
  padding-top: 28px;
  padding-bottom: 48px;
  border-top: 1px solid var(--rim);
  color: var(--muted);
  font-size: 14px;
}
.foot h2 {
  font-size: 16px;
  color: var(--ink);
  margin-bottom: 8px;
}
.foot ul {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 75ch;
}
.fine {
  margin-top: 16px;
  font-size: 13px;
}
</style>
