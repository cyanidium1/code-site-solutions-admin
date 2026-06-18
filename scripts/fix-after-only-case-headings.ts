/**
 * Industry after-only pages: the caseBlock heading still reads "До / Після" /
 * "Before / After", but these four pages no longer render a before card (no
 * before image — the Case block falls back to the after-only showcase), so the
 * comparison framing is misleading. Rewrite the heading to a result-focused
 * line. Comparison pages (finance, medicine, renovation) keep their heading.
 *
 * Only the heading.uk / heading.en sub-fields are touched (localizedText
 * `_type` and any other locales are preserved). Idempotent: skips headings that
 * no longer match the old before/after pattern.
 *
 * Dry-run:  npx sanity exec scripts/fix-after-only-case-headings.ts --with-user-token
 * Apply:    npx sanity exec scripts/fix-after-only-case-headings.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const TARGET_SLUGS = ['auto', 'courses', 'ecommerce', 'legal']

const NEW_HEADING = {
  uk: 'Результат на прикладі *реального* клієнта',
  en: 'The result, from a *real* client case',
}

// Only rewrite headings that still use the old before/after framing — keeps the
// script idempotent and safe against manual edits.
const OLD_RX = /до\s*\/\s*після|before\s*\/\s*after/i

async function main() {
  const pages: Array<{_id: string; slug: string; sections: any[]}> =
    await client.fetch(
      `*[_type == "industryPage" && slug.current in $slugs && !(_id in path("drafts.**"))]{_id, "slug": slug.current, sections}`,
      {slugs: TARGET_SLUGS},
    )

  // Surface drafts so a pending draft doesn't silently revert this on publish.
  const drafts: string[] = await client.fetch(
    `*[_type == "industryPage" && slug.current in $slugs && (_id in path("drafts.**"))].slug.current`,
    {slugs: TARGET_SLUGS},
  )
  if (drafts.length) {
    console.log(`⚠ drafts exist for: ${drafts.join(', ')} — they are NOT patched; publishing them would revert this.\n`)
  }

  const byDoc = new Map<string, Record<string, string>>()

  for (const page of pages) {
    const sections = page.sections ?? []
    const sec = sections.find((s: any) => s?._type === 'caseBlock')
    if (!sec) {
      console.log(`skip ${page.slug}: no caseBlock`)
      continue
    }
    const ukNow: string = sec.heading?.uk ?? ''
    const enNow: string = sec.heading?.en ?? ''
    if (!OLD_RX.test(ukNow) && !OLD_RX.test(enNow)) {
      console.log(`skip ${page.slug}: heading already updated`)
      continue
    }
    const skey = sec._key
    const base = skey
      ? `sections[_key=="${skey}"].heading`
      : `sections[${sections.indexOf(sec)}].heading`
    byDoc.set(page._id, {
      [`${base}.uk`]: NEW_HEADING.uk,
      [`${base}.en`]: NEW_HEADING.en,
    })
    console.log(`${page.slug} (${page._id})`)
    console.log(`  uk: ${ukNow}  ->  ${NEW_HEADING.uk}`)
    console.log(`  en: ${enNow}  ->  ${NEW_HEADING.en}`)
  }

  if (APPLY) {
    for (const [id, sets] of byDoc) {
      await client.patch(id).set(sets).commit()
      console.log(`    ✓ ${id}`)
    }
    console.log(`\nApplied to ${byDoc.size} doc(s).`)
  } else {
    console.log(`\nWould patch ${byDoc.size} doc(s). Re-run with -- --apply.`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
