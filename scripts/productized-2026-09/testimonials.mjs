/**
 * TZ v2 §3.12 — відгуки. Доповнює 3 наявні відгуки полями company/country
 * і створює 4 заглушки (pending: true, featured: false) для клієнтів, у яких
 * треба попросити текст: IceLab, Mono Pools, Олександр Ситников, Glimmer.
 * Заглушки фронтенд не показує; Review schema — тільки для реальних.
 *
 * _id без крапок (див. docs/sanity-document-ids.md у фронтенді).
 *
 *   node scripts/productized-2026-09/testimonials.mjs          // dry-run
 *   node scripts/productized-2026-09/testimonials.mjs --apply  // запис
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const APPLY = process.argv.includes("--apply");
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && APPLY) throw new Error("нужен SANITY_WRITE_TOKEN для --apply");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token,
});

const EXISTING = {
  DHIwRDN3sEoI638qoYQ1Yx: { company: "NBYG København ApS", country: "Данія", pending: false },
  DHIwRDN3sEoI638qoYQ1ml: { company: "Kondor Device", country: "Україна", pending: false },
  s2wDSUpWBbCAmLaTqSJeSh: { company: "E-Fedra", country: "Україна", pending: false },
};

const TODO = { uk: "TODO: текст від клієнта", ru: "TODO: текст от клиента", en: "TODO: client's text" };

const PENDING = [
  { _id: "testimonial-icelab", authorName: "IceLab", company: "IceLab", caseId: "teYo5SgUrFJ21nkOqz75NQ", order: 20 },
  { _id: "testimonial-mono-pools", authorName: "Mono Pools", company: "Mono Pools", caseId: "a2b52844-f284-4114-8a4d-61204b18b498", order: 21 },
  { _id: "testimonial-sytnykov", authorName: "Олександр Ситников", company: "Олександр Ситников", caseId: "6tWqPRZWZzG4Lv3HK7J6o8", order: 22 },
  { _id: "testimonial-glimmer", authorName: "Glimmer", company: "Glimmer", caseId: "71bf3d68-ea3f-48ff-a79a-4cb01841580c", order: 23 },
];

const here = dirname(fileURLToPath(import.meta.url));
const backupDir = join(here, "..", "..", "backups", "productized-2026-09");

const before = await client.fetch(`*[_type == "testimonial"]`);
console.log(`testimonials now: ${before.length}`);

const tx = client.transaction();
for (const [id, set] of Object.entries(EXISTING)) {
  console.log(`patch ${id}`, set);
  tx.patch(id, (p) => p.set(set));
}
for (const t of PENDING) {
  console.log(`createIfNotExists ${t._id}`);
  tx.createIfNotExists({
    _id: t._id,
    _type: "testimonial",
    pending: true,
    featured: false,
    authorName: t.authorName,
    company: t.company,
    country: "Україна",
    quote: { _type: "localizedText", ...TODO },
    caseRef: { _type: "reference", _ref: t.caseId },
    order: t.order,
  });
}

if (!APPLY) {
  console.log("dry-run — додайте --apply для запису");
  process.exit(0);
}
mkdirSync(backupDir, { recursive: true });
writeFileSync(join(backupDir, `testimonials-${Date.now()}.json`), JSON.stringify(before, null, 2));
const res = await tx.commit();
console.log("done:", res.results.length, "mutations");
