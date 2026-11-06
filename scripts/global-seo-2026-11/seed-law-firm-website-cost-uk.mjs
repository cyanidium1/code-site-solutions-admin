/**
 * EN-only blog post: "How much does a law firm website cost in the UK (2026)".
 * Q4 intl plan, days 31-60 item 1 (code-site.art-audit/intl-seo-2026-09).
 * Every price in the body was read from the named source's live page on
 * 06.11.2026 (research dossier: frontend docs/global-seo/research/).
 *
 * Usage: node seed-law-firm-website-cost-uk.mjs [--dry-run]
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
const key = () => `gc${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;

/** Paragraph; supports **bold** and [text](/href). */
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
const NOW = "2026-11-06T12:00:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const BODY_EN = [
  tldr("Law firm website cost in the UK — the short version", [
    "Published UK prices in November 2026 run from £350 for a 3-page template to £30,000+ for a bespoke multi-office build. Most quotes you'll actually receive sit between £1,500 and £8,000.",
    "Three bands: template packages £350–£1,000, fixed-price custom sites £1,400–£4,000, bespoke specialist builds from £7,500.",
    "Almost every UK price is quoted excluding VAT — add 20% unless the page says otherwise.",
    "Ongoing costs are the hidden half: £37–£79/month at the budget end, £150–£1,000/month once SEO and content are included.",
    "The biggest price drivers are a page per practice area, CRM integrations (Clio, LEAP), legal copywriting and who carries the SRA transparency work.",
  ]),
  p("Ask five UK agencies what a law firm website costs and you'll get numbers a hundredfold apart — £350 from one, £30,000 from another, both said with a straight face. Neither is lying. They're selling different products under the same name."),
  p("Instead of quoting a vague range, we collected the prices UK agencies actually publish on their own websites, checked each page on 6 November 2026, and sorted out what each number buys. Where an agency publishes no price (most premium legal specialists don't), we say so rather than guessing."),

  h2("What UK agencies publish, November 2026"),
  p("Every figure below was read from the named company's live pricing page on 6 November 2026. Positioning is theirs, not ours."),
  table(
    ["Agency", "Published price", "What it is", "VAT"],
    [
      ["Dot it Media (London, generalist)", "£349–£499 / £1,250–£1,500 / from £2,000", "1-page starter / 7–10 pages / up to 15 pages", "excl. VAT"],
      ["BrainyWebs (London, generalist)", "£350 / £997 / from £1,997", "1–3 page starter / up to 15 pages / custom with booking", "not stated"],
      ["DotGO (UK small-business)", "£499 / £699 / £999 + £37–42/mo", "packages with hosting and email in the monthly fee", "+ VAT"],
      ["Killed Pixel Studio (niche: consultant solicitors)", "from £1,449, typically £1,999", "tailored 6-page site; the higher figure adds branding", "not stated"],
      ["Solicitor Web Design UK (legal niche)", "£1,799, then optional £79/mo", "up to 10 pages, year-1 hosting and email included", "not stated"],
      ["Zunapro (platform)", "£790–£4,090 per year", "subscription tiers with SRA templates built in", "incl. VAT"],
      ["Fourseven Media (Twickenham)", "£3,990 fixed / from £8,950", "up to 20 pages with SRA pages / bespoke multi-office", "+ VAT"],
      ["MagnifyLab (St Albans, legal-heavy)", "from £7,500", "bespoke; says UK law firm sites typically run £7,500–£30,000", "not stated"],
    ]
  ),
  p("The premium end of the legal-specialist market — the agencies that build for national firms — publishes no prices at all; everything is quoted per project. Independent cost guides put that tier at £15,000–£30,000 for a specialist build and £30,000–£80,000+ for enterprise work (Whitehat SEO's 2026 guide), which matches MagnifyLab's own “up to £30,000”.",),

  h2("The three price bands, and what you actually get"),
  h3("£350–£1,000: a template with your logo on it"),
  p("At this level you're buying speed, and the published timelines say it openly: BrainyWebs promises a starter site “live within 3 working days”, Dot it Media builds a one-pager in 7 days. The product is a pre-built theme with your name, colours and three to five pages. It's a legitimate purchase for a brand-new sole practitioner who needs an address on the internet this month. What it won't do is rank for competitive searches or carry a page per practice area — and a template shared with hundreds of other sites can't say anything about your firm that it doesn't also say about them."),
  h3("£1,400–£4,000: a fixed-price custom site"),
  p("This is where most small and mid-size firms actually buy. Killed Pixel's typical project is £1,999; Solicitor Web Design UK charges £1,799 with the first year of hosting included; Fourseven's fixed package is £3,990 with a page per practice area, the SRA transparency pages and an editable CMS. The common thread: custom design on your content, separate pages for your practice areas, and a named delivery date. The differences hide in who writes the copy, who prepares the SRA costs information, and what happens after year one."),
  h3("From £7,500: bespoke specialist work"),
  p("MagnifyLab starts at £7,500 and runs to £30,000; Fourseven's bespoke tier starts at £8,950. Here the money goes into things smaller firms rarely need on day one: multi-office architecture, Clio or LEAP practice-management integrations, custom design systems, client portals, and a copywriting team that interviews fee earners. The guides agree on the ceiling: Whitehat puts enterprise legal builds at £30,000–£80,000+."),

  h2("Why two quotes for “the same site” differ threefold"),
  li("**A page per practice area.** The single biggest scope multiplier. A conveyancing-and-probate high-street firm needs 6–8 service pages; a full-service firm needs 20+. Several agencies price tiers directly by page count."),
  li("**Who writes the copy.** Legal copy needs someone who can read a retainer letter without flinching. MagnifyLab calls copywriting the most underestimated line; Killed Pixel's first question when comparing quotes is “who writes the pages?”"),
  li("**SRA transparency work.** The costs information, complaints procedure and digital badge are compliance work, not decoration. Some vendors include the pages (Fourseven, Zunapro); in cheaper quotes they're your problem. We've broken the rules down in [our SRA transparency checklist](/en/blog/sra-transparency-rules-law-firm-website)."),
  li("**Integrations.** Clio or LEAP sync, online booking, call tracking and live chat each add days of work — they appear only in the bespoke tiers."),
  li("**Template vs custom.** Every cost guide draws the same line: a theme costs a third of a custom build, and you pay the difference back in sameness and platform limits."),
  li("**Specialist premium.** Whitehat's guide prices a generalist agency build at £10,000–£15,000 and the same scope at a legal specialist at £15,000–£30,000. You're paying for the agency having made law-firm mistakes on someone else's budget."),

  h2("The ongoing costs nobody leads with"),
  p("A law firm website is not a one-off purchase, and the published retainers make that clear:"),
  table(
    ["Cost", "Published range", "Source"],
    [
      ["Maintenance / care plan", "£37–£79/month", "DotGO, Dot it Media, Fourseven, Solicitor Web Design UK"],
      ["Hosting + maintenance, market-wide", "£100–£300/month", "Whito research, 2026"],
      ["With content and SEO included", "£150–£1,000/month", "MagnifyLab cost guide, 2026"],
      ["Local SEO retainer (legal)", "£650/month", "Fourseven Media"],
      ["Copy, per page", "£80–£200", "Dot it Media"],
    ]
  ),
  p("Over three years the running costs routinely overtake the build. If a quote looks surprisingly cheap, read what year two costs before signing."),

  h2("Mind the VAT line"),
  p("Of the eight published price lists we checked, only one (Zunapro) quotes VAT-inclusive prices. Fourseven, Dot it Media and DotGO say “+VAT” explicitly; the rest don't mention it. For a UK firm that means the real invoice is usually **20% above the sticker price** — a £3,990 package is £4,788 by the time it's paid. Always ask."),

  h2("Timelines, from the same pages"),
  li("Template packages: 3–7 working days (BrainyWebs, Dot it Media)."),
  li("Fixed-price custom sites: 10 days–5 weeks (Solicitor Web Design UK 10–15 business days; Fourseven within 14 days of receiving content; Dot it Media 3–5 weeks)."),
  li("Bespoke builds: 6–12 weeks (Fourseven, MagnifyLab); redesigns and enterprise work run 8–24 weeks in Whitehat's guide."),
  p("The honest caveat every agency repeats in its FAQ: the clock usually waits on the firm, not the developer — practice-area descriptions, fee earner bios and costs information take longer to sign off than pages take to build."),

  h2("Where we sit in this market"),
  p(`Code-Site.Art builds [law firm websites](/en/sites-for/legal) from **€4,500** — custom-coded (no WordPress, no theme), a page per practice area, the SRA transparency elements in the structure from day one, and the first year of hosting and support in the price. Delivery is 14–21 working days. We invoice from Ukraine, so VAT isn't added — a VAT-registered UK firm accounts for it under the reverse charge. The full breakdown is on [the pricing page](/en/pricing), and [the calculator](/en/calculator) gives a figure for your own scope in two minutes.`),
  cta(
    "Want a number for your firm, not a range?",
    "Tell us your practice areas and what the current site does — we'll come back within a day with a fixed quote and a delivery date.",
    "Get a fixed quote",
    "/en/contacts"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "How much does a law firm website cost in the UK?",
    a: "Published prices in November 2026 run from £350 for a template starter site to £30,000+ for bespoke specialist builds. Most small and mid-size firms buy in the £1,500–£8,000 band: custom design, a page per practice area and a fixed delivery date. Premium legal-niche agencies don't publish prices and quote per project.",
  },
  {
    q: "Why do quotes differ so much for the same brief?",
    a: "The main drivers are the number of practice-area pages, who writes the legal copy, whether SRA transparency pages are included, integrations with practice management software like Clio or LEAP, and template versus custom design. Two quotes rarely cover the same scope — compare what's included, not the headline number.",
  },
  {
    q: "What are the ongoing costs after launch?",
    a: "Published care plans start at £37–£79 per month for hosting, updates and small fixes. Market-wide, hosting plus maintenance runs £100–£300 per month, and £150–£1,000 per month once content and SEO are included. Over three years the running costs often exceed the original build.",
  },
  {
    q: "Do the published prices include VAT?",
    a: "Usually not. Of eight UK price lists we checked in November 2026, only one quoted VAT-inclusive figures; the rest either add 20% VAT explicitly or don't mention it. A £3,990 package typically invoices at £4,788. Non-UK suppliers invoicing a VAT-registered firm fall under the reverse charge instead.",
  },
  {
    q: "How long does a law firm website take to build?",
    a: "Template sites go live in 3–7 working days. Fixed-price custom sites take two to five weeks. Bespoke builds run 6–12 weeks, and enterprise projects up to six months. In practice the schedule depends most on how quickly the firm supplies practice-area copy, bios and costs information.",
  },
];

const DOC = {
  _id: "glseo2026-law-firm-website-cost-uk",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 9,
  slugs: { en: { _type: "slug", current: "law-firm-website-cost-uk-2026" } },
  title: en("How Much Does a Law Firm Website Cost in the UK? Published Prices, Checked (2026)"),
  metaTitle: en("Law Firm Website Cost UK 2026: Published Prices Compared"),
  metaDescription: en("What UK agencies actually charge for law firm websites: published prices from £350 templates to £30k bespoke builds, ongoing costs, VAT and timelines — checked November 2026."),
  eyebrow: en("Pricing research · 9 min read"),
  lede: en("We collected the prices UK agencies publish for law firm websites and checked every page on 6 November 2026 — the real bands, the ongoing costs, and the VAT line most quotes leave out."),
  category: { _type: "reference", _ref: "28b8d6fe-07b6-4ee6-8f40-87bf838df79b" },
  author: AUTHOR,
  tags: ["legal", "pricing", "UK", "research"],
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
