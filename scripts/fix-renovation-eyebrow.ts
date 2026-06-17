/**
 * The renovation industry page's servicesBlock testimonialEyebrow has only
 * { en: "Testimony" } (no uk), so the UA route falls back to English. Align it
 * to the same bilingual value every other industry page uses.
 *
 * Dry-run:  npx sanity exec scripts/fix-renovation-eyebrow.ts --with-user-token
 * Apply:    npx sanity exec scripts/fix-renovation-eyebrow.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const NEW = {_type: 'localizedString', uk: 'ВІДГУК КЛІЄНТА', en: 'CLIENT TESTIMONIAL'}

async function main() {
  const page: {_id: string; sections: any[]} | null = await client.fetch(
    `*[_type == "industryPage" && slug.current == "renovation"][0]{_id, sections}`,
  )
  if (!page) throw new Error('renovation industryPage not found')

  const sections = page.sections ?? []
  const si = sections.findIndex((s: any) => s?._type === 'servicesBlock')
  if (si < 0) throw new Error('servicesBlock not found on renovation')
  const sectionKey = sections[si]?._key
  const path = sectionKey
    ? `sections[_key=="${sectionKey}"].testimonialEyebrow`
    : `sections[${si}].testimonialEyebrow`

  console.log(`renovation ${path}`)
  console.log(`  - ${JSON.stringify(sections[si]?.testimonialEyebrow)}`)
  console.log(`  + ${JSON.stringify(NEW)}`)

  if (APPLY) {
    await client.patch(page._id).set({[path]: NEW}).commit()
    console.log('    ✓ applied')
  } else {
    console.log('\nDry-run only. Re-run with -- --apply to write.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
