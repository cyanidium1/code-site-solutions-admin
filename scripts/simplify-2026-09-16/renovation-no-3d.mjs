// Renovation page: the studio never built 3D visualisers, VR tours or SMS
// reminders (owner, 17.09.2026). Remove every promise of them.
//   node scripts/simplify-2026-09-16/renovation-no-3d.mjs [--dry-run]
import { client, backup } from "./lib.mjs";
const DRY = process.argv.includes("--dry-run");
const ID = "lOTgaDd8FU4wgJ8F4KCHn9";
const doc = await client.getDocument(ID);
const BAD = /3D|3Д|VR|SMS|Planoplan|SweetHome/i;
const txt = (o) => [o?.uk, o?.ru, o?.en].filter(Boolean).join(" ");
const log = [];
const clone = structuredClone(doc.sections);

for (const sec of clone) {
  if (sec._type === "comparisonBlock") {
    for (const t of sec.tiers ?? []) {
      for (const k of ["includes", "excludes"]) {
        const before = (t[k] ?? []).length;
        t[k] = (t[k] ?? []).filter((it) => !BAD.test(txt(it)));
        if (t[k].length !== before) log.push(`tier ${txt(t.title).slice(0, 30)} ${k}: -${before - t[k].length}`);
      }
    }
  }
  if (sec._type === "servicesBlock") {
    const fb = (sec.features ?? []).length;
    sec.features = (sec.features ?? []).filter((f) => !BAD.test(txt(f.title)));
    if (sec.features.length !== fb) log.push(`features: -${fb - sec.features.length}`);
    for (const f of sec.features) {
      const b = (f.items ?? []).length;
      f.items = (f.items ?? []).filter((it) => !BAD.test(txt(it)));
      if (f.items.length !== b) log.push(`feature ${txt(f.title).slice(0, 20)} items: -${b - f.items.length}`);
    }
    const ib = (sec.integrations ?? []).length;
    sec.integrations = (sec.integrations ?? []).filter((it) => !BAD.test(txt(it)));
    if (sec.integrations.length !== ib) log.push(`integrations: -${ib - sec.integrations.length}`);
    if (sec.integrationsSub) {
      sec.integrationsSub = {
        ...sec.integrationsSub,
        uk: sec.integrationsSub.uk?.replace(" Клієнт — SMS-підтвердження візиту замірника.", ""),
        ru: sec.integrationsSub.ru?.replace(" Клиент — SMS-подтверждение визита замерщика.", ""),
        en: sec.integrationsSub.en?.replace(" The client gets an SMS confirming the estimator's visit.", ""),
      };
      log.push("integrationsSub: SMS sentence removed");
    }
  }
  if (sec._type === "faqBlock") {
    for (const it of sec.items ?? []) {
      for (const lang of ["uk", "ru", "en"]) {
        for (const block of it.answer?.[lang] ?? []) {
          for (const ch of block.children ?? []) {
            if (typeof ch.text !== "string") continue;
            const next = ch.text
              .replace("Преміум з 3D-візуалізатором — 8–10 тижнів", "Преміум — 8–10 тижнів")
              .replace("Премиум с 3D-визуализатором — 8–10 недель", "Премиум — 8–10 недель")
              .replace("Enterprise with a 3D visualiser — 8–10 weeks", "Enterprise — 8–10 weeks")
              .replace(" 3D-візуалізатор Planoplan: $500–1 000.", "")
              .replace(" 3D-визуализатор Planoplan: $500–1 000.", "")
              .replace(" 3D visualiser (Planoplan): £500–1,000.", "");
            if (next !== ch.text) { ch.text = next; log.push(`faq ${lang}: text fixed`); }
          }
        }
      }
    }
  }
}

const left = JSON.stringify(clone).match(/[^"]{0,40}(3D|VR-|VR tour|SMS|Planoplan|SweetHome)[^"]{0,40}/gi);
console.log(log.join("\n"));
console.log("left:", left);
if (DRY) process.exit(0);
backup("renovation-no-3d", doc);
await client.patch(ID).set({ sections: clone }).commit();
console.log("committed");
