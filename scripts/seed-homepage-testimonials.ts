/**
 * Seed script — uploads the homepage `testimonial` documents into Sanity.
 * The homepage's PullQuoteSwiper queries
 *   *[_type == "testimonial" && featured == true] | order(order asc, ...)
 * so anything seeded with `featured: true` shows up immediately.
 *
 * Idempotent: each doc uses `createOrReplace` with a fixed `_id`, so re-running
 * this script overwrites the existing documents instead of creating duplicates.
 *
 * Required env (loaded from .env.local / .env automatically):
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - NEXT_PUBLIC_SANITY_DATASET   (defaults to "production")
 *   - SANITY_API_TOKEN             (write-access token)
 *
 * Run:
 *   npm run seed:homepage-testimonials
 *
 * NOTE: `mockupLeft` and `mockupRight` image fields are intentionally left
 * empty — founder hasn't supplied screenshots yet. Same TODO posture as the
 * existing case-study seeds. Frontend conditionally renders the mockups, so
 * the slider gracefully falls back to a quote-only layout in the meantime.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@sanity/client";

/* ──────────────────────────── env loader ──────────────────────────────── */

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

/* ──────────────────────────── helpers ─────────────────────────────────── */

type LocaleString = { uk?: string; en?: string };

function bi(uk: string, en: string): LocaleString {
  return { uk, en };
}

/* ──────────────────────────── content ─────────────────────────────────── */

const NBYG_CASE_STUDY_ID = "caseStudy.nbyg-kobenhavn";

/** Mirrors the homepage default quote that PullQuote used before the swap. */
const NBYG_TESTIMONIAL = {
  _id: "testimonial.nbyg-kobenhavn",
  _type: "testimonial",
  authorName: "Søren Hansen",
  authorRole: bi(
    "Власник, NBYG København Aps",
    "Owner, NBYG København Aps",
  ),
  authorInitials: "SH",
  quote: bi(
    "Перед запуском нового сайту у нас було 3 заявки на місяць. Після запуску — 24 у перший місяць. Команда написала контент, провела QA, запустила. Нам залишилось лише отримати ключі.",
    "Before launching the new site we had 3 inquiries a month. After launch — 24 in our first month live. The team writes content, runs the QA, and ships. We just got the keys.",
  ),
  caseRef: {
    _type: "reference",
    _ref: NBYG_CASE_STUDY_ID,
  },
  caseLabel: bi("Подивитись повний кейс", "See the full case study"),
  featured: true,
  order: 0,
  // TODO: upload mockupLeft (phone) + mockupRight (laptop) screenshots
};

/**
 * Second placeholder testimonial. Kept `featured: false` so it stays in the
 * collection but doesn't render on the homepage until copy + assets land.
 * Confirms the `featured == true` filter is wired correctly.
 */
const PLACEHOLDER_TESTIMONIAL = {
  _id: "testimonial.placeholder-2",
  _type: "testimonial",
  authorName: "TBD",
  authorRole: bi("Роль клієнта", "Client role"),
  authorInitials: "TB",
  quote: bi(
    "Заглушка для другого тестімоніалу. Заповнити, коли клієнт надасть копію.",
    "Placeholder for the second testimonial. Fill in when the client provides copy.",
  ),
  featured: false,
  order: 10,
};

/* ──────────────────────────── main ────────────────────────────────────── */

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId) {
    console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
    process.exit(1);
  }
  if (!token) {
    console.error("✗ Missing SANITY_API_TOKEN");
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  const docs = [NBYG_TESTIMONIAL, PLACEHOLDER_TESTIMONIAL];

  console.log(
    `→ Seeding ${docs.length} testimonial doc(s) into ${projectId}/${dataset} (${apiVersion})`,
  );

  for (const doc of docs) {
    try {
      const result = await client.createOrReplace(doc);
      console.log(`  ✓ ${result._id} (featured=${doc.featured})`);
      if (!("mockupLeft" in doc)) {
        console.log(
          `    TODO: upload mockupLeft (phone) and mockupRight (laptop) for ${doc._id}`,
        );
      }
    } catch (err) {
      console.error(`  ✗ ${doc._id} failed:`, err);
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error("✗ Fatal:", err);
  process.exit(1);
});
