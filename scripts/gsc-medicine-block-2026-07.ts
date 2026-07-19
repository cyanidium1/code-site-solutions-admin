/**
 * Job #84 (2026-07-19): the medicine industry page features the Efedra case
 * (caseBlock sec2e shows medicine-case-before/after = efedra designs), and the
 * efedra-clinic GSC screenshot exists — mirror the renovation-page pattern by
 * inserting a "grow on Google" imageTextBlock between the caseBlock and the
 * outcomeBlock. Copy matches the efedra-clinic case block (same client/numbers).
 *
 * Dry-run by default. Run:
 *   npx sanity exec scripts/gsc-medicine-block-2026-07.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const MEDICINE_ID = '6tWqPRZWZzG4Lv3HK7JkzS'
const OUTCOME_KEY = 'secp'
const BLOCK_KEY = 'gscgrowth'
const GSC_ASSET_FILENAME = 'gsc-efedra-clinic-6mo-compare.jpg'

const UK_BODY =
  'За останні 6 місяців сайт клініки отримав 1 460 переходів з Google — проти 340 за попередні пів року, тобто зростання більш ніж у 4 рази. Покази в пошуку зросли з 1 820 до 13 000: клініку стали бачити всемеро більше людей, які шукають стоматологію та естетичну медицину. Більше людей бачать сайт у Google → більше переходів → більше записів на прийом.'
const EN_BODY =
  'Over the past 6 months the clinic site earned 1,460 clicks from Google — versus 340 in the previous half-year, more than a 4× increase. Search impressions grew from 1,820 to 13,000: seven times more people looking for dental and aesthetic-medicine services now see the clinic. More people see the site on Google → more visits → more appointment bookings.'

function richText(keyBase: string, text: string) {
  return [
    {
      _type: 'block',
      _key: `${keyBase}b`,
      style: 'normal',
      markDefs: [],
      children: [{_type: 'span', _key: `${keyBase}s`, text, marks: []}],
    },
  ]
}

async function main() {
  const assetId = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $f][0]._id`,
    {f: GSC_ASSET_FILENAME},
  )
  if (!assetId) throw new Error(`asset ${GSC_ASSET_FILENAME} not found`)

  const keys = await client.fetch<string[]>(`*[_id == $id][0].sections[]._key`, {id: MEDICINE_ID})
  if (!keys?.includes(OUTCOME_KEY)) throw new Error(`outcomeBlock ${OUTCOME_KEY} not found`)
  if (keys.includes(BLOCK_KEY)) {
    console.log(`block "${BLOCK_KEY}" already present — nothing to do`)
    return
  }

  const block = {
    _key: BLOCK_KEY,
    _type: 'imageTextBlock',
    variant: 'side',
    imageVariant: 'imageLeft',
    imageFit: 'natural',
    bulletIcon: 'check',
    heading: {
      _type: 'localizedText',
      uk: 'Як сайт почав *рости в Google*',
      en: 'How the site began to *grow on Google*',
    },
    body: richText('gsctxtuk', UK_BODY),
    bodyEn: richText('gsctxten', EN_BODY),
    image: {
      _type: 'imageWithLocalizedAlt',
      alt: {
        _type: 'localizedString',
        uk: 'Звіт Google Search Console для сайту Efedra: порівняння продуктивності за два піврічні періоди',
        en: 'Google Search Console report for the Efedra website: six-month performance comparison',
      },
      image: {_type: 'image', asset: {_type: 'reference', _ref: assetId}},
    },
  }

  console.log(`insert "${BLOCK_KEY}" before outcomeBlock ${OUTCOME_KEY} (${GSC_ASSET_FILENAME})`)
  if (!APPLY) {
    console.log('[dry-run] not committed — rerun with `-- --apply` to write')
    return
  }
  await client
    .patch(MEDICINE_ID)
    .insert('before', `sections[_key=="${OUTCOME_KEY}"]`, [block])
    .commit()
  console.log('committed')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
