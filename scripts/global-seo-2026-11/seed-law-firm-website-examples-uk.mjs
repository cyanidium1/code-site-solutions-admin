/**
 * EN-only blog post: "Law firm website examples (UK): 11 real sites reviewed".
 * The linkable-asset format that ranks #2/#5 in the "law firm website design"
 * SERP (intl SEO audit §6.1). Every observation was made on the named firm's
 * live site on 06.11.2026 (research dossier: frontend docs/global-seo/research/).
 *
 * Usage: node seed-law-firm-website-examples-uk.mjs [--dry-run]
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
const key = () => `ge${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;

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
const NOW = "2026-11-06T13:00:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const BODY_EN = [
  tldr("11 UK law firm websites, reviewed — the short version", [
    "We walked through 11 live UK law firm websites on 6 November 2026 — magic circle to high street — and recorded only what the pages actually show.",
    "The strongest consumer sites (Stowe Family Law, Irwin Mitchell, Hodge Jones & Allen) share the same stack: phone number in the hero, a callback with a time slot, reviews with a score and count, and a team shown on the service page itself.",
    "The most common failure isn't design — it's pages that promise prices and don't deliver them. Four of the six fee pages we opened contained no figures at all.",
    "Nine of the eleven homepages load the SRA digital badge; none of the six pricing pages carries a last-updated date.",
    "Three firms display two different phone numbers on the same site. Details like this cost more trust than any colour scheme.",
  ]),
  p("Most “best law firm websites” round-ups are screenshots with adjectives. This one is different: we opened 11 live UK firm sites on 6 November 2026 — from Slaughter and May to a three-office East Midlands high-street practice — and recorded what the pages actually do: what the first screen says, how you contact the firm, what proof is shown, whether the fee pages contain fees, and how the SRA elements are handled."),
  p("Why these things and not visual style? Because a law firm website has one job: convince a person under stress that this firm can be trusted with their problem, and give them a frictionless next step. Style serves that or it doesn't. (The compliance side — what the SRA Transparency Rules force a firm site to publish — we covered separately in [our SRA checklist built from 28 firm sites](/en/blog/sra-transparency-rules-law-firm-website).)"),

  h2("The five worth learning from"),

  h3("Stowe Family Law — the most complete conversion stack"),
  p("The UK's largest family-law specialist leads with its niche (“Specialist family lawyers”), and everything under the hero works toward one action. The proof is specific: **Trustpilot 4.7 from 2,791 reviews**, linked, not just a logo. The phone line publishes **weekend hours** (Mon–Fri 8:30–7, Sat–Sun 9–5) — rare in this set and exactly right for a family-law audience that calls when the house is quiet. The callback form lets you pick a date and a half-hour slot, the navigation is organised by life situation (“Getting started”, “Financial matters”, “Domestic abuse”) rather than legal taxonomy, and the blog is visibly dated and active (posts from 3 November and 22 October 2026). The costs page even publishes bands: full support £2,999–£9,999, online divorce from £179 fixed."),
  p("Not perfect: we found two different phone numbers on the site, and “93% of clients recommend us” in one section against “91%” in another. When your whole pitch is precision, the details are the pitch."),

  h3("Irwin Mitchell — pricing transparency at national scale"),
  p("One pricing page covers twelve practice areas with real numbers: hourly rates by grade (immigration partner £530–£680, paralegal £315–£405), ranged estimates for typical matters, itemised disbursements, the VAT basis stated. The standout is the **conveyancing calculator that asks for no email address** — “no email, card, or commitment” is written on the page. A visitor gets a usable figure before the firm gets a lead. That's confidence, and it's the pattern we'd copy first: remove the toll gate from the quote."),

  h3("Kingsley Napley — the model conveyancing fees page"),
  p("The firm's /pricing hub itself is sparse, but its residential conveyancing section is the best single fees page in the set: scaled fees with stated minimums (purchases from £4,500, banded up to £2m), disbursements itemised line by line (Land Registry £20–£910, searches £350–£700 + VAT), the stages of a transaction listed, timescales given (purchase 6–12 weeks), and **the full team listed by grade on the same page** with a 24-hour helpline. A buyer can see who does the work, what it costs and how long it takes without leaving the URL."),

  h3("Hodge Jones & Allen — the phone-first consumer hero"),
  p("The first screen does three jobs at once: names the specialism, shows “Call us now on: 0330 822 3451”, and offers both “Request a call back” and “Make an enquiry”. Ten practice areas sit directly in the top menu. The criminal defence page carries roughly 65 team profiles, directory quotes from Chambers and Legal 500, seven FAQs and an out-of-hours police station line — a page built for the worst night of someone's life, which is precisely the audience. The lesson: when clients arrive in crisis, the phone number is the hero, not the strapline."),

  h3("Hickman & Rose — a boutique that signals life"),
  p("A criminal and business-crime litigation boutique with no form at all (phone and email only) — yet the site works because the proof is current and attributed: “Close to perfection” (Legal 500, 2026), “an absolute powerhouse” (Chambers, 2025), and news dated 5 November, 2 November, 16 October 2026. For a referral-driven boutique, demonstrating the firm is busy and ranked may matter more than a contact form. The site's cadence does that on its own."),

  h2("All 11 at a glance"),
  table(
    ["Firm", "Type", "Strongest element", "Weakest element"],
    [
      ["Stowe Family Law", "National family specialist", "Scored reviews, weekend hours, slot-booking callback", "Two phone numbers; 93% vs 91% claims"],
      ["Irwin Mitchell", "National, 21 offices", "12-area pricing page; no-email quote calculator", "PI and medical negligence have no figures"],
      ["Kingsley Napley", "London mid-size", "Conveyancing fees page with bands and disbursements", "News-led homepage gives consumers no next step"],
      ["Hodge Jones & Allen", "London consumer/claimant", "Phone-first hero; 65 profiles on one service page", "“Costs” page contains no costs"],
      ["Hickman & Rose", "Criminal/litigation boutique", "Dated, frequent news; attributed directory quotes", "No enquiry form at all"],
      ["Vardags", "HNW divorce boutique", "Eligibility gate (£1m+ assets) qualifies leads on-page", "Two WhatsApp numbers; undated press items"],
      ["Coodes", "Cornwall/Devon regional", "Six Law Society panel accreditations; active blog", "“Complete transparency” on fees, no figures anywhere"],
      ["Slee Blackwell", "Devon/Somerset regional", "ReviewSolicitors proof: 1,950+ five-star reviews", "“Award-winning” H1 names no award"],
      ["Adam Bernard", "London high-street", "Widest channel mix: 24/7 phone, chat, WhatsApp, video", "Hero copy names no service or audience"],
      ["Bird & Co", "East Midlands high-street", "Instant conveyancing quote as primary CTA; Trustpilot 4.9/1,242", "Footer copyright reads 2017; undated blog"],
      ["Slaughter and May", "Magic circle", "Current deal news (Oct 2026) as brand proof", "SRA details two clicks deep; no consumer path (by design)"],
    ]
  ),

  h2("What the strong sites share"),
  num("**Navigation by client problem, not legal taxonomy.** Stowe sorts by life situation; HJA puts ten practice areas in the top menu; Irwin Mitchell splits personal and business at the root."),
  num("**A phone number in the hero, plus a scheduled callback.** Three of the strongest sites let the visitor pick a day and time slot — turning “we'll call you” from a threat into an appointment."),
  num("**Reviews with a source, a score and a count.** “Trustpilot 4.7 from 2,791 reviews” is proof; a grey Trustpilot logo is decoration."),
  num("**Fee information with structure:** rates by grade, banded fees with minimums, itemised disbursements, stated timescales. The firms that publish real numbers make every “prices from” competitor look evasive."),
  num("**The team on the service page itself**, not on a separate About page — by grade, with the helpline next to them."),
  num("**Visibly dated content.** Four of the eleven firms had posted within the previous two weeks. A dated post from last week says “alive” better than any badge."),

  h2("What most get wrong"),
  li("**Pages that promise prices and don't deliver.** The most repeated failure in the set: a “Criminal Defence Costs” page with no costs, an “Our Fees” page listing only funding methods, a /pricing hub with no figures, two firms claiming “transparent pricing” while publishing none. If the page is called costs, put costs on it — or don't link it from the header."),
  li("**No last-updated date on any fee page.** All six pricing pages we opened were undated. For YMYL content this is a trust leak Google and clients both notice."),
  li("**Inconsistent contact data.** Three firms show two different phone numbers; one writes its own SRA number two different ways. Nobody decides against a firm because of this consciously — it just quietly lowers the “they're careful” score, which is the only score a law firm has."),
  li("**Generic hero copy.** “Shaping tomorrow for clients” could open a site for a bank, a consultancy or a gym. A first screen that doesn't name who you help and with what is a paid-for blank space."),
  li("**Buried regulatory information.** One footer's SRA badge container is empty; one firm's complaints procedure hides inside “Regulatory information”; a magic-circle firm keeps its SRA number two clicks deep. Nine of eleven homepages do load the SRA digital badge — the floor is high, which makes the gaps visible."),
  li("**Stale signals.** A footer copyright frozen in 2017 and undated blog cards tell a 2026 visitor the site is unattended — on a site whose main CTA asks them to trust the firm with a house purchase."),

  h2("The checklist, if yours is next"),
  p("Pulling the patterns into one list — this is what we'd hold any new law firm website against:"),
  num("The first screen names the specialism, shows a phone number, and offers a callback with a time slot."),
  num("Every practice area has its own page, with the relevant team and FAQs on it."),
  num("Fee pages contain fees — structured, VAT-stated, dated. If you can't publish figures, publish rates by grade and the method."),
  num("Reviews carry a platform, a score and a count; directory quotes carry the year."),
  num("One phone number everywhere. One version of every claim."),
  num("SRA number, digital badge and complaints procedure reachable from the footer."),
  num("Something on the site is dated within the last month."),
  p("The compliance half of this list is covered rule by rule in [the SRA transparency checklist](/en/blog/sra-transparency-rules-law-firm-website); what a build like this costs across the UK market is in [our law firm website cost breakdown](/en/blog/law-firm-website-cost-uk-2026)."),

  cta(
    "Building or redesigning a law firm website?",
    "We build law firm websites with the SRA elements, practice-area structure and fee pages done properly — from €4,500, delivered in 14–21 working days.",
    "See the law firm package",
    "/en/sites-for/legal"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "What makes a good law firm website?",
    a: "The strongest UK firm sites in our November 2026 review share five things: a first screen that names the specialism and a phone number, navigation by practice area or client problem, reviews with a score and count, fee pages with real structured figures, and visibly recent, dated content. Design style varies widely; those fundamentals don't.",
  },
  {
    q: "Should a law firm publish its prices?",
    a: "For residential conveyancing, probate, immigration, motoring offences, employment tribunal claims and debt recovery, the SRA Transparency Rules require published price information. Beyond the mandated areas, the firms that publish structured fees — rates by grade, bands with minimums, itemised disbursements — stand out against the majority whose “fees” pages contain no figures at all.",
  },
  {
    q: "Which trust signals actually matter on a solicitor's website?",
    a: "Specific, verifiable ones: a linked review platform with the score and count shown, directory rankings quoted with the year, Law Society accreditations and panels, the SRA digital badge, named team members on the service page, and dated recent content. Unattributed claims — “award-winning” with no award named — work against the firm.",
  },
  {
    q: "How were these examples chosen and checked?",
    a: "We reviewed 11 live UK, SRA-regulated firm websites on 6 November 2026, spanning magic circle, national, mid-size London, boutique, regional and high-street practices. Every observation in the article — prices, review counts, dates, phone numbers — was read from the named firm's live pages on that date.",
  },
];

const DOC = {
  _id: "glseo2026-law-firm-website-examples-uk",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 11,
  slugs: { en: { _type: "slug", current: "law-firm-website-examples-uk" } },
  title: en("Law Firm Website Examples: 11 Real UK Sites Reviewed (2026)"),
  metaTitle: en("Law Firm Website Examples UK: 11 Real Sites Reviewed (2026)"),
  metaDescription: en("11 live UK law firm websites reviewed in November 2026 — what Stowe, Irwin Mitchell and Kingsley Napley get right, the mistakes most firms repeat, and a checklist for your own site."),
  eyebrow: en("Research · 11 min read"),
  lede: en("We opened 11 UK law firm websites — magic circle to high street — and recorded what the pages actually do: first screens, contact paths, fee pages, proof and SRA elements. Here's what separates the strong ones."),
  category: { _type: "reference", _ref: "28b8d6fe-07b6-4ee6-8f40-87bf838df79b" },
  author: AUTHOR,
  tags: ["legal", "examples", "UK", "research"],
  relatedPostSlugs: ["sait-dlia-advokata", "vartist-rozrobky-saytu-2026"],
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
