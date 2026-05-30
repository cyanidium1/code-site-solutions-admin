/**
 * Extract unique UK strings from Sanity docs.
 *
 * For each <docId> on the command line, walks the doc and collects every
 * non-empty UK string that lacks an EN counterpart. Deduplicated, with
 * FULL text (no truncation). Output is a single JSON object:
 *
 *   {
 *     "<docId>": { "<uk-string>": "" , ... },
 *     ...
 *   }
 *
 * Stdout is intended to be piped or saved as a translation-stub file
 * the translator fills in.
 *
 * Usage:
 *   npx tsx scripts/extract-uk-strings.ts <docId> [<docId> ...]
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@sanity/client";

function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const KNOWN_STRING_SHADOWS = new Set(["title", "lede", "eyebrow", "metaTitle", "metaDescription"]);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}
function isEmptyOrMissing(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string" && v.trim().length === 0) return true;
  return false;
}
function isLocalizedShape(v: Record<string, unknown>): boolean {
  return "uk" in v || "ru" in v || "en" in v;
}

function walk(node: unknown, set: Set<string>): void {
  if (Array.isArray(node)) {
    node.forEach((item) => walk(item, set));
    return;
  }
  if (!isPlainObject(node)) return;

  if (isLocalizedShape(node)) {
    const uk = node.uk;
    const en = node.en;
    if (isNonEmptyString(uk) && isEmptyOrMissing(en)) {
      set.add(uk);
    }
    return;
  }

  for (const [k, v] of Object.entries(node)) {
    if (k.endsWith("En")) continue;
    if (!KNOWN_STRING_SHADOWS.has(k)) continue;
    const enKey = `${k}En`;
    if (!(enKey in node)) continue;
    if (isNonEmptyString(v) && isEmptyOrMissing(node[enKey])) {
      set.add(v);
    }
  }

  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("_")) continue;
    if (k.endsWith("En")) continue;
    walk(v, set);
  }
}

async function main() {
  const docIds = process.argv.slice(2);
  if (!docIds.length) {
    console.error("Usage: npx tsx scripts/extract-uk-strings.ts <docId> [<docId> ...]");
    process.exit(1);
  }

  const out: Record<string, Record<string, string>> = {};
  for (const id of docIds) {
    const doc = await client.getDocument(id);
    if (!doc) {
      console.error(`✗ ${id} not found`);
      continue;
    }
    const set = new Set<string>();
    walk(doc, set);
    const sorted = [...set].sort();
    out[id] = Object.fromEntries(sorted.map((s) => [s, ""]));
  }
  process.stdout.write(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
