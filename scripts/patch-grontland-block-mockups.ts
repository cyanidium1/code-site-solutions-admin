/**
 * Job #164: swap the raw browser screenshots in the Grontland case
 * CHALLENGE + OUTCOME blocks for cover-style device mockups (laptop + phone
 * on leaf-green bg), matching how other cases present those blocks.
 *
 * Dry-run:
 *   npx sanity exec scripts/patch-grontland-block-mockups.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/patch-grontland-block-mockups.ts --with-user-token -- --apply
 */

import {createReadStream, existsSync} from 'node:fs'
import {join} from 'node:path'

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

const CASE_ID = 'Jp6kOd1C6kEhwIHN38RI9F'

const SCRATCH =
  process.env.GRONTLAND_SHOTS_DIR ??
  'C:/Users/kulak/AppData/Local/Temp/claude/C--GitHub23-code-site-workspace/01ca57ff-5e65-4f80-b528-ccb559671066/scratchpad'

const FILES: Record<string, [string, string]> = {
  private: [join(SCRATCH, 'ref/grontland-mock-private.png'), 'grontland-private-mockup.png'],
  b2b: [join(SCRATCH, 'ref/grontland-mock-b2b.png'), 'grontland-contractors-mockup.png'],
  projects: [join(SCRATCH, 'ref/grontland-mock-projects.png'), 'grontland-project-mockup.png'],
  omos: [join(SCRATCH, 'ref/grontland-mock-omos.png'), 'grontland-team-mockup.png'],
}

const img = (ref: string, uk: string, en: string, ru: string) => ({
  _type: 'imageWithLocalizedAlt',
  alt: {_type: 'localizedString', uk, en, ru},
  image: {_type: 'image', asset: {_ref: ref, _type: 'reference'}},
})

async function main() {
  const doc = await client.fetch(
    `*[_id == $id][0]{_id, "keys": sections[]._key}`,
    {id: CASE_ID},
  )
  if (!doc?._id) throw new Error(`Case ${CASE_ID} not found`)
  for (const key of ['grl-challenge', 'grl-outcome']) {
    if (!doc.keys.includes(key)) throw new Error(`Section ${key} missing`)
  }
  for (const [slot, [path]] of Object.entries(FILES)) {
    if (!existsSync(path)) throw new Error(`Missing file for ${slot}: ${path}`)
  }

  console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — patch ${CASE_ID} challenge/outcome images`)
  if (!APPLY) {
    console.log('Would upload 4 mockups and set challenge.image/.image2 + outcome.image/.image2')
    console.log('\nDry-run only. Re-run with -- --apply to write.')
    return
  }

  const assets: Record<string, string> = {}
  for (const [slot, [path, filename]] of Object.entries(FILES)) {
    const uploaded = await client.assets.upload('image', createReadStream(path), {filename})
    assets[slot] = uploaded._id
    console.log(`Uploaded ${slot}: ${uploaded._id}`)
  }

  const patched = await client
    .patch(CASE_ID)
    .set({
      'sections[_key=="grl-challenge"].image': img(
        assets.private,
        'Лендінг Grønt Land DK для приватних клієнтів на ноутбуці і телефоні',
        'Grønt Land DK landing page for private homeowners on laptop and phone',
        'Лендинг Grønt Land DK для частных клиентов на ноутбуке и телефоне',
      ),
      'sections[_key=="grl-challenge"].image2': img(
        assets.b2b,
        'Лендінг Grønt Land DK для підрядників на ноутбуці і телефоні',
        'Grønt Land DK landing page for contractors on laptop and phone',
        'Лендинг Grønt Land DK для подрядчиков на ноутбуке и телефоне',
      ),
      'sections[_key=="grl-outcome"].image': img(
        assets.projects,
        'Сторінка проєкту реновації вілли Grønt Land DK на ноутбуці, каталог проєктів на телефоні',
        'Grønt Land DK villa renovation project page on a laptop and project catalogue on a phone',
        'Страница проекта реновации виллы Grønt Land DK на ноутбуке, каталог проектов на телефоне',
      ),
      'sections[_key=="grl-outcome"].image2': img(
        assets.omos,
        'Сторінка про команду Grønt Land DK на ноутбуці і телефоні',
        'Grønt Land DK team page on laptop and phone',
        'Страница о команде Grønt Land DK на ноутбуке и телефоне',
      ),
    })
    .commit()
  console.log(`Patched ${patched._id}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
