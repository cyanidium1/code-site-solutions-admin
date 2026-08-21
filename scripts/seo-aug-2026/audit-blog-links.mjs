/**
 * Read-only audit: which internal links exist in each blogPost body.uk,
 * and which target phrases from the SEO link plan already appear in text.
 */
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  perspective: "published",
});

const posts = await client.fetch(
  `*[_type=="blogPost"]{ "slug": slugs.uk.current, "body": body.uk, relatedPostSlugs }`,
);

for (const p of posts.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const links = new Set();
  for (const block of p.body ?? []) {
    for (const def of block.markDefs ?? []) {
      if (def._type === "link" && def.href?.startsWith("/")) links.add(def.href);
    }
  }
  console.log(
    p.slug,
    "| links:",
    [...links].join(", ") || "(none)",
    "| related:",
    (p.relatedPostSlugs ?? []).length,
  );
}
