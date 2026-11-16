<script setup lang="ts">
import { computed } from 'vue'
import type { Source } from '../data/sources'
import { SLOT_NAME, SOURCES, goesOn } from '../data/sources'
import type { Plan } from '../lib/planner'
import { appliesTo } from '../lib/planner'
import { coins, r1 } from '../lib/format'
import { live, setOwned, state } from '../store'
import ItemIcon from './ItemIcon.vue'
import type { MobValue } from '../lib/payback'
import { formatHours, paybackHours } from '../lib/payback'

const props = defineProps<{ plan: Plan; value: MobValue | null }>()

const owned = computed(() => SOURCES.filter((s) => appliesTo(state)(s) && state.own[s.id]))

/** Index of the last row the budget covers; the budget marker goes right after it. */
const lastInBudget = computed(() => {
  let last = -1
  props.plan.rows.forEach((r, i) => {
    if (r.inBudget) last = i
  })
  return last
})
const budgetText = computed(() =>
  state.budget > 0 ? `Your ${coins(state.budget * 1e6)} budget ends here` : 'Set a budget to see how far it goes',
)

/** Price shown in the input, in millions: the override, else the live/default price, else blank. */
function priceValue(s: Source): string {
  const p = state.price[s.id]
  if (p !== undefined) return String(p)
  const c = live.cost[s.id] ?? s.cost
  return c === null ? '' : String(+(c / 1e6).toFixed(3))
}

function setPrice(s: Source, e: Event) {
  const raw = (e.target as HTMLInputElement).value.trim()
  const n = Number(raw)
  if (raw === '' || !Number.isFinite(n) || n < 0) delete state.price[s.id]
  else state.price[s.id] = n
}

const MARKET = { bazaar: 'Bazaar', ah: 'Auction House' } as const
/** A live price replaces the "old estimate" style warning chips; time-limited chips stay. */
function chipOf(s: Source): { text: string; kind: string } | null {
  const m = live.market[s.id]
  if (m && s.chip !== 'seasonal' && s.chip !== 'event') return { text: 'live ' + MARKET[m], kind: 'live' }
  if (!s.chip) return null
  return { text: s.chip, kind: s.chip === 'seasonal' || s.chip === 'event' ? 'time' : 'warn' }
}
</script>

<template>
  <section class="ledger">
    <div class="head">
      <div>
        <h2>Buy order</h2>
        <p class="lede">
          Cheapest Magic Find point first. Upgrade tiers stay behind the tier they build on, and only one helmet and
          one pet item count, so each row shows what it adds on top of what you have. Prices are in millions of coins
          (0.25 = 250k); clear one to go back to the default.
        </p>
      </div>
      <label class="field budget" for="budget">
        <span>Budget, millions</span>
        <input id="budget" v-model.number="state.budget" type="number" min="0" step="1" />
      </label>
    </div>

    <div class="cols" aria-hidden="true">
      <span>Own</span><span>Source</span><span class="r">Gives</span><span class="r">Price (M)</span
      ><span class="r">Per ✯</span><span class="r">Running total</span>
    </div>

    <ol class="rows">
      <template v-for="(r, i) in plan.rows" :key="r.source.id">
        <li class="row" :class="{ in: r.inBudget, unpriced: r.cost === null }">
          <span class="rank num">{{ i + 1 }}</span>
          <input
            class="own"
            type="checkbox"
            :checked="false"
            :aria-label="'I own ' + r.source.name"
            @change="setOwned(r.source.id, true)"
          />
          <div class="what">
            <ItemIcon :source="r.source.id" :size="32" />
            <div>
            <p class="name">
              {{ r.source.name }}
              <span v-if="chipOf(r.source)" class="chip" :class="chipOf(r.source)!.kind">{{ chipOf(r.source)!.text }}</span>
            </p>
            <p class="note">{{ r.source.note }}</p>
            <p v-if="goesOn(r.source, state.act)" class="note where">Goes on {{ goesOn(r.source, state.act) }}.</p>
            <p v-if="r.neededFor" class="note where">Adds nothing by itself; you need it for the {{ r.neededFor.name }}.</p>
            <p v-if="r.replaces && !r.neededFor" class="note where">
              Replaces your {{ r.replaces.name }} in the {{ SLOT_NAME[r.source.slot!] }} slot, so it adds only the
              difference.
            </p>
            <p v-if="value && r.cost && paybackHours(r.cost, r.gain, value) !== null" class="note pay">
              Earns about {{ coins(r.gain * value.perPointPerHour) }} more per hour on {{ value.mob.name }}, so it pays for itself
              after {{ formatHours(paybackHours(r.cost, r.gain, value)!) }} of farming.
            </p>
            <p v-if="live.detail[r.source.id]" class="note detail">{{ live.detail[r.source.id] }}</p>
            </div>
          </div>
          <span class="gives star num">+{{ r1(r.gain) }} ✯</span>
          <input
            class="price"
            type="number"
            min="0"
            step="0.01"
            :value="priceValue(r.source)"
            placeholder="price"
            :aria-label="'Price of ' + r.source.name + ' in millions'"
            @change="setPrice(r.source, $event)"
          />
          <span class="per num">
            <template v-if="r.coinsPerMF === null">no price</template>
            <span v-else class="coin">{{ r.coinsPerMF === 0 ? 'free' : coins(r.coinsPerMF) }}</span>
          </span>
          <span class="run num">
            <template v-if="r.runningMF !== null">
              <span class="star">{{ r1(r.runningMF) }} ✯</span>
              <span class="spent">{{ coins(r.runningCost ?? 0) }}</span>
            </template>
          </span>
        </li>
        <li v-if="i === lastInBudget" class="cut" role="presentation">{{ budgetText }}</li>
      </template>
      <li v-if="lastInBudget === -1 && plan.rows.length" class="cut first" role="presentation">
        {{ budgetText }}
      </li>
    </ol>

    <template v-if="plan.noGain.length">
      <h3>Adds nothing for you</h3>
      <p class="lede">A better item already fills the slot, so these don't add Magic Find while you farm this.</p>
      <ul class="owned">
        <li v-for="n in plan.noGain" :key="n.source.id">
          <span class="check">
            <ItemIcon :source="n.source.id" :size="20" />
            <span>{{ n.source.name }}</span>
          </span>
          <span class="muted-line">{{ n.blockedBy.name }} is better in the {{ SLOT_NAME[n.source.slot!] }} slot</span>
        </li>
      </ul>
    </template>

    <template v-if="owned.length">
      <h3>Already owned</h3>
      <ul class="owned">
        <li v-for="s in owned" :key="s.id">
          <label class="check">
            <input type="checkbox" checked @change="setOwned(s.id, false)" />
            <ItemIcon :source="s.id" :size="20" />
            <span>{{ s.name }}</span>
          </label>
          <span class="star num">+{{ r1(s.mf) }} ✯</span>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 32px;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 18px;
}
h2 {
  font-size: 24px;
  font-weight: 700;
}
.lede {
  margin-top: 4px;
  font-size: 14px;
  color: var(--muted);
  max-width: 60ch;
}
.budget {
  width: 160px;
}

/* One grid drives the column labels and every row. */
.cols,
.row {
  display: grid;
  grid-template-columns: 28px 22px minmax(0, 1fr) 72px 92px 76px 96px;
  gap: 12px;
  align-items: start;
}
.cols {
  padding: 0 12px 8px;
  font-size: 13px;
  color: var(--muted);
  border-bottom: 2px solid var(--rim);
}
.cols > span:first-child {
  grid-column: 1 / span 2;
}
.r {
  text-align: right;
}
.rows {
  list-style: none;
  margin: 0;
  padding: 0;
}
.row {
  padding: 14px 12px;
  border-bottom: 1px solid var(--rim);
}
.row.in {
  background: var(--panel);
  box-shadow: inset 3px 0 0 var(--good);
}
.rank {
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  color: var(--muted);
}
.row.in .rank {
  color: var(--good);
}
.own {
  margin-top: 3px;
}
.what {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
}
.name {
  font-weight: 700;
}
.note {
  margin-top: 2px;
  font-size: 14px;
  color: var(--muted);
  max-width: 62ch;
}
.chip {
  display: inline-block;
  margin-left: 6px;
  padding: 0 7px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  vertical-align: 2px;
  white-space: nowrap;
}
.chip.time {
  background: var(--sunk);
  color: var(--violet);
}
.chip.live {
  border: 1px solid var(--good);
  color: var(--good);
}
.where {
  color: var(--violet);
}
.muted-line {
  font-size: 13px;
  text-align: right;
}
.pay {
  color: var(--good);
  font-weight: 600;
}
.detail {
  color: var(--ink);
  opacity: 0.85;
}
.chip.warn {
  border: 1px solid var(--gold);
  color: var(--gold);
}
.gives,
.per,
.run {
  text-align: right;
  font-weight: 700;
  white-space: nowrap;
}
.price {
  text-align: right;
  padding: 4px 8px;
}
.unpriced .per {
  color: var(--muted);
  font-weight: 400;
  font-size: 14px;
}
.run {
  display: flex;
  flex-direction: column;
}
.spent {
  font-size: 13px;
  font-weight: 400;
  color: var(--muted);
}
.cut {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--good);
}
.cut::after {
  content: '';
  flex: 1;
  border-top: 2px dashed var(--good);
}

h3 {
  margin: 32px 0 8px;
  font-size: 17px;
}
.owned {
  list-style: none;
  margin: 0;
  padding: 0;
}
.owned li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--rim);
  color: var(--muted);
}

/* Phones: name across the top, numbers in a row beneath. */
@media (max-width: 720px) {
  .cols {
    display: none;
  }
  .row {
    grid-template-columns: 24px 22px repeat(3, minmax(0, 1fr));
    gap: 8px 10px;
    padding: 14px 4px;
  }
  .what {
    grid-column: 3 / -1;
  }
  .gives {
    grid-column: 3;
    grid-row: 2;
    text-align: left;
  }
  .price {
    grid-column: 4;
    grid-row: 2;
  }
  .per {
    grid-column: 5;
    grid-row: 2;
  }
  .run {
    grid-column: 3 / -1;
    grid-row: 3;
    flex-direction: row;
    gap: 10px;
    justify-content: flex-start;
    text-align: left;
  }
  .row.in {
    padding-left: 8px;
  }
  .per::before,
  .run::before {
    content: 'per ✯ ';
    font-size: 13px;
    font-weight: 400;
    color: var(--muted);
  }
  .run::before {
    content: 'Total';
  }
}
</style>
