/**
 * Re-upload dotted-ID documents for portfolio filters and homepage testimonials.
 *
 * Affected types: countryOption.*, budgetBucketOption.*, testimonial.*
 * (IDs with a dot are auth-only on the public API.)
 *
 * Flow:
 *   1. Download backups
 *   2. Create new docs with Sanity auto UUIDs
 *   3. Patch caseStudy country / budgetBucket references
 *   4. Rewrite testimonial caseRef using case-study manifest (if present)
 *   5. Delete old dotted docs + orphan hyphen duplicates (countryOption-XX)
 *
 * Dry-run:
 *   npx sanity exec scripts/reupload-dotted-options-testimonials.ts --with-user-token
 *
 * Apply:
 *   npx sanity exec scripts/reupload-dotted-options-testimonials.ts --with-user-token -- --apply
 */

import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const TYPES = ['countryOption', 'budgetBucketOption', 'testimonial'] as const
type DocType = (typeof TYPES)[number]

type SanityDoc = Record<string, unknown> & {
  _id: string
  _type: string
  slug?: {_type?: string; current?: string}
  caseRef?: {_type?: string; _ref?: string}
}

type ManifestEntry = {
  oldId: string
  newId: string | null
  type: string
  slug: string
}

function hasDot(id: string): boolean {
  return id.includes('.')
}

function stripForCreate(doc: SanityDoc): Record<string, unknown> {
  const {_id, _rev, _createdAt, _updatedAt, ...rest} = doc
  return {...rest, _type: doc._type}
}

function loadCaseStudyIdMap(): Map<string, string> {
  const map = new Map<string, string>()
  const dir = join(process.cwd(), 'backups')
  if (!existsSync(dir)) return map

  const entries = listBackupDirs(dir).filter((d) => d.startsWith('reupload-case-studies-'))
  if (entries.length === 0) return map

  entries.sort()
  const manifestPath = join(dir, entries[entries.length - 1], 'manifest.json')
  if (!existsSync(manifestPath)) return map

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Array<{
    oldId: string
    newId: string
    slug: string
  }>
  for (const row of manifest) {
    if (row.oldId && row.newId) map.set(row.oldId, row.newId)
  }
  return map
}

function listBackupDirs(path: string): string[] {
  try {
    return readdirSync(path, {withFileTypes: true})
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  } catch {
    return []
  }
}

async function fetchDottedDocs(type: DocType): Promise<SanityDoc[]> {
  const docs = await client.fetch<SanityDoc[]>(
    `*[_type == $type] | order(_id asc)`,
    {type},
  )
  return docs.filter((d) => hasDot(d._id))
}

async function patchCaseStudyOptionRefs(idMap: Map<string, string>) {
  const cases = await client.fetch<
    Array<{
      _id: string
      country?: {_ref?: string}
      budgetBucket?: {_ref?: string}
    }>
  >(`*[_type == "caseStudy"]{_id, country, budgetBucket}`)

  for (const c of cases) {
    const patches: Record<string, unknown> = {}
    const countryRef = c.country?._ref
    const budgetRef = c.budgetBucket?._ref

    if (countryRef && idMap.has(countryRef)) {
      patches.country = {_type: 'reference', _ref: idMap.get(countryRef)}
    }
    if (budgetRef && idMap.has(budgetRef)) {
      patches.budgetBucket = {_type: 'reference', _ref: idMap.get(budgetRef)}
    }

    if (Object.keys(patches).length === 0) continue

    if (!APPLY) {
      console.log(`  would patch ${c._id}: ${JSON.stringify(patches)}`)
      continue
    }
    await client.patch(c._id).set(patches).commit()
    console.log(`  ✓ caseStudy ${c._id}`)
  }
}

async function deleteOrphanHyphenCountries(slugsMigrated: Set<string>) {
  const orphans = await client.fetch<Array<{_id: string; slug?: {current?: string}}>>(
    `*[_type == "countryOption" && _id match "countryOption-*"]{_id, slug}`,
  )

  for (const o of orphans) {
    const slug = o.slug?.current
    if (!slug || !slugsMigrated.has(slug)) continue
    if (!APPLY) {
      console.log(`  would delete orphan ${o._id} (duplicate slug ${slug})`)
      continue
    }
    await client.delete(o._id)
    console.log(`  ✓ deleted orphan ${o._id}`)
  }
}

async function main() {
  const backupDir = join(
    process.cwd(),
    'backups',
    `reupload-options-testimonials-${new Date().toISOString().slice(0, 10)}`,
  )
  const caseStudyIdMap = loadCaseStudyIdMap()
  const idMap = new Map<string, string>()
  const manifest: ManifestEntry[] = []
  const migratedCountrySlugs = new Set<string>()

  console.log(APPLY ? '→ APPLY mode' : '→ DRY-RUN (pass -- --apply to commit)')
  console.log(`→ Backup folder: ${backupDir}`)
  if (caseStudyIdMap.size > 0) {
    console.log(`→ Loaded ${caseStudyIdMap.size} case-study id mappings from manifest`)
  }
  console.log('')

  mkdirSync(backupDir, {recursive: true})

  for (const type of TYPES) {
    const docs = await fetchDottedDocs(type)
    console.log(`— ${type}: ${docs.length} dotted document(s)`)

    for (const probe of docs) {
      const full = (await client.getDocument(probe._id)) as SanityDoc | null
      if (!full) continue

      const slug = full.slug?.current ?? probe._id
      const backupName = `${probe._id.replace(/\./g, '_')}.json`
      writeFileSync(join(backupDir, backupName), JSON.stringify(full, null, 2) + '\n', 'utf8')

      console.log(`  ${probe._id} (slug: ${slug})`)

      if (!APPLY) {
        idMap.set(probe._id, `<new-uuid-for-${slug}>`)
        manifest.push({oldId: probe._id, newId: null, type, slug})
        continue
      }

      const payload = stripForCreate(full)

      if (type === 'testimonial' && full.caseRef?._ref) {
        const oldRef = full.caseRef._ref
        if (caseStudyIdMap.has(oldRef)) {
          payload.caseRef = {
            _type: 'reference',
            _ref: caseStudyIdMap.get(oldRef),
          }
        }
      }

      if (type === 'testimonial' && probe._id === 'testimonial.nbyg-kobenhavn' && !payload.caseRef) {
        const nbygNew = caseStudyIdMap.get('caseStudy.nbyg-kobenhavn')
        if (nbygNew) {
          payload.caseRef = {_type: 'reference', _ref: nbygNew}
        }
      }

      const created = await client.create(payload)
      idMap.set(probe._id, created._id)
      manifest.push({oldId: probe._id, newId: created._id, type, slug})

      if (type === 'countryOption') migratedCountrySlugs.add(slug)

      console.log(`    ✓ created ${created._id}`)
    }
  }

  if (!APPLY) {
    writeFileSync(join(backupDir, 'manifest.dry-run.json'), JSON.stringify(manifest, null, 2) + '\n')
    console.log('\n— Would patch caseStudy option references')
    await patchCaseStudyOptionRefs(idMap)
    console.log('\n— Would remove orphan countryOption-* duplicates')
    await deleteOrphanHyphenCountries(migratedCountrySlugs)
    console.log('\nDry-run complete. Re-run with -- --apply')
    return
  }

  console.log('\n— Patching caseStudy country / budgetBucket references')
  await patchCaseStudyOptionRefs(idMap)

  console.log('\n— Removing orphan countryOption-* duplicates')
  await deleteOrphanHyphenCountries(migratedCountrySlugs)

  console.log('\n— Deleting old dotted documents')
  for (const {oldId, newId} of manifest) {
    if (!newId) continue
    await client.delete(oldId)
    console.log(`  ✓ deleted ${oldId} → ${newId}`)
  }

  writeFileSync(join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

  const dottedLeft = await client.fetch<number>(
    'count(*[_type in ["countryOption","budgetBucketOption","testimonial"] && _id match "*.*"])',
  )
  console.log(`\n→ Remaining dotted docs (these types): ${dottedLeft}`)
  console.log('✓ Finished.')
}

main().catch((err) => {
  console.error('✗ Failed:', err)
  process.exit(1)
})
