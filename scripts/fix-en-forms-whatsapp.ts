/**
 * EN industry forms: switch Telegram → WhatsApp wording.
 * - comparisonBlock.contact.channelPlaceholder.en  (Telegram → WhatsApp)
 * - comparisonBlock.contact.sub.en                 (word "Telegram" → "WhatsApp")
 * - auditBlock.inputs.contactPlaceholder.en        ("…Telegram…" → "Email or WhatsApp")
 * - auditBlock.inputs.phonePlaceholder.en          ("+1 (___) ___-____" → "Phone (optional)")
 * UA values are left untouched.
 *
 * Dry-run:  npx sanity exec scripts/fix-en-forms-whatsapp.ts --with-user-token
 * Apply:    npx sanity exec scripts/fix-en-forms-whatsapp.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type Edit = {id: string; slug: string; path: string; before: any; after: any}

async function main() {
  const pages: Array<{_id: string; slug: string; sections: any[]}> =
    await client.fetch(
      `*[_type == "industryPage" && defined(slug.current)]{_id, "slug": slug.current, sections}`,
    )

  const edits: Edit[] = []

  for (const page of pages) {
    const sections = page.sections ?? []
    sections.forEach((section: any, si: number) => {
      const skey = section?._key
      const at = (field: string) =>
        skey ? `sections[_key=="${skey}"].${field}` : `sections[${si}].${field}`

      if (section?._type === 'comparisonBlock' && section.contact) {
        const ch = section.contact.channelPlaceholder
        if (ch?.en && ch.en.includes('Telegram')) {
          const after = {...ch, en: ch.en.replace(/Telegram/g, 'WhatsApp')}
          edits.push({id: page._id, slug: page.slug, path: at('contact.channelPlaceholder'), before: ch, after})
        }
        const sub = section.contact.sub
        if (sub?.en && sub.en.includes('Telegram')) {
          const after = {...sub, en: sub.en.replace(/Telegram/g, 'WhatsApp')}
          edits.push({id: page._id, slug: page.slug, path: at('contact.sub'), before: sub, after})
        }
      }

      if (section?._type === 'auditBlock' && section.inputs) {
        const cp = section.inputs.contactPlaceholder
        if (cp?.en && cp.en.includes('Telegram')) {
          const after = {...cp, en: 'Email or WhatsApp'}
          edits.push({id: page._id, slug: page.slug, path: at('inputs.contactPlaceholder'), before: cp, after})
        }
        const pp = section.inputs.phonePlaceholder
        if (pp?.en && pp.en.includes('+1')) {
          const after = {...pp, en: 'Phone (optional)'}
          edits.push({id: page._id, slug: page.slug, path: at('inputs.phonePlaceholder'), before: pp, after})
        }
      }
    })
  }

  for (const e of edits) {
    console.log(`${e.slug}  ${e.path}\n  - ${JSON.stringify(e.before)}\n  + ${JSON.stringify(e.after)}`)
  }

  if (APPLY) {
    for (const e of edits) {
      await client.patch(e.id).set({[e.path]: e.after}).commit()
      console.log(`    ✓ ${e.slug} ${e.path}`)
    }
    console.log(`\nApplied ${edits.length} edit(s).`)
  } else {
    console.log(`\nWould patch ${edits.length} edit(s). Re-run with -- --apply.`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
