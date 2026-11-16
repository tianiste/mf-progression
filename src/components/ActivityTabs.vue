<script setup lang="ts">
import { computed } from 'vue'
import { ACTIVITIES } from '../data/sources'
import { state } from '../store'

const note = computed(() => ACTIVITIES.find((a) => a.id === state.act)?.note ?? '')
</script>

<template>
  <section class="panel">
    <h2>What are you killing?</h2>
    <div class="tabs">
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
    <p class="note" style="margin-top: 8px; max-width: 70ch">{{ note }}</p>
  </section>
</template>
