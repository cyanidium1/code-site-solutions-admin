import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
export const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
for (const f of [".env.local", ".env"]) {
  const p = join(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
export const client = createClient({
  projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false, perspective: "raw",
});
export function backup(name, data) {
  const dir = join(HERE, "backup"); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}-${Date.now()}.json`), JSON.stringify(data, null, 1));
}
