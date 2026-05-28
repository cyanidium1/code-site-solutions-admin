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
const doc = await client.fetch(`*[_type=="caseStudy" && slug.current=="efedra-clinic"][0]{
  _id,
  status,
  "subheadingUk": hero.subheading.uk,
  "heroImageUrl": hero.heroImage.image.asset->url,
  "heroImageAltUk": hero.heroImage.alt.uk,
  "centeredSections": sections[_type=="imageTextBlock" && variant=="centered"]{
    "eyebrow": eyebrow.uk,
    variant,
    centeredLayout,
    "imageUrl": image.asset->url,
    "image2Url": image2.asset->url
  },
  "solutionBullet7Uk": sections[_type=="imageTextBlock" && variant=="side-with-list"][0].bulletList[6].uk
}`);

console.log(JSON.stringify(doc, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
