/**
 * Intl SEO (UK) CMS pass, 2026-09-27 — tasks T-C2, T-C3, T-C10, T-C11 of
 * code-site.art-audit/intl-seo-2026-09/SEO-PLAN-INTL-2026-Q4.md (frontend repo).
 *
 * Only `.en` values change; uk and ru stay as they are. Decision D3: every
 * claim a UK reader can't check against a document or a live client site is
 * removed from /en — «4.9/5 client rating», an unattributed «×3.2», «top-3 for
 * criminal defence solicitor London» on a Kyiv case, SystmOne / EMIS / NHS DSP
 * Toolkit, «solicitor-reviewed», tiers that no longer exist (Industry Pro /
 * Pro Plus), «audit of 47 clinics» meta rows. Cost rows stop mixing £ and €.
 * The legal page gets the UK specifics a solicitor looks for (SRA
 * Transparency Rules, Legal Ombudsman, SRA badge) as an EN-only text block.
 *
 * Phase 1 is safe on the frontend that is live now.
 * Phase 2 needs frontend PR #59 deployed first:
 *   - a reason stat without a label for the locale is hidden (before #59 the
 *     label falls back to Ukrainian);
 *   - FAQ JSON-LD skips questions a locale doesn't have (before #59 an
 *     EN-only question becomes an empty Question on the UA page).
 *
 *   node scripts/intl-uk-2026-09/apply.mjs                    # phase 1, dry run
 *   node scripts/intl-uk-2026-09/apply.mjs --write            # phase 1
 *   node scripts/intl-uk-2026-09/apply.mjs --phase=2 [--write]
 *
 * Full documents are saved to scripts/simplify-2026-09-16/backup/ before a write.
 */
import { randomBytes } from "node:crypto";
import { client, backup } from "../simplify-2026-09-16/lib.mjs";

const WRITE = process.argv.includes("--write");
const PHASE = Number((process.argv.find((a) => a.startsWith("--phase=")) ?? "--phase=1").slice(8));

const ID = {
  legal: "DHIwRDN3sEoI638qoYRwQ9",
  medicine: "6tWqPRZWZzG4Lv3HK7JkzS",
  finance: "lOTgaDd8FU4wgJ8F4KCGuB",
  "real-estate": "lOTgaDd8FU4wgJ8F4KCHLf",
  renovation: "lOTgaDd8FU4wgJ8F4KCHn9",
  auto: "6tWqPRZWZzG4Lv3HK7Jkoz",
};

/* ── Portable text helpers ─────────────────────────────────────────── */
const key = () => randomBytes(6).toString("hex");
/** `*text*` becomes an em span, as in the rest of the CMS copy. */
function spans(text) {
  return text
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("*") && part.endsWith("*")
        ? { _type: "span", _key: key(), text: part.slice(1, -1), marks: ["em"] }
        : { _type: "span", _key: key(), text: part, marks: [] },
    );
}
const block = (style, text) => ({ _type: "block", _key: key(), style, markDefs: [], children: spans(text) });
const h2 = (t) => block("h2", t);
const h3 = (t) => block("h3", t);
const p = (t) => block("normal", t);

/* ── Path resolver: sections[_key=="x"].items[_key=="y"].en ─────────── */
function resolve(doc, path) {
  let node = doc;
  for (const m of path.matchAll(/([A-Za-z0-9_]+)|\[_key=="([^"]+)"\]/g)) {
    if (node == null) return undefined;
    node = m[1] !== undefined ? node[m[1]] : Array.isArray(node) ? node.find((x) => x?._key === m[2]) : undefined;
  }
  return node;
}

const S = (k) => `sections[_key=="${k}"]`;

/* ═════════════════════════ PHASE 1 ═════════════════════════════════ */

const LEGAL_SET = {
  // Hero stats: service facts instead of a rating and a multiplier nobody can check.
  'hero.stats[_key=="leg-st-1"].value.en': "3 ways in",
  'hero.stats[_key=="leg-st-1"].label.en': "enquiry form, consultation booking, call-back",
  'hero.stats[_key=="leg-st-2"].value.en': "1 page",
  'hero.stats[_key=="leg-st-2"].label.en': "per practice\narea",
  'hero.stats[_key=="leg-st-3"].value.en': "SRA-ready",
  'hero.stats[_key=="leg-st-3"].label.en': "fees, complaints,\ndigital badge",
  // Ticker: UK practice names.
  'hero.tickerItems[_key=="z4CtSEe3d2bzDASWmszwki"].en': "Corporate & commercial",
  'hero.tickerItems[_key=="z4CtSEe3d2bzDASWmszwuQ"].en': "Criminal defence",
  'hero.tickerItems[_key=="z4CtSEe3d2bzDASWmszx48"].en': "Conveyancing",
  'hero.tickerItems[_key=="z4CtSEe3d2bzDASWmszxIh"].en': "Employment law",
  'hero.tickerItems[_key=="z4CtSEe3d2bzDASWmszxNY"].en': "Wills & probate",
  'hero.tickerItems[_key=="z4CtSEe3d2bzDASWmszxSP"].en': "High-street firms",

  // Case: a Kyiv client, labelled as one; no London ranking.
  [`${S("leg-sec-35")}.lede.en`]:
    "Oleksandr Sytnykov, a retired justice of the Supreme Court of Ukraine based in Kyiv, came to us with a complex task: structure multi-layered content — his judicial practice, academic publications, and signature courses on criminal procedure — and rank for specific queries on Google.",
  [`${S("leg-sec-35")}.after.items[_key=="z4CtSEe3d2bzDASWmszyTW"].en`]:
    "A separate page for each practice area, each written for its own search query",
  [`${S("leg-sec-35")}.meta[_key=="leg-cm-38"].strong.en`]: "2 languages",
  [`${S("leg-sec-35")}.meta[_key=="leg-cm-38"].text.en`]: "separate URLs per language",
  [`${S("leg-sec-35")}.results[_key=="leg-rs-42"].value.en`]: "2 languages",
  [`${S("leg-sec-35")}.results[_key=="leg-rs-42"].label.en`]: "each with its own URLs",

  // Outcome: firm formats and today's packages instead of retired tiers.
  [`${S("leg-sec-43")}.directions.lede.en`]:
    "A sole practitioner and a multi-partner firm need different sites. The packages below cover both.",
  [`${S("leg-sec-43")}.directions.replaceLabel.en`]: "Sole practitioner",
  [`${S("leg-sec-43")}.directions.replaceItems[_key=="z4CtSEe3d2bzDASWmszzZU"].en`]:
    "The Industry solution package fits",
  [`${S("leg-sec-43")}.directions.allowedLabel.en`]: "Multi-partner law firm",
  [`${S("leg-sec-43")}.directions.allowedItems[_key=="z4CtSEe3d2bzDASWmszzG4"].en`]:
    "A custom platform fits",
  [`${S("leg-sec-43")}.benefitRows[_key=="leg-br-44"].items[_key=="z4CtSEe3d2bzDASWmszzeL"].en`]:
    '"Contesting a will" — its own page',
  [`${S("leg-sec-43")}.benefitRows[_key=="leg-br-44"].items[_key=="z4CtSEe3d2bzDASWmszzjC"].en`]:
    '"Settlement agreements" — its own page',
  [`${S("leg-sec-43")}.benefitRows[_key=="leg-br-46"].items[_key=="z4CtSEe3d2bzDASWmt00u1"].en`]:
    "Client care letter signed via DocuSign or Adobe Sign",

  // Services: what a UK firm's pages carry; no ranking promises.
  [`${S("leg-sec-47")}.features[_key=="leg-sf-48"].items[_key=="z4CtSEe3d2bzDASWmt018a"].en`]:
    "Description, typical matters, fixed fees where you offer them",
  [`${S("leg-sec-47")}.features[_key=="leg-sf-49"].items[_key=="z4CtSEe3d2bzDASWmt01Wr"].en`]:
    "SRA number, year admitted, publications",
  [`${S("leg-sec-47")}.features[_key=="leg-sf-51"].items[_key=="z4CtSEe3d2bzDASWmt029h"].en`]:
    "Client care letter via DocuSign or Adobe Sign",
  [`${S("leg-sec-47")}.features[_key=="leg-sf-52"].items[_key=="z4CtSEe3d2bzDASWmt02T7"].en`]:
    "Guides for clients, grouped by practice area",
  [`${S("leg-sec-47")}.features[_key=="leg-sf-53"].items[_key=="z4CtSEe3d2bzDASWmt02cp"].en`]:
    'Pages built for "solicitor + practice + town" searches',
  [`${S("leg-sec-47")}.features[_key=="leg-sf-53"].items[_key=="z4CtSEe3d2bzDASWmt02hg"].en`]:
    "Schema.org LegalService markup",
  [`${S("leg-sec-47")}.features[_key=="leg-sf-53"].items[_key=="z4CtSEe3d2bzDASWmt02rO"].en`]:
    "Pages for the towns you actually serve",
  [`${S("leg-sec-47")}.integrationsHeading.en`]: "The tools UK law firms already use",
  [`${S("leg-sec-47")}.integrationsSub.en`]:
    "Enquiries land in your CRM. Client care letters go out through DocuSign or Adobe Sign. Calendar invites and video links are sent automatically, so no enquiry sits unread in an inbox.",

  // Comparison: one currency per row.
  [`${S("leg-sec-54")}.rows[_key=="7f32777199aa"].wp.en`]: "€7,000–11,500",
  [`${S("leg-sec-54")}.rows[_key=="7f32777199aa"].wix.en`]: "€5,800–8,000",

  // Audit block.
  [`${S("leg-sec-97")}.sub.en`]: "Drop a link to your current site. Detailed PDF report within 3 working days.",
  [`${S("leg-sec-97")}.list[_key=="z4CtSEe3d2bzDASWmt053K"].en`]:
    "SRA transparency and UK GDPR check: fees pages, complaints, badge, privacy notice",
};

const LEGAL_FAQ_SET = {
  "leg-fq-72": [
    "Yes. You invoice for the consultation or the work, and the client pays by card (Stripe or GoCardless) or bank transfer. The paperwork stays as usual: a client care letter and terms of engagement. A payment on account for work not yet billed is client money under the SRA Accounts Rules, so we set the payouts up to reach the right account.",
  ],
  "leg-fq-82": [
    "Clio, Actionstep, HubSpot and Pipedrive all have an open API, so the enquiry form writes straight into them. For LEAP we confirm API access during the brief. A CRM integration is a fixed +€600 add-on; if you run your own system with an API, we price it in the quote and fix it in the contract.",
  ],
  "leg-fq-87": [
    "The site is built to UK GDPR: forms over HTTPS, two-factor sign-in to the admin, enquiries sent to you rather than kept on the website, and a privacy notice and cookie banner that match what the site actually does. You sign a data processing agreement with us. Your firm's ICO registration and data protection policies stay with you.",
  ],
};

const LEGAL_TEXT_REPLACE = [
  {
    path: `${S("leg-sec-7")}.reasons[_key=="leg-r-8"].text.en`,
    from: "Closes the site in 8 seconds",
    to: "Closes the tab and calls the next firm",
  },
];

// UK specifics as an EN-only block after the diagnosis. pickLocalized() is
// strict, so the UA and RU pages render nothing for it.
const LEGAL_UK_BLOCK = {
  _type: "richTextBlock",
  _key: "leg-uk-sra",
  content: {
    en: [
      h2("Law firm website design for UK solicitors"),
      p("A law firm website has two readers. The client arrives with a problem — a dismissal, a house purchase, a will being contested — and wants to know within seconds whether you handle it, what it costs and how to reach you. The regulator expects certain information to be there as well. We design law firm websites around both: one page per practice area, fees where the SRA requires them, and an enquiry form that reaches the right person."),
      h3("What the SRA Transparency Rules put on your website"),
      p("If you offer a service the SRA Transparency Rules list, your website has to publish price and service information for it. For individuals: residential conveyancing, uncontested probate, immigration applications and First-tier Tribunal appeals (excluding asylum), summary road traffic offences, and employment tribunal claims for unfair or wrongful dismissal. For businesses: defending those employment claims, debt recovery up to £100,000, and licensing applications for business premises."),
      p("We build these as pages your team keeps current in the CMS: the total cost or how the fee is worked out, disbursements and VAT, what is and isn't included, the key stages and typical timescales, and the experience of the people doing the work. When a fee changes, you edit one field; nobody opens the code."),
      h3("Complaints, your SRA number and the digital badge"),
      p("Every firm's website also carries its complaints procedure, including how and when a client can complain to the Legal Ombudsman and to the SRA, plus the SRA number and the SRA digital badge. The badge goes in the footer of every page using the SRA's own embed code, so it keeps itself up to date. The complaints procedure gets its own page, linked from the footer and from each fees page."),
      h3("Pages that match what clients search for"),
      p('Clients don\'t search for "full-service law firm". They search for "settlement agreement solicitor", "conveyancing solicitor Leeds", "contesting a will". Each practice area gets its own page, written the way clients describe the problem, with the matters you handle, how you charge and a consultation form for that practice. Town pages go live only for places you actually serve.'),
      h3("What stays with you"),
      p("We don't write legal advice and we don't sign off your compliance. We draft the practice content and you review it, usually in about an hour for the whole site. Anonymised cases carry only what the client has agreed to in writing. You get a fixed price in the contract, a weekly progress report with screenshots, and the code, the CMS and the domain in your name at handover."),
    ],
  },
};

const MEDICINE_SET = {
  "hero.lede.en":
    "For UK private clinics, dental practices and diagnostic centres: online booking, practitioner profiles, your CQC rating in view. Live in *14–21 working days*.",
  'hero.stats[_key=="st28"].value.en': "3 steps",
  'hero.stats[_key=="st28"].label.en': "from service to a booked slot",
  'hero.stats[_key=="st29"].value.en': "GMC · GDC",
  'hero.stats[_key=="st29"].label.en': "number on every practitioner profile",
  'hero.stats[_key=="st2a"].label.en': "enquiries for Efedra Clinic\nafter relaunch",
  'hero.features[_key=="HJmXNYczL6aRqGsM8H4N4t"].en': "Compliant | UK GDPR · CQC rating widget",

  [`${S("sec2m")}.features[_key=="f2n"].items[_key=="HJmXNYczL6aRqGsM8H4JyD"].en`]:
    "Connects to booking systems with an open API — *Cliniko*, Semble, Dentally — or to your own calendar",
  [`${S("sec2m")}.features[_key=="f2o"].items[_key=="HJmXNYczL6aRqGsM8H4K43"].en`]:
    "Photo, qualifications, *GMC or GDC number*, speciality, patient reviews",
  [`${S("sec2m")}.features[_key=="f2p"].items[_key=="HJmXNYczL6aRqGsM8H4KFj"].en`]:
    'Each price shows what it includes, so "from" prices don\'t mislead',
  [`${S("sec2m")}.features[_key=="f2r"].title.en`]: "Insured patients",
  [`${S("sec2m")}.features[_key=="f2r"].items[_key=="HJmXNYczL6aRqGsM8H4KUK"].en`]:
    "Which *private insurers* recognise you, treatment by treatment",
  [`${S("sec2m")}.features[_key=="f2r"].items[_key=="HJmXNYczL6aRqGsM8H4KXF"].en`]:
    "Pages for *Bupa*, *AXA Health* and other insurers' patients: what's covered, how to book",
  [`${S("sec2m")}.features[_key=="f2s"].items[_key=="HJmXNYczL6aRqGsM8H4Kg0"].en`]:
    "Your *CQC rating widget* in the footer, Google Business Profile, a map with parking",
  [`${S("sec2m")}.integrations[_key=="HJmXNYczL6aRqGsM8H4Kub"].en`]: "Google Calendar",
  [`${S("sec2m")}.integrations[_key=="HJmXNYczL6aRqGsM8H4KxW"].en`]: "Microsoft 365",
  [`${S("sec2m")}.integrationsHeading.en`]: "The systems\n*clinics already use*",

  [`${S("sect")}.rows[_key=="rowy"].custom.en`]: "high (UK GDPR)",
  [`${S("sect")}.rows[_key=="rowz"].custom.en`]: "privacy notice, consent records, DPA",
  [`${S("sect")}.rows[_key=="row10"].wp.en`]: "€7,000–11,500",
  [`${S("sect")}.rows[_key=="row10"].wix.en`]: "€5,800–8,000",
};

const MEDICINE_FAQ_SET = {
  faq1f: [
    "We write the copy ourselves, or you supply it and we lay it out, or a mix: you give us service descriptions and we rewrite them for search and for the rules medical content has to follow (UK GDPR, the CQC's standards for registered providers, and ASA/MHRA rules on health advertising). Photography is arranged separately.",
  ],
  faq1k: [
    "Bookings go to practice systems with an open API — Cliniko, Semble, Dentally — and enquiries to HubSpot or Pipedrive; if your system has an API, we wire it up. NHS clinical systems such as SystmOne and EMIS only connect through NHS England's IM1 pairing process, so for NHS services the booking goes to your front desk instead. The practitioner gets a WhatsApp notification either way.",
  ],
  faq1p: [
    "The site is built to UK GDPR: encryption in transit and at rest, two-factor sign-in to the admin, a full edit history, regular backups. Before launch we tell you where each piece of patient data is stored, and you sign a data processing agreement with us. If you complete the NHS Data Security and Protection Toolkit, we give you the answers it asks of your website supplier.",
  ],
  faq1u: [
    "Yes, but only with the patient's written consent and without disclosing diagnoses. We give you a consent template to run past your own adviser. Alternative — integrate Google Reviews or Doctify, where the platform moderates.",
  ],
  faq24: [
    'Yes, with caveats. You can\'t promise "guaranteed cures", use before/after photos in ad creative, or advertise prescription-only medicines. We build landing pages to Google\'s healthcare and medicines policy, so they don\'t get held in review for avoidable reasons. Ad setup itself is a separate scope, but we can refer vetted partners.',
  ],
};

// Each `from` sits inside one span (the figures are em spans of their own).
const MEDICINE_TEXT_REPLACE = [
  { path: `${S("sec1")}.reasons[_key=="r2"].text.en`, from: "60% of bookings", to: "Evening and weekend bookings" },
  {
    path: `${S("sec1")}.reasons[_key=="r2"].text.en`,
    from: " get lost evenings and weekends.",
    to: " go to whoever answers.",
  },
  { path: `${S("sec1")}.reasons[_key=="rg"].text.en`, from: "80% of patients", to: "Few patients" },
  {
    path: `${S("sec1")}.reasons[_key=="rg"].text.en`,
    from: " never click past the first page of results.",
    to: " look past the first page of results.",
  },
];

// The page's SEO block leads with the query it should rank for and loses
// SystmOne / EMIS; a section on what UK regulators expect is added.
const MEDICINE_SCOPE_EN = [
  h2("Healthcare website design for UK clinics and dental practices"),
  p("We design and build websites for private clinics, dental practices, physiotherapy and aesthetic clinics, and diagnostic centres in the UK. Patients arrive anxious and usually on a phone, so the site has three jobs: show who they will see, what it costs, and let them book without calling. Every item below sits inside the fixed price; none of it arrives as a separate invoice."),
  h3("Medical website design"),
  p("Web design for medical websites follows different rules than retail. Patients arrive anxious, so the design has one job: to reassure. A calm palette, large readable type, photographs of your actual clinicians instead of stock, prices without asterisks. Every screen is drawn from scratch for your clinic rather than adapted from a template."),
  h3("What UK regulators expect to see on the site"),
  p("A CQC-rated provider has to show its latest rating on its website within 21 days of publication; we add the CQC's own ratings widget, which updates itself. Dental practices need each dentist's qualifications and GDC number, the complaints procedure and a link to the GDC. Treatment pages follow the CAP Code: no promised results, and no promotion of prescription-only medicines such as Botox. We handle how the site shows all this; the regulatory decisions stay with your registered manager."),
  h3("Build and programming"),
  p("Our medical website builds are responsive by default: most patients look for a clinic on a phone, often on the move and on a poor connection. Programming a medical website is mostly integration work — online booking, syncing with practitioner calendars, practice systems with an open API such as Cliniko, Semble or Dentally, and SMS or WhatsApp reminders to the patient."),
  h3("How to order a medical website"),
  p("To order a medical website from us you need to prepare nothing — no brief, no copy, no photography. One conversation is enough: we ask about your specialities, how many clinicians you have and how bookings run today. Then you get a fixed price and a timeline. You can order a new site at any stage, including when a site already exists and needs migrating without losing rankings."),
];

// «audit of 47 clinics · 2024–25» meta rows → no invented sample size.
const META_NEUTRAL = {
  legal: "where law firm sites lose clients",
  medicine: "where clinic sites lose patients",
  finance: "where finance sites lose clients",
  "real-estate": "where property sites lose buyers",
  renovation: "where construction sites lose leads",
  auto: "where dealer sites lose buyers",
};

const OTHER_TEXT_REPLACE = {
  auto: [{ reason: "aut-r-8", from: "80% of clients don’t call", to: "most clients don’t call" }],
  renovation: [{ reason: "r8", from: "70% of leads drop off", to: "Many leads drop off" }],
};

/* ═════════════════════════ PHASE 2 ═════════════════════════════════ */

// EN-only FAQ items for UK firms (see header: needs #59 for JSON-LD).
const faqItem = (k, question, answer) => ({
  _type: "faqItem",
  _key: k,
  question: { en: question },
  answer: { en: [p(answer)] },
});
const LEGAL_FAQ_NEW_FIRST = [
  faqItem(
    "leg-fq-uk-sra",
    "Do you work with SRA-regulated firms?",
    "Yes. We're a web studio, not regulated by the SRA ourselves, but we build the site so it carries what the SRA Transparency Rules ask for: price and service pages for the services they list, the complaints procedure with Legal Ombudsman details, your SRA number and the digital badge. Compliance itself stays with your COLP; the site makes it easy to keep in line.",
  ),
  faqItem(
    "leg-fq-uk-fees",
    "Can the site publish our fees for conveyancing, probate or employment claims?",
    "Yes. Each of those services gets a fees page your team edits in the CMS: the total cost or how the fee is worked out, disbursements and VAT, what's included and what isn't, the key stages and typical timescales, and who does the work. When a fee changes, you update one field.",
  ),
];
const LEGAL_FAQ_NEW_LAST = [
  faqItem(
    "leg-fq-uk-owner",
    "Who owns the website?",
    "You do. The code, the CMS project and the domain are in your name at handover, and there is no licence fee. Hosting and SSL are included for the first year; after that you can keep hosting with us or move the site anywhere.",
  ),
];

/* ═════════════════════════ Runner ══════════════════════════════════ */

function planFor(slug, doc) {
  const set = {};
  const unset = [];
  const inserts = [];
  const missing = [];
  const need = (path) => {
    if (resolve(doc, path) === undefined) missing.push(path);
  };

  const rb = doc.sections?.find((s) => s._type === "reasonsBlock");

  if (PHASE === 1) {
    const add = (path, value) => {
      // The parent object must exist; the `.en` leaf may be new.
      need(path.replace(/\.en$/, ""));
      set[path] = value;
    };
    const faq = (k, paras) => {
      const sec = doc.sections.find((s) => s._type === "faqBlock");
      const path = `${S(sec._key)}.items[_key=="${k}"].answer.en`;
      need(path.replace(/\.en$/, ""));
      set[path] = paras.map(p);
    };
    const text = (path, from, to) => {
      const arr = resolve(doc, path);
      const hits = [];
      for (const b of arr ?? []) for (const c of b.children ?? []) if (c.text?.includes(from)) hits.push([b._key, c]);
      if (hits.length !== 1) return missing.push(`${path} ~ "${from}" (${hits.length} matches)`);
      const [bk, c] = hits[0];
      set[`${path}[_key=="${bk}"].children[_key=="${c._key}"].text`] = c.text.replace(from, to);
    };

    if (rb?.metaRows?.[0]?.en?.startsWith("audit of")) add(`${S(rb._key)}.metaRows[_key=="${rb.metaRows[0]._key}"].en`, META_NEUTRAL[slug]);

    if (slug === "legal") {
      for (const [k, v] of Object.entries(LEGAL_SET)) add(k, v);
      for (const [k, v] of Object.entries(LEGAL_FAQ_SET)) faq(k, v);
      for (const t of LEGAL_TEXT_REPLACE) text(t.path, t.from, t.to);
      if (!doc.sections.some((s) => s._key === LEGAL_UK_BLOCK._key))
        inserts.push({ after: S("leg-sec-7"), items: [LEGAL_UK_BLOCK] });
    }
    if (slug === "medicine") {
      for (const [k, v] of Object.entries(MEDICINE_SET)) add(k, v);
      for (const [k, v] of Object.entries(MEDICINE_FAQ_SET)) faq(k, v);
      for (const t of MEDICINE_TEXT_REPLACE) text(t.path, t.from, t.to);
      need(`${S("secScope")}.content`);
      set[`${S("secScope")}.content.en`] = MEDICINE_SCOPE_EN;
    }
    for (const t of OTHER_TEXT_REPLACE[slug] ?? [])
      text(`${S(rb._key)}.reasons[_key=="${t.reason}"].text.en`, t.from, t.to);
  }

  if (PHASE === 2) {
    // Market figures without a source leave /en; the stat stays on UA/RU.
    for (const r of rb?.reasons ?? [])
      if (r.stat?.label?.en) unset.push(`${S(rb._key)}.reasons[_key=="${r._key}"].stat.label.en`);

    if (slug === "legal") {
      const faqSec = doc.sections.find((s) => s._type === "faqBlock");
      const have = new Set(faqSec.items.map((i) => i._key));
      const first = LEGAL_FAQ_NEW_FIRST.filter((i) => !have.has(i._key));
      const last = LEGAL_FAQ_NEW_LAST.filter((i) => !have.has(i._key));
      if (first.length) inserts.push({ before: `${S(faqSec._key)}.items[0]`, items: first });
      if (last.length) inserts.push({ after: `${S(faqSec._key)}.items[-1]`, items: last });
    }
  }

  return { set, unset, inserts, missing };
}

const show = (v) => (typeof v === "string" ? JSON.stringify(v) : Array.isArray(v) ? `[${v.length} blocks]` : JSON.stringify(v));

const drafts = await client.fetch('*[_id in $ids]._id', { ids: Object.values(ID).map((i) => `drafts.${i}`) });
if (drafts.length) console.warn(`⚠ open drafts (Publish in Studio would overwrite this pass): ${drafts.join(", ")}\n`);

let problems = 0;
const tx = client.transaction();
for (const [slug, id] of Object.entries(ID)) {
  const doc = await client.getDocument(id);
  if (!doc) throw new Error(`no document ${id} (${slug})`);
  const { set, unset, inserts, missing } = planFor(slug, doc);
  for (const [k, v] of Object.entries(set))
    if (JSON.stringify(resolve(doc, k)) === JSON.stringify(v)) delete set[k];
  const n = Object.keys(set).length + unset.length + inserts.length;
  console.log(`\n## ${slug} (${id}) — phase ${PHASE}: ${Object.keys(set).length} set, ${unset.length} unset, ${inserts.length} insert`);
  for (const m of missing) console.log(`  ✗ MISSING ${m}`);
  problems += missing.length;
  for (const [k, v] of Object.entries(set)) console.log(`  ${k}\n    - ${show(resolve(doc, k))}\n    + ${show(v)}`);
  for (const k of unset) console.log(`  unset ${k}  (was ${show(resolve(doc, k))})`);
  for (const ins of inserts) console.log(`  insert ${ins.after ? `after ${ins.after}` : `before ${ins.before}`}: ${ins.items.map((i) => i._key).join(", ")}`);
  if (!n) continue;
  if (WRITE) backup(`intl-uk-p${PHASE}-${slug}`, doc);
  if (Object.keys(set).length) tx.patch(id, (pt) => pt.set(set));
  if (unset.length) tx.patch(id, (pt) => pt.unset(unset));
  for (const ins of inserts)
    tx.patch(id, (pt) => (ins.after ? pt.insert("after", ins.after, ins.items) : pt.insert("before", ins.before, ins.items)));
}

if (problems) {
  console.error(`\n${problems} path(s) not found — nothing written.`);
  process.exit(1);
}
if (!WRITE) {
  console.log("\nDry run. Add --write to apply.");
  process.exit(0);
}
const res = await tx.commit({ visibility: "sync" });
console.log(`\nCommitted: ${res.transactionId}`);
