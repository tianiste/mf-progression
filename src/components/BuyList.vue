<script setup lang="ts">
import { computed } from 'vue'
import type { Source } from '../data/sources'
import { SOURCES } from '../data/sources'
import type { Plan } from '../lib/planner'
import { appliesTo } from '../lib/planner'
import { coins, r1 } from '../lib/format'
import { live, setOwned, state } from '../store'

defineProps<{ plan: Plan }>()

const owned = computed(() => SOURCES.filter((s) => appliesTo(state.act)(s) && state.own[s.id]))

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

const chipClass = (s: Source) => (s.chip === 'seasonal' || s.chip === 'event' ? 'a' : 'w')
const noteOf = (s: Source) => live.note[s.id] ?? s.note
</script>

<template>
  <section class="panel">
    <div class="list-head">
      <h2 style="margin: 0">Buy order, cheapest Magic Find first</h2>
      <label class="f" style="width: 170px" for="budget">
        <span>Budget (million coins)</span>
        <input id="budget" v-model.number="state.budget" type="number" min="0" step="1" />
      </label>
    </div>
    <div class="scroll">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Own</th>
            <th>Source</th>
            <th class="n">+MF</th>
            <th class="n">Price (M)</th>
            <th class="n">Coins / MF</th>
            <th class="n">Running MF</th>
            <th class="n">Running cost</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in plan.rows" :key="r.source.id" :class="{ in: r.inBudget }">
            <td class="step">{{ i + 1 }}</td>
            <td>
              <input
                type="checkbox"
                :checked="false"
                :aria-label="'Own ' + r.source.name"
                @change="setOwned(r.source.id, true)"
              />
            </td>
            <td>
              <div class="nm">
                {{ r.source.name
                }}<span v-if="r.source.chip" class="chip" :class="chipClass(r.source)">{{ r.source.chip }}</span>
              </div>
              <div class="note">{{ noteOf(r.source) }}</div>
            </td>
            <td class="n">+{{ r1(r.source.mf) }}</td>
            <td class="n">
              <input
                type="number"
                min="0"
                step="0.01"
                :value="priceValue(r.source)"
                :aria-label="'Price of ' + r.source.name + ' in millions'"
                @change="setPrice(r.source, $event)"
              />
            </td>
            <td class="n">
              <span v-if="r.coinsPerMF === null" class="chip">set a price</span>
              <template v-else>{{ r.coinsPerMF === 0 ? 'free' : coins(r.coinsPerMF) }}</template>
            </td>
            <td class="n">{{ r.runningMF === null ? '' : r1(r.runningMF) }}</td>
            <td class="n">{{ r.runningCost === null ? '' : coins(r.runningCost) }}</td>
          </tr>
          <tr v-for="s in owned" :key="'own-' + s.id" class="own">
            <td class="step"></td>
            <td>
              <input type="checkbox" checked :aria-label="'Own ' + s.name" @change="setOwned(s.id, false)" />
            </td>
            <td>
              <div class="nm">{{ s.name }}</div>
              <div class="note">{{ noteOf(s) }}</div>
            </td>
            <td class="n">+{{ r1(s.mf) }}</td>
            <td class="n" colspan="4"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="note" style="margin-top: 10px; max-width: 75ch">
      Green edge = inside your budget. Rows with no price sit at the bottom until you type one in. Prices are per row, in
      millions (0.86 = 860k). Clear a price to go back to the default.
    </p>
  </section>
</template>

<style scoped>
.list-head {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>
