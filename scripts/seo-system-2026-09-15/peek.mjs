import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
for (const line of readFileSync(".env","utf8").split("\n")) { const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if(m) process.env[m[1]]=m[2].replace(/^["']|["']$/g,""); }
const c = createClient({ projectId:"4lk0x7o9", dataset:"production", apiVersion:"2024-10-01", token:process.env.SANITY_API_WRITE_TOKEN, useCdn:false, perspective:"published" });
const q = process.argv[2];
console.log(JSON.stringify(await c.fetch(q), null, 1));
