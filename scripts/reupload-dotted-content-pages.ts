/**
 * Re-upload dotted-ID content documents (auth-only on public API):
 *   industryPage.*, blogPost.*, pricingPlan.*
 *
 * Flow:
 *   1. Download JSON backups
 *   2. Create new docs with Sanity auto UUIDs (preserve published status)
 *   3. Patch every document that still references old IDs
 *   4. Delete old dotted documents
 *
 * Dry-run:
 *   npx sanity exec scripts/reupload-dotted-content-pages.ts --with-user-token
 *
 * Apply:
 *   npx sanity exec scripts/reupload-dotted-content-pages.ts --with-user-token -- --apply
 */

import {mkdirSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

/** Migrate in dependency order (blogPost before industryPage). */
const TYPE_ORDER = ['pricingPlan', 'blogPost', 'industryPage'] as const
type DocType = (typeof TYPE_ORDER)[number]

type SanityDoc = Record<string, unknown> & {
  _id: string
  _type: string
  slug?: {_type?: string; current?: string}
  status?: string
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

function stripSystem(doc: SanityDoc): Record<string, unknown> {
  const {_id, _rev, _createdAt, _updatedAt, ...rest} = doc
  return {...rest, _type: doc._type}
}

function stripForCreate(doc: SanityDoc): Record<string, unknown> {
  const payload = stripSystem(doc)
  if (doc._type === 'industryPage' || doc._type === 'blogPost') {
    payload.status = 'published'
  }
  return payload
}

function rewriteRefs(value: unknown, idMap: Map<string, string>): unknown {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map((v) => rewriteRefs(v, idMap))
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj._ref === 'string' && idMap.has(obj._ref)) {
      return {...obj, _ref: idMap.get(obj._ref)}
    }
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      out[k] = rewriteRefs(v, idMap)
    }
    return out
  }
  return value
}

async function fetchDottedDocs(type: DocType): Promise<SanityDoc[]> {
  const docs = await client.fetch<SanityDoc[]>(
    `*[_type == $type] | order(_id asc)`,
    {type},
  )
  return docs.filter((d) => hasDot(d._id))
}

async function patchAllReferrers(idMap: Map<string, string>) {
  const patched = new Set<string>()

  for (const [oldId, newId] of idMap) {
    const referrers = await client.fetch<Array<{_id: string; _type: string}>>(
      `*[references($oldId)]{_id,_type}`,
      {oldId},
    )

    for (const ref of referrers) {
      if (ref._id === oldId || patched.has(ref._id)) continue

      const doc = (await client.getDocument(ref._id)) as SanityDoc | null
      if (!doc) continue

      const rewritten = rewriteRefs(stripSystem(doc), idMap) as Record<string, unknown>
      rewritten._id = ref._id
      rewritten._type = doc._type

      if (!APPLY) {
        console.log(`  would patch referrer ${ref._id} (${ref._type})`)
        patched.add(ref._id)
        continue
      }

      await client.createOrReplace(rewritten)
      patched.add(ref._id)
      console.log(`  ✓ referrer ${ref._id} (${ref._type})`)
    }

    if (!APPLY && referrers.length > 0) {
      console.log(`  ${oldId} → ${newId}: ${referrers.length} referrer(s)`)
    }
  }
}

async function main() {
  const backupDir = join(
    process.cwd(),
    'backups',
    `reupload-content-pages-${new Date().toISOString().slice(0, 10)}`,
  )
  const idMap = new Map<string, string>()
  const manifest: ManifestEntry[] = []

  console.log(APPLY ? '→ APPLY mode' : '→ DRY-RUN (pass -- --apply to commit)')
  console.log(`→ Backup folder: ${backupDir}\n`)

  mkdirSync(backupDir, {recursive: true})

  for (const type of TYPE_ORDER) {
    const docs = await fetchDottedDocs(type)
    console.log(`— ${type}: ${docs.length} dotted document(s)`)

    for (const probe of docs) {
      const full = (await client.getDocument(probe._id)) as SanityDoc | null
      if (!full) continue

      const slug =
        full.slug?.current ??
        (probe._id.split('.').slice(1).join('.') || probe._id)
      const backupName = `${probe._id.replace(/\./g, '_')}.json`
      writeFileSync(join(backupDir, backupName), JSON.stringify(full, null, 2) + '\n', 'utf8')

      console.log(`  ${probe._id} (slug: ${slug})`)

      if (!APPLY) {
        idMap.set(probe._id, `<new-uuid>`)
        manifest.push({oldId: probe._id, newId: null, type, slug})
        continue
      }

      const payload = rewriteRefs(stripForCreate(full), idMap) as Record<string, unknown>
      const created = await client.create(payload)
      idMap.set(probe._id, created._id)
      manifest.push({oldId: probe._id, newId: created._id, type, slug})
      console.log(`    ✓ created ${created._id}`)
    }
  }

  const total = manifest.length
  console.log(`\n→ Total to migrate: ${total}`)

  if (total === 0) {
    console.log('✓ Nothing to migrate.')
    return
  }

  console.log('\n— Patch documents that reference old IDs')
  await patchAllReferrers(idMap)

  if (!APPLY) {
    writeFileSync(join(backupDir, 'manifest.dry-run.json'), JSON.stringify(manifest, null, 2) + '\n')
    console.log('\nDry-run complete. Re-run with -- --apply')
    return
  }

  console.log('\n— Deleting old dotted documents')
  for (const {oldId, newId} of manifest) {
    if (!newId) continue
    await client.delete(oldId)
    console.log(`  ✓ deleted ${oldId} → ${newId}`)
  }

  writeFileSync(join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

  const dottedLeft = await client.fetch<number>(
    'count(*[_type in ["industryPage","blogPost","pricingPlan"] && _id match "*.*"])',
  )
  console.log(`\n→ Remaining dotted docs (these types): ${dottedLeft}`)
  console.log('✓ Finished.')
}

main().catch((err) => {
  console.error('✗ Failed:', err)
  process.exit(1)
})
