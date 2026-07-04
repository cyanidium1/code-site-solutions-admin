/**
 * Job #36 follow-up: the "property submission" screenshot is the Sanity admin
 * property editor — make the alts say so (case doc + industry outcome row).
 * Run: npx sanity exec scripts/fix-domlivo-alts-job36.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const CASE_ID = 'n3kbNYBoL1jFrKaaxAvIfd'
const INDUSTRY_ID = 'lOTgaDd8FU4wgJ8F4KCHLf'

const UK = 'Додавання обʼєкта в адмін-панелі Domlivo'
const EN = 'Adding a property in the Domlivo admin panel'

async function main() {
  if (!APPLY) {
    console.log('DRY-RUN: would set admin-panel alts on case + industry docs')
    return
  }
  const r1 = await client
    .patch(CASE_ID)
    .set({
      'sections[_key=="dml-agents"].image.alt.uk': UK,
      'sections[_key=="dml-agents"].image.alt.en': EN,
      'sections[_key=="dml-gallery"].images[_key=="dml-g-4"].alt.uk': UK,
      'sections[_key=="dml-gallery"].images[_key=="dml-g-4"].alt.en': EN,
    })
    .commit()
  const r2 = await client
    .patch(INDUSTRY_ID)
    .set({
      'sections[_key=="rea-sec-43"].benefitRows[_key=="rea-br-46"].image.alt.uk': UK,
      'sections[_key=="rea-sec-43"].benefitRows[_key=="rea-br-46"].image.alt.en': EN,
    })
    .commit()
  console.log('patched', r1._id, r2._id)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
