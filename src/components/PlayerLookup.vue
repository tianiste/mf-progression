<script setup lang="ts">
import { ref } from 'vue'
import type { Profile } from '../lib/hypixel'
import { NetworkBlockedError, getProfiles, readMember, uuidOf } from '../lib/hypixel'
import type { GearScan } from '../lib/gear'
import { scanGear } from '../lib/gear'
import { BOSSES, SOURCES } from '../data/sources'
import { setOwned, state } from '../store'
import { BESTIARY_MF_PER_TIER, FAMILY_NAMES, bestPetLevel, bestiaryTier } from '../lib/progress'
import { MOBS } from '../../shared/mobs'

const loading = ref(false)
const message = ref(
  'Optional. Key from developer.hypixel.net, kept in your browser.',
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

  // Bestiary tiers for every tracked family; the picked mob's tier fills Bestiary Magic Find.
  const m = member as { bestiary?: { kills?: Record<string, number> }; pets_data?: { pets?: unknown } } | undefined
  const kills = m?.bestiary?.kills
  if (kills && typeof kills === 'object') {
    const tiers: Record<string, number> = {}
    for (const fam of FAMILY_NAMES) {
      const t = bestiaryTier(fam, kills)
      if (t !== null) tiers[fam] = t
    }
    state.bestiary = tiers
    const fam = MOBS.find((x) => x.id === state.mob)?.bestiary
    if (fam && tiers[fam] !== undefined) {
      state.prog.best = tiers[fam]! * BESTIARY_MF_PER_TIER
      got.push(`${fam} Bestiary tier ${tiers[fam]}`)
    } else got.push('Bestiary')
  } else miss.push('Bestiary')

  // Griffin (King of Kings needs Legendary or better) and Megalodon levels.
  const griffin = bestPetLevel(m?.pets_data?.pets, 'GRIFFIN', 'LEGENDARY')
  if (griffin !== null) {
    state.prog.griffin = griffin
    got.push('Griffin ' + griffin)
  }
  const mega = bestPetLevel(m?.pets_data?.pets, 'MEGALODON')
  if (mega !== null) {
    state.prog.mega = mega
    got.push('Megalodon ' + mega)
  }

  gear.value = null
  try {
    const scan = await scanGear(member)
    gear.value = scan
    for (const s of scan.owned) setOwned(s, true)
    if (!scan.inventoryApi) miss.push('inventory (API setting off)')
  } catch {
    miss.push('inventory')
  }

  message.value =
    `${p.cute_name || 'Profile'}: ${got.join(', ') || 'nothing'}.` + (miss.length ? ` Missing: ${miss.join(', ')}.` : '')
}

async function load() {
  const name = state.name.trim()
  const key = state.key.trim()
  if (!name || !key) {
    message.value = 'Need a name and a key.'
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
        ? "Couldn't reach the internet."
        : 'Failed: ' + (e instanceof Error ? e.message : String(e))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="block">
    <h2>Profile</h2>
    <label class="field" for="pname">
      <span>Name</span>
      <input id="pname" v-model.trim="state.name" type="text" autocomplete="off" spellcheck="false" />
    </label>
    <label class="field" for="pkey">
      <span>API key</span>
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
      {{ loading ? 'Loading…' : 'Load' }}
    </button>
    <p class="lede" aria-live="polite">{{ message }}</p>

    <div v-if="gear && gear.inventoryApi" class="gear">
      <p v-if="gear.owned.size" class="lede">Found: {{ [...gear.owned].map(sourceName).join(', ') }}</p>
      <template v-if="gear.looting.length">

        <ul>
          <li v-for="(l, i) in gear.looting.slice(0, 6)" :key="i">
            {{ l.name }}: Looting {{ ROMAN[l.level] ?? l.level }} <span class="where">({{ l.where }})</span>
          </li>
        </ul>
      </template>
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
