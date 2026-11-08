/**
 * EN-only blogPost: "Real estate website design that brings buyers" —
 * targets "real estate website design" (US 1,900/KD 8; UK 250/KD 3;
 * AU 300/KD 3; AE 100 — Ahrefs 07.11.2026). Design-principles teardown of
 * Domlivo (our own platform) with uploaded screenshots. Facts per
 * domlivo-case-brief-2026-11-07.md; forbidden list honoured (no revenue,
 * 5.9k = ALL organic traffic, no PSI claims, no Perplexity numbers,
 * one-off prices only).
 * Usage: node seed-real-estate-website-design.mjs [--dry-run]
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
const key = () => `rd${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;
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
const img = (ref, alt, caption) => ({
  _key: key(), _type: "blogImage",
  asset: { _type: "reference", _ref: ref }, alt, caption,
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
const NOW = "2026-11-08T10:00:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const IMG = {
  hero: "image-370aafa3264d85addca02512540a4759a360a771-2880x1800-png",
  splitMap: "image-075c22701d15ee8f427e350cb2941906b51f9c94-2880x1800-png",
  property: "image-a168618112ffa0362f485069533877bf3051756a-2880x1800-png",
  checker: "image-3bfebfd6f7399b058614c05aad653f0758a4c817-2880x1800-png",
  gsc: "image-0960546174523b19e922a989158ffb73a18cc157-1519x484-png",
  ga4: "image-992dd68d1bc0ed363878ad59ad303c3770896b4a-1525x546-png",
};

const BODY_EN = [
  tldr("Real estate website design — what actually matters", [
    "Every screenshot in this article is from a live platform we built and operate ourselves, with its traffic numbers published — not from a mock-up gallery.",
    "The first screen's job is to sell the inventory, not the agency: live listing counts, a real lowest price, one search action.",
    "The catalogue that converts is a split view — honest listing cards next to a clustered map — and “honest” is a design feature: price per m², market-comparison badges, listed/checked dates.",
    "Design that ranks is mostly invisible: every listing is its own fast page, every language has its own URLs. Our site went from zero to 554 Google clicks per 28 days in about three months.",
    "Design now has a third audience after buyers and Google: AI assistants. Ours became the site's #2 traffic channel, and 28% of CRM leads arrive from ChatGPT.",
  ]),
  p("Search “real estate website design” and you'll get galleries of handsome heroes with palm trees. They're nice to look at and useless to learn from, because a screenshot can't show you whether the design ever produced a buyer. So this is a different kind of design article: a walkthrough of [Domlivo](/en/portfolio/domlivo), the property platform we built and run ourselves — ~5,900 unique visitors a month, all of it organic (search, AI assistants and direct — the site has never run an ad). Every principle below is illustrated by the live site and backed by its numbers."),

  h2("1. The first screen sells inventory, not the agency"),
  img(IMG.hero, "Domlivo catalogue hero: live listing count, lowest-price marker on a real photo of the Albanian coast, one search entry point", "The catalogue first screen: 869 live listings, a real lowest price, a real place — not a stock photo."),
  p("Buyers don't arrive wondering who you are; they arrive wondering what you have. The first screen answers with facts: a live count of listings (869 at this screenshot), the real lowest price pinned to a real photograph of the place, and a single obvious next action. The agency's story can wait for the about page — **the inventory is the hero**. This is the single most common inversion we see on agency sites: the design celebrates the brand and hides the stock behind three clicks."),

  h2("2. The catalogue is a split view — and honesty is a design element"),
  img(IMG.splitMap, "Domlivo catalogue: listing cards with price per square metre and market badges next to a clustered map of Albania", "Cards carry price/m², an “Above market” badge, listed and checked dates; the map clusters 654 listings around Durrës."),
  p("The pattern buyers already know from the big portals — cards on the left, map on the right — is the pattern to give them. But look closer at the cards, because that's where trust is designed in: **price per square metre** next to the asking price, an “Above market” badge computed against our own price index, a “Listed / Checked” date pair that tells the buyer the stock is alive, and view counters. Even the map is honest — the note says locations are approximate, the area rather than the building. Every one of those microcopy decisions costs a conversation with a seller and earns a buyer's trust. None of them requires a designer's taste; they require the courage to show data."),

  h2("3. The listing page answers before it asks"),
  img(IMG.property, "Domlivo property page: gallery, price with per-square-metre figure, key facts and an enquiry path on one screen", "A listing page's job: every question a buyer would ask an agent, answered above the enquiry form."),
  p("A buyer who has to message you to learn the floor area will message a competitor who published it. The listing page carries the gallery, the price with its per-m² context, the key facts and the costs around the purchase — and only then the enquiry form. Counterintuitive but true in our funnel: **the more a page answers, the more enquiries it produces**, because the enquiries that arrive are from buyers who already qualified themselves."),

  h2("4. Tools are design: give buyers something to do"),
  img(IMG.checker, "Domlivo property-check tool: an interactive legal checklist for a chosen property type and status", "The /property-check tool: an interactive legal checklist — one of six calculators and checkers on the platform."),
  p("Between “started dreaming” and “ready to enquire” there are weeks of research, and most agency sites offer nothing to do during them. We designed tools for that interval: purchase-cost and running-cost calculators, a rental-yield calculator, an interactive legal-check checklist, a residency-route checker. They keep returning visitors returning — and they're precisely the pages AI assistants cite, because their outputs are concrete. Tools are not a gimmick bolted onto design; on a property site they ARE the design of the research phase."),

  h2("5. The design Google sees: pages, speed, languages"),
  img(IMG.gsc, "Google Search Console graph: clicks and impressions growing from zero to 554 clicks per 28 days in about three months", "GSC, three months from first impressions: 554 clicks/28 days by early November — ×4 in six weeks. Source: GSC, 07.11.2026."),
  p("Most of “design for search” is architecture a visitor never consciously sees: every listing is its own server-rendered page with schema markup; every city-and-type combination is an indexable catalogue page; photos go through an image pipeline so the pages stay fast; and the whole site exists in **8 languages with hand-written translations and per-language URLs** — a German buyer lands on a German page, not on a translate widget. The graph above is what that architecture did in its first three months, from a standing start, with zero advertising."),

  h2("6. The third audience: design for AI assistants"),
  img(IMG.ga4, "GA4 channels report: AI Assistant is the second channel with 256 sessions and the highest conversion share", "GA4, 28 days: “AI Assistant” is channel #2 (256 sessions, 32%) and converts best — 38% of key events. Source: GA4, 06.11.2026."),
  p("Buyers increasingly research through ChatGPT before they ever type into Google — and an assistant can't be charmed by a hero image. It cites sites whose facts are checkable: our knowledge base attributes every number to a quoted primary source, our price index publishes open data, and AI crawlers are explicitly allowed. The result is measurable: AI assistants are the site's **#2 traffic channel and its best-converting one, and 28% of CRM leads arrive with chatgpt.com as the referrer**. The full method is in [our ChatGPT-leads playbook](/en/blog/real-estate-leads-from-chatgpt)."),

  h2("The checklist for your own site"),
  num("First screen: live inventory numbers, a real photo of your market, one search action. Brand story one click away, not zero."),
  num("Catalogue: split view with a map; cards carrying price/m², dates and honest badges."),
  num("Listing pages that answer everything an agent would be asked — before the form."),
  num("At least one tool for the research phase: a cost calculator beats a brochure page."),
  num("Architecture: a page per listing, a page per city×type, real multilingual URLs, photos through a pipeline."),
  num("Facts with sources on the content side — buyers trust it and AI assistants cite it."),
  p("If you'd rather start from a platform where all of this is already built: the design above isn't a concept, it's [a website for real estate agents](/en/portfolio/domlivo) you can launch under your own brand in a week — one-off from €3,900, extended build from €6,900, full source ownership from €19,000. And if you're still weighing a theme against a build, read [templates vs custom, honestly compared](/en/blog/real-estate-website-template-vs-custom) first."),

  cta(
    "Want this design working for your listings?",
    "Domlivo is our own platform — every screenshot above is the live site. Catalogue with split map, 8 languages, AI assistant, tools. Under your brand in a week, from €3,900 one-off.",
    "See the Domlivo platform",
    "/en/portfolio/domlivo"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "What makes a good real estate website design?",
    a: "A first screen that sells the inventory (live counts, real lowest price, one search action), a split-view catalogue with honest cards — price per m², market badges, listed/checked dates — listing pages that answer every buyer question before the enquiry form, tools for the research phase, and the invisible layer: a fast page per listing, per-language URLs, schema markup. Every example in this article is from our own live platform with published traffic numbers.",
  },
  {
    q: "What should be on a real estate website's homepage?",
    a: "The inventory, not the agency story: a live listing count, a real photograph of the market, the lowest real price, and a single prominent search entry. Trust elements (team, process, reviews) belong one click away. The most common design mistake we see is inverting this — celebrating the brand on the first screen and hiding the stock behind navigation.",
  },
  {
    q: "Does website design affect real estate SEO?",
    a: "The part of design nobody screenshots does: whether every listing is its own fast, server-rendered, schema-marked page; whether city and type combinations have indexable pages; whether languages have real URLs with hreflang. On our platform that architecture took Google clicks from zero to 554 per 28 days in about three months, with no advertising.",
  },
  {
    q: "How is designing for AI assistants different?",
    a: "Assistants don't see visual design at all — they select sources whose facts are checkable: numbers attributed to quoted primary sources, open data, crawlable fast pages. On our platform that audience became the #2 traffic channel with the best conversion rate, and 28% of CRM leads arrive from ChatGPT — measured, dated numbers, not projections.",
  },
];

const DOC = {
  _id: "glseo2026-real-estate-website-design",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW, readingTimeMinutes: 10,
  slugs: { en: { _type: "slug", current: "real-estate-website-design" } },
  title: en("Real Estate Website Design That Brings Buyers: a Walkthrough of Our Own Platform"),
  metaTitle: en("Real Estate Website Design: a Live Platform Walkthrough"),
  metaDescription: en("Real estate website design principles shown on a live platform we built and run: first screens, split-map catalogues, honest listing cards, tools — with real traffic numbers, not mock-ups."),
  eyebrow: en("Design teardown · 10 min read"),
  lede: en("Design galleries show pretty heroes; they can't show whether a design ever produced a buyer. So here's a teardown of our own live property platform instead — ~5,900 monthly visitors, all organic, screenshots and numbers included."),
  category: { _type: "reference", _ref: "10c16de9-82a6-4d3e-a5ac-0ae99056d446" },
  author: AUTHOR,
  tags: ["real-estate", "design", "case-study"],
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
