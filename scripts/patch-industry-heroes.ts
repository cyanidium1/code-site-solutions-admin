/**
 * Patch script — updates only `hero.lede.uk` on the existing
 * `industryPage.medicine` and `industryPage.renovation` documents.
 *
 * Non-destructive: uses Sanity's `patch().set()` so the rest of the document
 * (manual Studio edits, other fields) stays intact.
 *
 * Required env (loaded from .env.local automatically):
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - NEXT_PUBLIC_SANITY_DATASET (defaults to "production")
 *   - SANITY_API_TOKEN          (write-access token)
 *
 * Run:
 *   npx tsx scripts/patch-industry-heroes.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@sanity/client";

function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename);
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN = process.env.SANITY_API_TOKEN;

if (!PROJECT_ID) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
if (!TOKEN) throw new Error("SANITY_API_TOKEN is required");

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: "2024-10-01",
  token: TOKEN,
  useCdn: false,
});

const PATCHES: { id: string; lede: string }[] = [
  {
    id: "industryPage.medicine",
    lede:
      "Ви отримуєте сайт клініки що починає приймати онлайн-записи з першого дня. Без вашої участі більше ніж *5 годин*: ми пишемо тексти, ставимо інтеграції з Helsi/Medesk, налаштовуємо локальне SEO. Запуск за 4–6 тижнів.",
  },
  {
    id: "industryPage.renovation",
    lede:
      "Ви отримуєте сайт ремонтної компанії з працюючим калькулятором ціни і галереєю *«до/після»*. Без вашої участі більше ніж *5 годин*: контент пишемо ми, фото додасте з телефону потім. Запуск за 4–6 тижнів — і клієнти починають записуватися самі.",
  },
];

async function main() {
  for (const p of PATCHES) {
    const result = await client
      .patch(p.id)
      .set({ "hero.lede.uk": p.lede })
      .commit();
    console.log(`✓ Patched ${result._id} (rev ${result._rev})`);
  }
}

main().catch((err) => {
  console.error("✗ Patch failed:", err);
  process.exit(1);
});
