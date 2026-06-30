/**
 * UK localisation Phase 3 — MEDICINE industry page (template page).
 *
 * Validated patches (expect -> to) for the medicine industryPage: swaps the
 * Ukrainian/US medical integration stack and compliance frameworks for UK ones,
 * reframes the insurance line, and strips Odesa / Russian-language framing from
 * the (real) Efedra Clinic case while keeping the client as genuine proof.
 *
 * Dry-run:  npx sanity exec scripts/uk-phase3-medicine.ts --with-user-token
 * Apply:    npx sanity exec scripts/uk-phase3-medicine.ts --with-user-token -- --apply
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-10-01'})
const APPLY = process.argv.includes('--apply')
const SLUG = 'medicine'

type T = {path: string; expect: string; to: string}

const TARGETS: T[] = [
  // ── hero ────────────────────────────────────────────────────────────────
  {path: 'hero.features[2].en', expect: 'CRM integration | Bitrix · AmoCRM', to: 'CRM integration | HubSpot · Pipedrive'},
  {path: 'hero.features[3].en', expect: 'Compliant | HIPAA-aware (US), GDPR (EU)', to: 'Compliant | UK GDPR · NHS DSP Toolkit'},

  // ── Efedra case: strip Odesa / Russian-language framing (client stays real)
  {path: 'sections[1].after.items[3].en', expect: 'proper multilingual setup (RU/UA)', to: 'proper multilingual setup'},
  {path: 'sections[1].before.foot.en', expect: '**Note:** Russian was kept as the primary language for SEO — in Odesa a meaningful share of search queries are still in Russian.', to: '**Note:** an outdated structure and slow load meant most visitors left before booking.'},
  {path: 'sections[1].before.items[3].en', expect: 'broken multilingual setup (Russian / Ukrainian)', to: 'a broken multilingual setup'},
  {path: 'sections[1].eyebrowEm.en', expect: 'EFEDRA CLINIC, ODESA', to: 'EFEDRA CLINIC'},
  {path: 'sections[1].lede.en', expect: '*Efedra Clinic* in Odesa came to us with an outdated site that wasn\'t generating inquiries. The brief was tricky: rebuild the structure, design, and logic for *two business lines* under one brand — a dental practice and an aesthetic-medicine studio.', to: '*Efedra Clinic* came to us with an outdated site that wasn\'t generating inquiries. The brief was tricky: rebuild the structure, design, and logic for *two business lines* under one brand — a dental practice and an aesthetic-medicine studio.'},
  {path: 'sections[1].meta[2].strong.en', expect: 'UA + RU', to: 'Multilingual'},

  // ── features: integrations + insurance ──────────────────────────────────
  {path: 'sections[3].features[0].items[1].en', expect: 'Integrates with *Dental4Windows*, Medesk, MedAI, Helsi, KeyCRM', to: 'Integrates with *SystmOne*, EMIS, Dentally, Software of Excellence, Cliniko'},
  {path: 'sections[3].features[4].items[1].en', expect: "*Helsi* integration for Ukraine's NHSU (state insurance)", to: 'Integration with *Bupa*, *AXA Health* and other insurers'},

  // ── integrations chip list ──────────────────────────────────────────────
  {path: 'sections[3].integrations[0].en', expect: 'Dental4Windows', to: 'Dentally'},
  {path: 'sections[3].integrations[1].en', expect: 'Medesk', to: 'Cliniko'},
  {path: 'sections[3].integrations[2].en', expect: 'MedAI', to: 'Semble'},
  {path: 'sections[3].integrations[3].en', expect: 'Helsi', to: 'SystmOne'},
  {path: 'sections[3].integrations[4].en', expect: 'KeyCRM', to: 'EMIS'},
  {path: 'sections[3].integrations[5].en', expect: 'AmoCRM', to: 'HubSpot'},
  {path: 'sections[3].integrations[6].en', expect: 'Bitrix24', to: 'Pipedrive'},

  // ── comparison table: compliance rows ───────────────────────────────────
  {path: 'sections[4].rows[4].custom.en', expect: 'high (HIPAA-aware, GDPR)', to: 'high (UK GDPR, NHS DSP Toolkit)'},
  {path: 'sections[4].rows[5].param.en', expect: 'Compliance (HIPAA / GDPR)', to: 'Compliance (UK GDPR / DPA 2018)'},

  // ── FAQ portable-text spans ─────────────────────────────────────────────
  // items[2] — who writes the content
  {path: 'sections[5].items[2].answerEn[0].children[2].text', expect: ' and the rules medical content has to follow (HIPAA-aware for US clients, GDPR for the EU, Ministry of Health (Ukraine) guidance for UA practices).', to: " and the rules medical content has to follow (UK GDPR, the CQC's standards for registered providers, and ASA/MHRA rules on health advertising)."},
  // items[3] — which CRM integrations
  {path: 'sections[5].items[3].answerEn[0].children[1].text', expect: 'Dental4Windows', to: 'SystmOne'},
  {path: 'sections[5].items[3].answerEn[0].children[2].text', expect: ", Medesk, MedAI, Helsi (Ukraine's NHSU), KeyCRM, AmoCRM, and Bitrix24. If your CRM isn't on the list, we wire it up via API or webhooks. Bookings hit your CRM instantly, and the doctor gets a WhatsApp notification.", to: ", EMIS, Dentally, Software of Excellence, Cliniko, HubSpot, and Pipedrive. If your CRM isn't on the list, we wire it up via API or webhooks. Bookings hit your CRM instantly, and the doctor gets a WhatsApp notification."},
  // items[4] — patient data protection
  {path: 'sections[5].items[4].answerEn[0].children[1].text', expect: 'HIPAA-aware', to: 'UK GDPR-compliant'},
  {path: 'sections[5].items[4].answerEn[0].children[2].text', expect: ' for US clients and ', to: ' and aligned with the '},
  {path: 'sections[5].items[4].answerEn[0].children[3].text', expect: 'GDPR-compliant', to: 'NHS Data Security & Protection Toolkit'},
  {path: 'sections[5].items[4].answerEn[0].children[4].text', expect: ' for the EU (we also follow Ministry of Health Ukraine guidance for UA practices): encryption in transit (HTTPS) and at rest, IP allowlisting on the admin, audit logs, regular backups. Servers in the EU. Your contract includes a DPA.', to: ': encryption in transit (HTTPS) and at rest, IP allowlisting on the admin, audit logs, regular backups. Servers in the UK or EU. Your contract includes a DPA.'},
  // items[5] — patient reviews
  {path: 'sections[5].items[5].answerEn[0].children[2].text', expect: " and without disclosing diagnoses. We'll draft a consent template with a solicitor. Alternative — integrate Google Reviews or Doc.ua, where the platform moderates.", to: " and without disclosing diagnoses. We'll draft a consent template with a solicitor. Alternative — integrate Google Reviews or Doctify, where the platform moderates."},
  // items[6] — advertising rules & data law
  {path: 'sections[5].items[6].answerEn[0].children[0].text', expect: "Different in every market — HIPAA plus FTC rules in the US, GDPR plus your national medical board in the EU (Sundhedsdatastyrelsen in Denmark, MDR in Germany). We handle the technical side: privacy notices, consent banners, secure intake forms, transparent pricing displays where they're required. We're not solicitors — for advertising restrictions, licensing, or telehealth specifics, we'll connect you with a healthcare solicitor during the brief. That's their lane.", to: "In the UK that's UK GDPR and the Data Protection Act 2018, the CQC's standards for registered providers, and the ASA/MHRA rules on what health services can advertise. We handle the technical side: privacy notices, consent banners, secure intake forms, transparent pricing displays where they're required. We're not solicitors — for advertising restrictions, registration, or telehealth specifics, we'll connect you with a healthcare solicitor during the brief. That's their lane."},
]

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
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'} — industryPage/${SLUG}`)
  console.log('='.repeat(78))
  const doc = await client.fetch('*[_type=="industryPage" && slug.current==$slug][0]{...}', {slug: SLUG})
  if (!doc) throw new Error('medicine doc not found')

  const sets: Record<string, string> = {}
  let ok = 0
  let done = 0
  let bad = 0
  for (const t of TARGETS) {
    const cur = getAtPath(doc, t.path)
    if (cur === t.to) {
      done++
      continue
    }
    if (cur !== t.expect) {
      bad++
      console.log(`\n✗ MISMATCH ${t.path}\n    expected: ${JSON.stringify(t.expect)}\n    found:    ${JSON.stringify(cur)}`)
      continue
    }
    ok++
    sets[t.path] = t.to
    console.log(`\n✓ ${t.path}\n    -  ${t.expect.length > 110 ? t.expect.slice(0, 110) + '…' : t.expect}\n    +  ${t.to.length > 110 ? t.to.slice(0, 110) + '…' : t.to}`)
  }

  if (APPLY && ok > 0) {
    await client.patch(doc._id).set(sets).commit()
    console.log(`\n  wrote ${ok} field(s).`)
  }
  console.log('\n' + '='.repeat(78))
  console.log(`Planned: ${ok} | already-done: ${done} | MISMATCH: ${bad}`)
  if (bad > 0) console.log('⚠ Fix mismatches before applying.')
  if (!APPLY) console.log('(Re-run with -- --apply to write.)')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
