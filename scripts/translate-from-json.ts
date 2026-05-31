/**
 * Generic UK→EN translation patcher.
 *
 * Reads `Sanity/translations/<docId>.json` (a `{ strings: { uk: en } }`
 * map plus optional metadata), walks the doc in Sanity, and emits a
 * patch that fills every `{uk, ru?, en?}` localized object whose `uk`
 * matches a translation entry.
 *
 * Dry-run by default. Pass `--apply` to commit. Non-destructive: only
 * sets `.en` fields that are currently empty/missing; never overwrites
 * existing EN content or touches UK content.
 *
 * Limits (v1):
 *   - Localized objects (`{uk, ru?, en?}`) only.
 *   - Known scalar shadow fields (titleEn / ledeEn / metaTitleEn /
 *     metaDescriptionEn / eyebrowEn) when matched by UK key.
 *   - Portable-text shadow fields (bodyEn / textEn / answerEn) are
 *     NOT handled here — those need block-level authoring; use a
 *     per-doc script (e.g. translate-medicine-en.ts) for now.
 *
 * Usage:
 *   npx tsx scripts/translate-from-json.ts <docId>              # dry-run
 *   npx tsx scripts/translate-from-json.ts <docId> --apply      # commit
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@sanity/client";

/* ──────────────────────────── env loader ──────────────────────────────── */

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

/* ──────────────────────────── types + helpers ─────────────────────────── */

/**
 * Portable-text span: either a plain string (no marks) or an object
 * with a single mark key. Keep the authoring shape terse — most spans
 * are unmarked, em is the common emphasis.
 */
type PtSpan = string | { em: string } | { strong: string };
/** A block = an array of spans. A path → an array of blocks. */
type PtBlock = PtSpan[];

type TranslationFile = {
  _meta?: { docId?: string; _type?: string; voice?: string; notes?: string };
  strings: Record<string, string>;
  /**
   * Path-keyed UK+EN overrides for content corrections (not pure
   * translations). Used when a UK value is itself wrong — e.g. a
   * placeholder alt-text like "hero" or a stock string that was
   * copy-pasted across multiple cases and points at the wrong subject.
   *
   * Each entry sets BOTH `<path>.uk` and `<path>.en`. If the existing
   * UK value would be replaced, the dry-run prints a warning showing
   * the prior value so the operator can sanity-check before --apply.
   */
  overrides?: Record<string, { uk: string; en: string }>;
  /**
   * Portable-text shadow translations. Path points at a `<key>En` array
   * (e.g. `sections[_key=="sec6"].bodyEn`). Value is an array of blocks
   * — each block is an array of spans. Strings = unmarked spans; objects
   * with `em` or `strong` = marked spans. The driver assembles these
   * into Sanity-shaped `{_type:'block', children:[{_type:'span',...}]}`
   * structures and writes them under the path. Re-applying replaces the
   * whole shadow array (idempotent at the content level — block _keys
   * are regenerated each run, which is fine because nothing references
   * shadow-block keys externally).
   */
  portableText?: Record<string, PtBlock[]>;
};

const KNOWN_STRING_SHADOWS = new Set([
  "title",
  "lede",
  "eyebrow",
  "metaTitle",
  "metaDescription",
]);

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

/** Build a key-based path segment so patches survive array reordering. */
function arraySeg(item: unknown, i: number): string {
  if (isPlainObject(item) && typeof item._key === "string" && item._key.length > 0) {
    return `[_key=="${item._key}"]`;
  }
  return `[${i}]`;
}

/**
 * Construct a Sanity portable-text block from an authoring-style array
 * of spans. Strings become unmarked spans; `{em}` / `{strong}` objects
 * become marked spans. Each block + span gets a fresh `_key` per build —
 * shadow-block keys aren't referenced externally so this is fine.
 */
let __ptKeyCounter = 0;
function ptKey(prefix: string): string {
  __ptKeyCounter += 1;
  return `${prefix}${__ptKeyCounter.toString(36)}en`;
}

function buildPtBlock(spans: PtSpan[]): Record<string, unknown> {
  return {
    _type: "block",
    _key: ptKey("b"),
    style: "normal",
    markDefs: [],
    children: spans.map((s) => {
      if (typeof s === "string") {
        return { _type: "span", _key: ptKey("s"), text: s, marks: [] };
      }
      if ("em" in s) {
        return { _type: "span", _key: ptKey("s"), text: s.em, marks: ["em"] };
      }
      return { _type: "span", _key: ptKey("s"), text: s.strong, marks: ["strong"] };
    }),
  };
}

/**
 * Read a Sanity dotted-and-bracketed path against an in-memory doc.
 * Supports `foo.bar`, `arr[3]`, and `arr[_key=="abc"]`. Returns the
 * value at the path or undefined if any segment misses.
 */
function readPath(doc: unknown, path: string): unknown {
  if (!path) return doc;
  // Split on `.` but keep `[...]` brackets attached to the prior segment.
  const tokens: string[] = [];
  let buf = "";
  let depth = 0;
  for (const ch of path) {
    if (ch === "[") depth++;
    if (ch === "]") depth--;
    if (ch === "." && depth === 0) {
      if (buf) tokens.push(buf);
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf) tokens.push(buf);

  let cur: unknown = doc;
  for (const tok of tokens) {
    if (cur === undefined || cur === null) return undefined;
    // Split a token like `images[_key=="abc"][3]` into a name + bracket parts.
    const nameMatch = tok.match(/^([^[]*)/);
    const name = nameMatch ? nameMatch[1] : "";
    if (name) {
      if (!isPlainObject(cur)) return undefined;
      cur = cur[name];
    }
    const brackets = tok.matchAll(/\[(.*?)\]/g);
    for (const b of brackets) {
      const inside = b[1];
      if (cur === undefined || cur === null) return undefined;
      if (!Array.isArray(cur)) return undefined;
      const keyMatch = inside.match(/^_key=="(.+)"$/);
      if (keyMatch) {
        cur = cur.find((x) => isPlainObject(x) && x._key === keyMatch[1]);
      } else {
        const idx = Number(inside);
        if (Number.isInteger(idx)) cur = cur[idx];
        else return undefined;
      }
    }
  }
  return cur;
}

/* ──────────────────────────── walker ──────────────────────────────────── */

type SetOp = { path: string; value: string; sourceUk: string };

function walk(
  node: unknown,
  path: string,
  translations: Record<string, string>,
  setOps: SetOp[],
  unmatched: Array<{ path: string; uk: string }>,
  alreadySet: Set<string>,
): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${path}${arraySeg(item, i)}`, translations, setOps, unmatched, alreadySet));
    return;
  }
  if (!isPlainObject(node)) return;

  // Pattern A: localized object { uk, ru?, en? }
  if (isLocalizedShape(node)) {
    const uk = node.uk;
    const en = node.en;
    if (isNonEmptyString(uk) && isEmptyOrMissing(en)) {
      const enPath = `${path}.en`;
      if (alreadySet.has(enPath)) return;
      const enVal = translations[uk];
      if (enVal !== undefined) {
        alreadySet.add(enPath);
        setOps.push({ path: enPath, value: enVal, sourceUk: uk });
      } else {
        unmatched.push({ path: enPath, uk });
      }
    }
    return; // never recurse into uk/ru/en strings
  }

  // Pattern B: scalar shadow pair (e.g. blogPost.titleEn)
  const entries = Object.entries(node);
  for (const [k, v] of entries) {
    if (k.endsWith("En")) continue;
    if (!KNOWN_STRING_SHADOWS.has(k)) continue;
    const enKey = `${k}En`;
    if (!(enKey in node)) continue;
    const enVal = node[enKey];
    if (!isNonEmptyString(v) || !isEmptyOrMissing(enVal)) continue;
    const enPath = path ? `${path}.${enKey}` : enKey;
    if (alreadySet.has(enPath)) continue;
    const translation = translations[v];
    if (translation !== undefined) {
      alreadySet.add(enPath);
      setOps.push({ path: enPath, value: translation, sourceUk: v });
    } else {
      unmatched.push({ path: enPath, uk: v });
    }
  }

  // Recurse into every non-EN child
  for (const [k, v] of entries) {
    if (k.startsWith("_")) continue;
    if (k.endsWith("En")) continue;
    walk(v, path ? `${path}.${k}` : k, translations, setOps, unmatched, alreadySet);
  }
}

/* ──────────────────────────── runner ──────────────────────────────────── */

async function main() {
  const docId = process.argv[2];
  const apply = process.argv.includes("--apply");
  if (!docId) {
    console.error("Usage: npx tsx scripts/translate-from-json.ts <docId> [--apply]");
    process.exit(1);
  }

  const transPath = join(process.cwd(), "translations", `${docId}.json`);
  if (!existsSync(transPath)) {
    console.error(`✗ Translation file not found: ${transPath}`);
    process.exit(1);
  }
  const file = JSON.parse(readFileSync(transPath, "utf8")) as TranslationFile;
  if (!file.strings || typeof file.strings !== "object") {
    console.error(`✗ Translation file must have a 'strings' object`);
    process.exit(1);
  }
  console.log(`→ Loaded ${Object.keys(file.strings).length} translation entries from ${transPath}`);

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const token = process.env.SANITY_API_TOKEN;
  if (!projectId) {
    console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
    process.exit(1);
  }
  if (apply && !token) {
    console.error("✗ --apply requires SANITY_API_TOKEN");
    process.exit(1);
  }
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-10-01",
    token,
    useCdn: false,
  });

  console.log(`→ Fetching ${docId} from ${projectId}/${dataset}…`);
  const doc = await client.getDocument(docId);
  if (!doc) {
    console.error(`✗ Document ${docId} not found.`);
    process.exit(1);
  }

  const setOps: SetOp[] = [];
  const unmatched: Array<{ path: string; uk: string }> = [];
  const alreadySet = new Set<string>();

  // Process explicit overrides first so the walker doesn't try to translate
  // a UK string we're about to replace anyway. Each override sets both
  // `<path>.uk` and `<path>.en` and records the prior UK value for review.
  type Override = { path: string; uk: string; en: string; priorUk: unknown };
  const overrides: Override[] = [];
  if (file.overrides) {
    for (const [basePath, val] of Object.entries(file.overrides)) {
      const prior = readPath(doc, basePath); // {uk?, en?, ...} or undefined
      const priorUk = prior && typeof prior === "object" ? (prior as Record<string, unknown>).uk : undefined;
      overrides.push({ path: basePath, uk: val.uk, en: val.en, priorUk });
      alreadySet.add(`${basePath}.uk`);
      alreadySet.add(`${basePath}.en`);
    }
  }

  // Process portable-text shadow translations. Each entry assembles into
  // a Sanity block array under the shadow path (e.g. `...bodyEn`). Mark
  // the path as alreadySet so the walker doesn't probe into it.
  type PtOp = { path: string; blockCount: number; preview: string; priorPresent: boolean };
  const ptOps: PtOp[] = [];
  const ptValues: Record<string, unknown> = {};
  if (file.portableText) {
    for (const [shadowPath, blocks] of Object.entries(file.portableText)) {
      const built = blocks.map(buildPtBlock);
      ptValues[shadowPath] = built;
      alreadySet.add(shadowPath);
      // Compact preview: concatenate first block's child text, trim.
      const firstBlock = blocks[0] ?? [];
      const previewText = firstBlock
        .map((s) => (typeof s === "string" ? s : "em" in s ? s.em : s.strong))
        .join("");
      const prior = readPath(doc, shadowPath);
      ptOps.push({
        path: shadowPath,
        blockCount: blocks.length,
        preview: previewText.length > 100 ? `${previewText.slice(0, 97)}…` : previewText,
        priorPresent: Array.isArray(prior) && prior.length > 0,
      });
    }
  }

  walk(doc, "", file.strings, setOps, unmatched, alreadySet);

  console.log(`\n→ Would set ${setOps.length} fields via translation lookup:`);
  for (const op of setOps) {
    const preview = op.value.length > 80 ? `${op.value.slice(0, 77)}…` : op.value;
    console.log(`  · ${op.path}\n      uk: ${op.sourceUk.slice(0, 80)}\n      en: ${preview}`);
  }

  if (overrides.length) {
    console.log(`\n→ Would override ${overrides.length} fields (sets both .uk and .en):`);
    for (const o of overrides) {
      const sameUk = typeof o.priorUk === "string" && o.priorUk === o.uk;
      const tag = o.priorUk === undefined
        ? "(no prior value)"
        : sameUk
          ? "(uk unchanged)"
          : `(REPLACES prior uk: ${JSON.stringify(String(o.priorUk).slice(0, 80))})`;
      console.log(`  · ${o.path} ${tag}`);
      console.log(`      uk: ${o.uk.slice(0, 100)}`);
      console.log(`      en: ${o.en.slice(0, 100)}`);
    }
  }

  if (ptOps.length) {
    console.log(`\n→ Would write ${ptOps.length} portable-text shadow arrays (each replaces the entire shadow array):`);
    for (const op of ptOps) {
      const tag = op.priorPresent ? "(REPLACES existing EN blocks)" : "(no prior EN content)";
      console.log(`  · ${op.path}  [${op.blockCount} block${op.blockCount === 1 ? "" : "s"}]  ${tag}`);
      console.log(`      preview: ${op.preview}`);
    }
  }

  if (unmatched.length) {
    console.log(`\n→ ${unmatched.length} UK strings have no translation entry (will be left as UK fallback):`);
    for (const u of unmatched) {
      console.log(`  · ${u.path}\n      uk: ${u.uk.slice(0, 80)}`);
    }
  }

  // Look for translation entries that didn't match any UK string in the doc — these are stale.
  const matchedUk = new Set(setOps.map((op) => op.sourceUk));
  const stale = Object.keys(file.strings).filter((uk) => !matchedUk.has(uk));
  if (stale.length) {
    console.log(`\n→ ${stale.length} translation entries didn't match any UK string in the doc (stale or typo'd):`);
    for (const s of stale) console.log(`  · ${s.slice(0, 80)}`);
  }

  if (!apply) {
    console.log(`\n→ Dry-run only. Pass --apply to commit.`);
    return;
  }

  const setMap: Record<string, unknown> = Object.fromEntries(setOps.map((op) => [op.path, op.value]));
  // Override pairs: each writes both `<path>.uk` and `<path>.en`.
  for (const o of overrides) {
    setMap[`${o.path}.uk`] = o.uk;
    setMap[`${o.path}.en`] = o.en;
  }
  // Portable-text shadow arrays.
  for (const [p, v] of Object.entries(ptValues)) setMap[p] = v;
  console.log(`\n→ Applying patch with ${Object.keys(setMap).length} set ops (${setOps.length} translations + ${overrides.length * 2} override values + ${ptOps.length} portable-text arrays)…`);
  const result = await client.patch(docId).set(setMap).commit();
  console.log(`✓ Patched ${result._id} (rev ${result._rev})`);
}

main().catch((err) => {
  console.error("✗ Translate failed:", err);
  process.exit(1);
});
