// Read-only dump of the documents the SEO system 2026-09-15 changes touch.
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
for (const f of [".env.local", ".env"]) {
  const p = join(ROOT, f); if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const client = createClient({ projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN, useCdn: false, perspective: "published" });
const posts = await client.fetch(`*[_type=="blogPost"]{_id, status, "cat": category->slug.current, slugs, title, seo, excerpt, "bodyKeys": body}`);
writeFileSync(join(HERE, "backup", "blogPosts.json"), JSON.stringify(posts, null, 1));
const cats = await client.fetch(`*[_type=="blogCategory" || _type=="category"]{_id,_type,slug,title}`);
writeFileSync(join(HERE, "backup", "categories.json"), JSON.stringify(cats, null, 1));
const ind = await client.fetch(`*[_type=="industryPage"]`);
writeFileSync(join(HERE, "backup", "industryPages.json"), JSON.stringify(ind, null, 1));
console.log("posts", posts.length, "cats", cats.length, "industry", ind.length);
