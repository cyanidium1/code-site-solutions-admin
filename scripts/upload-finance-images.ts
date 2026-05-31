/**
 * One-off: upload 6 PNGs for the finance industry doc and patch the doc to
 * reference them.
 *
 *   hero.png       → hero.deviceMockup.image
 *   before.png     → sections[caseBlock].before.image
 *   after.png      → sections[caseBlock].after.image
 *   service-1.png  → sections[servicesBlock].features[0].image
 *   service-2.png  → sections[servicesBlock].features[1].image
 *   service-3.png  → sections[servicesBlock].features[2].image
 *
 * Idempotent on the asset side: Sanity dedupes uploads by content hash.
 * The doc patch overwrites the image refs in place — image assets stay
 * referenced even if the asset already existed from a prior run.
 *
 * Run:
 *   npx tsx scripts/upload-finance-images.ts
 */

import {createReadStream, existsSync, readFileSync} from 'node:fs'
import {basename, join} from 'node:path'

import {createClient, type SanityClient} from '@sanity/client'

function loadEnvFile(path: string) {
  if (!existsSync(path)) return
  const content = readFileSync(path, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    let v = t.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (process.env[k] === undefined) process.env[k] = v
  }
}

loadEnvFile(join(process.cwd(), '.env.local'))
loadEnvFile(join(process.cwd(), '.env'))
loadEnvFile(join(process.cwd(), '..', 'code-site-solutions', '.env.local'))

const TOKEN = process.env.SANITY_API_TOKEN
if (!TOKEN) {
  console.error('✘ Missing SANITY_API_TOKEN.')
  process.exit(1)
}

const IMG_DIR = 'C:\\Users\\User\\Pictures\\industries-photo\\accountants'
const SLUG = 'finance'

const FILES = {
  hero: 'hero.png',
  before: 'before.png',
  after: 'after.png',
  service1: 'service-1.png',
  service2: 'service-2.png',
  service3: 'service-3.png',
} as const

async function uploadOne(client: SanityClient, filename: string) {
  const fullPath = join(IMG_DIR, filename)
  if (!existsSync(fullPath)) throw new Error(`File not found: ${fullPath}`)
  const stream = createReadStream(fullPath)
  const asset = await client.assets.upload('image', stream, {
    filename: basename(fullPath),
  })
  return asset._id
}

function imageRef(assetId: string) {
  return {
    _type: 'image',
    asset: {_type: 'reference', _ref: assetId},
  }
}

async function main() {
  const client = createClient({
    projectId: '4lk0x7o9',
    dataset: 'production',
    apiVersion: '2024-10-01',
    token: TOKEN,
    useCdn: false,
  })

  console.log(`Uploading 6 images for /${SLUG}…`)
  const uploads: Record<keyof typeof FILES, string> = {} as never
  for (const [key, filename] of Object.entries(FILES) as Array<[keyof typeof FILES, string]>) {
    const id = await uploadOne(client, filename)
    uploads[key] = id
    console.log(`  ${filename}  →  ${id}`)
  }

  console.log(`\nFetching industryPage.${SLUG}…`)
  const doc = (await client.getDocument(`industryPage.${SLUG}`)) as
    | {
        _id: string
        hero?: {deviceMockup?: {image?: unknown; alt?: unknown}}
        sections?: Array<{
          _type?: string
          _key?: string
          before?: {image?: unknown}
          after?: {image?: unknown}
          features?: Array<{image?: unknown}>
        }>
      }
    | undefined

  if (!doc) {
    console.error(`✘ Document industryPage.${SLUG} not found. Run the seeder first.`)
    process.exit(1)
  }

  /* ─── Patch in-memory, then commit via patch().set ─────────────────────── */

  const caseSection = doc.sections?.find((s) => s._type === 'caseBlock')
  const servicesSection = doc.sections?.find((s) => s._type === 'servicesBlock')

  if (!caseSection?._key) throw new Error('No caseBlock section found')
  if (!servicesSection?._key) throw new Error('No servicesBlock section found')

  const patch = client.patch(doc._id)

  // Hero mockup
  patch.set({
    'hero.deviceMockup.image': imageRef(uploads.hero),
    'hero.deviceMockup.alt': {uk: 'Сайт фінансової фірми', en: 'Finance firm website'},
  })

  // Case before/after — set the full imageWithLocalizedAlt wrapper.
  // Setting the whole object avoids leftover flat `before.image = {asset}`
  // from a prior bad run (Sanity merges leaf-by-leaf; passing the wrapper
  // overwrites).
  patch.set({
    [`sections[_key=="${caseSection._key}"].before.image`]: {
      image: imageRef(uploads.before),
      alt: {uk: 'Сайт FinLiga до редизайну', en: 'FinLiga site before redesign'},
    },
    [`sections[_key=="${caseSection._key}"].after.image`]: {
      image: imageRef(uploads.after),
      alt: {uk: 'Сайт FinLiga після редизайну', en: 'FinLiga site after redesign'},
    },
  })

  // Services features — patch top 3 by array index
  const featureKeys = servicesSection.features?.slice(0, 3).map((_, i) => i) ?? []
  if (featureKeys.length < 3) {
    throw new Error(`Expected ≥3 service features, got ${featureKeys.length}`)
  }
  const featurePatches: Record<string, unknown> = {}
  const serviceAssets = [uploads.service1, uploads.service2, uploads.service3]
  // Use _key when available; fall back to index path
  servicesSection.features?.slice(0, 3).forEach((f, i) => {
    const key = (f as {_key?: string})._key
    const base = key
      ? `sections[_key=="${servicesSection._key}"].features[_key=="${key}"]`
      : `sections[_key=="${servicesSection._key}"].features[${i}]`
    featurePatches[`${base}.image.image`] = imageRef(serviceAssets[i])
  })
  patch.set(featurePatches)

  const result = await patch.commit()
  console.log(`\n✓ Patched ${doc._id} → _rev=${result._rev}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
