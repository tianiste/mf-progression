// Copies the item icons the site uses into public/icons and writes src/data/icons.generated.json.
//
// Usage: node scripts/import-icons.mjs <Hypixel SkyBlock pack> <Minecraft client jar contents> [--furfsky <FurfSky Reborn pack>]
// (all unzipped, outside the repo). Adapted from SkyProgression-WEB's importer.
//
// Sources, first match wins:
//   1. FurfSky Reborn, only when --furfsky is given. Its textures need the FurfSky Reborn team's permission for this
//      site; the permission granted to SkyProgression does not cover Luckledger.
//   2. The official Hypixel SkyBlock Resource Pack (Hypixel API /v2/resources/packs; free use on Hypixel-related sites).
//   3. The item's player head skin from Hypixel's public items resource, or for attribute shards the head from
//      NotEnoughUpdates-REPO (MIT), drawn as a small isometric cube like SkyCrypt draws heads.
//   4. Minecraft's own texture: an explicit minecraft:<name> in icon-map.json, or the item's in-game material.
// Anything else gets the site's own fallback icon.
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(name)
  if (i < 0) return undefined
  const [, value] = args.splice(i, 2)
  return value
}
const furfsky = flag('--furfsky')
const [hypixel, minecraft] = args
if (!hypixel || !fs.existsSync(path.join(hypixel, 'assets/hypixel_skyblock')) || !minecraft) {
  console.error('Usage: node scripts/import-icons.mjs <Hypixel SkyBlock pack> <Minecraft client jar contents> [--furfsky <pack>]')
  process.exit(1)
}

const root = path.resolve(import.meta.dirname, '..')
const outDir = path.join(root, 'public', 'icons')
const map = JSON.parse(fs.readFileSync(path.join(root, 'src/data/icon-map.json'), 'utf8'))
const NEU_COMMIT = '10f61150886e2c4a7151aeed0c2172bc0e4d2eca'

const wanted = [...new Set([...Object.values(map.source), ...Object.values(map.toggle)])].sort()

/** Resolves a model reference to its first layer0 texture file, following parents, within the given namespaces. */
function textureResolver(assets, namespaces) {
  const split = (ref) => (ref.includes(':') ? ref.split(':') : ['minecraft', ref])
  const readModel = (ref) => {
    const [ns, rest] = split(ref)
    const file = path.join(assets, ns, 'models', `${rest}.json`)
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
  }
  return (modelRef) => {
    for (let ref = modelRef, depth = 0; ref && depth < 8; depth++) {
      const model = readModel(ref)
      if (!model) return null
      const layer = model.textures?.layer0
      if (layer) {
        const [ns, rest] = split(layer)
        if (!namespaces.includes(ns)) return null
        const file = path.join(assets, ns, 'textures', `${rest}.png`)
        return fs.existsSync(file) ? file : null
      }
      ref = model.parent
    }
    return null
  }
}

function readPng(buf) {
  const end = buf.indexOf('IEND')
  if (end > 0) buf = buf.subarray(0, end + 8)
  return { png: PNG.sync.read(buf), bytes: buf }
}

function writePng(png, dest, original) {
  const encoded = PNG.sync.write(png, { deflateLevel: 9 })
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, original && original.length <= encoded.length ? original : encoded)
}

/** Writes the texture's first square frame (animated textures are vertical strips). */
function copyTexture(src, dest) {
  const { png, bytes } = readPng(fs.readFileSync(src))
  const size = png.width
  if (png.height > size) {
    const frame = new PNG({ width: size, height: size })
    png.data.copy(frame.data, 0, 0, size * size * 4)
    writePng(frame, dest)
  } else writePng(png, dest, bytes)
  return size
}

/** A player head skin drawn as a small isometric cube (top, front, left side, hat layer, simple shading), 32x32. */
function headIso(skin, dest) {
  const { png } = readPng(skin)
  const S = 32, L = 15, c = Math.cos(Math.PI / 6), s = 0.5, ox = 16, oy = L + 1, SS = 4
  const texel = (tx, ty) => {
    const i = (Math.min(ty, png.height - 1) * png.width + Math.min(tx, png.width - 1)) * 4
    return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]]
  }
  // Old 64x32 skins often fill the hat area with a solid colour; Minecraft ignores a hat layer with no transparent pixels.
  let hatHasAlpha = false
  for (let y = 0; y < 16 && !hatHasAlpha; y++) for (let x = 32; x < 64; x++) if (texel(x, y)[3] < 255) { hatHasAlpha = true; break }
  const faces = [
    { at: [8, 0], shade: 1, uv: (px, py) => { const a = px / c, b = (py + L) / s; const x = (a + b) / 2, z = (b - a) / 2; return [x / L, z / L] } },
    { at: [8, 8], shade: 0.86, uv: (px, py) => { const x = px / c + L; const y = x * s + L * s - py; return [x / L, (L - y) / L] } },
    { at: [16, 8], shade: 0.7, uv: (px, py) => { const z = L - px / c; const y = L * s + z * s - py; return [(L - z) / L, (L - y) / L] } },
  ]
  const sample = (px, py) => {
    let out = null
    for (const f of faces) {
      const [u, v] = f.uv(px, py)
      if (u < 0 || u >= 1 || v < 0 || v >= 1) continue
      const tx = f.at[0] + Math.floor(u * 8), ty = f.at[1] + Math.floor(v * 8)
      const base = texel(tx, ty), hat = texel(tx + 32, ty)
      const a = hatHasAlpha ? hat[3] / 255 : 0
      out = [...[0, 1, 2].map((k) => (hat[k] * a + base[k] * (1 - a)) * f.shade), 255]
      if (f !== faces[0]) break
    }
    return out
  }
  const img = new PNG({ width: S, height: S })
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const acc = [0, 0, 0, 0]
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++) {
          const c4 = sample(x + (sx + 0.5) / SS - ox, y + (sy + 0.5) / SS - oy)
          if (!c4) continue
          for (let k = 0; k < 3; k++) acc[k] += c4[k]
          acc[3] += 1
        }
      const o = (y * S + x) * 4
      if (acc[3]) for (let k = 0; k < 3; k++) img.data[o + k] = Math.round(acc[k] / acc[3])
      img.data[o + 3] = Math.round((acc[3] / (SS * SS)) * 255)
    }
  writePng(img, dest)
  return S
}

// 1. FurfSky Reborn (only with permission): firmskyblock/models/item/<id>.json per SkyBlock id.
let fromFurfsky = () => null
if (furfsky) {
  const t = textureResolver(path.join(furfsky, 'assets'), ['firmskyblock', 'cittofirmgenerated'])
  fromFurfsky = (id) => t(`firmskyblock:item/${id.toLowerCase()}`)
}

// 2. Hypixel SkyBlock Resource Pack: hypixel_skyblock/items/item/**/<id>.json points at a model. Only Hypixel's own
// namespace is used.
const hypAssets = path.join(hypixel, 'assets')
const hypIndex = new Map()
for (const f of fs.readdirSync(path.join(hypAssets, 'hypixel_skyblock/items/item'), { recursive: true }))
  if (f.endsWith('.json')) hypIndex.set(path.basename(f, '.json'), path.join(hypAssets, 'hypixel_skyblock/items/item', f))
const hypTexture = textureResolver(hypAssets, ['hypixel_skyblock'])
const firstModel = (node) => {
  if (!node || typeof node !== 'object') return null
  if ((node.type === 'minecraft:model' || node.type === 'model') && typeof node.model === 'string') return node.model
  for (const v of Object.values(node)) {
    const found = firstModel(v)
    if (found) return found
  }
  return null
}
const fromHypixel = (id) => {
  const file = hypIndex.get(id.toLowerCase())
  if (!file) return null
  const model = firstModel(JSON.parse(fs.readFileSync(file, 'utf8')))
  return model?.startsWith('hypixel_skyblock:') ? hypTexture(model) : null
}

// 4. Minecraft textures: minecraft:<path> or minecraft:<item>, item texture first, then block.
const fromMinecraft = (ref) => {
  if (!ref?.startsWith('minecraft:')) return null
  const name = ref.slice('minecraft:'.length)
  for (const t of name.includes('/') ? [name] : [`item/${name}`, `block/${name}`]) {
    const file = path.join(minecraft, 'assets/minecraft/textures', `${t}.png`)
    if (fs.existsSync(file)) return file
  }
  return null
}
/** 1.8 material names in the items resource that differ from today's item names. */
const LEGACY = { GOLD_HELMET: 'golden_helmet', SKULL_ITEM: null, PAPER: null }

// 3. Head skins: Hypixel's items resource, and NEU-REPO for attribute shards (not in the items resource).
const items = new Map()
for (const item of (await (await fetch('https://api.hypixel.net/v2/resources/skyblock/items')).json()).items ?? []) items.set(item.id, item)
const skinUrl = (b64) => {
  try {
    const url = JSON.parse(Buffer.from(b64, 'base64').toString('utf8')).textures?.SKIN?.url
    return url?.startsWith('http://textures.minecraft.net/texture/') ? url.replace('http://', 'https://') : null
  } catch {
    return null
  }
}
const neuShards = (await (await fetch(`https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/${NEU_COMMIT}/constants/attribute_shards.json`)).json()).attributes
async function headUrl(id) {
  const value = items.get(id)?.skin?.value
  if (value) return skinUrl(value)
  const shard = neuShards.find((a) => a.bazaarName === id)
  if (!shard) return null
  const neu = await (await fetch(`https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/${NEU_COMMIT}/items/${encodeURIComponent(shard.internalName)}.json`)).json()
  const m = /Value:\\?"([A-Za-z0-9+/=]+)\\?"/.exec(neu.nbttag ?? '')
  return m ? skinUrl(m[1]) : null
}

fs.rmSync(outDir, { recursive: true, force: true })
const manifest = {
  sources: {
    furfsky: furfsky ? 'FurfSky Reborn resource pack' : undefined,
    hypixel: 'Hypixel SkyBlock Resource Pack (Hypixel API /v2/resources/packs)',
    head: 'Player head skins from the Hypixel API items resource and NotEnoughUpdates-REPO (attribute shards)',
    minecraft: 'Minecraft client textures',
  },
  items: {},
}
const missing = []
const fileName = (id) => id.toLowerCase().replace(/[^a-z0-9_]/g, '_') + '.png'

for (const id of wanted) {
  if (id.startsWith('minecraft:')) {
    const tex = fromMinecraft(id)
    if (!tex) { missing.push(id); continue }
    const file = `minecraft/${fileName(id.slice(10))}`
    manifest.items[id] = { file, size: copyTexture(tex, path.join(outDir, file)), source: 'minecraft' }
    continue
  }
  const furf = fromFurfsky(id)
  const hyp = furf ? null : fromHypixel(id)
  if (furf || hyp) {
    const source = furf ? 'furfsky' : 'hypixel'
    const file = `${source}/${fileName(id)}`
    manifest.items[id] = { file, size: copyTexture(furf ?? hyp, path.join(outDir, file)), source }
    continue
  }
  const head = await headUrl(id)
  if (head) {
    const res = await fetch(head)
    if (res.ok) {
      const file = `heads/${fileName(id)}`
      manifest.items[id] = { file, size: headIso(Buffer.from(await res.arrayBuffer()), path.join(outDir, file)), source: 'head' }
      continue
    }
  }
  const material = items.get(id)?.material
  const name = material && (material in LEGACY ? LEGACY[material] : material.toLowerCase())
  const tex = name ? fromMinecraft(`minecraft:${name}`) : null
  if (tex) {
    const file = `minecraft/${fileName(name)}`
    manifest.items[id] = { file, size: copyTexture(tex, path.join(outDir, file)), source: 'minecraft' }
  } else missing.push(id)
}

fs.writeFileSync(path.join(root, 'src/data/icons.generated.json'), JSON.stringify(manifest, null, 1) + '\n')
const count = (s) => Object.values(manifest.items).filter((t) => t.source === s).length
console.log(`Icons: ${count('furfsky')} FurfSky, ${count('hypixel')} Hypixel pack, ${count('head')} heads, ${count('minecraft')} Minecraft`)
console.log(`No icon (fallback): ${missing.join(', ') || 'none'}`)
