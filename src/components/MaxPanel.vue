<script setup lang="ts">
import { computed } from 'vue'
import { ACTIVITIES, MF_CAP } from '../data/sources'
import { breakdown } from '../lib/planner'
import { r1 } from '../lib/format'
import { state } from '../store'

const b = computed(() => breakdown(state))
const act = computed(() => ACTIVITIES.find((a) => a.id === state.act)?.name ?? '')
const pct = (now: number, max: number) => (max > 0 ? Math.min(100, (now / max) * 100) : 0)
const KIND = { grind: 'free to grind', buy: 'costs coins', boost: 'temporary' } as const
const left = computed(() => {
  const by = { grind: 0, buy: 0, boost: 0 }
  for (const l of b.value.lines) by[l.kind] += Math.max(0, l.max - l.now)
  return by
})
</script>

<template>
  <section class="max" aria-labelledby="max-h">
    <h2 id="max-h">How far you can go</h2>
    <p class="lede">
      Farming {{ act.toLowerCase() }}, the most Magic Find you can reach is
      <strong class="star num">{{ r1(Math.min(MF_CAP, b.max)) }} ✯</strong> (×{{ (1 + Math.min(MF_CAP, b.max) / 100).toFixed(2) }}
      drops). You have <strong class="star num">{{ r1(b.now) }}</strong>, {{ Math.round(pct(b.now, b.max)) }}% of the way.
      Still open: <span class="num">+{{ r1(left.grind) }}</span> by grinding, <span class="num">+{{ r1(left.buy) }}</span> from
      coins and <span class="num">+{{ r1(left.boost) }}</span> from boosts.
    </p>

    <ul class="lines">
      <li v-for="l in b.lines" :key="l.label">
        <div class="top">
          <span class="label">{{ l.label }}</span>
          <span class="kind" :class="l.kind">{{ KIND[l.kind] }}</span>
          <span class="val num"><span class="star">{{ r1(l.now) }}</span> / {{ r1(l.max) }}</span>
        </div>
        <div class="bar" role="img" :aria-label="`${r1(l.now)} of ${r1(l.max)}`">
          <span :style="{ width: pct(l.now, l.max) + '%' }" :class="{ full: l.max > 0 && l.now >= l.max }"></span>
        </div>
      </li>
    </ul>

    <ul class="notes">
      <li>
        The stat caps at {{ MF_CAP }}. Even with everything above you stay far below it, so the cap never limits a real
        setup.
      </li>
      <li>
        Each point adds 1% of the base drop chance. When a drop's chance passes 100%, the extra becomes a chance to get it
        twice.
      </li>
      <li>
        Not counted in the maximum: a Jerry Statspocalypse mayor (+10%), Bobbin' Time with a big fishing party (the wiki
        lists up to +20), stews above +1, a fragged Daedalus Blade (double the Bestiary bonus) and mob-specific Bestiary
        milestones beyond the value you entered.
      </li>
    </ul>
  </section>
</template>

<style scoped>
.max {
  margin-top: 40px;
  padding-top: 28px;
  border-top: 2px solid var(--rim);
}
h2 {
  font-size: 24px;
  font-weight: 700;
}
.lede {
  margin-top: 6px;
  max-width: 70ch;
  color: var(--muted);
}
.lede strong {
  font-weight: 700;
}
.lines {
  list-style: none;
  margin: 20px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px 28px;
}
.top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
}
.label {
  font-weight: 600;
  flex: 1;
  min-width: 0;
}
.kind {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}
.val {
  font-weight: 700;
  white-space: nowrap;
}
.bar {
  margin-top: 6px;
  height: 6px;
  background: var(--sunk);
  border-radius: 1px;
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  background: var(--violet);
}
.bar span.full {
  background: var(--good);
}
.notes {
  margin: 20px 0 0;
  padding-left: 18px;
  font-size: 14px;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 75ch;
}
</style>
