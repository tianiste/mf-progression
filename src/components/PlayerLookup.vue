<script setup lang="ts">
import { ref } from 'vue'
import type { Profile } from '../lib/hypixel'
import { NetworkBlockedError, getProfiles, readMember, uuidOf } from '../lib/hypixel'
import type { GearScan } from '../lib/gear'
import { scanGear } from '../lib/gear'
import { BOSSES, SOURCES } from '../data/sources'
import { setOwned, state } from '../store'

const loading = ref(false)
const message = ref(
  'Fills in combat level, pet score, slayer levels, Booster Cookie and the Magic Find gear you own. Get a key at developer.hypixel.net; it stays in this browser and is only sent to api.hypixel.net.',
)
const uuid = ref('')
const profiles = ref<Profile[]>([])
const profileId = ref('')
const gear = ref<GearScan | null>(null)

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
const sourceName = (id: string) => SOURCES.find((s) => s.id === id)?.name ?? id

async function applyProfile(id: string) {
  const p = profiles.value.find((x) => x.profile_id === id)
  if (!p) return
  const member = p.members?.[uuid.value]
  const r = readMember(member)
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

  gear.value = null
  try {
    const scan = await scanGear(member)
    gear.value = scan
    for (const s of scan.owned) setOwned(s, true)
    if (!scan.inventoryApi) miss.push('inventories (turn on the Inventory API in your SkyBlock settings)')
  } catch {
    miss.push('inventories (could not be read)')
  }

  message.value =
    `Loaded ${p.cute_name || 'profile'}: ${got.join(', ') || 'nothing'}.` +
    (miss.length ? ` Not in the API response: ${miss.join(', ')}.` : '') +
    ' Set by hand: Bestiary, account upgrade, pet levels and attribute shards.'
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
    await applyProfile(first.profile_id)
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

    <div v-if="gear && gear.inventoryApi" class="gear">
      <h3>Your Magic Find gear</h3>
      <p v-if="gear.owned.size" class="lede">
        Ticked as owned: {{ [...gear.owned].map(sourceName).join(', ') }}.
      </p>
      <p v-else class="lede">No Magic Find items found in your inventories.</p>
      <template v-if="gear.looting.length">
        <p class="lede">Looting on your items:</p>
        <ul>
          <li v-for="(l, i) in gear.looting.slice(0, 6)" :key="i">
            {{ l.name }}: Looting {{ ROMAN[l.level] ?? l.level }} <span class="where">({{ l.where }})</span>
          </li>
        </ul>
        <p class="lede">Looting only counts on the item you kill with, so put your best book on that one.</p>
      </template>
      <p v-else class="lede">None of your items have Looting yet.</p>
    </div>
  </section>
</template>

<style scoped>
.gear {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 4px;
}
h3 {
  font-size: 15px;
}
ul {
  margin: 0;
  padding-left: 18px;
  font-size: 14px;
}
.where {
  color: var(--muted);
  font-size: 13px;
}
</style>
