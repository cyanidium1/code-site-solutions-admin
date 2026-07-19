/**
 * Job #83 (2026-07-19): body copy for the "grow on Google" blocks inserted by
 * gsc-images-2026-07.ts (_key "gscgrowth") on kondor-device, mono-pools,
 * efedra-clinic and boulevard-salon. nbyg keeps its existing copy untouched.
 * Numbers come straight from each client's GSC screenshot on the same block.
 *
 * Dry-run by default. Run:
 *   npx sanity exec scripts/gsc-block-texts-2026-07.ts --with-user-token -- --apply
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const BLOCK_KEY = 'gscgrowth'

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

const TEXTS: {slug: string; docId: string; uk: string; en: string}[] = [
  {
    slug: 'kondor-device',
    docId: 'a5311634-9a57-4de9-ab72-ec42fcfcc270',
    uk: 'Сайт стартував з нуля — раніше компанія не мала присутності в пошуку Google. За останні 6 місяців сайт отримав 138 переходів з Google і 841 показ у пошуку. Середній CTR — 16,4%: приблизно кожен шостий, хто бачить сайт у видачі, переходить на нього. Це означає, що сайт знаходять люди, які шукають саме ці товари, — і з ростом позицій цей трафік зростатиме.',
    en: 'The site started from zero — the company had no presence in Google search before. Over the past 6 months it earned 138 clicks from Google and 841 impressions in search. The average CTR is 16.4%: roughly one in six people who see the site in the results clicks through. That means the site is being found by people looking for exactly these products — and as rankings grow, so will this traffic.',
  },
  {
    slug: 'mono-pools',
    docId: 'a2b52844-f284-4114-8a4d-61204b18b498',
    uk: 'Раніше компанія не мала пошукового трафіку — сайт стартував з нуля. За останні 6 місяців він отримав 168 переходів з Google і 5 050 показів у пошуку, середня позиція — 19,5 і продовжує покращуватися. Це цільові відвідувачі: люди, які шукають композитний басейн, тепер знаходять виробника напряму.',
    en: 'The company had no search traffic before — the site started from zero. Over the past 6 months it earned 168 clicks from Google and 5,050 impressions in search, with an average position of 19.5 that keeps improving. These are targeted visitors: people searching for a composite pool now find the manufacturer directly.',
  },
  {
    slug: 'efedra-clinic',
    docId: 'lOTgaDd8FU4wgJ8F4K9w0O',
    uk: 'За останні 6 місяців сайт отримав 1 460 переходів з Google — проти 340 за попередні пів року, тобто зростання більш ніж у 4 рази. Покази в пошуку зросли з 1 820 до 13 000: клініку стали бачити всемеро більше людей, які шукають стоматологію та естетичну медицину. Більше людей бачать сайт у Google → більше переходів → більше записів на прийом.',
    en: 'Over the past 6 months the site earned 1,460 clicks from Google — versus 340 in the previous half-year, more than a 4× increase. Search impressions grew from 1,820 to 13,000: seven times more people looking for dental and aesthetic-medicine services now see the clinic. More people see the site on Google → more visits → more appointment bookings.',
  },
  {
    slug: 'boulevard-salon',
    docId: '6tWqPRZWZzG4Lv3HK7J6Xx',
    uk: 'За останні 6 місяців сайт отримав 488 переходів з Google проти 269 за попередні пів року — майже вдвічі більше. Покази зросли з 7 360 до 13 200, а середня позиція піднялася з 21 до 12,6. Салон тепер частіше бачать люди, які шукають б’юті-послуги поруч, — і саме цей трафік приводить нових клієнтів.',
    en: 'Over the past 6 months the site earned 488 clicks from Google versus 269 in the previous half-year — nearly twice as many. Impressions grew from 7,360 to 13,200, and the average position climbed from 21 to 12.6. More people searching for beauty services nearby now see the salon — and that traffic is what brings in new clients.',
  },
]

async function main() {
  for (const t of TEXTS) {
    const sec = await client.fetch<{_key: string; hasBody: boolean} | null>(
      `*[_id == $id][0].sections[_key == $key][0]{_key, "hasBody": defined(body)}`,
      {id: t.docId, key: BLOCK_KEY},
    )
    if (!sec) throw new Error(`block "${BLOCK_KEY}" not found in ${t.slug}`)
    console.log(`── ${t.slug} ── (body already set: ${sec.hasBody})`)
    console.log(`  uk: ${t.uk.slice(0, 70)}…`)
    console.log(`  en: ${t.en.slice(0, 70)}…`)
    if (!APPLY) {
      console.log('  [dry-run] not committed')
      continue
    }
    const base = `sections[_key=="${BLOCK_KEY}"]`
    await client
      .patch(t.docId)
      .set({
        [`${base}.body`]: richText('gsctxtuk', t.uk),
        [`${base}.bodyEn`]: richText('gsctxten', t.en),
      })
      .commit()
    console.log('  committed')
  }
  console.log(`\n${APPLY ? 'DONE' : 'DRY RUN complete — rerun with `-- --apply` to write'}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
