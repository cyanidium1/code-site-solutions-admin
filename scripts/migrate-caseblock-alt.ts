/**
 * One-shot: move caseBlock's block-level before/after alt (the value the
 * frontend actually rendered) into the imageWithLocalizedAlt wrapper
 * (before.image.alt), then remove the legacy field. Block-level wins on
 * conflict because it was live. Orphan alts (no image uploaded) are dropped.
 *
 * Run: npx sanity exec scripts/migrate-caseblock-alt.ts --with-user-token          (dry-run)
 *      npx sanity exec scripts/migrate-caseblock-alt.ts --with-user-token -- --commit
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const COMMIT = process.argv.includes('--commit')

function main() {
  return client
    .fetch<any[]>(
      `*[defined(sections) && count(sections[_type=="caseBlock" && (defined(before.alt) || defined(after.alt))]) > 0]{_id, sections}`,
    )
    .then(async (docs) => {
      for (const doc of docs) {
        const sets: Record<string, unknown> = {}
        const unsets: string[] = []
        for (const s of doc.sections ?? []) {
          if (s._type !== 'caseBlock') continue
          for (const side of ['before', 'after'] as const) {
            const alt = s[side]?.alt
            if (!alt) continue
            const base = `sections[_key=="${s._key}"].${side}`
            if (s[side]?.image?.image?.asset) {
              sets[`${base}.image.alt`] = {_type: 'localizedString', ...alt}
            }
            unsets.push(`${base}.alt`)
          }
        }
        console.log(doc._id, JSON.stringify(sets), 'unset:', unsets)
        if (COMMIT && (Object.keys(sets).length || unsets.length)) {
          await client.patch(doc._id).set(sets).unset(unsets).commit()
        }
      }
      console.log(COMMIT ? 'APPLIED' : 'dry-run only — re-run with -- --commit')
    })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
