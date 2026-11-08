/**
 * Links to the rebuilt /sites-for/real-estate service page (08.11.2026)
 * from the three Domlivo-cluster articles and the UA/RU agency post.
 * Idempotent (guard href per body). Anchors per the SEO brief.
 * Usage: node interlink-realestate-service-2026-11-08.mjs [--dry-run]
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
const key = () => `rs${(seq++).toString(36)}${Date.now().toString(36).slice(-5)}`;
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
const NOW = "2026-11-08T14:00:00.000Z";
const EN_SVC = "/en/sites-for/real-estate";

const JOBS = [
  {
    id: "glseo2026-real-estate-website-design", field: "body.en", guard: EN_SVC,
    parts: ["Want these principles applied to your own agency site? That's our ",
      { t: "estate agent website design service", href: EN_SVC },
      " — template on our engine from €1,500, custom from €2,500, the full Domlivo level from €3,900, all one-off."],
  },
  {
    id: "glseo2026-real-estate-templates-vs-custom", field: "body.en", guard: EN_SVC,
    parts: ["If you've read this far and want the decision made with you rather than by a marketplace: ",
      { t: "our estate agent website design and development page", href: EN_SVC },
      " lays out both routes with one-off prices — engine template from €1,500, custom from €2,500."],
  },
  {
    id: "glseo2026-real-estate-chatgpt-leads", field: "body.en", guard: EN_SVC,
    parts: ["To get this machine built for your agency, start at ",
      { t: "the estate agent website design & development service", href: EN_SVC },
      " — the playbook above ships with the Domlivo-level tier."],
  },
  {
    id: "ltAug2026-sait-ahentstva-nerukhomosti", field: "body.uk", guard: "/sites-for/real-estate",
    parts: ["Якщо потрібен не лише розбір, а готовий сайт: ",
      { t: "створення сайту нерухомості — наша послуга", href: "/sites-for/real-estate" },
      " — лендінг на движку від €1 500, свій дизайн від €2 500, рівень Domlivo від €3 900 разово."],
  },
  {
    id: "ltAug2026-sait-ahentstva-nerukhomosti", field: "body.ru", guard: "/ru/sites-for/real-estate",
    parts: ["Если нужен не только разбор, а готовый сайт: ",
      { t: "создание сайта недвижимости — наша услуга", href: "/ru/sites-for/real-estate" },
      " — лендинг на движке от €1 500, свой дизайн от €2 500, уровень Domlivo от €3 900 разово."],
  },
];

for (const job of JOBS) {
  const d = await client.fetch("*[_id==$id][0]{_id, body}", { id: job.id });
  if (!d) { console.log(`SKIP ${job.id}: not found`); continue; }
  const locale = job.field.split(".")[1];
  const arr = d.body?.[locale];
  if (!arr || !arr.length) { console.log(`SKIP ${job.id} ${job.field}: empty`); continue; }
  if (JSON.stringify(arr).includes(`"${job.guard}"`)) { console.log(`SKIP ${job.id} ${job.field}: already linked`); continue; }
  seq = 0;
  const b = block(job.parts);
  if (DRY) { console.log(`DRY ${job.id} ${job.field}: +1 block`); continue; }
  const res = await client.patch(job.id).append(job.field, [b]).set({ updatedAt: NOW }).commit();
  console.log(`OK ${job.id} ${job.field}: blocks now ${res.body[locale].length}`);
}
