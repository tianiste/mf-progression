<script setup lang="ts">
import { computed } from 'vue'
import { MF_CAP } from '../data/sources'
import { breakdown } from '../lib/planner'
import { r1 } from '../lib/format'
import { state } from '../store'

const b = computed(() => breakdown(state))
const pct = (now: number, max: number) => (max > 0 ? Math.min(100, (now / max) * 100) : 0)
const KIND = { grind: 'grind', buy: 'coins', boost: 'boost' } as const
const left = computed(() => {
  const by = { grind: 0, buy: 0, boost: 0 }
  for (const l of b.value.lines) by[l.kind] += Math.max(0, l.max - l.now)
  return by
})
</script>

<template>
  <section class="max" aria-labelledby="max-h">
    <h2 id="max-h">Max Magic Find</h2>
    <p class="lede">
      <strong class="star num">{{ r1(b.now) }}</strong> of <strong class="star num">{{ r1(Math.min(MF_CAP, b.max)) }}</strong>.
      Left: +{{ r1(left.grind) }} grind, +{{ r1(left.buy) }} coins, +{{ r1(left.boost) }} boosts.
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

    <p class="notes">Leaves out Jerry (+10%), big Bobbin' parties and fragged Daedalus.</p>
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
  margin-top: 16px;
  font-size: 13px;
  color: var(--muted);
}
</style>
