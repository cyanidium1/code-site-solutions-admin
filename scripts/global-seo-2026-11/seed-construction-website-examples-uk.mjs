/**
 * EN-only blog post: "Construction company website examples (UK): 11 real
 * sites reviewed". Completes the construction cluster around
 * /en/sites-for/renovation and builders-website-cost-uk-2026.
 * SERP check 06.11.2026: the examples intent is served by agency listicles,
 * mostly US-centric or dated 2018 — no current UK SME-inclusive piece.
 * Every observation was made on the named company's live site on 06.11.2026
 * (research dossier: frontend docs/global-seo/research/).
 *
 * Usage: node seed-construction-website-examples-uk.mjs [--dry-run]
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
const key = () => `gx${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;

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
const NOW = "2026-11-06T15:00:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const BODY_EN = [
  tldr("11 UK construction websites, reviewed — the short version", [
    "We walked through 11 live UK construction-sector websites on 6 November 2026 — national contractors, regional firms, specialist trades, a housebuilder and small local builders.",
    "The strongest project pages read like contract records: client, value, duration, completion date, partners. Barnes Construction states £7.3m and 39 weeks; Willmott Dixon lists client, framework, value and partners on every featured scheme.",
    "The best small-builder site (Build Team, London) shows its estimate before asking for contact details — a 7-step calculator with the price range up front.",
    "The sector-wide weakness: accreditation badges that can't be checked. Across all 11 sites we found no CHAS, Constructionline, SafeContractor or ISO certificate numbers in the page text — and one builder's FMB badge linked to a PDF on its own server.",
    "Freshness slips everywhere: a 2025 footer next to November 2026 news, undated project pages, and one firm whose legacy domain now throws a certificate error.",
  ]),
  p("Search “best construction company websites UK” and you get agency listicles — many built around US contractors, and one still ranking with “the best of 2018” in the title. So we did what those lists don't: opened 11 live UK construction-sector sites on 6 November 2026, from a FTSE 250 contractor to a Bristol family builder, and recorded what the pages actually show — first screens, project proof, accreditations, reviews, contact paths and freshness."),
  p("A construction website earns its keep in one moment: when a client — a homeowner, a developer, a council procurement officer — tries to verify that you are real, competent and currently active. Everything below is judged against that moment."),

  h2("The ones worth learning from"),

  h3("Build Team (London) — the small-builder conversion benchmark"),
  p("A design-and-build extensions firm whose first screen does everything a local builder's site should: the H1 names the service and the market (“House extensions in London”), the proof line is a number (“Since 2007, 1,750+ London projects”), the hero photos are captioned with real streets and postcodes, and two CTAs split the audience — “Book free consultation” or “Instant quote” — with a clickable phone number in a sticky header."),
  p("The quote calculator is the standout: seven steps covering extension type, postcode, property age, dimensions and finishes — and **the price range appears before the form asks who you are**. Inclusions and exclusions are spelled out (VAT in, design fees and party wall costs out), with a stated accuracy claim. Compare that with the sector norm — “fill in the form and we'll be in touch” — and it's obvious which site a homeowner trusts with a six-figure project. The footer closes the loop with full legal identity: trading name, company number, registered address."),
  p("Not perfect: the homepage says “Google Reviews: 4.4 stars” with no review count, and the badges from a well-known home-design platform aren't linked to the profile behind them."),

  h3("Willmott Dixon — project proof with structure"),
  p("The national contractor's projects section is a model for anyone whose work is the product. The index filters by sector, region, expertise and live/completed status, with a map view. Each project page carries a structured facts box — client, procurement framework, completion date, value, named architect and engineer — plus quotes from named people on the client side and a named contact with a face. One caution from the same page: the facts box says £18m where the body text says £17.9m. Structured data has to be maintained like code — one source of truth."),

  h3("Barnes Construction (Ipswich) — the regional contractor template"),
  p("Nine testimonials on the homepage, every one with a name and an organisation — NHS trusts, Cambridge colleges, a London borough. Project pages read like contract records: client, **£7.3m value, 39-week duration, December 2025 completion**, sector, and a client quote on the page. News is dated and recent. If you're a regional main contractor wondering what “trust signals” means in practice, this is it."),

  h3("Kier — outcomes, not adjectives"),
  p("A hospital facilities page quantifies the relationship instead of describing it: 11,494 help-desk calls handled, 2,086 repairs completed, 1,571 planned maintenance tasks. Numbers like these are the B2B equivalent of reviews — they can't be written by a copywriter who wasn't there. The weak spot: a footer full of award logos with empty alt text, none of them linked to anything."),

  h3("Two case studies hiding in weaker sites"),
  p("Buxton Building Contractors buries a genuinely strong project page — a Bloomsbury conservation-area refurbishment naming the client, architect and QS, with a **45/45 Considerate Constructors Scheme score**, the only verifiable CCS evidence we found in the whole set — under a homepage with no headline and the phone only in the footer. BriggsAmasco's Battersea Power Station case study quantifies the work in square metres, on a site whose footer still reads “© 2025” next to news from October 2026. The lesson cuts both ways: one excellent case study doesn't rescue a weak site, and a decent site shouldn't bury its best evidence."),

  h2("All 11 at a glance"),
  table(
    ["Company", "Type", "Strongest element", "Weakest element"],
    [
      ["Build Team", "London extensions SME", "Estimate shown before contact details; postcoded hero projects", "“4.4 stars” with no review count"],
      ["Willmott Dixon", "National contractor", "Filterable projects + structured facts boxes", "£18m vs £17.9m on one page; hero CTA is recruitment"],
      ["Barnes Construction", "Regional (East)", "9 named client testimonials; £7.3m/39-week project records", "No accreditation evidence in page text"],
      ["Kier", "National (FTSE 250)", "Quantified FM outcomes on project pages", "Unlinked award logos, empty alt text"],
      ["Beard Construction", "Regional (South West)", "5 offices each with address and phone", "No contact form; undated news; portfolio invisible without JavaScript"],
      ["Buxton Building", "Surrey main contractor", "CCS 45/45 stated on a detailed case study", "No hero message; phone in footer only"],
      ["BriggsAmasco", "National roofing specialist", "Battersea case study with m² quantities", "“© 2025” footer; accreditations page names no standard"],
      ["Toureen Group", "Groundworks/civils", "Clear service structure; phone in header", "Legacy domain throws a TLS error; “award-winning” names no award"],
      ["Set Square Group", "Bristol family builder", "27 named towns served; badges link to live FMB/Checkatrade profiles", "“Zero bad reviews” with no data; uncaptioned project photos"],
      ["Build My Space", "Small London builder", "Gallery named by job type + postcode", "FMB badge links to a PDF on its own server, not the register"],
      ["Pentland Homes", "Kent housebuilder", "Per-development prices, status and sales phone numbers", "No warranty provider named; no phone on the homepage"],
    ]
  ),

  h2("What the strong ones share"),
  num("**Project pages with facts, not just photos.** Client, value, duration, completion, partners. A photo grid says “we exist”; a facts box says “we deliver on contract”."),
  num("**Named testimonials tied to organisations.** “Claire Howe, Cambridge University Hospitals NHS Foundation Trust” outweighs five anonymous five-star quotes."),
  num("**A proof line in numbers on the first screen** — “1,750+ projects since 2007”, “since 1892”, “£30m schemes” — something a template can't fake."),
  num("**Filterable portfolios** by sector, region and status once you're past ~20 projects."),
  num("**Area clarity for local firms.** The Bristol builder lists 27 towns and a 15-mile radius; the housebuilder gives each development its own sales phone number."),
  num("**Dated, recent news.** Four of the eleven had posted within the previous three weeks. In a sector where companies fail mid-project, “alive and busy” is a ranking factor with clients, whatever Google thinks of it."),

  h2("What most get wrong"),
  li("**Unverifiable accreditations — the sector's signature failure.** Construction lives on CHAS, Constructionline, SafeContractor, ISO, FMB, TrustMark. Yet across 11 sites we found not one certificate number in the page text, a dedicated accreditations page that names no standard, and an FMB badge linking to a PDF hosted on the builder's own site instead of the FMB register. The honourable exception: the Bristol builder whose FMB, Checkatrade and MyBuilder badges click through to the live profiles. If a badge can't be checked, assume clients won't believe it."),
  li("**Review claims without evidence.** A star rating with no count, “zero bad reviews” with no platform, an empty reviews page, video stories with no dates. Nobody in the set embeds a live review widget with dates visible."),
  li("**The phone number plays hide and seek.** On several sites — including firms whose clients include homeowners — we couldn't find a phone number anywhere on the homepage; on others it sits only in the footer. For trades and builders the phone is the conversion event; it belongs in the header as a clickable link."),
  li("**First screens that don't sell.** One contractor's hero CTA recruits graduates; one builder's only homepage links are “Read More”; one has no headline at all. The first screen is for the client with a project, full stop."),
  li("**Freshness slips that undermine everything else:** a “© 2025” footer beside November 2026 news, undated project pages, a “Business Plan 2023–2026” expiring in the footer, and a legacy domain left to die with a certificate error. These cost nothing to fix and are exactly what a procurement officer notices."),
  li("**Portfolios locked inside JavaScript.** Two sites render their project grids entirely client-side — crawlers, preview tools and some assistive tech see an empty page where the proof should be. If the portfolio is the product, it should be in the HTML."),
  li("**Generic contact forms.** Name-email-message is the norm; only one site qualifies the lead (postcode, property type, size, start date) and states what happens next. One regional contractor has no form at all."),

  h2("The checklist, if yours is next"),
  num("First screen: what you build, where, a numeric proof line, a clickable phone, and a CTA for the client (not the recruiter)."),
  num("Project pages with client, value or scale, duration, completion date — and one named quote where the client allows it."),
  num("Every accreditation badge links to the live register entry. If it can't be verified, it doesn't go up."),
  num("Reviews with platform, score, count — or none at all. “No bad reviews” is not a metric."),
  num("Areas served, spelled out in town names."),
  num("Something dated within the last month, and a footer year that matches."),
  num("The portfolio renders in HTML, not only in the visitor's browser."),
  p("What a site like this costs across the UK market is in [our builders' website cost breakdown](/en/blog/builders-website-cost-uk-2026); how we build for the sector is on [the construction website page](/en/sites-for/renovation)."),

  cta(
    "Building or rebuilding a construction company website?",
    "Custom-coded construction websites with the project-proof structure done properly — from €4,500, delivered in 14–21 working days, first year of hosting and support included.",
    "See the construction package",
    "/en/sites-for/renovation"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "What makes a good construction company website?",
    a: "From our November 2026 review of 11 UK sites: a first screen that names the service, area and a numeric proof line with a clickable phone; project pages carrying client, value, duration and completion date; named testimonials tied to organisations; accreditation badges that link to live register entries; and visibly recent, dated content.",
  },
  {
    q: "What should a construction project page include?",
    a: "The strongest UK contractor sites treat a project page like a contract record: client name, value or scale, duration, completion date, partners (architect, engineer, QS), photos, and a named client quote. A facts box of this kind does more for credibility than any number of uncaptioned photos.",
  },
  {
    q: "How should a builder show accreditations like FMB, CHAS or Constructionline?",
    a: "Link every badge to the live entry on the scheme's own register so a client can verify it in one click. In our review, only one of eleven sites did this; most showed unlinked logos, and one linked its FMB badge to a PDF on its own server — which reads as a red flag rather than a credential.",
  },
  {
    q: "How were these examples chosen and checked?",
    a: "We reviewed 11 live UK construction-sector websites on 6 November 2026 — national contractors, regional main contractors, a roofing specialist, a groundworks firm, a housebuilder and small local builders. Every observation was read from the named company's live pages on that date; where a page relies on JavaScript rendering, we say so rather than guess.",
  },
];

const DOC = {
  _id: "glseo2026-construction-website-examples-uk",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 10,
  slugs: { en: { _type: "slug", current: "construction-website-examples-uk" } },
  title: en("Construction Company Website Examples: 11 Real UK Sites Reviewed (2026)"),
  metaTitle: en("Construction Website Examples UK: 11 Sites Reviewed (2026)"),
  metaDescription: en("11 live UK construction company websites reviewed in November 2026 — what Willmott Dixon, Barnes and the best small builders get right, the sector's verification problem, and a checklist."),
  eyebrow: en("Research · 10 min read"),
  lede: en("We opened 11 UK construction-sector websites — FTSE 250 contractors to family builders — and recorded what the pages actually show: project proof, accreditations, reviews and contact paths. Here's what separates the credible ones."),
  category: { _type: "reference", _ref: "def50bf2-ac5c-4432-9076-d900344ad334" },
  author: AUTHOR,
  tags: ["construction", "examples", "UK", "research"],
  relatedPostSlugs: ["sait-dlia-budivelnoi-kompanii-2026", "vartist-rozrobky-saytu-2026"],
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
