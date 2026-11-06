/**
 * EN-only blog post: "What a dental practice website must show: GDC rules +
 * a check of 17 practice sites". The SRA-article format applied to dental —
 * the interim dental play while a dental industryPage stays blocked
 * (see docs/global-seo/NEXT_ACTIONS.md item 6).
 * Rules quotes verified against live gdc-uk.org pages on 06.11.2026 by this
 * session (not only by the research subagent). Field data: dossier in
 * frontend docs/global-seo/research/. Named practices appear only as
 * positive examples; shortfalls are reported as aggregates.
 *
 * Usage: node seed-gdc-rules-dental-website.mjs [--dry-run]
 */
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const DRY = process.argv.includes("--dry-run");

function loadEnvFile(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!TOKEN && !DRY) throw new Error("SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN missing");

const client = createClient({
  projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", token: TOKEN, useCdn: false,
});

let keySeq = 0;
const key = () => `gd${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;

function p(text, style = "normal") {
  const children = []; const markDefs = [];
  const re = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0; let m;
  while ((m = re.exec(text))) {
    if (m.index > last) children.push({ _key: key(), _type: "span", text: text.slice(last, m.index), marks: [] });
    if (m[1]) children.push({ _key: key(), _type: "span", text: m[1].slice(2, -2), marks: ["strong"] });
    else {
      const label = m[2].slice(1, m[2].indexOf("]"));
      const href = m[2].slice(m[2].indexOf("(") + 1, -1);
      const dk = key();
      markDefs.push({ _key: dk, _type: "link", href });
      children.push({ _key: key(), _type: "span", text: label, marks: [dk] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) children.push({ _key: key(), _type: "span", text: text.slice(last), marks: [] });
  return { _key: key(), _type: "block", style, markDefs, children };
}
const h2 = (t) => p(t, "h2");
const h3 = (t) => p(t, "h3");
const li = (t) => ({ ...p(t), listItem: "bullet", level: 1 });
const num = (t) => ({ ...p(t), listItem: "number", level: 1 });
const tldr = (title, items) => ({ _key: key(), _type: "tldrBox", title, items });
const table = (headers, rows) => ({
  _key: key(), _type: "blogTable", headers,
  rows: rows.map((cells) => ({ _key: key(), _type: "blogTableRow", cells })),
});
const cta = (heading, sub, label, href) => ({
  _key: key(), _type: "ctaCallout",
  heading, sub, ctaLabel: label, ctaHref: href,
  title: heading, text: sub, buttonLabel: label, buttonHref: href,
});

const AUTHOR = {
  name: "Fedir Alpatov", role: "Founder & Tech Lead",
  bio: "Founder of Code-Site.Art. I do the tech-lead work and write about real figures from 50+ projects.",
  photoUrl: "/team/fedir-avatar.jpg",
};
const NOW = "2026-11-06T18:00:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const BODY_EN = [
  tldr("GDC rules for dental websites — the short version", [
    "The GDC's advertising guidance names five things every practice website must display: practice name and address, full contact details, the GDC's details or a link, the complaints procedure with escalation contacts, and the date the website was last updated.",
    "The Standards add a price duty most practices don't realise applies online: “clear information on prices in your practice literature and on your websites” — patients “should not have to ask”.",
    "Every clinician named as providing care must appear with their qualification, its country, and their GDC number.",
    "We checked 17 real practice sites: 13 publish prices, but only 6 show a GDC number, only 6 carry a last-updated date, and 5 have no complaints link.",
    "High-street dental practices are CQC-registered but NOT rated — so there is no rating to display, and a generic CQC logo does less than a link to your own inspection report.",
  ]),
  p("Dentistry is one of the few sectors where the regulator has written down, almost as a checklist, what your website must contain — and yet most practice sites we checked miss at least one mandatory item. This article quotes the rules from the primary sources (verified against the live GDC pages on 6 November 2026), then shows how 17 real UK practice websites measure up."),
  p("One caveat before the rules: the GDC's Standards are under review — a consultation on replacing the 2013 “silver book” with a new Framework for Professionalism closed on 31 August 2026, with no transition date announced. Everything below is the guidance in force as we write; we'll re-check this page when the GDC publishes the outcome."),

  h2("What the GDC says your website must display"),
  p("From the GDC's guidance on ethical advertising (in effect since 30 September 2013), the website-specific list — “If you are responsible for a practice website, you must display”:"),
  num("The practice name and the geographic address where the dental service is provided."),
  num("Contact details of the dental service, including an email address and telephone number."),
  num("The GDC's address and contact details, or a link to the GDC website."),
  num("Details of the practice's complaints procedure — including who to contact if the patient isn't satisfied: the relevant NHS body for NHS treatment, the Dental Complaints Service for private treatment."),
  num("“The date the website was last updated.”"),
  p("Two further MUSTs sit around that list. The site has to be kept current — “so that it accurately reflects the personnel at the practice and the service offered”. And any clinician named as providing care must be shown with their professional qualification, the country it comes from, and their **GDC registration number**. In our field check this was the single most-missed rule: only 6 of 17 sites showed even one GDC number."),

  h2("Prices: the rule lives in the Standards, not the advertising guidance"),
  p("Standard 2.4.2 is unambiguous: “You must give clear information on prices in your practice literature and on your websites” — and patients “should not have to ask for this information”. Its sibling 2.4.1 requires a simple price list covering the basics (a consultation, a single-surface filling, an extraction, radiographs, hygienist treatment), with “from–to” ranges allowed where costs vary. Standard 2.4.3 adds that you should tell patients whether treatment is guaranteed, under what circumstances and for how long."),
  p("The good news from the field check: this is the best-kept rule — 13 of 17 sites publish real figures, from a £39 private check-up to implants from £2,800. The practices that publish nothing are the outliers now, and they read as such."),

  h2("NHS, mixed or private — say which"),
  p("The advertising guidance requires it in terms: “You must make clear in advertisements and other practice publicity whether the practice is NHS (or equivalent health service), mixed or wholly private.” Standard 1.7.2 adds that patients must be told which treatments are available on the NHS. In our check, 9 of 17 sites state their status explicitly; the sites without any statement were, without exception, London private and cosmetic practices — precisely the ones where a patient's “will this cost me £30 or £3,000?” anxiety is highest."),
  p("The cleanest example we saw was Yorkshire Dental Suite's FAQ, which answers the question head-on: “As a private dental practice, no we do not offer NHS treatments.” One sentence, no ambiguity."),

  h2("Complaints: name the escalation routes"),
  p("The Standards require an effective written complaints procedure (5.1.1) that patients can find without asking (5.1.5), including “information on other independent organisations that patients can contact”. On a website that means naming names: the Dental Complaints Service for private care, the local NHS body (ICB) for NHS care, and the GDC as the registrant regulator. 12 of 17 sites link a complaints procedure; of the complaints pages we opened, all named the DCS — but only two named the NHS body. mydentist's customer-feedback page is a solid template: DCS, ICB and ombudsman, each with its role explained."),

  h2("Titles: “specialist”, “Dr” and post-nominals"),
  li("A dentist on a GDC specialist list may use “Specialist” or “specialist in …”. A dentist who isn't must not use titles implying it — Orthodontist, Periodontist, Endodontist — and must not say “specialising in”. The permitted alternatives: “special interest in”, “experienced in”, “practice limited to”."),
  li("Dental care professionals have no specialist lists at all — so coinages like “Smile specialist” are out, full stop."),
  li("“Dr” is allowed as a courtesy title, but you must not imply you're a medical doctor — the GDC's own suggestion is the format “Dr A. Smith, Dentist”. The ASA says the same for ads."),
  li("Memberships, fellowships and honorary degrees must not be listed in abbreviated form — spell them out."),

  h2("CQC: registered, yes — rated, no"),
  p("A persistent confusion we see in briefs: dental practices assume they must display a CQC rating like GPs and care homes do. They can't — primary dental care is excluded from CQC's ratings programme (the 2018 performance-assessment regulations exclude dental services unless run by an independent hospital or NHS trust), so the Regulation 20A duty to display a rating doesn't bite: there is no rating. What a practice website should still do is link its own CQC location report rather than pasting a generic logo — in our check only 4 of 17 did, and one site linked the CQC's guidance page about displaying ratings instead of any report, which helps nobody."),

  h2("Advertising claims: the ASA layer"),
  li("Before/after photos must be “genuine and representative”, with signed and dated proof held — and whitening images must not be digitally enhanced to exaggerate the effect."),
  li("Tooth whitening may only be advertised and performed by registered dentists (or certain registered dental professionals to a dentist's prescription) — relevant if your site promotes whitening deals."),
  li("Efficacy claims need evidence; claims about braces specifically need “robust evidence in the form of clinical trials”. “Less painful” and “faster” are claims, not copy."),
  li("The GDC adds its own: no content comparing your skills or qualifications with other named dental professionals, and treatment promoted on social or deal sites must note that suitability depends on assessment."),

  h2("How 17 real practice websites measure up (06.11.2026)"),
  p("We checked the live sites of 17 practices — national NHS-heavy groups, mixed independents from Truro to Harrogate, and London cosmetic clinics — reading the homepage plus fees, team and complaints pages where linked. “Not found” means not found on the pages we checked."),
  table(
    ["GDC/Standards item", "Found on", "Reading"],
    [
      ["Prices with real figures", "13 of 17", "The best-kept rule; the gaps were a fees page with only finance terms, and sites with no fee info at all"],
      ["Complaints procedure linked", "12 of 17", "All opened procedures named the Dental Complaints Service; only 2 named the NHS body"],
      ["Explicit NHS / mixed / private statement", "9 of 17", "All four sites with no statement were London private/cosmetic"],
      ["GDC number for at least one clinician", "6 of 17", "All listed clinicians with numbers on only 2 sites"],
      ["“Last updated” date on the site", "6 of 17", "One of the six was dated 2023 — arguably worse than none"],
      ["Link to the GDC (required if details not shown)", "4 of 17", "The least-met item on the GDC's own five-point list"],
      ["CQC location report linked", "4 of 17", "8 more mention CQC without linking their report"],
    ]
  ),
  p("The pattern that surprised us: the small independents and NHS-heavy groups are the compliant ones. mydentist lists every clinician's GDC number on its team pages and names all three complaints routes; Smile For Life in Truro shows a GDC number for everyone including reception staff; Threemilestone and Yorkshire Dental Suite both carry a current last-updated date — YDS goes further with “Updated and clinically reviewed 5 November 2026” on the page. The expensive London cosmetic sites, with the biggest design budgets in the set, were the most likely to miss the basics."),

  h2("The checklist"),
  num("Practice name and geographic address — on the site, not only in Google Maps."),
  num("Email AND phone, visible."),
  num("A link to gdc-uk.org (or the GDC's full contact details)."),
  num("Complaints procedure naming the Dental Complaints Service (private), your ICB or health board (NHS), and the GDC."),
  num("A real “last updated” date — and a process that actually updates it."),
  num("Every named clinician: qualification, country, GDC number."),
  num("Prices on the website: the basic items, “from–to” where they vary, plus your guarantee terms."),
  num("One sentence stating NHS, mixed or wholly private."),
  num("Specialist wording checked against the GDC lists; “Dr” formatted as the GDC suggests; no abbreviated post-nominals."),
  num("Your CQC location report linked; no rating claimed (there isn't one for dental)."),
  num("Before/after photos genuine, consented, held on file with dates — and never retouched whiter."),
  p("For the business side of the same build — what a compliant clinic site costs and how fast patients leave slow ones — see [our clinic website cost breakdown](/en/blog/clinic-website-cost-uk-2026) and [the 15 clinic website mistakes](/en/blog/15-clinic-website-mistakes) piece; how we build for healthcare is on [the medical website page](/en/sites-for/medicine)."),

  cta(
    "Building or rebuilding a dental practice website?",
    "We build healthcare websites with the GDC items in the structure from day one — team pages with registration numbers, fee pages, complaints routes, a dated-update process. From €4,500, in 14–21 working days.",
    "See the healthcare package",
    "/en/sites-for/medicine"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "What must a UK dental practice website display by law?",
    a: "Under the GDC's advertising guidance a practice website must display the practice name and geographic address, contact details including email and phone, the GDC's details or a link to it, the complaints procedure with escalation contacts (Dental Complaints Service for private care, the NHS body for NHS care), and the date the website was last updated. Clinicians named on the site must appear with their qualification, its country and their GDC registration number.",
  },
  {
    q: "Do dentists have to publish prices on their website?",
    a: "Yes. GDC Standard 2.4.2 requires “clear information on prices in your practice literature and on your websites”, and patients should not have to ask. A simple list covering a consultation, a filling, an extraction, radiographs and hygienist treatment is expected, with from–to ranges where costs vary. In our November 2026 check, 13 of 17 practice sites complied.",
  },
  {
    q: "Does a dental practice have to show a CQC rating on its website?",
    a: "No — because there isn't one. Primary dental care is excluded from CQC's ratings programme, so the Regulation 20A duty to display ratings doesn't apply to high-street practices. Good practice is to link your own CQC location report instead of showing a generic logo; only 4 of the 17 sites we checked did.",
  },
  {
    q: "Can a dentist use the title 'specialist' or 'Dr' on their website?",
    a: "“Specialist” only if the dentist is on a GDC specialist list — otherwise titles like Orthodontist are out, and so is “specialising in” (the permitted forms are “special interest in”, “experienced in”, “practice limited to”). “Dr” is allowed as a courtesy title provided the site doesn't imply a medical doctor — the GDC suggests the format “Dr A. Smith, Dentist”.",
  },
  {
    q: "How was the 17-practice check done?",
    a: "On 6 November 2026 we read the live homepage plus fees, team and complaints pages (where linked) of 17 UK practices — national groups, mixed independents and London cosmetic clinics — and recorded which GDC items we could find. “Not found” means not found on the pages checked; the rule quotes were verified against the live GDC pages the same day.",
  },
];

const DOC = {
  _id: "glseo2026-gdc-rules-dental-website",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 11,
  slugs: { en: { _type: "slug", current: "gdc-rules-dental-practice-website" } },
  title: en("What a Dental Practice Website Must Show: GDC Rules, Quoted — and a Check of 17 Practice Sites"),
  metaTitle: en("GDC Rules for Dental Websites: Checklist + 17-Site Check (2026)"),
  metaDescription: en("The GDC's website requirements quoted rule by rule — mandatory contact details, complaints routes, GDC numbers, prices, the last-updated date — and how 17 real UK practice sites measure up (November 2026)."),
  eyebrow: en("Research · 11 min read"),
  lede: en("The GDC has effectively written a checklist for dental practice websites — five mandatory items plus price, title and claims rules. We quote them from the primary sources and check 17 real UK practice sites against them."),
  category: { _type: "reference", _ref: "46501974-af48-4456-9e60-02157b4aa031" },
  author: AUTHOR,
  tags: ["medicine", "dental", "compliance", "UK", "research"],
  relatedPostSlugs: ["vymohy-do-saitu-kliniky", "skilky-koshtuye-sait-dlia-kliniky-2026"],
  body: { en: BODY_EN },
  faq: FAQ.map((f) => ({
    _key: key(), _type: "faqItem",
    question: en(f.q), answer: enText(f.a),
  })),
};

async function run() {
  if (DRY) {
    const out = join(HERE, "out");
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, `${DOC._id}.json`), JSON.stringify(DOC, null, 2));
    console.log(`dry-run: wrote out/${DOC._id}.json (${BODY_EN.length} blocks)`);
    return;
  }
  const res = await client.createOrReplace(DOC);
  console.log(`created/replaced ${res._id} (${BODY_EN.length} blocks)`);
}
run().catch((e) => { console.error(e); process.exit(1); });
