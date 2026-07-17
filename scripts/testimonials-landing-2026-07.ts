/**
 * Testimonials pass for the 2026-07 landing copy refresh (frontend PR #33).
 *
 * Source of truth: workspace docs/Code-Site-Art_Landing_EN.md ("50+ clients
 * ready to recommend us" block). EN quotes verbatim from the doc; UK quotes
 * adapted keeping the intent.
 *
 *   1. Patch Søren Hansen doc (DHIwRDN3sEoI638qoYQ1Yx — the one WITH the
 *      nbyg-kobenhavn caseRef): new quote wording per the doc.
 *   2. Repurpose the "TBD" placeholder (DHIwRDN3sEoI638qoYQ1ml) as
 *      Vlad / Kondor Device: real quote, caseRef → kondor-device,
 *      featured. reviewDate is unset (placeholder date was meaningless;
 *      JSON-LD falls back to _createdAt).
 *   3. Create Maria / E-Fedra testimonial (Sanity-generated UUID),
 *      caseRef → e-fedra-beauty.
 *   4. Delete 37c94c37-d527-4092-9b6e-3f2d2b26171e — exact duplicate of the
 *      Søren doc but WITHOUT the caseRef; both were featured, so the
 *      homepage swiper showed the same slide twice.
 *
 * rating: 5 follows the curated-testimonial convention set by
 * scripts/backfill-review-fields.ts.
 *
 * Idempotent for patches/delete; the create is guarded by an authorName
 * lookup so re-running does not duplicate Maria.
 *
 * Dry-run:
 *   npx sanity exec scripts/testimonials-landing-2026-07.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/testimonials-landing-2026-07.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const SOREN_ID = 'DHIwRDN3sEoI638qoYQ1Yx'
const TBD_ID = 'DHIwRDN3sEoI638qoYQ1ml'
const SOREN_DUPE_ID = '37c94c37-d527-4092-9b6e-3f2d2b26171e'
const KONDOR_CASE_ID = 'a5311634-9a57-4de9-ab72-ec42fcfcc270' // kondor-device
const EFEDRA_CASE_ID = 'lOTgaDd8FU4wgJ8F4K9vjD' // e-fedra-beauty

const CASE_LABEL = {en: 'See the full case study', uk: 'Подивитись повний кейс'}

const SOREN_QUOTE = {
  en: 'Before the new site we had 3 enquiries a month. After launch — 24 in the first month. The team wrote the content, ran QA, and launched it. All we had to do was pick up the keys.',
  uk: 'До нового сайту в нас було 3 заявки на місяць. Після запуску — 24 за перший місяць. Команда написала контент, провела QA й запустила сайт. Нам залишилося тільки отримати ключі.',
}

const KONDOR_PATCH = {
  authorName: 'Vlad',
  authorInitials: 'V',
  authorRole: {en: 'Kondor Device · electronics', uk: 'Kondor Device · електроніка'},
  quote: {
    en: 'Very happy with the work. The site runs very fast, and the admin panel is incredibly easy to use. We rank at the top of Google for our target queries.',
    uk: 'Дуже задоволені роботою. Сайт працює дуже швидко, а адмін-панель неймовірно зручна. За цільовими запитами ми в топі Google.',
  },
  caseRef: {_type: 'reference', _ref: KONDOR_CASE_ID},
  caseLabel: CASE_LABEL,
  featured: true,
  order: 20,
  rating: 5,
}

const MARIA_DOC = {
  _type: 'testimonial',
  authorName: 'Maria',
  authorInitials: 'M',
  authorRole: {en: 'E-Fedra · medicine & aesthetics', uk: 'E-Fedra · медицина та естетика'},
  quote: {
    en: 'Everything works, I’m delighted. If anyone ever needs your help, I’ll definitely recommend you.',
    uk: 'Все працює, я в захваті. Якщо комусь знадобиться ваша допомога — обов’язково вас порекомендую.',
  },
  caseRef: {_type: 'reference', _ref: EFEDRA_CASE_ID},
  caseLabel: CASE_LABEL,
  featured: true,
  order: 30,
  rating: 5,
}

function run() {
  return client
    .fetch<{_id: string; authorName?: string}[]>(
      '*[_type == "testimonial"]{_id, authorName}',
    )
    .then((docs) => {
      const ids = new Set(docs.map((d) => d._id))
      const mariaExists = docs.some((d) => d.authorName === 'Maria')

      console.log(`Found ${docs.length} testimonial docs:`)
      for (const d of docs) console.log(`  ${d._id}  (${d.authorName})`)
      console.log('')
      console.log('Planned mutations:')
      if (ids.has(SOREN_ID)) console.log(`  PATCH  ${SOREN_ID}  → new Søren quote`)
      if (ids.has(TBD_ID))
        console.log(`  PATCH  ${TBD_ID}  → Vlad / Kondor Device (unset reviewDate)`)
      console.log(
        mariaExists
          ? '  SKIP   Maria doc already exists'
          : '  CREATE Maria / E-Fedra (generated UUID)',
      )
      if (ids.has(SOREN_DUPE_ID))
        console.log(`  DELETE ${SOREN_DUPE_ID}  (duplicate Søren, no caseRef)`)
      console.log('')

      if (!APPLY) {
        console.log('Dry-run only. Re-run with `-- --apply` to execute.')
        return Promise.resolve()
      }

      let tx = client.transaction()
      if (ids.has(SOREN_ID)) {
        tx = tx.patch(SOREN_ID, (p) => p.set({quote: SOREN_QUOTE}))
      }
      if (ids.has(TBD_ID)) {
        tx = tx.patch(TBD_ID, (p) => p.set(KONDOR_PATCH).unset(['reviewDate']))
      }
      if (ids.has(SOREN_DUPE_ID)) {
        tx = tx.delete(SOREN_DUPE_ID)
      }
      return tx
        .commit()
        .then((res) => {
          console.log(`Transaction committed: ${res.transactionId}`)
          if (mariaExists) return undefined
          return client.create(MARIA_DOC).then((created) => {
            console.log(`Created Maria testimonial: ${created._id}`)
          })
        })
        .then(() => console.log('Done.'))
    })
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
