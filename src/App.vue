<script setup lang="ts">
import { computed } from 'vue'
import { live, state } from './store'
import { plan } from './lib/planner'
import PlayerLookup from './components/PlayerLookup.vue'
import ActivityTabs from './components/ActivityTabs.vue'
import ProgressPanel from './components/ProgressPanel.vue'
import SummaryTiles from './components/SummaryTiles.vue'
import BuyList from './components/BuyList.vue'
import MechanicsPanel from './components/MechanicsPanel.vue'

const result = computed(() => plan(state, live.cost))
</script>

<template>
  <main>
    <header style="display: flex; flex-direction: column; gap: 6px">
      <h1>Magic Find Upgrade Path</h1>
      <p class="sub">
        Every Magic Find source in SkyBlock 0.27.3, ranked by coins per point. Tick what you own, fix the prices, set a
        budget.
      </p>
    </header>

    <div class="banner">
      Numbers follow Release Candidate #2 (12 Nov 2026). The update is scheduled to go live in the 17 Nov maintenance,
      so values and prices can still move. Loading a player also refreshes the Cinderbat Shard price from the Bazaar.
      Edit any other price in the list.
    </div>

    <PlayerLookup />
    <ActivityTabs />
    <ProgressPanel />
    <SummaryTiles :plan="result" />
    <BuyList :plan="result" />
    <MechanicsPanel />
  </main>
</template>
