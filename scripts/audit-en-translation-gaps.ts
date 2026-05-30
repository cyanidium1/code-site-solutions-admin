/**
 * EN translation-gap audit.
 *
 * Walks every published industryPage, caseStudy, and blogPost; surfaces
 * each field that has UK content but no EN counterpart. Emits a markdown
 * report to stdout.
 *
 * Detects two patterns:
 *   1. Localized objects shaped { uk, ru?, en? } where uk is non-empty
 *      and en is missing/empty/whitespace.
 *   2. Shadow-field pairs (blog post style): if `<key>` is a non-empty
 *      string and `<key>En` is missing/empty at the same object level.
 *   3. Portable-text arrays of blocks ([{ _type: 'block', children: [...] }]):
 *      each block becomes one row, UK text = concatenated child spans.
 *
 * Run:  npx tsx scripts/audit-en-translation-gaps.ts > ../Frontend/docs/audits/2026-05-30-en-translation-gaps.md
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

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

/* ──────────────────────────── walker ──────────────────────────────────── */

type Gap = { path: string; ukText: string; words: number };

const MAX_PREVIEW_CHARS = 320;

/**
 * Scalar fields the schemas pair with a `<key>En` shadow. Keep in sync
 * with: blogPost.ts (title, titleEn / lede, ledeEn / eyebrow, eyebrowEn /
 * metaTitle, metaTitleEn / metaDescription, metaDescriptionEn).
 * Portable-text shadows (body, text, answer) are detected structurally
 * by `isPortableTextArray` — no need to list them here.
 */
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

function wordCount(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function truncate(s: string): string {
  const collapsed = s.replace(/\s+/g, " ").trim();
  if (collapsed.length <= MAX_PREVIEW_CHARS) return collapsed;
  return `${collapsed.slice(0, MAX_PREVIEW_CHARS)}… (+${collapsed.length - MAX_PREVIEW_CHARS} chars)`;
}

function escapeMd(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/** Concatenate child spans of a portable-text block into a single string. */
function blockText(block: Record<string, unknown>): string {
  const children = block.children;
  if (!Array.isArray(children)) return "";
  return children
    .map((c) => (isPlainObject(c) && typeof c.text === "string" ? c.text : ""))
    .join("");
}

/** True if value looks like a portable-text array (array of {_type:'block'}). */
function isPortableTextArray(v: unknown): v is Array<Record<string, unknown>> {
  return Array.isArray(v) && v.some((x) => isPlainObject(x) && x._type === "block");
}

/** True if object looks like a localizedString/localizedText. */
function isLocalizedShape(v: Record<string, unknown>): boolean {
  return "uk" in v || "ru" in v || "en" in v;
}

function visit(value: unknown, path: string, gaps: Gap[]): void {
  // Arrays: recurse with [i]; specially handle portable-text arrays as ONE
  // gap-per-block when ALL blocks are missing translation (we treat the
  // whole UK body as un-translated until a shadow field exists).
  if (Array.isArray(value)) {
    if (isPortableTextArray(value)) {
      // Portable-text body without a shadow EN array is handled by the
      // shadow-field pair detection in the parent. Here we just recurse
      // into block children for nested localized objects (rare).
      value.forEach((item, i) => visit(item, `${path}[${i}]`, gaps));
      return;
    }
    value.forEach((item, i) => visit(item, `${path}[${i}]`, gaps));
    return;
  }
  if (!isPlainObject(value)) return;

  // Pattern 1: localized object — { uk, ru?, en? }
  if (isLocalizedShape(value)) {
    const uk = value.uk;
    const en = value.en;
    if (isNonEmptyString(uk) && isEmptyOrMissing(en)) {
      gaps.push({
        path: `${path}.en`,
        ukText: uk,
        words: wordCount(uk),
      });
      return; // don't recurse into uk/ru/en strings
    }
    // localized object that's already translated — nothing more to do
    return;
  }

  // Pattern 2: shadow-field pairs. Two sub-cases:
  //   (a) Portable-text bodies — ANY field whose value is a portable-text
  //       array gets paired with `<key>En`. The EN shadow may not exist
  //       in the doc data at all (Sanity only writes it when populated),
  //       so we don't gate on key presence here. Known shadows in the
  //       schema: body/bodyEn (imageTextBlock), text/textEn
  //       (reasonsBlock.reasons[]), answer/answerEn (faqBlock.items[]).
  //   (b) Known scalar shadow pair — blogPost top-level shadows. Gate
  //       on KNOWN_STRING_SHADOWS *AND* on the shadow key existing in
  //       this object (`enKey in value`). The presence check matters
  //       because the same field name (e.g. `title`, `eyebrow`) is also
  //       used by nested custom blocks like tldrBox/ctaCallout which
  //       have NO shadow defined in the schema; those translate by
  //       duplicating the whole block into bodyEn[], not by per-field
  //       shadowing.
  const entries = Object.entries(value);
  for (const [k, v] of entries) {
    if (k.endsWith("En")) continue; // EN side handled when we hit the UK side
    const enKey = `${k}En`;
    const enVal = (value as Record<string, unknown>)[enKey];

    // (a) Portable-text shadow pair — always check, even if enKey absent.
    if (isPortableTextArray(v)) {
      const enIsEmpty =
        enVal === undefined ||
        enVal === null ||
        (Array.isArray(enVal) && enVal.length === 0);
      if (enIsEmpty) {
        v.forEach((block, i) => {
          if (isPlainObject(block) && block._type === "block") {
            const text = blockText(block);
            if (isNonEmptyString(text)) {
              gaps.push({
                path: `${path}.${enKey}[block:${i}]`,
                ukText: text,
                words: wordCount(text),
              });
            }
          }
        });
      }
      continue;
    }

    // (b) Known scalar string shadow pair — must be in KNOWN_STRING_SHADOWS
    // AND the shadow key must already exist in this object (proving the
    // schema actually defines a shadow at this level).
    if (
      isNonEmptyString(v) &&
      KNOWN_STRING_SHADOWS.has(k) &&
      enKey in value &&
      isEmptyOrMissing(enVal)
    ) {
      gaps.push({ path: `${path}.${enKey}`, ukText: v, words: wordCount(v) });
      continue;
    }
  }

  // Recurse into every child (this surfaces nested localized objects and
  // shadow pairs deeper in the tree). Skip `*En` keys entirely — they
  // hold EN content that we've already accounted for from the UK side;
  // recursing in would re-walk the EN copy and false-positive every
  // nested string as a "UK gap".
  for (const [k, v] of entries) {
    if (k === "_id" || k === "_type" || k === "_rev" || k === "_createdAt" || k === "_updatedAt" || k === "_key") continue;
    if (k.endsWith("En")) continue;
    visit(v, path ? `${path}.${k}` : k, gaps);
  }
}

/* ──────────────────────────── report ──────────────────────────────────── */

type DocAudit = {
  id: string;
  type: string;
  slug?: string;
  status?: string;
  hasAnyEn: boolean;
  gaps: Gap[];
};

function auditDoc(doc: Record<string, unknown>): DocAudit {
  const gaps: Gap[] = [];
  visit(doc, "", gaps);
  // Detect "any EN content present" by walking again for any non-empty .en
  // or *En field — coarse but enough to flag half-translated docs.
  let hasAnyEn = false;
  (function detect(v: unknown) {
    if (Array.isArray(v)) { v.forEach(detect); return; }
    if (!isPlainObject(v)) return;
    for (const [k, val] of Object.entries(v)) {
      if ((k === "en" || k.endsWith("En")) && isNonEmptyString(val)) hasAnyEn = true;
      if (k === "en" && Array.isArray(val) && val.length > 0) hasAnyEn = true;
      if (k.endsWith("En") && Array.isArray(val) && val.length > 0) hasAnyEn = true;
      detect(val);
    }
  })(doc);
  return {
    id: String(doc._id ?? ""),
    type: String(doc._type ?? ""),
    slug: ((doc.slug as Record<string, unknown> | undefined)?.current as string | undefined) ?? undefined,
    status: doc.status as string | undefined,
    hasAnyEn,
    gaps,
  };
}

function emitDocSection(a: DocAudit): string {
  if (a.gaps.length === 0) return "";
  const words = a.gaps.reduce((s, g) => s + g.words, 0);
  const half = a.hasAnyEn ? " — **half-translated**" : "";
  const lines: string[] = [];
  lines.push(`### \`${a.id}\` (${a.slug ?? "no slug"})${half}`);
  lines.push(`- Status: \`${a.status ?? "n/a"}\``);
  lines.push(`- Field gaps: ${a.gaps.length}`);
  lines.push(`- UK word count: ~${words}`);
  lines.push("");
  lines.push("| Field path | UK source text |");
  lines.push("| --- | --- |");
  for (const g of a.gaps) {
    lines.push(`| \`${g.path}\` | ${escapeMd(truncate(g.ukText))} |`);
  }
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const today = "2026-05-30";

  const [industries, cases, blogs] = await Promise.all([
    client.fetch<Record<string, unknown>[]>(
      `*[_type == "industryPage" && status == "published"] | order(slug.current asc)`,
    ),
    client.fetch<Record<string, unknown>[]>(
      `*[_type == "caseStudy" && status == "published"] | order(slug.current asc)`,
    ),
    client.fetch<Record<string, unknown>[]>(
      `*[_type == "blogPost" && status == "published"] | order(slug.current asc)`,
    ),
  ]);

  const auditGroup = (docs: Record<string, unknown>[]) =>
    docs.map(auditDoc).filter((a) => a.gaps.length > 0);

  const indGaps = auditGroup(industries);
  const caseGaps = auditGroup(cases);
  const blogGaps = auditGroup(blogs);

  const sumGroup = (group: DocAudit[]) => ({
    docs: group.length,
    fields: group.reduce((s, a) => s + a.gaps.length, 0),
    words: group.reduce((s, a) => s + a.gaps.reduce((t, g) => t + g.words, 0), 0),
    half: group.filter((a) => a.hasAnyEn).length,
  });

  const sInd = sumGroup(indGaps);
  const sCase = sumGroup(caseGaps);
  const sBlog = sumGroup(blogGaps);

  const out: string[] = [];
  out.push(`# EN Translation Gaps — ${today}`);
  out.push("");
  out.push(`Source: \`Sanity/scripts/audit-en-translation-gaps.ts\` against Sanity dataset \`${process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production"}\`. Re-run after publishing translations to refresh.`);
  out.push("");
  out.push("## Summary");
  out.push("");
  out.push("| Type | Docs with gaps | Field gaps | UK words | Half-translated |");
  out.push("| --- | --- | --- | --- | --- |");
  out.push(`| Industries | ${sInd.docs} / ${industries.length} | ${sInd.fields} | ${sInd.words.toLocaleString()} | ${sInd.half} |`);
  out.push(`| Case studies | ${sCase.docs} / ${cases.length} | ${sCase.fields} | ${sCase.words.toLocaleString()} | ${sCase.half} |`);
  out.push(`| Blog posts | ${sBlog.docs} / ${blogs.length} | ${sBlog.fields} | ${sBlog.words.toLocaleString()} | ${sBlog.half} |`);
  out.push(`| **Total** | **${sInd.docs + sCase.docs + sBlog.docs}** | **${sInd.fields + sCase.fields + sBlog.fields}** | **${(sInd.words + sCase.words + sBlog.words).toLocaleString()}** | **${sInd.half + sCase.half + sBlog.half}** |`);
  out.push("");

  if (indGaps.length) {
    out.push("## Industries");
    out.push("");
    for (const a of indGaps) out.push(emitDocSection(a));
  } else {
    out.push("## Industries\n\n*(no gaps — every published industryPage has EN.)*\n");
  }

  if (caseGaps.length) {
    out.push("## Case Studies");
    out.push("");
    for (const a of caseGaps) out.push(emitDocSection(a));
  } else {
    out.push("## Case Studies\n\n*(no gaps — every published caseStudy has EN.)*\n");
  }

  if (blogGaps.length) {
    out.push("## Blog Posts");
    out.push("");
    for (const a of blogGaps) out.push(emitDocSection(a));
  } else {
    out.push("## Blog Posts\n\n*(no gaps — every published blogPost has EN.)*\n");
  }

  process.stdout.write(out.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
