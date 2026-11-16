<script setup lang="ts">
import { computed } from 'vue'
import { ACTIVITIES } from '../data/sources'
import { state } from '../store'

const note = computed(() => ACTIVITIES.find((a) => a.id === state.act)?.note ?? '')
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
        @click="state.act = a.id"
      >
        {{ a.name }}
      </button>
    </div>
    <p class="lede">{{ note }}</p>
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
</style>
