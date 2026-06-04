/**
 * Re-upload case studies that use dotted custom _id values (caseStudy.*).
 *
 * Those IDs are auth-only on the public API. This script:
 *   1. Downloads each dotted case study to backups/
 *   2. Creates a new document with a Sanity-generated UUID (no custom _id)
 *   3. Sets status to "published"
 *   4. Updates testimonial → caseStudy references
 *   5. Deletes the old dotted document
 *
 * Does not modify UUID case studies or reuse other seed/migrate scripts.
 *
 * Dry-run (default):
 *   npx sanity exec scripts/reupload-dotted-case-studies.ts --with-user-token
 *
 * Apply:
 *   npx sanity exec scripts/reupload-dotted-case-studies.ts --with-user-token -- --apply
 */

import {mkdirSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type SanityDoc = Record<string, unknown> & {
  _id: string
  _type: string
  slug?: {_type?: string; current?: string}
  status?: string
}

type ManifestEntry = {
  oldId: string
  newId: string | null
  slug: string
  title?: string
}

function isDottedCaseStudyId(id: string): boolean {
  return id.startsWith('caseStudy.')
}

function stripForCreate(doc: SanityDoc): Record<string, unknown> {
  const {_id, _rev, _createdAt, _updatedAt, ...rest} = doc
  return {
    ...rest,
    _type: 'caseStudy',
    status: 'published',
  }
}

async function fetchDottedCaseStudies(): Promise<SanityDoc[]> {
  return client.fetch<SanityDoc[]>(
    `*[_type == "caseStudy" && _id match "caseStudy.*"] | order(slug.current asc)`,
  )
}

async function patchTestimonialRefs(idMap: Map<string, string>) {
  const testimonials = await client.fetch<
    Array<{_id: string; caseRef?: {_ref?: string}}>
  >(`*[_type == "testimonial" && defined(caseRef._ref)]{_id, caseRef}`)

  for (const t of testimonials) {
    const ref = t.caseRef?._ref
    if (!ref || !idMap.has(ref)) continue
    const newRef = idMap.get(ref)!
    if (!APPLY) {
      console.log(`  would patch ${t._id}: caseRef ${ref} → ${newRef}`)
      continue
    }
    await client.patch(t._id).set({caseRef: {_type: 'reference', _ref: newRef}}).commit()
    console.log(`  ✓ testimonial ${t._id}: caseRef → ${newRef}`)
  }
}

async function main() {
  const docs = await fetchDottedCaseStudies()
  const backupDir = join(
    process.cwd(),
    'backups',
    `reupload-case-studies-${new Date().toISOString().slice(0, 10)}`,
  )

  console.log(APPLY ? '→ APPLY mode' : '→ DRY-RUN (pass -- --apply to commit)')
  console.log(`→ Dotted case studies to re-upload: ${docs.length}`)
  console.log(`→ Backup folder: ${backupDir}\n`)

  if (docs.length === 0) {
    console.log('✓ No caseStudy.* documents found.')
    return
  }

  mkdirSync(backupDir, {recursive: true})

  const manifest: ManifestEntry[] = []
  const idMap = new Map<string, string>()

  for (const probe of docs) {
    const full = (await client.getDocument(probe._id)) as SanityDoc | null
    if (!full) {
      console.log(`  ✗ ${probe._id} not found`)
      continue
    }

    const slug = full.slug?.current ?? '(no slug)'
    const title =
      typeof full.title === 'object' && full.title !== null && 'uk' in full.title
        ? String((full.title as {uk?: string}).uk)
        : undefined

    const backupName = `${probe._id.replace(/\./g, '_')}.json`
    writeFileSync(join(backupDir, backupName), JSON.stringify(full, null, 2) + '\n', 'utf8')

    console.log(`  ${probe._id}`)
    console.log(`    slug: ${slug}`)
    console.log(`    backup: ${backupName}`)

    if (!APPLY) {
      manifest.push({oldId: probe._id, newId: null, slug, title})
      continue
    }

    const payload = stripForCreate(full)
    const created = await client.create(payload)
    idMap.set(probe._id, created._id)
    manifest.push({oldId: probe._id, newId: created._id, slug, title})
    console.log(`    ✓ created ${created._id} (published)`)
  }

  if (!APPLY) {
    writeFileSync(join(backupDir, 'manifest.dry-run.json'), JSON.stringify(manifest, null, 2) + '\n')
    console.log('\nDry-run complete. Re-run with -- --apply to re-upload and delete old docs.')
    return
  }

  console.log('\n— Updating testimonial references')
  await patchTestimonialRefs(idMap)

  console.log('\n— Deleting old caseStudy.* documents')
  for (const {oldId, newId} of manifest) {
    if (!newId) continue
    await client.delete(oldId)
    console.log(`  ✓ deleted ${oldId} → kept ${newId}`)
  }

  writeFileSync(join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

  const dottedLeft = await client.fetch<number>(
    'count(*[_type == "caseStudy" && _id match "caseStudy.*"])',
  )
  const published = await client.fetch<number>(
    'count(*[_type == "caseStudy" && status == "published"])',
  )

  console.log(`\n→ Remaining caseStudy.* : ${dottedLeft}`)
  console.log(`→ Published case studies: ${published}`)
  console.log('✓ Re-upload finished.')
}

main().catch((err) => {
  console.error('✗ Failed:', err)
  process.exit(1)
})
