<script setup lang="ts">
import { computed } from 'vue'
import type { BossId, ProgressStat } from '../data/sources'
import { BOSSES, PROGRESS, TOGGLES } from '../data/sources'
import { state } from '../store'
import { appliesTo } from '../lib/planner'
import ItemIcon from './ItemIcon.vue'
import { r1 } from '../lib/format'

const stats = computed(() => PROGRESS.filter(appliesTo(state.act)))

const value = (p: ProgressStat) => state.prog[p.id] ?? 0
const bonus = (p: ProgressStat) => r1(p.mf(Math.min(p.max, value(p)), state.boss))

function setValue(p: ProgressStat, e: Event) {
  const n = Number((e.target as HTMLInputElement).value)
  state.prog[p.id] = Number.isFinite(n) && n > 0 ? n : 0
}

function setBoss(e: Event) {
  state.boss = (e.target as HTMLSelectElement).value as BossId
  const loaded = state.slayers[state.boss]
  if (loaded !== undefined) state.prog.slv = loaded
}
</script>

<template>
  <section class="block">
    <h2>What you already have</h2>
    <label v-if="state.act === 'slayer'" class="field" for="boss">
      <span>Slayer boss</span>
      <select id="boss" :value="state.boss" @change="setBoss">
        <option v-for="b in BOSSES" :key="b.id" :value="b.id">{{ b.name }}</option>
      </select>
    </label>
    <div class="stats">
      <label v-for="p in stats" :key="p.id" class="stat" :for="'p_' + p.id">
        <span class="name">{{ p.name }}</span>
        <input :id="'p_' + p.id" type="number" min="0" :max="p.max" :value="value(p)" @change="setValue(p, $event)" />
        <span class="hint">{{ p.hint }}</span>
        <span class="bonus star num">+{{ bonus(p) }} ✯</span>
      </label>
    </div>
    <div class="toggles">
      <label v-for="g in TOGGLES" :key="g.id" class="check" :for="'t_' + g.id">
        <input :id="'t_' + g.id" v-model="state.tog[g.id]" type="checkbox" />
        <ItemIcon v-if="g.id !== 'aatrox'" :toggle="g.id" :size="20" />
        <span>{{ g.name }}</span>
      </label>
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.stat {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 84px;
  gap: 2px 12px;
  align-items: center;
  font-size: 14px;
}
.name {
  font-weight: 600;
}
.stat input {
  grid-row: span 2;
  text-align: right;
}
.hint {
  font-size: 13px;
  color: var(--muted);
}
.bonus {
  grid-column: 1 / -1;
  font-size: 13px;
  font-weight: 700;
}
.toggles {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
}
</style>
