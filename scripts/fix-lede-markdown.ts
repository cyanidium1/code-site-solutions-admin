/**
 * One-shot, idempotent fix: strip literal `**` bold markers from the
 * `lede` field of the 2 UK blog posts where they leaked as visible text
 * (lede is rendered raw in the post hero, related cards, and listing).
 *
 * Patches every version of each doc (published + drafts) so a later
 * Publish can't re-introduce the markers.
 *
 * Dry-run:  npx sanity exec scripts/fix-lede-markdown.ts --with-user-token
 * Apply:    npx sanity exec scripts/fix-lede-markdown.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const APPLY = process.argv.includes('--apply')
const SLUGS = ['tilda-7200-za-3-roky', 'dohovir-z-veb-studieyu-7-punktiv']

const client = getCliClient({apiVersion: '2024-10-01'})

async function main() {
  // Match published + any draft/version docs for these slugs.
  const docs: Array<{_id: string; lede?: string}> = await client.fetch(
    `*[_type=="blogPost" && slug.current in $slugs]{_id, "lede": lede}`,
    {slugs: SLUGS},
  )

  let changed = 0
  for (const d of docs) {
    if (typeof d.lede !== 'string' || !d.lede.includes('**')) {
      console.log(`  skip  ${d._id} (no ** in lede)`)
      continue
    }
    const next = d.lede.replace(/\*\*/g, '')
    changed++
    console.log(`\n  ${APPLY ? 'PATCH' : 'WOULD PATCH'}  ${d._id}`)
    console.log(`    before: "${d.lede}"`)
    console.log(`    after:  "${next}"`)
    if (APPLY) {
      await client.patch(d._id).set({lede: next}).commit()
      console.log(`    ✓ committed`)
    }
  }

  console.log(
    `\n${APPLY ? 'Applied' : 'Dry-run'}: ${changed} doc(s) with ** in lede; ${docs.length} total matched.`,
  )
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e)
    process.exit(1)
  },
)
