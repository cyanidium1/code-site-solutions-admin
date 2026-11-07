/**
 * EN-only blogPost: "28% of our real estate leads come from ChatGPT" —
 * the GEO flagship for the Domlivo-engine cluster. Every figure comes from
 * domlivo-case-brief-2026-11-07.md (sources: GSC/GA4/Clarity/Sanity CRM/
 * Ahrefs, each dated); the brief's "do not publish" list is honoured
 * (no revenue figures, no Perplexity numbers, no PSI claims).
 * Usage: node seed-real-estate-chatgpt-leads.mjs [--dry-run]
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
const key = () => `cg${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;
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
const NOW = "2026-11-07T15:30:00.000Z";
const en = (s) => ({ _type: "localizedString", en: s });
const enText = (s) => ({ _type: "localizedText", en: s });

const BODY_EN = [
  tldr("Real estate leads from ChatGPT — our measured numbers", [
    "28% of the leads in our property platform's CRM arrive with chatgpt.com as the referrer (Sanity CRM, 6 November 2026).",
    "“AI Assistant” is the site's #2 traffic channel in GA4 — 256 sessions, 32% of the total, ahead of organic search — and converts best of all channels: 38% of key events.",
    "Ahrefs counts 73 AI-answer mentions of the site, +54 in a month. The site is ~3 months old in Google's index.",
    "Nothing here is a trick: LLMs cite the site because it's the easiest source to verify — 656 facts with word-for-word quotes from 558 primary sources, open data, and crawlable pages.",
    "The playbook below is what we actually did, in order, with what each step is for. No step requires ads. We can't promise your percentages — we can show ours and the method.",
  ]),
  p("Everyone in real estate marketing is suddenly talking about “AI SEO”, and almost nobody shows numbers. So here are ours. We run [Domlivo](/en/portfolio/domlivo), a multilingual property platform in a market where buyers are mostly foreign — which means they research hard before they fly in. Increasingly, that research happens inside ChatGPT. Our job was to be the site it quotes."),

  h2("The numbers first (all dated, all sourced)"),
  table(
    ["Metric", "Value", "Source, date"],
    [
      ["Leads with chatgpt.com referrer", "28% of CRM leads", "Sanity CRM, 06.11.2026"],
      ["“AI Assistant” channel", "#2 channel: 256 sessions, 32% of total (Direct 302, AI 256, Organic 170)", "GA4 traffic acquisition, 28 days, 06.11.2026"],
      ["AI channel conversion", "21 of 55 key events = 38% — the best of any channel", "GA4, 06.11.2026"],
      ["AI answers citing the site", "73, +54 in a month", "Ahrefs, 05.11.2026"],
      ["Monthly audience", "~5,900 unique visitors, zero paid traffic ever", "Microsoft Clarity, 06.11.2026 (bot sessions filtered)"],
      ["Google clicks", "554 per 28 days — ×4 in six weeks", "GSC, 07.11.2026"],
    ]
  ),
  p("Context that matters: the site had its first Google impressions in early August 2026. These are month-three numbers, built from a standing start, and the AI channel outconverts every other channel the site has."),

  h2("Why ChatGPT cites this site and not the competitors"),
  p("When an LLM answers “can a foreigner buy property in Albania?” or “what does ownership verification cost?”, it looks for sources it can trust mechanically: concrete claims, attributed to primary documents, on pages it's allowed to read. Most real-estate content fails all three tests — unsourced claims, recycled myths, and crawlers blocked. We built for the opposite:"),
  num("**A knowledge base where every number is a quoted fact.** 99 articles built on 656 individual facts, each carrying a word-for-word quote from one of 558 primary sources — laws, government decisions, customs tariffs, the statistics institute. When competitors repeat a myth, we publish the refutation with the document. That's the content LLMs select when they need something defensible."),
  num("**Our own data nobody else has.** A monthly price index across 7 cities with frozen snapshots and open CSV/JSON downloads. Original, dated, machine-readable data is citation bait for both AI answers and journalists."),
  num("**Open doors for AI crawlers.** llms.txt published; GPTBot, ClaudeBot and peers explicitly allowed; full schema.org markup (RealEstateListing, FAQPage, Organization); fast server-rendered pages. Access doesn't create citations — it's the precondition for them."),
  num("**Answer-shaped pages.** FAQ blocks with dated, self-contained answers; calculators and checkers (purchase costs, residency routes, legal checks) whose outputs are concrete enough to quote."),
  num("**Eight languages, honestly localised.** Hand-written translations with per-language URLs — so the site is quotable in the language the buyer asked in."),
  p("Note what's NOT on the list: no “AI optimization” tools, no prompt tricks, no content spinning. The mechanism is boringly causal — be the most verifiable source in the niche, be readable by machines, and the machines quote you."),

  h2("The playbook, in the order we'd repeat it"),
  num("Pick the questions buyers actually ask an assistant (visa rules, taxes, process, costs — not “best agency”) and answer each on its own page."),
  num("Source every number to a primary document with the quote visible. Refuse to publish what you can't verify — the restraint is itself the differentiator."),
  num("Publish data only you have: your transaction stats, your price observations, dated and downloadable."),
  num("Open the site technically: allow AI crawlers in robots, add llms.txt, ship schema markup, keep pages server-rendered and fast."),
  num("Track it like a channel: referrer-split your CRM leads, build a GA4 channel group for AI referrers, watch Ahrefs' AI-answer mentions."),
  p("And the step most teams skip: wire the leads to a CRM with sources, or you'll never know any of this is happening. 28% from ChatGPT is only a number because every enquiry lands in the CRM with its referrer attached."),

  h2("What we can't tell you (yet)"),
  li("Whether these percentages transfer to your market — AI-assisted research is strongest where buyers are remote and stakes are high (international, investment, relocation). A purely local rental audience may behave differently."),
  li("Perplexity and Google AI Overviews: we have a measurement method but no numbers fresh enough to publish — so we won't."),
  li("How durable the channel is. It's been growing monthly in our data; that's an observation, not a guarantee."),

  cta(
    "Want this machine working for your listings?",
    "Domlivo is the platform these numbers come from — catalogue, 8 languages, knowledge base, AI assistant, CRM with lead sources. Launched under your brand in a week, from €3,900. SEO and GEO as an ongoing service from €900/month.",
    "See the Domlivo platform",
    "/en/portfolio/domlivo"
  ),

  h2("FAQ"),
];

const FAQ = [
  {
    q: "Can a real estate website really get leads from ChatGPT?",
    a: "Ours does, measurably: 28% of CRM leads arrive with chatgpt.com as the referrer, and the AI channel is #2 in GA4 with 32% of sessions and the best conversion rate of any channel (38% of key events) — data from 6 November 2026, on a site with zero paid traffic. The mechanism is citation: assistants quote the site's knowledge base and users click through.",
  },
  {
    q: "How do you get ChatGPT to cite a real estate website?",
    a: "Be the most verifiable source in the niche and be machine-readable: answer the questions buyers ask assistants on dedicated pages, attribute every number to a quoted primary source, publish original dated data, allow AI crawlers (robots + llms.txt), ship schema markup and fast server-rendered pages. Access alone doesn't create citations — verifiability does.",
  },
  {
    q: "Does llms.txt improve AI visibility?",
    a: "By itself, no — it's a courtesy map for AI crawlers, and Google ignores it. We publish it as part of being maximally readable, but the citations in our data come from the content layer: quoted primary sources, original data and answer-shaped pages. Don't expect a text file to do the content's job.",
  },
  {
    q: "How do you measure AI-driven leads?",
    a: "Three layers: a CRM where every lead stores its referrer (that's where 28% from chatgpt.com comes from), a GA4 channel group for AI referrers (chatgpt.com and peers), and Ahrefs' count of AI answers mentioning the domain (73 for ours, +54 in a month). Without lead-level sources you can't see the channel at all.",
  },
];

const DOC = {
  _id: "glseo2026-real-estate-chatgpt-leads",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW, readingTimeMinutes: 9,
  slugs: { en: { _type: "slug", current: "real-estate-leads-from-chatgpt" } },
  title: en("28% of Our Real Estate Leads Come From ChatGPT. Here's the Playbook, With Numbers"),
  metaTitle: en("Real Estate Leads From ChatGPT: a Measured Playbook (2026)"),
  metaDescription: en("Our property platform gets 28% of CRM leads from ChatGPT and AI is its #2, best-converting channel. The exact playbook — knowledge base, open data, llms.txt, measurement — with dated sources."),
  eyebrow: en("Case data · 9 min read"),
  lede: en("Everyone talks about AI SEO for real estate; almost nobody shows numbers. Here are ours — 28% of leads from ChatGPT, AI as the #2 channel with the best conversion — and exactly how the site earned the citations."),
  category: { _type: "reference", _ref: "10c16de9-82a6-4d3e-a5ac-0ae99056d446" },
  author: AUTHOR,
  tags: ["real-estate", "AI", "GEO", "case-study"],
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
