<script setup lang="ts">
import { computed } from 'vue'
import iconMap from '../data/icon-map.json'
import generated from '../data/icons.generated.json'

const props = withDefaults(defineProps<{ source?: string; toggle?: string; size?: number }>(), { size: 32 })

type Entry = { file: string; size: number; source: string }
const items = generated.items as Record<string, Entry>

const entry = computed<Entry | undefined>(() => {
  const id = props.source
    ? (iconMap.source as Record<string, string>)[props.source]
    : props.toggle
      ? (iconMap.toggle as Record<string, string>)[props.toggle]
      : undefined
  return id ? items[id] : undefined
})
</script>

<template>
  <span class="slot" :style="{ width: size + 'px', height: size + 'px' }" aria-hidden="true">
    <img
      v-if="entry"
      :src="'/icons/' + entry.file"
      :width="size"
      :height="size"
      alt=""
      loading="lazy"
      decoding="async"
      :class="{ pixel: entry.source !== 'head' }"
    />
    <svg v-else viewBox="0 0 16 16" :width="size * 0.6" :height="size * 0.6">
      <path
        fill="currentColor"
        d="M8 1.2l1.8 4.3 4.6.3-3.5 3 1.1 4.5L8 10.9l-4 2.4 1.1-4.5-3.5-3 4.6-.3z"
      />
    </svg>
  </span>
</template>

<style scoped>
.slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: var(--star);
  opacity: 1;
}
img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
img.pixel {
  image-rendering: pixelated;
}
</style>
