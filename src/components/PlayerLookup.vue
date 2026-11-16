<script setup lang="ts">
import { ref } from 'vue'
import type { Profile } from '../lib/hypixel'
import { NetworkBlockedError, getProfiles, readMember, uuidOf } from '../lib/hypixel'
import { BOSSES } from '../data/sources'
import { state } from '../store'

const loading = ref(false)
const message = ref(
  'Fills in combat level, pet score, slayer levels and Booster Cookie. Get a key at developer.hypixel.net; it stays in this browser and is only sent to api.hypixel.net.',
)
const uuid = ref('')
const profiles = ref<Profile[]>([])
const profileId = ref('')

function applyProfile(id: string) {
  const p = profiles.value.find((x) => x.profile_id === id)
  if (!p) return
  const r = readMember(p.members?.[uuid.value])
  const got: string[] = []
  const miss: string[] = []
  if (r.combat !== undefined) {
    state.prog.combat = r.combat
    got.push('Combat ' + r.combat)
  } else miss.push('Combat level')
  if (r.petScore !== undefined) {
    state.prog.pet = r.petScore
    got.push('Pet Score ' + r.petScore)
  } else miss.push('Pet Score')
  const slayers = r.slayers
  if (slayers) {
    state.slayers = slayers
    state.prog.slv = slayers[state.boss] ?? 0
    got.push('Slayers ' + BOSSES.map((b) => slayers[b.id] ?? 0).join('/'))
  } else miss.push('Slayer levels')
  if (r.cookie !== undefined) {
    state.tog.cookie = r.cookie
    got.push('Cookie ' + (r.cookie ? 'on' : 'off'))
  }
  message.value =
    `Loaded ${p.cute_name || 'profile'}: ${got.join(', ') || 'nothing'}.` +
    (miss.length ? ` Not in the API response: ${miss.join(', ')}.` : '') +
    ' Set by hand: Bestiary, account upgrade, pet levels and the items you own.'
}


async function load() {
  const name = state.name.trim()
  const key = state.key.trim()
  if (!name || !key) {
    message.value = 'Enter a player name and your API key first.'
    return
  }
  loading.value = true
  message.value = ''
  try {
    uuid.value = await uuidOf(name)
    const list = await getProfiles(uuid.value, key)
    const first = list.find((p) => p.selected) ?? list[0]
    if (!first) throw new Error('That player has no SkyBlock profiles.')
    profiles.value = list
    profileId.value = first.profile_id
    applyProfile(first.profile_id)
  } catch (e) {
    message.value =
      e instanceof NetworkBlockedError
        ? 'This page could not reach the internet. Open it in Chrome, Edge or Firefox; some embedded previews block network requests.'
        : 'Lookup failed: ' + (e instanceof Error ? e.message : String(e))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="block">
    <h2>Load your profile</h2>
    <label class="field" for="pname">
      <span>Player name or UUID</span>
      <input id="pname" v-model.trim="state.name" type="text" autocomplete="off" spellcheck="false" />
    </label>
    <label class="field" for="pkey">
      <span>Hypixel API key</span>
      <input id="pkey" v-model.trim="state.key" type="password" autocomplete="off" />
    </label>
    <label v-if="profiles.length" class="field" for="pprof">
      <span>Profile</span>
      <select id="pprof" v-model="profileId" @change="applyProfile(profileId)">
        <option v-for="p in profiles" :key="p.profile_id" :value="p.profile_id">
          {{ p.cute_name || p.profile_id }}
        </option>
      </select>
    </label>
    <button type="button" class="btn" :disabled="loading" @click="load">
      {{ loading ? 'Loading…' : 'Load profile' }}
    </button>
    <p class="lede" aria-live="polite">{{ message }}</p>
  </section>
</template>
