/**
 * Blog relaunch 2026 — delete the 3 original blog posts, replaced by the new
 * bilingual posts created in blog-relaunch-2026.ts. Run ONLY after the new posts
 * are live and the next.config.ts redirects are deployed.
 *
 * Validate-before-delete: each id is fetched and its slug confirmed against the
 * expected old slug before deletion. Backup lives in
 * backups/blog-relaunch-2026-pre/.
 *
 * Dry-run:  npx sanity exec scripts/blog-delete-old-2026.ts --with-user-token
 * Apply:    npx sanity exec scripts/blog-delete-old-2026.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const TARGETS = [
  {_id: 'DHIwRDN3sEoI638qoYRvCD', slug: 'skilky-koshtuye-sayt-2026'},
  {_id: '6tWqPRZWZzG4Lv3HK7JkiK', slug: 'tilda-7200-za-3-roky'},
  {_id: '6tWqPRZWZzG4Lv3HK7Jkai', slug: 'dohovir-z-veb-studieyu-7-punktiv'},
]

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY (deleting)' : 'DRY-RUN (no writes)'}`)
  console.log('='.repeat(78))
  for (const t of TARGETS) {
    const doc: any = await client.fetch('*[_id == $id][0]{_id,_type,"slug":slug.current,title}', {id: t._id})
    if (!doc) {
      console.log(`! ${t._id} — not found (already deleted?). Skipping.`)
      continue
    }
    if (doc._type !== 'blogPost' || doc.slug !== t.slug) {
      console.log(`! ${t._id} — MISMATCH (type=${doc._type}, slug=${doc.slug}). Expected blogPost/${t.slug}. SKIPPING for safety.`)
      continue
    }
    console.log(`✓ ${t._id} | blogPost | ${doc.slug} — "${doc.title}"`)
    if (APPLY) {
      await client.delete(t._id)
      console.log(`  → deleted`)
    }
  }
  console.log('\n' + '='.repeat(78))
  if (!APPLY) console.log('(Re-run with -- --apply to delete.)')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
