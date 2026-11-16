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
  if (!m?.bestiary) return ''
  const tier = state.bestiary[m.bestiary]
  return tier === undefined ? '' : `Bestiary ${tier}`
})
</script>

<template>
  <section class="block">
    <h2>Farming</h2>
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
    <p v-if="note" class="lede">{{ note }}</p>

    <label class="field" for="mob">
      <span>Mob</span>
      <select id="mob" :value="state.mob" @change="pickMob(($event.target as HTMLSelectElement).value)">
        <option value="">Any mob</option>
        <option v-for="m in mobs" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
    </label>

    <template v-if="mob">
      <p class="lede">{{ mob.types.join(', ') }}<template v-if="bestiaryLine">. {{ bestiaryLine }}</template></p>
      <label class="field" for="kph">
        <span>Kills per hour</span>
        <input id="kph" type="number" min="0" step="1" :value="kph" @change="setKph" />
      </label>
      <p v-if="props.value && props.value.perPointPerHour > 0" class="value">
        1 MF ≈ <strong class="coin">{{ coins(props.value.perPointPerKill) }}</strong>/kill,
        <strong class="coin">{{ coins(props.value.perPointPerHour) }}</strong>/h
      </p>
      <p v-else-if="props.value && mob.drops.length" class="lede">No drop prices yet.</p>
      <p v-if="mob.dataNote" class="lede">{{ mob.dataNote }}</p>
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
