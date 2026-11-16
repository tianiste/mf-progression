<script setup lang="ts">
import { computed } from 'vue'
import { live, state } from './store'
import { plan } from './lib/planner'
import BrandMark from './components/BrandMark.vue'
import NextBuy from './components/NextBuy.vue'
import PlayerLookup from './components/PlayerLookup.vue'
import ActivityTabs from './components/ActivityTabs.vue'
import ProgressPanel from './components/ProgressPanel.vue'
import BuyList from './components/BuyList.vue'

const result = computed(() => plan(state, live.cost))
</script>

<template>
  <header class="top wrap">
    <a class="brand" href="/">
      <BrandMark :size="34" />
      <span>Luckledger</span>
    </a>
    <p class="status">
      Values from 0.27.3 Release Candidate 2. The update goes live in the 17 Nov maintenance, so numbers can still
      change.
    </p>
  </header>

  <section class="hero wrap">
    <div class="pitch">
      <h1>Every Magic Find source, cheapest point first.</h1>
      <p>
        Each point of Magic Find adds the same 1% to your drops, so the best upgrade is always the cheapest one you
        don't own yet. Tick what you have, set a budget, and the list re-sorts as you go.
      </p>
    </div>
    <NextBuy :plan="result" />
  </section>

  <div class="layout wrap">
    <aside class="setup" aria-label="Your setup">
      <PlayerLookup />
      <ActivityTabs />
      <ProgressPanel />
    </aside>
    <main>
      <BuyList :plan="result" />
    </main>
  </div>

  <footer class="foot wrap">
    <h2>How it's counted</h2>
    <ul>
      <li>Drops = base chance × (1 + Magic Find / 100), on every mob drop, not only drops under 5%.</li>
      <li>Past 100% the extra becomes a chance to double the drop. Magic Find caps at 500.</li>
      <li>
        Pets, enrichments, Sorrow base stats, cloaks, Lucky Clover, Legion, Jerry Candy and SkyBlock levels no longer
        give Magic Find.
      </li>
    </ul>
    <p class="fine">Not affiliated with Hypixel or Mojang. Prices are estimates; edit any of them in the list.</p>
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
