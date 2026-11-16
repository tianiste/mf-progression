<script setup lang="ts">
import { computed } from 'vue'
import { ACTIVITIES } from '../data/sources'
import { MOBS } from '../../shared/mobs'
import type { MobValue } from '../lib/payback'
import { coins } from '../lib/format'
import { pickActivity, pickMob, state } from '../store'

const props = defineProps<{ value: MobValue | null }>()

const note = computed(() => ACTIVITIES.find((a) => a.id === state.act)?.note ?? '')
/** Mobs for the open tab; on "Anything" every mob, grouped by activity. */
const mobs = computed(() => (state.act === 'all' ? MOBS : MOBS.filter((m) => m.act === state.act)))
const mob = computed(() => MOBS.find((m) => m.id === state.mob))
const kph = computed(() => (mob.value ? (state.kph[mob.value.id] ?? mob.value.killsPerHour) : 0))

function setKph(e: Event) {
  if (!mob.value) return
  const n = Number((e.target as HTMLInputElement).value)
  if (Number.isFinite(n) && n > 0) state.kph[mob.value.id] = n
  else delete state.kph[mob.value.id]
}

const bestiaryLine = computed(() => {
  const m = mob.value
  if (!m?.bestiary) return m ? 'No Bestiary family for this mob.' : ''
  const tier = state.bestiary[m.bestiary]
  return tier === undefined
    ? `Bestiary: ${m.bestiary}. Load your profile to fill in your tier.`
    : `Bestiary: ${m.bestiary}, tier ${tier} (filled in below).`
})
</script>

<template>
  <section class="block">
    <h2>What are you farming?</h2>
    <div class="seg" role="group" aria-label="Activity">
      <button
        v-for="a in ACTIVITIES"
        :key="a.id"
        type="button"
        :aria-pressed="a.id === state.act"
        @click="pickActivity(a.id)"
      >
        {{ a.name }}
      </button>
    </div>
    <p class="lede">{{ note }}</p>

    <label class="field" for="mob">
      <span>Mob</span>
      <select id="mob" :value="state.mob" @change="pickMob(($event.target as HTMLSelectElement).value)">
        <option value="">Any mob</option>
        <option v-for="m in mobs" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
      <span class="hint">Picks the matching attribute shard, Witch stew rule and Bestiary, and shows payback time.</span>
    </label>

    <template v-if="mob">
      <p class="lede">Mob types: {{ mob.types.join(', ') }}. {{ bestiaryLine }}</p>
      <label class="field" for="kph">
        <span>Your kills per hour</span>
        <input id="kph" type="number" min="0" step="1" :value="kph" @change="setKph" />
        <span class="hint">Starts at a rough guess ({{ mob.killsPerHour }}); set your own for real payback times.</span>
      </label>
      <p v-if="props.value && props.value.perPointPerHour > 0" class="value">
        Each Magic Find point is worth about <strong class="coin">{{ coins(props.value.perPointPerKill) }}</strong> per kill,
        <strong class="coin">{{ coins(props.value.perPointPerHour) }}</strong> per hour.
      </p>
      <p v-else-if="props.value" class="lede">No priced drops for this mob yet, so there is no payback time.</p>
      <p class="lede">
        {{ mob.dataNote }}
        <template v-if="props.value && props.value.missing.length">
          {{ props.value.missing.length }} of {{ props.value.total }} drops have no price right now and are left out.
        </template>
      </p>
    </template>
  </section>
</template>

<style scoped>
.seg {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.seg button {
  padding: 6px 12px;
  border: 1px solid var(--rim);
  border-radius: 4px;
  background: var(--panel);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.seg button[aria-pressed='true'] {
  background: var(--violet);
  border-color: var(--violet);
  color: var(--bg);
}
.value {
  font-size: 14px;
}
</style>
