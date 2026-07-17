/**
 * Add device-mockup images to the Vlad (Kondor Device) and Maria (E-Fedra)
 * testimonial slides so they get the same visual treatment as the Søren
 * Hansen slide (follow-up to scripts/testimonials-landing-2026-07.ts).
 *
 * Søren's own mockups are NBYG-specific screenshots, so instead of
 * duplicating those, each slide gets its OWN case's hero mockup
 * ("website shown on laptop and phone" composite, same transparent-PNG
 * style, ~same aspect ratio as Søren's laptop mockup). Alts are copied
 * from the case heroes (already bilingual per the alt style guide).
 *
 * Only `mockupRight` is set — the hero composites already include both
 * laptop and phone, and the slide component renders each side
 * conditionally.
 *
 * Idempotent — re-running sets the same values.
 *
 * Dry-run:
 *   npx sanity exec scripts/testimonials-mockups-2026-07.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/testimonials-mockups-2026-07.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const VLAD_ID = 'DHIwRDN3sEoI638qoYQ1ml'
const MARIA_ID = 's2wDSUpWBbCAmLaTqSJeSh'

function mockup(ref: string, altEn: string, altUk: string) {
  return {
    _type: 'imageWithLocalizedAlt',
    alt: {_type: 'localizedString', en: altEn, uk: altUk},
    image: {_type: 'image', asset: {_type: 'reference', _ref: ref}},
  }
}

const PATCHES: {id: string; who: string; mockupRight: ReturnType<typeof mockup>}[] = [
  {
    id: VLAD_ID,
    who: 'Vlad / Kondor Device',
    // kondor-device case hero
    mockupRight: mockup(
      'image-bd316e99efce95e83ddf61ad58c9a39a15a870d1-1189x1133-png',
      'Kondor Device website shown on laptop and phone',
      'Сайт Kondor Device на ноутбуці і телефоні',
    ),
  },
  {
    id: MARIA_ID,
    who: 'Maria / E-Fedra',
    // e-fedra-beauty case hero
    mockupRight: mockup(
      'image-45877ebe7c437a04d62904b6b3bc6cfbf2426f87-1199x1133-png',
      'E-Fedra Beauty website shown on laptop and phone',
      'Сайт E-Fedra Beauty на ноутбуці і телефоні',
    ),
  },
]

function run() {
  return client
    .fetch<{_id: string}[]>('*[_id in $ids]{_id}', {ids: PATCHES.map((p) => p.id)})
    .then((docs) => {
      const found = new Set(docs.map((d) => d._id))
      console.log('Planned mutations:')
      for (const p of PATCHES) {
        console.log(
          found.has(p.id)
            ? `  PATCH ${p.id}  → mockupRight for ${p.who}`
            : `  SKIP  ${p.id}  (doc not found — ${p.who})`,
        )
      }
      if (!APPLY) {
        console.log('\nDry-run only. Re-run with `-- --apply` to execute.')
        return Promise.resolve()
      }
      let tx = client.transaction()
      for (const p of PATCHES) {
        if (found.has(p.id)) {
          tx = tx.patch(p.id, (patch) => patch.set({mockupRight: p.mockupRight}))
        }
      }
      return tx.commit().then((res) => {
        console.log(`\nTransaction committed: ${res.transactionId}`)
      })
    })
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
