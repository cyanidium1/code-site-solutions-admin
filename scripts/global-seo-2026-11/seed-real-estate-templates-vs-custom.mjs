/**
 * EN-only blogPost: "Real estate website templates vs custom" — targets
 * "real estate website template" (US 1,200/KD 3, GSV 1,900; Ahrefs
 * 07.11.2026). Part of the Domlivo-engine cluster; links the case page.
 * Usage: node seed-real-estate-templates-vs-custom.mjs [--dry-run]
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
loadEnvFile(join(ROOT, ".env.local")); loadEnvFile(join(ROOT, ".env"));
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!TOKEN && !DRY) throw new Error("token missing");
const client = createClient({ projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", token: TOKEN, useCdn: false });

let keySeq = 0;
const key = () => `tc${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;
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
const li = (t) => ({ ...p(t), listItem: "bullet", level: 1 });
const num = (t) => ({ ...p(t), listItem: "number", level: 1 });
const tldr = (title, items) => ({ _key: key(), _type: "tldrBox", title, items });
const table = (headers, rows) => ({
  _key: key(), _type: "blogTable", headers,
  rows: rows.map((cells) => ({ _key: key(), _type: "blogTableRow", cells })),
});
const cta = (heading, sub, label, href) => ({
  _key: key(), _type: "ctaCallout", heading, sub, ctaLabel: label, ctaHref: href,
  title: heading, text: sub, buttonLabel: label, buttonHref: href,
});
const AUTHOR = {
  name: "Fedir Alpatov", role: "Founder & Tech Lead",
  bio: "Founder of Code-Site.Art. I do the tech-lead work and write about real figures from 50+ projects.",
  photoUrl: "/team/fedir-avatar.jpg",
};
const NOW = "2026-11-07T15:00:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const BODY_EN = [
  tldr("Templates vs custom for a real estate website — the short version", [
    "A template answers “do I exist online?”. It cannot answer “do buyers find my listings in Google?” — because the SEO outcome lives in the parts a theme can't change: URL architecture, listing pages as indexable entities, speed, and languages.",
    "A template is the right buy for a solo agent whose leads come from referrals and portals, who needs a brochure site this month.",
    "It's the wrong buy the day you want search traffic: every agency on the same theme ships the same structure, and Google has no reason to pick your copy of it.",
    "The questions that decide it: how many listings, how many languages, where your leads actually come from, and who updates the site.",
    "We run our own property platform and publish its numbers — the comparison below is from operating both kinds of sites, not from selling themes.",
  ]),
  p("“Real estate website template” is one of the most-searched phrases in this niche, and the marketplaces that rank for it will happily sell you a handsome theme for $17–$79. This is not an article telling you templates are evil. It's an attempt to answer the question the marketplaces never do: **what exactly does the cheap option not buy you** — so you can decide if you need it."),

  h2("What a template actually is"),
  p("A real estate theme is a set of page designs: a homepage with a search bar, listing cards, an agent profile, a contact form. On WordPress or a site builder it gets you something presentable within days, and for a predictable, low price. What it standardises is precisely the thing search engines use to choose between sites: structure. Your copy of the theme has the same URL patterns, the same heading skeleton, the same page weight (usually heavy — themes ship every feature every buyer might want), and the same listing-page markup as hundreds of other agencies."),

  h2("When a template is the right call"),
  li("You're a solo agent or a new office and your deals come from referrals, social media and the portals — the website is a business card that confirms you're real."),
  li("You hold a handful of exclusive listings at a time; buyers meet your stock on Rightmove, Zillow-class portals or Facebook anyway."),
  li("The budget is a few hundred, not a few thousand — in that bracket a clean template beats a cheap custom job every time."),
  li("You need it live this month."),
  p("In this situation, buy the template, keep the photos professional, and spend the difference on listings and ads. Honestly."),

  h2("Where templates quietly cost you leads"),
  num("**Search structure.** Organic real-estate traffic lands on listing and area pages, not homepages. That demands every listing as its own indexable page with clean URLs, structured data (RealEstateListing schema), unique titles and internal links by city and district. Themes render listings; they rarely architect them for search — and on a shared theme your structure is identical to every other buyer's."),
  num("**Speed.** Property pages are photo-heavy; themes are JavaScript-heavy. The combination routinely lands in the orange-to-red Core Web Vitals zone, and both rankings and impatient buyers pay for it."),
  num("**Languages.** If your buyers come from abroad — the normal case for coastal and investment markets — you need real localisation: translated pages with per-language URLs and hreflang, not a Google-Translate widget. Multilingual plugins on templates are where this dream usually dies."),
  num("**Sameness.** A buyer who has seen three agency sites this hour doesn't remember the fourth copy of the same theme. Nothing about a template says why you."),
  num("**Ownership and drift.** Theme licences, plugin subscriptions, updates that break the design — the “cheap” option accumulates a monthly cost and a maintenance dependency."),

  h2("The comparison, honestly"),
  table(
    ["", "Template", "Custom platform"],
    [
      ["Time to launch", "days", "a week to a few weeks"],
      ["Upfront cost", "$17–79 theme + setup", "from a few thousand"],
      ["Listing pages built for search", "rarely — renderer, not architecture", "the whole point: every listing and every city×type combination an indexable page"],
      ["Speed on photo-heavy pages", "usually poor without surgery", "engineered in (image pipelines, static rendering)"],
      ["Real multilingual", "plugin lottery", "per-language URLs, hreflang, hand-written translations"],
      ["Looks like", "every other buyer of the theme", "your brand"],
      ["Who it fits", "solo agent, referral-driven, few listings", "agency that wants Google and AI search as a lead channel"],
    ]
  ),

  h2("What the custom route looks like when it works"),
  p("We can show rather than argue, because we run our own property platform: [Domlivo](/en/portfolio/domlivo), a multilingual real-estate site we built and operate ourselves. It's three months old in the index and does ~5,900 unique visitors a month with **zero advertising** — every listing is its own page in 8 languages, every city-and-type combination is an indexable catalogue page, and 28% of its CRM leads arrive from ChatGPT, which cites the site's knowledge base. None of that is achievable by installing a theme — not because themes are bad, but because those results come from the architecture layer themes standardise away."),
  p("That's the test to run on your own plans: if the website's job is to **generate** demand rather than confirm your existence, the money belongs in structure — listing pages, speed, languages, data — and that's a build, not a skin. The middle path also exists: start on a template now, and move to a platform when the maths of organic leads justifies it. Just know that the move is a migration project, not a switch."),

  cta(
    "Want the custom route without the custom timeline?",
    "Domlivo is our own platform — catalogue with map search, 8-language localisation, AI assistant, calculators — launched under your brand in a week, from €3,900. You own the result.",
    "See the Domlivo platform",
    "/en/portfolio/domlivo"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "Are real estate website templates good enough?",
    a: "For a referral-driven solo agent who needs a credible brochure site quickly and cheaply — yes, genuinely. For an agency that wants Google or AI search as a lead channel — no: the ranking outcome depends on listing-page architecture, speed and localisation, which are exactly the layers a shared theme standardises and that you can't meaningfully change.",
  },
  {
    q: "Why do template-based real estate sites struggle in Google?",
    a: "Because organic property traffic lands on listing and area pages, and templates render those pages rather than architect them: shared URL structures across every theme buyer, heavy JavaScript on photo-heavy pages, weak structured data, and multilingual support left to plugins. Google has little reason to prefer one copy of a theme over hundreds of identical ones.",
  },
  {
    q: "What does a custom real estate website give that a template can't?",
    a: "Architecture: every listing and every city-and-type combination as its own fast, indexable page with schema markup; real multilingual URLs with hreflang; image pipelines that keep photo-heavy pages fast; and a design that belongs to your brand. Our own platform runs this way — about 5,900 unique monthly visitors with zero advertising, three months after launch.",
  },
  {
    q: "Can I start on a template and move to a custom platform later?",
    a: "Yes, and for tight budgets it's a sensible path — but treat the move as a migration project: URLs change, so it needs a redirect map and careful transfer of any rankings you've earned. If search traffic is in your 12-month plan, starting on the right architecture is cheaper than migrating onto it.",
  },
];

const DOC = {
  _id: "glseo2026-real-estate-templates-vs-custom",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW, readingTimeMinutes: 8,
  slugs: { en: { _type: "slug", current: "real-estate-website-template-vs-custom" } },
  title: en("Real Estate Website Templates vs Custom: What the Cheap Option Doesn't Buy"),
  metaTitle: en("Real Estate Website Template vs Custom: an Honest Comparison"),
  metaDescription: en("When a real estate website template is genuinely the right buy, where it quietly costs you leads, and what a custom platform changes — from a studio that runs its own property site."),
  eyebrow: en("Guide · 8 min read"),
  lede: en("The marketplaces will sell you a handsome theme for $49. Here's what it does and doesn't buy — from a team that operates its own multilingual property platform and publishes the numbers."),
  category: { _type: "reference", _ref: "10c16de9-82a6-4d3e-a5ac-0ae99056d446" },
  author: AUTHOR,
  tags: ["real-estate", "templates", "platform", "guide"],
  relatedPostSlugs: ["sait-dlia-ahentsii-nerukhomosti", "vartist-rozrobky-saytu-2026"],
  body: { en: BODY_EN },
  faq: FAQ.map((f) => ({ _key: key(), _type: "faqItem", question: en(f.q), answer: enText(f.a) })),
};

async function run() {
  if (DRY) {
    const out = join(HERE, "out"); mkdirSync(out, { recursive: true });
    writeFileSync(join(out, `${DOC._id}.json`), JSON.stringify(DOC, null, 2));
    console.log(`dry-run: ${BODY_EN.length} blocks`); return;
  }
  const res = await client.createOrReplace(DOC);
  console.log(`created/replaced ${res._id} (${BODY_EN.length} blocks)`);
}
run().catch((e) => { console.error(e); process.exit(1); });
