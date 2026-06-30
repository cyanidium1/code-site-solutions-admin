/**
 * UK localisation — Phase 1 visible-bug fixes (EN fields only).
 *
 * Surgical, validated patches: each target declares the value it expects to
 * find; the script only writes when the current value matches, so a shifted
 * array index or already-fixed field is skipped, never corrupted.
 *
 * Covers:
 *  - Cyrillic / wrong-locale leaks in EN stat & result values
 *  - the two image-alt mis-pastes on raul-avto (Le'Muse / Solide text)
 *  - WebBond SEO title/description (carried model-scouting copy)
 *  - NBYG "Ccontinued" typo
 *  - renovation SEO price (£1,000 → £3,500, matching its own tiers + homepage)
 *
 * Dry-run:  npx sanity exec scripts/uk-fix-en-bugs.ts --with-user-token
 * Apply:    npx sanity exec scripts/uk-fix-en-bugs.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')

type Target = {slug: string; type: string; path: string; expect: string; to: string; note?: string}

const TARGETS: Target[] = [
  // ── Cyrillic / wrong-locale leaks: industryPage ──────────────────────────
  {slug: 'courses', type: 'industryPage', path: 'sections[1].results[3].value.en', expect: '1 крок', to: '1 step'},
  {slug: 'ecommerce', type: 'industryPage', path: 'sections[1].results[3].value.en', expect: '3 хв', to: '3 min'},
  {slug: 'finance', type: 'industryPage', path: 'hero.stats[2].value.en', expect: 'від структури до запуску сайту', to: '4–8 weeks'},
  {slug: 'real-estate', type: 'industryPage', path: 'hero.stats[2].value.en', expect: '5 ринків', to: '5 markets'},
  {slug: 'real-estate', type: 'industryPage', path: 'sections[1].results[2].value.en', expect: '4 тижні', to: '4 weeks'},
  {slug: 'medicine', type: 'industryPage', path: 'sections[1].results[1].value.en', expect: '<1.5c', to: '<1.5s', note: 'wrong unit letter'},
  {slug: 'renovation', type: 'industryPage', path: 'sections[1].results[1].value.en', expect: '0.8c', to: '0.8s', note: 'wrong unit letter'},

  // ── Cyrillic leaks: caseStudy stat values ────────────────────────────────
  {slug: 'glimmer', type: 'caseStudy', path: 'sections[0].items[0].value.en', expect: '~1 тиждень', to: '~1 week'},
  {slug: 'mono-pools', type: 'caseStudy', path: 'sections[0].items[1].value.en', expect: '~2 місяці', to: '~2 months'},
  {slug: 'kondor-device', type: 'caseStudy', path: 'sections[0].items[0].value.en', expect: '↑ продажі', to: '↑ sales'},
  {slug: 'right-cars', type: 'caseStudy', path: 'sections[0].items[0].value.en', expect: '1 аукціон', to: '1 auction'},
  {slug: 'right-cars', type: 'caseStudy', path: 'sections[0].items[1].value.en', expect: '1000+ авто', to: '1,000+ cars'},
  {slug: 'right-cars', type: 'caseStudy', path: 'sections[0].items[2].value.en', expect: '20+ фільтрів', to: '20+ filters'},
  {slug: 'right-cars', type: 'caseStudy', path: 'sections[0].items[3].value.en', expect: '1 особистий кабінет', to: '1 user account'},
  {slug: 'nbyg-kobenhavn', type: 'caseStudy', path: 'sections[0].items[2].value.en', expect: 'сайт частіше бачили люди в пошуку', to: '302,000 Google impressions'},

  // ── Image-alt mis-pastes: raul-avto ──────────────────────────────────────
  {slug: 'raul-avto', type: 'caseStudy', path: 'sections[2].image.alt.en', expect: "Le'Muse Nature's new homepage with categories, bestsellers, and the ingredients block", to: "Raul Avto's new homepage"},
  {slug: 'raul-avto', type: 'caseStudy', path: 'sections[3].image.alt.en', expect: 'Sanity CMS admin panel on the Solide Renovation site', to: 'Sanity CMS admin panel on the Raul Avto site'},

  // ── NBYG typo ────────────────────────────────────────────────────────────
  {slug: 'nbyg-kobenhavn', type: 'caseStudy', path: 'sections[7].bulletList[5].en', expect: 'Ccontinued SEO promotion after launch', to: 'Continued SEO promotion after launch'},

  // ── WebBond SEO mis-paste (model-scouting copy → digital agency) ──────────
  {slug: 'webbond', type: 'caseStudy', path: 'seo.title.en', expect: 'ᐈ WebBond — Model Scouting Platform Case Study | Code-Site.Art', to: 'ᐈ WebBond — Website for a Digital Agency Case Study | Code-Site.Art'},
  {slug: 'webbond', type: 'caseStudy', path: 'seo.description.en', expect: '➤ Dual-flow talent platform ✔️ Model scouting system ✔️ Client portfolio presentation ✔️ B2B & B2C conversion ➡ See the full case study.', to: '➤ Website for WebBond, a digital agency offering web design, SEO, ads & branding ✔️ Service pages ✔️ Portfolio ✔️ Lead capture ➡ See the full case study.'},

  // ── Renovation SEO price (stale £1,000 → real £3,500) ────────────────────
  {slug: 'renovation', type: 'industryPage', path: 'seo.description.en', expect: '➤ Custom websites for UK builders, contractors & renovation companies ✔️ Online quote calculator ✔️ Project gallery ✔️ Fixed price from £1,000 ➡ Get a free estimate today.', to: '➤ Custom websites for UK builders, contractors & renovation companies ✔️ Online quote calculator ✔️ Project gallery ✔️ Fixed price from £3,500 ➡ Get a free estimate today.', note: 'price corrected to match tiers (£3,500/£6,500/£12,000)'},
]

// Resolve a path like "a.b[0].c.en" against a doc object.
function getAtPath(obj: any, path: string): any {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return cur
}

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY (writing changes)' : 'DRY-RUN (no writes)'}`)
  console.log('='.repeat(78))

  let ok = 0
  let skip = 0
  // Group sets per document id.
  const byId = new Map<string, {slug: string; type: string; sets: Record<string, string>}>()

  for (const t of TARGETS) {
    const doc = await client.fetch('*[_type==$type && slug.current==$slug][0]{...}', {type: t.type, slug: t.slug})
    if (!doc) {
      console.log(`\n✗ NOT FOUND: ${t.type}/${t.slug}`)
      skip++
      continue
    }
    const cur = getAtPath(doc, t.path)
    if (cur === t.to) {
      console.log(`\n• already done: [${t.type}/${t.slug}] ${t.path}`)
      skip++
      continue
    }
    if (cur !== t.expect) {
      console.log(`\n✗ MISMATCH (skipped): [${t.type}/${t.slug}] ${t.path}`)
      console.log(`    expected: ${JSON.stringify(t.expect)}`)
      console.log(`    found:    ${JSON.stringify(cur)}`)
      skip++
      continue
    }
    console.log(`\n✓ [${t.type}/${t.slug}] ${t.path}${t.note ? '  (' + t.note + ')' : ''}`)
    console.log(`    -  ${t.expect}`)
    console.log(`    +  ${t.to}`)
    let entry = byId.get(doc._id)
    if (!entry) {
      entry = {slug: t.slug, type: t.type, sets: {}}
      byId.set(doc._id, entry)
    }
    entry.sets[t.path] = t.to
    ok++
  }

  if (APPLY) {
    for (const [id, entry] of byId) {
      await client.patch(id).set(entry.sets).commit()
      console.log(`\n  wrote ${Object.keys(entry.sets).length} field(s) to ${entry.type}/${entry.slug}`)
    }
  }

  console.log('\n' + '='.repeat(78))
  console.log(`Planned: ${ok} | skipped: ${skip} | docs: ${byId.size}`)
  if (!APPLY) console.log('(Re-run with -- --apply to write changes.)')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
