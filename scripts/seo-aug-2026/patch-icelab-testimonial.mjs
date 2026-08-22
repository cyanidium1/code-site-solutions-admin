/**
 * IceLab case study — add the client testimonial.
 *
 * Grounded in the client's own Telegram messages supplied by the owner:
 * a large B2B enquiry arrived through the site ("заявка прям жирна впала
 * з сайту, хочуть B2B контракт"), the contract was signed ("вже підписали
 * договір"), the first shipment was made ("сьогодні вже перше
 * відвантаження їм зробили"), the client confirmed search — not ads —
 * delivered it, and closed with "спрацювало все як треба, дякую". The
 * owner supplied the 30+ enquiries figure for the first month.
 *
 * Attribution is to the company, not a person: the chat export does not
 * name the individual and inventing one would be dishonest.
 *
 * NOTE FOR THE OWNER: this is a composed testimonial, not a verbatim
 * quote. Get the client's sign-off on this exact wording before treating
 * it as a published endorsement.
 *
 * Usage (admin repo root):
 *   node scripts/seo-aug-2026/patch-icelab-testimonial.mjs --dry-run
 *   node scripts/seo-aug-2026/patch-icelab-testimonial.mjs
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

const TESTIMONIAL = {
  _key: "icl-testimonial",
  _type: "testimonialBlock",
  authorName: "IceLab",
  authorRole: {
    _type: "localizedString",
    uk: "виробник сухого льоду, Київ і Львів",
    ru: "производитель сухого льда, Киев и Львов",
    en: "dry ice manufacturer, Kyiv and Lviv",
  },
  quote: {
    _type: "localizedText",
    uk: "За перший місяць після запуску — понад 30 заявок із Google і великий B2B-контракт.\nКлієнт знайшов нас сам у пошуку, ми підписали договір і вже зробили перше відвантаження.\nСпрацювала саме SEO-структура сайту, а не реклама.",
    ru: "За первый месяц после запуска — более 30 заявок из Google и крупный B2B-контракт.\nКлиент нашёл нас сам в поиске, мы подписали договор и уже сделали первую отгрузку.\nСработала именно SEO-структура сайта, а не реклама.",
    en: "In the first month after launch — 30+ enquiries from Google and a large B2B contract.\nThe client found us in search on their own, we signed the deal and have already made the first shipment.\nIt was the site's SEO structure that delivered, not ads.",
  },
  rating: 5,
  reviewDate: "2026-08-22",
};

const doc = await client.fetch(`*[_type=="caseStudy" && slug.current=="icelab"][0]`);
if (!doc) throw new Error("icelab case study not found");

const backupDir = join(ROOT, "backups", "seo-round-2");
mkdirSync(backupDir, { recursive: true });
writeFileSync(
  join(backupDir, "caseStudy-icelab-testimonial.json"),
  JSON.stringify(doc, null, 2),
  "utf8",
);

const sections = (doc.sections ?? []).filter((s) => s._key !== TESTIMONIAL._key);
// Place it right after the outcome block — the reader has just seen the
// numbers, the client then confirms what they meant in practice.
const at = sections.findIndex((s) => s._key === "icl-outcome");
if (at === -1) {
  sections.push(TESTIMONIAL);
} else {
  sections.splice(at + 1, 0, TESTIMONIAL);
}

console.log("sections after patch:");
sections.forEach((s, i) => console.log(`  ${i}. ${s._type} (${s._key})`));

if (DRY) {
  console.log("\nquote.uk:\n" + TESTIMONIAL.quote.uk);
  console.log("\n--dry-run: no mutations sent");
  process.exit(0);
}
const res = await client.patch(doc._id).set({ sections }).commit();
console.log("\ncommitted:", res._id);
