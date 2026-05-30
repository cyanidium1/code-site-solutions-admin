/**
 * One-shot backfill: populate the new `country` and `budgetBucket` fields on
 * existing caseStudy documents. Idempotent — re-running is safe.
 *
 *   npx sanity@latest exec scripts/backfill-case-filters.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})

const UPDATES: Array<{
  id: string
  patch: {country?: string; budgetBucket?: string}
}> = [
  {
    id: 'caseStudy.efedra-clinic',
    patch: {country: 'UA', budgetBucket: '3-7k'}, // $5,000 → 3-7k bucket
  },
  {
    id: 'caseStudy.nbyg-kobenhavn',
    patch: {country: 'DK'}, // budget intentionally unset; leave bucket empty
  },
]

async function main() {
  for (const {id, patch} of UPDATES) {
    const existing = await client.fetch<{_id: string} | null>(
      `*[_id == $id][0]{_id}`,
      {id},
    )
    if (!existing) {
      console.log(`  ⨯ ${id} — not found, skipping`)
      continue
    }
    await client.patch(id).set(patch).commit()
    console.log(`  ✓ ${id} — set ${JSON.stringify(patch)}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
