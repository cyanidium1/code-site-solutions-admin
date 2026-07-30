/**
 * Post-migration cleanup: removes the orphaned legacy `slug` field from
 * blogPost docs. `slugs.uk` has been the canonical slug since the 2026-07
 * locale migration; no query reads `slug` any more.
 *
 *   Dry run:  npx sanity exec scripts/unset-legacy-blog-slug.ts --with-user-token -- --dry-run
 *   Real run: npx sanity exec scripts/unset-legacy-blog-slug.ts --with-user-token
 *
 * Safety: refuses to touch a doc whose slugs.uk.current does not equal the
 * legacy slug.current (should never happen; guards against surprises).
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
const DRY = process.argv.includes('--dry-run')

type Doc = {_id: string; slug?: {current?: string}; slugs?: {uk?: {current?: string}}}

async function main() {
  const docs = await client.fetch<Doc[]>(
    `*[_type == "blogPost" && defined(slug)]{_id, slug, slugs}`,
  )
  const tx = client.transaction()
  let patched = 0
  for (const d of docs) {
    if (!d.slugs?.uk?.current || d.slugs.uk.current !== d.slug?.current) {
      console.warn(`SKIP ${d._id}: slugs.uk (${d.slugs?.uk?.current}) != legacy slug (${d.slug?.current})`)
      continue
    }
    console.log(`blogPost ${d._id}: unset legacy slug (${d.slug.current})`)
    tx.patch(d._id, (p) => p.unset(['slug']))
    patched++
  }
  if (!patched) {
    console.log('Nothing to clean.')
    return
  }
  if (DRY) {
    console.log(`DRY RUN: would patch ${patched} document(s).`)
    return
  }
  await tx.commit()
  console.log(`Patched ${patched} document(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
