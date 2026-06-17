/**
 * Industry pages: populate the before/after card taglines for pages that lack
 * them. Six pages have null before.tagline/after.tagline, so the frontend
 * falls back to the Ukrainian/medical defaults ("Сайт, що приводить пацієнтів").
 * Set generic localized taglines (medicine/renovation already have their own).
 *
 * Dry-run:  npx sanity exec scripts/fix-case-taglines.ts --with-user-token
 * Apply:    npx sanity exec scripts/fix-case-taglines.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const BEFORE = {
  _type: 'localizedString',
  uk: 'Сайт, що не продає',
  en: "A site that doesn't convert",
}
const AFTER = {
  _type: 'localizedString',
  uk: 'Сайт, що приводить клієнтів',
  en: 'A site that brings in clients',
}

async function main() {
  const pages: Array<{_id: string; slug: string; sections: any[]}> =
    await client.fetch(
      `*[_type == "industryPage" && defined(slug.current) && !(_id in path("drafts.**"))]{_id, "slug": slug.current, sections}`,
    )

  const edits: Array<{id: string; slug: string; path: string; value: any}> = []

  for (const page of pages) {
    const sections = page.sections ?? []
    const sec = sections.find((s: any) => s?._type === 'caseBlock')
    if (!sec) continue
    if (sec.before?.tagline) {
      console.log(`skip ${page.slug}: before.tagline already set`)
      continue
    }
    const skey = sec._key
    const at = (field: string) =>
      skey
        ? `sections[_key=="${skey}"].${field}`
        : `sections[${sections.indexOf(sec)}].${field}`
    edits.push({id: page._id, slug: page.slug, path: at('before.tagline'), value: BEFORE})
    edits.push({id: page._id, slug: page.slug, path: at('after.tagline'), value: AFTER})
  }

  for (const e of edits) {
    console.log(`${e.slug}  ${e.path}\n  + ${JSON.stringify(e.value)}`)
  }

  if (APPLY) {
    const byDoc = new Map<string, Record<string, any>>()
    for (const e of edits) {
      const m = byDoc.get(e.id) ?? {}
      m[e.path] = e.value
      byDoc.set(e.id, m)
    }
    for (const [id, sets] of byDoc) {
      await client.patch(id).set(sets).commit()
      console.log(`    ✓ ${id} (${Object.keys(sets).length} fields)`)
    }
    console.log(`\nApplied ${edits.length} field(s) across ${byDoc.size} doc(s).`)
  } else {
    console.log(`\nWould patch ${edits.length} field(s). Re-run with -- --apply.`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
