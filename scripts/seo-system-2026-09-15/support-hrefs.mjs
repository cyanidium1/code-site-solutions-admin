// Follow-up to apply.mjs: EN and RU article bodies still linked the UA-only
// /support page. Point them at the locale's pricing page, which now lists
// maintenance prices (PRICING_TYPES_* "standalone services" table).
//   node scripts/seo-system-2026-09-15/support-hrefs.mjs [--dry-run]
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
for (const line of readFileSync(join(HERE, "..", "..", ".env"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const DRY = process.argv.includes("--dry-run");
const client = createClient({ projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false, perspective: "raw" });
const TO = { en: "/en/pricing", ru: "/ru/pricing" };
const docs = await client.fetch(`*[_type=="blogPost" && !(_id in path("drafts.**"))]{_id,_rev,body}`);
const tx = client.transaction(); const backup = []; let n = 0;
for (const d of docs) {
  const set = {};
  for (const loc of ["en", "ru"]) {
    const body = d.body?.[loc]; if (!Array.isArray(body)) continue;
    let c = 0;
    const walk = (v) => Array.isArray(v) ? v.map(walk) : v && typeof v === "object"
      ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === "string" && ["href","ctaHref","ctaSecondaryHref","buttonHref"].includes(k) && x === "/support" ? (c++, TO[loc]) : walk(x)]))
      : v;
    const next = walk(body);
    if (c) { set[`body.${loc}`] = next; console.log(d._id, loc, c); n += c; }
  }
  if (Object.keys(set).length) { backup.push(d); tx.patch(client.patch(d._id).ifRevisionId(d._rev).set(set)); }
}
console.log("hrefs:", n);
if (DRY || !n) process.exit(0);
mkdirSync(join(HERE, "backup"), { recursive: true });
writeFileSync(join(HERE, "backup", `before-support-hrefs-${Date.now()}.json`), JSON.stringify(backup, null, 1));
console.log("committed", (await tx.commit()).transactionId);
