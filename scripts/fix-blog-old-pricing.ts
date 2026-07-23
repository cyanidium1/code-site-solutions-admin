/**
 * Fix stale old-4-tier pricing in the UA fields of three published blog posts.
 *
 * Context (2026-07-22): the live pricing model is the 3 CMS pricingPlan docs
 * (Лендінг від $800, Корпоративний сайт від $3,500, Кастомна платформа від
 * $6,000). The UA fields of these posts still carried the pre-relaunch ladder
 * (від $1,000 … $14,000+, "Industry Pro", "Кастомний продукт"). The EN fields
 * were already rewritten during the blog relaunch and are not touched here.
 *
 * Every replacement asserts the current value matches the expected old string
 * verbatim; any mismatch aborts before writing. Original docs are saved to
 * backups/blog-pricing-fix-2026-07-22/ before applying.
 *
 * Dry-run:
 *   npx sanity exec scripts/fix-blog-old-pricing.ts --with-user-token
 * Apply:
 *   npx sanity exec scripts/fix-blog-old-pricing.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'
import * as fs from 'fs'
import * as path from 'path'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type Change = {path: string; old: string; new: string}

const CHANGES: Record<string, Change[]> = {
  // «Вартість розробки сайту 2026» (vartist-rozrobky-saytu-2026)
  kSKPKaUF67MMZcPKqwVwa6: [
    {
      path: 'body[0].items[0]',
      old: 'Сайт в Україні у 2026 коштує **від $1,000 до $14,000+**. Цифра залежить від обсягу.',
      new: 'Сайт в Україні у 2026 коштує **від $800 до $6,000+**. Цифра залежить від обсягу.',
    },
    {
      path: 'body[0].items[1]',
      old: '**Лендинг:** від $1,000 (1–2 тижні)',
      new: '**Лендинг:** від $800 (1–2 тижні)',
    },
    {
      path: 'body[0].items[2]',
      old: '**Сайт під галузь (Industry Pro):** від $3,500 (4–10 тижнів)',
      new: '**Корпоративний сайт:** від $3,500 (4–8 тижнів)',
    },
    {
      path: 'body[0].items[4]',
      old: '**Кастомний продукт:** від $14,000 (8–16 тижнів)',
      new: '**Кастомна платформа:** від $6,000 (8–16 тижнів)',
    },
    {path: 'body[8].rows[0].cells[1]', old: 'від $1,000', new: 'від $800'},
    {path: 'body[8].rows[1].cells[0]', old: 'Сайт під галузь', new: 'Корпоративний сайт'},
    {path: 'body[8].rows[1].cells[2]', old: '4–10 тижнів', new: '4–8 тижнів'},
    {
      path: 'body[8].rows[1].cells[3]',
      old: 'CMS, блог, 2–3 інтеграції, дві мови, compliance',
      new: 'CMS, блог, 5+ інтеграцій, дві мови, compliance',
    },
    {path: 'body[8].rows[2].cells[0]', old: 'Кастомний продукт', new: 'Кастомна платформа'},
    {path: 'body[8].rows[2].cells[1]', old: 'від $14,000', new: 'від $6,000'},
    {
      path: 'faq[0].answer',
      old: 'Реальна вилка — від $1,000 за лендинг до $14,000+ за кастомний продукт. Більшість МСБ потрапляє в пакет Industry Pro $3,500 (сайт із CMS, інтеграціями і compliance).',
      new: 'Реальна вилка — від $800 за лендинг до $6,000+ за кастомну платформу. Більшість МСБ потрапляє в пакет «Корпоративний сайт» $3,500 (сайт із CMS, інтеграціями і compliance).',
    },
    {
      path: 'faq[2].answer',
      old: '$1,000–$2,500. Дешевше — це шаблон на конструкторі з усіма мінусами. Дорожче — це вже багатосторінковий сайт.',
      new: '$800–$2,500. Дешевше — це шаблон на конструкторі з усіма мінусами. Дорожче — це вже багатосторінковий сайт.',
    },
    {
      path: 'faq[3].answer',
      old: '$5,000–$10,000 для каталогу до 200 SKU з оплатою і доставкою. Мультивендор чи B2B-портал — це пакет від $14,000.',
      new: '$5,000–$10,000 для каталогу до 200 SKU з оплатою і доставкою. Мультивендор чи B2B-портал — це пакет від $6,000.',
    },
    {
      path: 'lede',
      old: 'Сайт у 2026 коштує від $1,000 до $14,000+. Ось що стоїть за кожною цифрою і як відрізнити чесний кошторис від розмитого.',
      new: 'Сайт у 2026 коштує від $800 до $6,000+. Ось що стоїть за кожною цифрою і як відрізнити чесний кошторис від розмитого.',
    },
    {
      path: 'metaDescription',
      old: 'Чесний прайс: лендинг від $1,000, сайт під галузь від $3,500, кастомний продукт від $14,000. Що формує ціну, фікс vs погодинна, і реальні цифри з 47 проєктів.',
      new: 'Чесний прайс: лендинг від $800, корпоративний сайт від $3,500, кастомна платформа від $6,000. Що формує ціну, фікс vs погодинна, і реальні цифри з 47 проєктів.',
    },
  ],
  // «Tilda vs кастомний сайт» (tilda-vs-kastomnyy-sayt-2026)
  gvhqpxBkuTxVKsvJravgoG: [
    {
      path: 'body[6].rows[3].cells[1]',
      old: 'від $1,000 / $3,500',
      new: 'від $800 / $3,500',
    },
    {
      path: 'body[8].rows[4].cells[0]',
      old: 'Кастом (Industry Pro)',
      new: 'Кастом (Корпоративний сайт)',
    },
  ],
  // «Next.js проти WordPress та конструкторів» (nextjs-proty-wordpress-ta-konstruktoriv)
  kSKPKaUF67MMZcPKqwVz1e: [
    {
      path: 'body[24].children[0].text',
      old: 'Бюджет до $1,000 і шаблон влаштовує → конструктор',
      new: 'Бюджет до $800 і шаблон влаштовує → конструктор',
    },
  ],
}

function getAtPath(obj: unknown, p: string): unknown {
  const tokens = p.match(/[^.[\]]+/g) ?? []
  let cur: any = obj
  for (const t of tokens) {
    if (cur == null) return undefined
    cur = cur[/^\d+$/.test(t) ? Number(t) : t]
  }
  return cur
}

async function main() {
  const ids = Object.keys(CHANGES)
  const docs = await client.getDocuments(ids)

  const backupDir = path.join(__dirname, '..', 'backups', 'blog-pricing-fix-2026-07-22')
  let mismatches = 0

  for (const doc of docs) {
    if (!doc) throw new Error('missing doc')
    const changes = CHANGES[doc._id]
    console.log(`\n=== ${doc._id} (${(doc as any).slug?.current}) — ${changes.length} changes`)
    for (const c of changes) {
      const cur = getAtPath(doc, c.path)
      if (cur === c.new) {
        console.log(`  = ${c.path} already new value (idempotent skip)`)
      } else if (cur !== c.old) {
        console.log(`  ! MISMATCH at ${c.path}\n    expected: ${c.old}\n    actual:   ${String(cur)}`)
        mismatches++
      } else {
        console.log(`  ~ ${c.path}\n    "${c.old}" -> "${c.new}"`)
      }
    }
  }

  if (mismatches) {
    console.log(`\nAborting: ${mismatches} mismatch(es); nothing written.`)
    process.exitCode = 1
    return
  }
  if (!APPLY) {
    console.log('\nDry-run complete. Re-run with -- --apply to write.')
    return
  }

  fs.mkdirSync(backupDir, {recursive: true})
  for (const doc of docs) {
    fs.writeFileSync(
      path.join(backupDir, `${doc!._id}.json`),
      JSON.stringify(doc, null, 2),
      'utf8',
    )
  }
  console.log(`\nBackups written to ${backupDir}`)

  for (const doc of docs) {
    const changes = CHANGES[doc!._id]
    const set: Record<string, string> = {}
    for (const c of changes) {
      if (getAtPath(doc, c.path) === c.old) set[c.path] = c.new
    }
    if (!Object.keys(set).length) {
      console.log(`No pending changes for ${doc!._id}`)
      continue
    }
    const res = await client.patch(doc!._id).set(set).commit()
    console.log(`Patched ${res._id} (rev ${res._rev}), ${Object.keys(set).length} fields`)
  }

  // Re-fetch and verify every target path now holds the new value.
  const after = await client.getDocuments(ids)
  let bad = 0
  for (const doc of after) {
    for (const c of CHANGES[doc!._id]) {
      if (getAtPath(doc, c.path) !== c.new) {
        console.log(`VERIFY FAIL ${doc!._id} ${c.path}`)
        bad++
      }
    }
  }
  console.log(bad ? `\nVERIFY: ${bad} path(s) wrong` : '\nVERIFY: all paths updated correctly.')
  if (bad) process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
