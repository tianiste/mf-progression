<script setup lang="ts">
import { computed } from 'vue'
import type { BossId, ProgressStat } from '../data/sources'
import { BOSSES, PROGRESS, TOGGLES } from '../data/sources'
import { state } from '../store'
import { appliesTo } from '../lib/planner'
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
  <section class="panel">
    <h2>Your progress (no coin price)</h2>
    <div class="grid">
      <label v-if="state.act === 'slayer'" class="f" for="boss">
        <span>Boss</span>
        <select id="boss" :value="state.boss" @change="setBoss">
          <option v-for="b in BOSSES" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <span>level loads with the player</span>
      </label>
      <label v-for="p in stats" :key="p.id" class="f" :for="'p_' + p.id">
        <span>{{ p.name }} <b>+{{ bonus(p) }}</b></span>
        <input :id="'p_' + p.id" type="number" min="0" :max="p.max" :value="value(p)" @change="setValue(p, $event)" />
        <span>{{ p.hint }}</span>
      </label>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 14px">
      <label v-for="g in TOGGLES" :key="g.id" class="c" :for="'t_' + g.id">
        <input :id="'t_' + g.id" v-model="state.tog[g.id]" type="checkbox" />
        {{ g.name }}
      </label>
    </div>
  </section>
</template>
