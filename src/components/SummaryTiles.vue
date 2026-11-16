<script setup lang="ts">
import { computed } from 'vue'
import { MF_CAP } from '../data/sources'
import type { Plan } from '../lib/planner'
import { coins, r1 } from '../lib/format'

const props = defineProps<{ plan: Plan }>()

const tiles = computed(() => {
  const { now, budgetMF, budgetCost, everything } = props.plan
  const cap = (x: number) => Math.min(MF_CAP, x)
  return [
    { k: 'Magic Find now', v: r1(cap(now)), s: '×' + (1 + cap(now) / 100).toFixed(2) + ' drops' },
    { k: 'With your budget', v: r1(cap(budgetMF)), s: '+' + r1(budgetMF - now) + ' for ' + coins(budgetCost) },
    {
      k: 'Drop gain from budget',
      v: '+' + (((100 + cap(budgetMF)) / (100 + cap(now)) - 1) * 100).toFixed(1) + '%',
      s: 'more loot than you get now',
    },
    { k: 'Everything on this list', v: r1(cap(everything)), s: 'cap is ' + MF_CAP },
  ]
})
</script>

<template>
  <section class="tiles">
    <div v-for="t in tiles" :key="t.k" class="tile">
      <div class="k">{{ t.k }}</div>
      <div class="v">{{ t.v }}</div>
      <div class="s">{{ t.s }}</div>
    </div>
  </section>
</template>
