/**
 * Upload Domlivo screenshots as Sanity image assets for the blog articles.
 * Prints asset _id per file. Sanity dedupes by content hash — safe to re-run.
 * Usage: node upload-domlivo-shots.mjs <file...>
 */
import { createClient } from "@sanity/client";
import { createReadStream, readFileSync, existsSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
function loadEnvFile(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvFile(join(ROOT, ".env.local")); loadEnvFile(join(ROOT, ".env"));
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
const client = createClient({ projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", token: TOKEN, useCdn: false });

for (const f of process.argv.slice(2)) {
  const asset = await client.assets.upload("image", createReadStream(f), { filename: basename(f) });
  console.log(`${basename(f)} -> ${asset._id} (${asset.metadata?.dimensions?.width}x${asset.metadata?.dimensions?.height})`);
}
