/**
 * Job #165: challenge/outcome block images — house style is a SINGLE device
 * per slot on a transparent background (phone in `image` / left, laptop in
 * `image2` / right), as in kondor-device / nbyg / mono-pools. Replaces the
 * two-device green mockups from job #164.
 *
 * Dry-run:
 *   npx sanity exec scripts/patch-grontland-single-mockups.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/patch-grontland-single-mockups.ts --with-user-token -- --apply
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
  phPrivate: [join(SCRATCH, 'ref/grontland-single-ph-private.png'), 'grontland-private-phone.png'],
  lapB2b: [join(SCRATCH, 'ref/grontland-single-lap-b2b.png'), 'grontland-contractors-laptop.png'],
  phProjects: [join(SCRATCH, 'ref/grontland-single-ph-projects.png'), 'grontland-projects-phone.png'],
  lapProject: [join(SCRATCH, 'ref/grontland-single-lap-project.png'), 'grontland-project-laptop.png'],
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

  console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — single-device mockups on ${CASE_ID}`)
  if (!APPLY) {
    console.log('Would upload 4 singles and set challenge/outcome image+image2')
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
        assets.phPrivate,
        'Мобільна версія лендінгу Grønt Land DK для приватних клієнтів',
        'Grønt Land DK private-clients landing on mobile',
        'Мобильная версия лендинга Grønt Land DK для частных клиентов',
      ),
      'sections[_key=="grl-challenge"].image2': img(
        assets.lapB2b,
        'Лендінг Grønt Land DK для підрядників на ноутбуці',
        'Grønt Land DK contractors landing on a laptop',
        'Лендинг Grønt Land DK для подрядчиков на ноутбуке',
      ),
      'sections[_key=="grl-outcome"].image': img(
        assets.phProjects,
        'Каталог проєктів Grønt Land DK на телефоні',
        'Grønt Land DK project catalogue on a phone',
        'Каталог проектов Grønt Land DK на телефоне',
      ),
      'sections[_key=="grl-outcome"].image2': img(
        assets.lapProject,
        'Сторінка проєкту реновації вілли Grønt Land DK на ноутбуці',
        'Grønt Land DK villa renovation project page on a laptop',
        'Страница проекта реновации виллы Grønt Land DK на ноутбуке',
      ),
    })
    .commit()
  console.log(`Patched ${patched._id}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
