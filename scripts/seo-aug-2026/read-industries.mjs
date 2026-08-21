import { createClient } from "@sanity/client";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2];
const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  perspective: "published",
});

const industries = await client.fetch(
  `*[_type=="industryPage"]{_id,"slug":slug.current,"seoTitleUk":seo.title.uk,"seoDescUk":seo.description.uk,"heroHeadingUk":hero.heading.uk,"ledeUk":hero.lede.uk,"sectionTypes":sections[]{_type,_key,"headingUk":heading.uk,"eyebrowUk":eyebrow.uk}}`,
);
writeFileSync(join(OUT, "industries-summary.json"), JSON.stringify(industries, null, 2), "utf8");

const medicine = await client.fetch(
  `*[_type=="industryPage" && slug.current=="medicine"][0]`,
);
writeFileSync(join(OUT, "medicine-full.json"), JSON.stringify(medicine, null, 2), "utf8");

console.log("industries:", industries.length, "medicine sections:", medicine?.sections?.length);
