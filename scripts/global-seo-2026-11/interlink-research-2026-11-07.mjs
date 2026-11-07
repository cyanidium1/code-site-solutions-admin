/**
 * Interlinking pass 07.11.2026: older EN posts get one closing paragraph
 * linking the new research pieces (published 06.11). Idempotent — a post
 * already containing the target href is skipped.
 *
 * Usage: node interlink-research-2026-11-07.mjs [--dry-run]
 */
import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
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
if (!TOKEN) throw new Error("token missing");
const client = createClient({
  projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", token: TOKEN, useCdn: false,
});

let seq = 0;
const key = () => `il${(seq++).toString(36)}${Date.now().toString(36).slice(-5)}`;

/** Build one normal block from parts: strings and {t, href} links. */
function block(parts) {
  const children = []; const markDefs = [];
  for (const part of parts) {
    if (typeof part === "string") {
      children.push({ _key: key(), _type: "span", text: part, marks: [] });
    } else {
      const dk = key();
      markDefs.push({ _key: dk, _type: "link", href: part.href });
      children.push({ _key: key(), _type: "span", text: part.t, marks: [dk] });
    }
  }
  return { _key: key(), _type: "block", style: "normal", markDefs, children };
}

const JOBS = [
  {
    slug: "websites-for-solicitors",
    guard: "/en/blog/law-firm-website-examples-uk",
    parts: [
      "If you're weighing up what a proper law firm website involves, we've published the research: ",
      { t: "11 real UK firm websites reviewed", href: "/en/blog/law-firm-website-examples-uk" },
      " — what the strong ones share — and ",
      { t: "what UK agencies actually charge for a law firm website", href: "/en/blog/law-firm-website-cost-uk-2026" },
      ", every published price checked in November 2026.",
    ],
  },
  {
    slug: "attorney-website-essentials",
    guard: "/en/blog/law-firm-website-examples-uk",
    parts: [
      "For the UK picture, see our research: ",
      { t: "11 real UK law firm websites reviewed", href: "/en/blog/law-firm-website-examples-uk" },
      " and ",
      { t: "the UK law firm website cost breakdown", href: "/en/blog/law-firm-website-cost-uk-2026" },
      ", both checked against live pages in November 2026.",
    ],
  },
  {
    slug: "real-estate-agency-website",
    guard: "/en/blog/estate-agent-website-examples-uk",
    parts: [
      "We've since published the UK research behind this topic: ",
      { t: "12 real UK estate agency websites reviewed", href: "/en/blog/estate-agent-website-examples-uk" },
      " — including the valuation-funnel mistake every brand repeats — and ",
      { t: "what an estate agent website costs in the UK", href: "/en/blog/estate-agent-website-cost-uk-2026" },
      ", with every published price checked in November 2026.",
    ],
  },
  {
    slug: "15-clinic-website-mistakes",
    guard: "/en/blog/gdc-rules-dental-practice-website",
    parts: [
      "For dental practices there's a regulatory layer on top of all this: ",
      { t: "the GDC's website rules, quoted rule by rule and checked against 17 real practice sites", href: "/en/blog/gdc-rules-dental-practice-website" },
      " (November 2026).",
    ],
  },
  {
    slug: "medical-website-design-trust",
    guard: "/en/blog/gdc-rules-dental-practice-website",
    parts: [
      "If the practice is dental, part of “trust” is written down by the regulator: see ",
      { t: "what a dental practice website must show under GDC rules", href: "/en/blog/gdc-rules-dental-practice-website" },
      " — the requirements quoted from the primary sources, with a 17-site field check.",
    ],
  },
  {
    slug: "custom-website-cost-uk-2026",
    guard: "/en/blog/law-firm-website-cost-uk-2026",
    parts: [
      "We also keep niche-by-niche price research with every published figure checked against live pages: ",
      { t: "law firm websites", href: "/en/blog/law-firm-website-cost-uk-2026" },
      ", ",
      { t: "estate agency websites", href: "/en/blog/estate-agent-website-cost-uk-2026" },
      ", ",
      { t: "builders' websites", href: "/en/blog/builders-website-cost-uk-2026" },
      " and ",
      { t: "clinic websites", href: "/en/blog/clinic-website-cost-uk-2026" },
      ".",
    ],
  },
];

const NOW = "2026-11-07T09:00:00.000Z";

for (const job of JOBS) {
  const d = await client.fetch(
    '*[_type=="blogPost" && slugs.en.current==$s][0]{_id, body}', { s: job.slug },
  );
  if (!d) { console.log(`SKIP ${job.slug}: not found`); continue; }
  const txt = JSON.stringify(d.body.en);
  if (txt.includes(job.guard)) { console.log(`SKIP ${job.slug}: already links ${job.guard}`); continue; }
  seq = 0;
  const b = block(job.parts);
  if (DRY) { console.log(`DRY ${job.slug} (${d._id}): would append 1 block`); continue; }
  const res = await client.patch(d._id)
    .append("body.en", [b])
    .set({ updatedAt: NOW })
    .commit();
  console.log(`OK ${job.slug} (${d._id}): blocks now ${res.body.en.length}`);
}
