/**
 * Domlivo-engine cluster interlinking, 07.11.2026. Idempotent (guard href).
 * - the two new EN articles link each other;
 * - estate-agent cost/examples posts link the case page;
 * - the existing UA/RU post «Сайт для агентства нерухомості» gets a case
 *   paragraph in body.uk and body.ru (its EN body got estate links earlier).
 * Usage: node interlink-domlivo-case-2026-11-07.mjs [--dry-run]
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
loadEnvFile(join(ROOT, ".env.local")); loadEnvFile(join(ROOT, ".env"));
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!TOKEN) throw new Error("token missing");
const client = createClient({ projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", token: TOKEN, useCdn: false });

let seq = 0;
const key = () => `dl${(seq++).toString(36)}${Date.now().toString(36).slice(-5)}`;
function block(parts) {
  const children = []; const markDefs = [];
  for (const part of parts) {
    if (typeof part === "string") children.push({ _key: key(), _type: "span", text: part, marks: [] });
    else {
      const dk = key();
      markDefs.push({ _key: dk, _type: "link", href: part.href });
      children.push({ _key: key(), _type: "span", text: part.t, marks: [dk] });
    }
  }
  return { _key: key(), _type: "block", style: "normal", markDefs, children };
}
const NOW = "2026-11-07T16:00:00.000Z";

const JOBS = [
  {
    id: "glseo2026-real-estate-templates-vs-custom", field: "body.en",
    guard: "/en/blog/real-estate-leads-from-chatgpt",
    parts: ["Related: the measured side of the same argument — ",
      { t: "how our platform gets 28% of its leads from ChatGPT", href: "/en/blog/real-estate-leads-from-chatgpt" },
      ", with every number dated and sourced."],
  },
  {
    id: "glseo2026-real-estate-chatgpt-leads", field: "body.en",
    guard: "/en/blog/real-estate-website-template-vs-custom",
    parts: ["Related: why this playbook needs the right foundations — ",
      { t: "real estate website templates vs custom, honestly compared", href: "/en/blog/real-estate-website-template-vs-custom" },
      "."],
  },
  {
    id: "glseo2026-estate-agent-website-cost-uk", field: "body.en",
    guard: "/en/portfolio/domlivo",
    parts: ["If you're weighing the owned route, our reference project is ",
      { t: "Domlivo — the property platform we built and run", href: "/en/portfolio/domlivo" },
      ": ~5,900 unique visitors a month with zero ads, 8 languages, and leads from Google and ChatGPT."],
  },
  {
    id: "glseo2026-estate-agent-website-examples-uk", field: "body.en",
    guard: "/en/portfolio/domlivo",
    parts: ["And the site we hold ourselves to the same checklist on: ",
      { t: "Domlivo, the property platform we built and operate", href: "/en/portfolio/domlivo" },
      " — listing pages, split-map search and 8 languages, with its traffic numbers published."],
  },
  {
    id: "ltAug2026-sait-ahentstva-nerukhomosti", field: "body.uk",
    guard: "/portfolio/domlivo",
    parts: ["Ми не лише пишемо про сайти нерухомості — ми збудували й ведемо власну платформу: ",
      { t: "Domlivo, кейс із цифрами", href: "/portfolio/domlivo" },
      " — ~5,9 тис. відвідувачів на місяць без жодної реклами, 8 мов, 28% лідів із ChatGPT. Платформу можна запустити під вашим брендом за тиждень."],
  },
  {
    id: "ltAug2026-sait-ahentstva-nerukhomosti", field: "body.ru",
    guard: "/ru/portfolio/domlivo",
    parts: ["Мы не только пишем о сайтах недвижимости — мы построили и ведём собственную платформу: ",
      { t: "Domlivo, кейс с цифрами", href: "/ru/portfolio/domlivo" },
      " — ~5,9 тыс. посетителей в месяц без рекламы, 8 языков, 28% лидов из ChatGPT. Платформу можно запустить под вашим брендом за неделю."],
  },
];

for (const job of JOBS) {
  const d = await client.fetch("*[_id==$id][0]{_id, body}", { id: job.id });
  if (!d) { console.log(`SKIP ${job.id}: not found`); continue; }
  const arrPath = job.field.split(".");
  const arr = d.body?.[arrPath[1]];
  if (!arr || !arr.length) { console.log(`SKIP ${job.id} ${job.field}: empty body`); continue; }
  if (JSON.stringify(arr).includes(job.guard)) { console.log(`SKIP ${job.id} ${job.field}: already linked`); continue; }
  seq = 0;
  const b = block(job.parts);
  if (DRY) { console.log(`DRY ${job.id} ${job.field}: +1 block`); continue; }
  const res = await client.patch(job.id).append(job.field, [b]).set({ updatedAt: NOW }).commit();
  console.log(`OK ${job.id} ${job.field}: blocks now ${res.body[arrPath[1]].length}`);
}
