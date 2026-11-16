<script setup lang="ts">
import { computed } from 'vue'
import { MF_CAP, goesOn } from '../data/sources'
import type { Plan } from '../lib/planner'
import { coins, r1 } from '../lib/format'
import { live, state } from '../store'
import ItemIcon from './ItemIcon.vue'

const props = defineProps<{ plan: Plan }>()

const next = computed(() => props.plan.rows[0])
const after = computed(() => props.plan.rows.slice(1, 3))
const cap = (x: number) => Math.min(MF_CAP, x)
const mult = (x: number) => '×' + (1 + cap(x) / 100).toFixed(2)
const gain = computed(() => props.plan.budgetMF - props.plan.now)
const budgetLabel = computed(() => (state.budget > 0 ? coins(state.budget * 1e6) : 'no'))
</script>

<template>
  <div class="tooltip" aria-live="polite">
    <template v-if="next">
      <p class="kicker">Buy this next</p>
      <div class="item-row">
        <ItemIcon :source="next.source.id" :size="48" />
        <p class="item">{{ next.source.name }}</p>
      </div>
      <p class="line star-line">✯ Magic Find +{{ r1(next.gain) }}</p>
      <p v-if="next.cost === null" class="line muted">No price yet. Type one into the list below.</p>
      <p v-else-if="next.cost === 0" class="line coin-line">Free: costs only XP or time</p>
      <p v-else class="line coin-line">
        {{ coins(next.cost) }} coins, {{ coins(next.coinsPerMF ?? 0) }} per ✯
      </p>
      <p v-if="goesOn(next.source, state.act)" class="line where">Goes on {{ goesOn(next.source, state.act) }}.</p>
      <p class="line muted note">{{ next.source.note }}</p>
      <p v-if="live.detail[next.source.id]" class="line muted note live">{{ live.detail[next.source.id] }}</p>
      <p v-if="after.length" class="line muted then">
        Then {{ after.map((r) => r.source.name).join(', then ') }}.
      </p>
    </template>
    <template v-else>
      <p class="kicker">Nothing left to buy</p>
      <p class="item">You own every source for this activity.</p>
    </template>

    <dl class="readout">
      <div>
        <dt>You have</dt>
        <dd><span class="big">{{ r1(cap(plan.now)) }}</span> ✯ <span class="sub">{{ mult(plan.now) }} drops</span></dd>
      </div>
      <div>
        <dt>With a {{ budgetLabel }} budget</dt>
        <dd>
          <span class="big">{{ r1(cap(plan.budgetMF)) }}</span> ✯
          <span class="sub">+{{ r1(gain) }} for {{ coins(plan.budgetCost) }}</span>
        </dd>
      </div>
      <div>
        <dt>Everything listed</dt>
        <dd><span class="big">{{ r1(cap(plan.everything)) }}</span> ✯ <span class="sub">cap {{ MF_CAP }}</span></dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
/* Drawn like an item tooltip: dark violet fill, inset violet rim, notched pixel corners. */
.tooltip {
  --n: 4px;
  background: var(--tip-bg);
  color: var(--tip-ink);
  padding: 26px 28px 24px;
  box-shadow:
    inset 0 0 0 4px var(--tip-bg),
    inset 0 0 0 7px var(--tip-rim);
  clip-path: polygon(
    var(--n) 0,
    calc(100% - var(--n)) 0,
    calc(100% - var(--n)) var(--n),
    100% var(--n),
    100% calc(100% - var(--n)),
    calc(100% - var(--n)) calc(100% - var(--n)),
    calc(100% - var(--n)) 100%,
    var(--n) 100%,
    var(--n) calc(100% - var(--n)),
    0 calc(100% - var(--n)),
    0 var(--n),
    var(--n) var(--n)
  );
}
.kicker {
  font-size: 13px;
  color: var(--tip-muted);
}
.item-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 8px 0 10px;
}
.item-row .item {
  margin: 0;
}
.item {
  font-family: var(--pixel);
  font-weight: 700;
  font-size: clamp(24px, 3vw, 30px);
  line-height: 1.15;
  margin: 4px 0 10px;
  color: #ffffff;
  text-wrap: balance;
}
.line {
  font-size: 15px;
}
.star-line {
  color: var(--tip-star);
  font-weight: 600;
}
.where {
  margin-top: 8px;
  color: var(--tip-gold);
  font-size: 14px;
}
.coin-line {
  color: var(--tip-gold);
  font-weight: 600;
}
.muted {
  color: var(--tip-muted);
}
.note {
  margin-top: 10px;
  font-size: 14px;
  max-width: 52ch;
}
.note.live {
  margin-top: 4px;
}
.then {
  margin-top: 6px;
  font-size: 14px;
}
.readout {
  margin: 20px 0 0;
  padding-top: 16px;
  border-top: 2px solid var(--tip-rim);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.readout dt {
  font-size: 13px;
  color: var(--tip-muted);
}
.readout dd {
  margin: 2px 0 0;
  color: var(--tip-star);
  font-variant-numeric: tabular-nums;
}
.big {
  font-weight: 700;
  font-size: 32px;
  letter-spacing: -0.01em;
  line-height: 1;
}
.sub {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: var(--tip-muted);
}
@media (max-width: 480px) {
  .tooltip {
    padding: 22px 20px 20px;
  }
  .readout {
    grid-template-columns: 1fr;
  }
  .readout > div {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }
  .sub {
    display: inline;
    margin-left: 6px;
  }
}
</style>
