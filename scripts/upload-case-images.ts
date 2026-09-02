/**
 * Fill draft case studies with section screenshots, then optionally publish.
 *
 * What it does (per draft caseStudy that has NO coverImage):
 *   1. Looks for screenshots in tools/case-generator/output/<slug>/sections/
 *   2. Uploads them to Sanity (Sanity dedupes by content hash — safe to re-run).
 *   3. Sets coverImage (hero-desktop preferred) as imageWithLocalizedAlt.
 *   4. Builds/refreshes a single mediaGalleryBlock in sections[] with the rest.
 *   5. ADMIN RULE: if a screenshot name matches admin/cms/sanity, it is NOT
 *      re-uploaded per case — the first existing matching asset in the dataset
 *      is reused (looked up by originalFilename).
 *   6. With --publish, flips status -> 'published' ONLY when coverImage is set
 *      and SEO title.uk + description.uk exist (matches the schema's publish rule).
 *
 * Matching: the on-disk folder name must equal the case's slug.current.
 *
 * Flags:
 *   --slug <slug>   limit to one case study
 *   --publish       set status=published when ready (otherwise stays draft)
 *   --dry-run       report what would happen, change nothing
 *
 * Run:
 *   npx tsx scripts/upload-case-images.ts                 # all drafts, no publish
 *   npx tsx scripts/upload-case-images.ts --slug urmodels --publish
 *   npx tsx scripts/upload-case-images.ts --dry-run
 */

import {createReadStream, existsSync, readFileSync, readdirSync} from 'node:fs'
import {basename, join} from 'node:path'
import {randomUUID} from 'node:crypto'

import {createClient, type SanityClient} from '@sanity/client'

/* ── env loading (same approach as upload-finance-images.ts) ─────────────── */
function loadEnvFile(path: string) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    let v = t.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (process.env[k] === undefined) process.env[k] = v
  }
}
loadEnvFile(join(process.cwd(), '.env.local'))
loadEnvFile(join(process.cwd(), '.env'))
loadEnvFile(join(process.cwd(), '..', 'code-site-solutions', '.env.local'))

const TOKEN = process.env.SANITY_API_TOKEN
if (!TOKEN) {
  console.error('✘ Missing SANITY_API_TOKEN (needs write access). Set it in .env.local.')
  process.exit(1)
}

/* ── args ────────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2)
function flagValue(name: string): string | undefined {
  const i = argv.indexOf(`--${name}`)
  return i !== -1 ? argv[i + 1] : undefined
}
const onlySlug = flagValue('slug')
const doPublish = argv.includes('--publish')
const dryRun = argv.includes('--dry-run')

const SECTIONS_ROOT = join(process.cwd(), 'tools', 'case-generator', 'output')

/* ── ordering / classification ──────────────────────────────────────────── */
const SECTION_PRIORITY = ['hero', 'services', 'catalog', 'advantages', 'cta', 'contact', 'gallery']
const ADMIN_NAME_RE = /(admin|cms|sanity|dashboard)/i

function displayModeFor(file: string): string {
  if (ADMIN_NAME_RE.test(file)) return 'adminPanel'
  if (/mobile/i.test(file)) return 'mobileScreenshot'
  return 'desktopScreenshot'
}

function sortKey(file: string): number {
  const base = file.toLowerCase()
  const idx = SECTION_PRIORITY.findIndex((s) => base.startsWith(s))
  const order = idx === -1 ? 99 : idx
  const vp = base.includes('mobile') ? 1 : 0 // desktop first within a section
  return order * 10 + vp
}

type ImageRef = {_type: 'image'; asset: {_type: 'reference'; _ref: string}}
function imageRef(assetId: string): ImageRef {
  return {_type: 'image', asset: {_type: 'reference', _ref: assetId}}
}

/* ── asset upload with admin-reuse ──────────────────────────────────────── */
const uploadCache = new Map<string, string>() // filename -> assetId (per run)
let reuseCount = 0 // reset per case in processCase

async function findExistingAssetByFilename(client: SanityClient, filename: string): Promise<string | null> {
  const id = await client.fetch<string | null>(
    `*[_type=="sanity.imageAsset" && originalFilename==$f][0]._id`,
    {f: filename},
  )
  return id ?? null
}

async function uploadOrReuse(client: SanityClient, fullPath: string): Promise<string> {
  const filename = basename(fullPath)
  if (uploadCache.has(filename)) return uploadCache.get(filename)!

  // Admin screenshots are shared across cases — reuse an existing asset if present.
  if (ADMIN_NAME_RE.test(filename)) {
    const existing = await findExistingAssetByFilename(client, filename)
    if (existing) {
      console.log(`    ♻ reuse admin asset ${filename} → ${existing}`)
      uploadCache.set(filename, existing)
      reuseCount++
      return existing
    }
  }

  const asset = await client.assets.upload('image', createReadStream(fullPath), {filename})
  uploadCache.set(filename, asset._id)
  return asset._id
}

/* ── case study shape we care about ─────────────────────────────────────── */
type CaseDoc = {
  _id: string
  status?: string
  slug?: {current?: string}
  title?: {uk?: string; en?: string}
  coverImage?: {image?: {asset?: unknown}}
  seo?: {title?: {uk?: string}; description?: {uk?: string}}
  sections?: Array<{_type?: string; _key?: string}>
}

async function processCase(client: SanityClient, doc: CaseDoc) {
  const slug = doc.slug?.current
  const titleUk = doc.title?.uk ?? doc.title?.en ?? slug ?? 'Case'
  console.log(`\n▶ ${titleUk} (${slug})`)

  if (!slug) {
    console.log('  ⚠ no slug.current — skipping')
    return {slug: '(no slug)', added: 0, reused: 0, published: false, note: 'no slug'}
  }
  const dir = join(SECTIONS_ROOT, slug, 'sections')
  if (!existsSync(dir)) {
    console.log(`  ⚠ no screenshots at tools/case-generator/output/${slug}/sections — run the crawler first`)
    return {slug, added: 0, reused: 0, published: false, note: 'no screenshots on disk'}
  }
  const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort((a, b) => sortKey(a) - sortKey(b))
  if (files.length === 0) {
    console.log('  ⚠ folder empty — skipping')
    return {slug, added: 0, reused: 0, published: false, note: 'folder empty'}
  }

  // cover = hero-desktop if present, else first by priority
  const coverFile = files.find((f) => /^hero-desktop/i.test(f)) ?? files.find((f) => /^hero/i.test(f)) ?? files[0]
  const galleryFiles = files.filter((f) => f !== coverFile)

  if (dryRun) {
    console.log(`  [dry-run] cover: ${coverFile}`)
    console.log(`  [dry-run] gallery (${galleryFiles.length}): ${galleryFiles.join(', ')}`)
    return {slug, added: files.length, reused: 0, published: false, note: 'dry-run'}
  }

  reuseCount = 0
  const coverAsset = await uploadOrReuse(client, join(dir, coverFile))

  const galleryItems = []
  for (const f of galleryFiles) {
    const assetId = await uploadOrReuse(client, join(dir, f))
    galleryItems.push({
      _type: 'mediaGalleryImageItem',
      _key: randomUUID().slice(0, 12),
      image: imageRef(assetId),
      displayMode: displayModeFor(f),
      objectPosition: 'top',
      alt: {uk: `${titleUk} — ${basename(f).replace(/\.[^.]+$/, '')}`},
    })
  }
  const patch = client.patch(doc._id)
  patch.set({
    coverImage: {image: coverAsset, alt: {uk: `${titleUk} — головна сторінка`}},
  })

  // refresh existing gallery block or append a new one
  const existingGallery = doc.sections?.find((s) => s._type === 'mediaGalleryBlock')
  const galleryBlock = {
    _type: 'mediaGalleryBlock',
    _key: existingGallery?._key ?? randomUUID().slice(0, 12),
    title: {uk: 'Скріншоти проєкту', en: 'Project screenshots'},
    enableLightbox: true,
    images: galleryItems,
  }
  if (existingGallery?._key) {
    patch.set({[`sections[_key=="${existingGallery._key}"]`]: galleryBlock})
  } else {
    patch.setIfMissing({sections: []}).append('sections', [galleryBlock])
  }

  await patch.commit()
  console.log(`  ✓ cover + gallery (${galleryItems.length} images) set`)

  // publish gate
  let published = false
  if (doPublish) {
    const seoOk = Boolean(doc.seo?.title?.uk?.trim()) && Boolean(doc.seo?.description?.uk?.trim())
    if (!seoOk) {
      console.log('  ⚠ not publishing: SEO title.uk / description.uk missing (schema requires it)')
    } else {
      await client.patch(doc._id).set({status: 'published'}).commit()
      published = true
      console.log('  ✓ status → published')
    }
  }

  return {slug, added: files.length, reused: reuseCount, published, note: ''}
}

async function main() {
  const client = createClient({
    projectId: '4lk0x7o9',
    dataset: 'production',
    apiVersion: '2024-10-01',
    token: TOKEN,
    useCdn: false,
  })

  const filter = onlySlug
    ? `*[_type=="caseStudy" && slug.current==$slug]`
    : `*[_type=="caseStudy" && status=="draft" && !defined(coverImage.image.asset)]`
  const docs = await client.fetch<CaseDoc[]>(
    `${filter}{_id, status, slug, title, "coverImage": coverImage, seo, sections[]{_type,_key}}`,
    onlySlug ? {slug: onlySlug} : {},
  )

  console.log(`Found ${docs.length} case stud${docs.length === 1 ? 'y' : 'ies'} to process${dryRun ? ' (dry-run)' : ''}.`)
  const report = []
  for (const doc of docs) report.push(await processCase(client, doc))

  console.log('\n────────── SUMMARY ──────────')
  for (const r of report) {
    console.log(
      `${r.slug.padEnd(22)} images:${String(r.added).padStart(2)}  reused:${String(r.reused).padStart(2)}  published:${r.published ? 'yes' : 'no '}  ${r.note}`,
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
