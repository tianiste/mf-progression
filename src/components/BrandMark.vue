<script setup lang="ts">
import { ROWS, STAR } from './brand-paths'

withDefaults(defineProps<{ size?: number }>(), { size: 32 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 256 256" aria-hidden="true" focusable="false">
    <path :d="ROWS" fill="var(--violet)" />
    <path :d="STAR" fill="var(--star)" />
  </svg>
</template>
