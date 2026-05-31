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
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function main() {
  const [industries, cases, blogs] = await Promise.all([
    client.fetch<Array<{ slug: string; hasEnTitle: boolean; hasEnHero: boolean }>>(`
      *[_type == "industryPage" && status == "published" && defined(slug.current)]{
        "slug": slug.current,
        "hasEnTitle": defined(title.en) && title.en != "",
        "hasEnHero": defined(hero.heading.en) && hero.heading.en != ""
      } | order(slug asc)
    `),
    client.fetch<Array<{ slug: string; hasEnTitle: boolean; hasEnHero: boolean }>>(`
      *[_type == "caseStudy" && status == "published" && defined(slug.current)]{
        "slug": slug.current,
        "hasEnTitle": defined(title.en) && title.en != "",
        "hasEnHero": defined(hero.heading.en) && hero.heading.en != ""
      } | order(slug asc)
    `),
    client.fetch<Array<{ uaSlug: string; enSlug: string | null; hasEnTitle: boolean; hasEnLede: boolean }>>(`
      *[_type == "blogPost" && status == "published" && defined(slug.current)]{
        "uaSlug": slug.current,
        "enSlug": slugEn.current,
        "hasEnTitle": defined(titleEn) && titleEn != "",
        "hasEnLede": defined(ledeEn) && ledeEn != ""
      } | order(uaSlug asc)
    `),
  ]);

  console.log("=== INDUSTRY PAGES ===");
  console.table(industries);
  console.log("\nEN-available industry slugs:");
  console.log(industries.filter((i) => i.hasEnTitle && i.hasEnHero).map((i) => i.slug));

  console.log("\n=== CASE STUDIES ===");
  console.table(cases);
  console.log("\nEN-available case slugs:");
  console.log(cases.filter((c) => c.hasEnTitle && c.hasEnHero).map((c) => c.slug));

  console.log("\n=== BLOG POSTS ===");
  console.table(blogs);
  console.log("\nEN-available blog map (uaSlug -> enSlug):");
  console.log(
    Object.fromEntries(
      blogs
        .filter((b) => b.enSlug && b.hasEnTitle && b.hasEnLede)
        .map((b) => [b.uaSlug, b.enSlug]),
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
