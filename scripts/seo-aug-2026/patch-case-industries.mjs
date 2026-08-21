/**
 * SEO overhaul (Aug 2026) — assign missing caseStudy.industry references.
 *
 * The "cases in this niche" block on /sites-for/* and the niche backlink
 * on every case page both key off caseStudy.industry. Only a handful of
 * cases carry the reference today, so most industries fail the
 * ">= 2 inbound links from /portfolio/*" acceptance check.
 *
 * ONLY confident mappings are listed. Review before running — and note
 * there is currently NO obvious legal or finance case in the portfolio,
 * so those two industries cannot reach 2 portfolio links without either
 * a new case study or a deliberate reassignment.
 *
 * Usage (admin repo root):
 *   node scripts/seo-aug-2026/patch-case-industries.mjs --dry-run
 *   node scripts/seo-aug-2026/patch-case-industries.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DRY = process.argv.includes("--dry-run");

function loadEnvFile(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));
loadEnvFile(join(ROOT, "..", "code-site-solutions", ".env.local"));

const TOKEN = process.env.SANITY_API_TOKEN;
if (!TOKEN && !DRY) throw new Error("SANITY_API_TOKEN missing");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  token: TOKEN,
  useCdn: false,
});

/** case slug → industry slug. Confident mappings only. */
const MAPPING = {
  "e-fedra-beauty": "medicine", // E-Fedra beauty & aesthetic-medicine centre
  "aleko-course": "courses",
  "right-cars": "auto",
  "raul-avto": "auto",
  glimmer: "ecommerce",
  "le-muse-nature": "ecommerce",
  "mono-pools": "renovation", // pool construction
};

const industries = await client.fetch(
  `*[_type=="industryPage"]{_id, "slug": slug.current}`,
);
const industryId = (slug) => {
  const d = industries.find((i) => i.slug === slug);
  if (!d) throw new Error(`industryPage ${slug} not found`);
  return d._id;
};

const cases = await client.fetch(
  `*[_type=="caseStudy" && slug.current in $slugs]{_id, "slug": slug.current, "industrySlug": industry->slug.current}`,
  { slugs: Object.keys(MAPPING) },
);

const backupDir = join(ROOT, "backups", "seo-aug-2026");
mkdirSync(backupDir, { recursive: true });

let tx = client.transaction();
let patched = 0;
for (const c of cases) {
  const target = MAPPING[c.slug];
  if (c.industrySlug === target) {
    console.log(`${c.slug}: already → ${target}, skip`);
    continue;
  }
  console.log(`${c.slug}: ${c.industrySlug ?? "(none)"} → ${target}`);
  writeFileSync(
    join(backupDir, `caseStudy-industry-${c.slug}.json`),
    JSON.stringify(c, null, 2),
    "utf8",
  );
  tx = tx.patch(c._id, (p) =>
    p.set({ industry: { _type: "reference", _ref: industryId(target) } }),
  );
  patched++;
}

console.log(`\n${patched} cases to patch`);
if (DRY) {
  console.log("--dry-run: no mutations sent");
  process.exit(0);
}
const res = await tx.commit();
console.log("committed:", res.transactionId);
