/**
 * Industry pages: populate the before/after (caseBlock) CTA per industry.
 * Six pages have a null caseBlock CTA, so the frontend falls back to the
 * hardcoded Ukrainian/medical default ("Подивитися кейси клінік"). Set a
 * generic localized ctaText + a per-industry localized button label, mirroring
 * the structure medicine/renovation already use ({cta:{type:"custom",label}}).
 * The button href stays auto-built per industry (we don't set cta.href).
 *
 * Dry-run:  npx sanity exec scripts/fix-case-cta-per-industry.ts --with-user-token
 * Apply:    npx sanity exec scripts/fix-case-cta-per-industry.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const CTA_TEXT = {
  _type: 'localizedText',
  uk: 'Хочете **такий самий результат**? Подивіться, як ми це робимо.',
  en: 'Want **the same kind of result**? See how we do it.',
}

// Per-industry button labels (slug → localized label).
const LABELS: Record<string, {uk: string; en: string}> = {
  auto: {uk: 'Подивитися авто-кейси', en: 'See auto case studies'},
  courses: {uk: 'Подивитися кейси курсів', en: 'See course case studies'},
  ecommerce: {uk: 'Подивитися кейси магазинів', en: 'See store case studies'},
  legal: {uk: 'Подивитися кейси юристів', en: 'See legal case studies'},
  finance: {uk: 'Подивитися кейси у фінансах', en: 'See finance case studies'},
  'real-estate': {uk: 'Подивитися кейси нерухомості', en: 'See real estate case studies'},
}

async function main() {
  const pages: Array<{_id: string; slug: string; sections: any[]}> =
    await client.fetch(
      `*[_type == "industryPage" && defined(slug.current) && !(_id in path("drafts.**"))]{_id, "slug": slug.current, sections}`,
    )

  const edits: Array<{id: string; slug: string; path: string; value: any}> = []

  for (const page of pages) {
    const label = LABELS[page.slug]
    if (!label) continue // only the six pages that need it
    const sections = page.sections ?? []
    const sec = sections.find((s: any) => s?._type === 'caseBlock')
    if (!sec) continue
    if (sec.cta?.label) {
      console.log(`skip ${page.slug}: cta.label already set`)
      continue
    }
    const skey = sec._key
    const at = (field: string) =>
      skey
        ? `sections[_key=="${skey}"].${field}`
        : `sections[${sections.indexOf(sec)}].${field}`

    const labelObj = {_type: 'localizedString', uk: label.uk, en: label.en}
    edits.push({id: page._id, slug: page.slug, path: at('cta'), value: {_type: 'ctaAction', type: 'custom', label: labelObj}})
    edits.push({id: page._id, slug: page.slug, path: at('ctaLabel'), value: labelObj})
    edits.push({id: page._id, slug: page.slug, path: at('ctaText'), value: CTA_TEXT})
  }

  for (const e of edits) {
    console.log(`${e.slug}  ${e.path}\n  + ${JSON.stringify(e.value)}`)
  }

  if (APPLY) {
    // Group sets per document so cta/ctaLabel/ctaText commit together.
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
