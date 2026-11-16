<script setup lang="ts">
import { ref } from 'vue'
import type { Profile } from '../lib/hypixel'
import { NetworkBlockedError, bazaarBuyPrice, getProfiles, readMember, uuidOf } from '../lib/hypixel'
import { BOSSES } from '../data/sources'
import { coins } from '../lib/format'
import { live, state } from '../store'

const CINDERBAT_SHARDS = 24

const loading = ref(false)
const message = ref(
  'The key stays in this browser and is only sent to api.hypixel.net. Get one at developer.hypixel.net. The player needs their Skills and Slayer API settings on.',
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

async function refreshBazaar() {
  try {
    const each = await bazaarBuyPrice('SHARD_CINDER_BAT')
    if (each === null) return
    live.cost.cinder = Math.round(each * CINDERBAT_SHARDS)
    live.note.cinder = `${CINDERBAT_SHARDS} shards at ${coins(each)} each, live Bazaar price. +0.5 per level.`
  } catch {
    // keep the default price
  }
}

async function load() {
  const name = state.name.trim()
  const key = state.key.trim()
  if (!name || !key) {
    message.value = 'Enter a player name and your API key first.'
    return
  }
  loading.value = true
  message.value = 'Loading…'
  try {
    uuid.value = await uuidOf(name)
    const list = await getProfiles(uuid.value, key)
    const first = list.find((p) => p.selected) ?? list[0]
    if (!first) throw new Error('That player has no SkyBlock profiles.')
    profiles.value = list
    profileId.value = first.profile_id
    applyProfile(first.profile_id)
    void refreshBazaar()
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
  <section class="panel">
    <h2>Load a player</h2>
    <div class="grid">
      <label class="f" for="pname">
        <span>Player name or UUID</span>
        <input id="pname" v-model.trim="state.name" type="text" autocomplete="off" spellcheck="false" />
      </label>
      <label class="f" for="pkey">
        <span>Your Hypixel API key</span>
        <input id="pkey" v-model.trim="state.key" type="password" autocomplete="off" />
      </label>
      <label class="f" for="pprof">
        <span>Profile</span>
        <select id="pprof" v-model="profileId" :disabled="!profiles.length" @change="applyProfile(profileId)">
          <option v-if="!profiles.length" value="">Load a player first</option>
          <option v-for="p in profiles" :key="p.profile_id" :value="p.profile_id">
            {{ p.cute_name || p.profile_id }}
          </option>
        </select>
      </label>
    </div>
    <div class="actions">
      <button type="button" class="btn" :disabled="loading" @click="load">Load stats</button>
      <p class="note" style="max-width: 70ch" aria-live="polite">{{ message }}</p>
    </div>
  </section>
</template>

<style scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
}
</style>
