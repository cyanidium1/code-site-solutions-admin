import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
for (const f of [".env.local",".env"]) { if(!existsSync(f)) continue;
  for (const l of readFileSync(f,"utf8").split("\n")) { const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if(m&&process.env[m[1]]===undefined) process.env[m[1]]=m[2].replace(/^["']|["']$/g,""); } }
const c = createClient({projectId:"4lk0x7o9",dataset:"production",apiVersion:"2024-10-01",token:process.env.SANITY_API_WRITE_TOKEN||process.env.SANITY_API_TOKEN,useCdn:false});
// Without the colon the phrase reads as gibberish in both languages;
// the rest of the cluster uses the "Термін це: …" shape.
const r = await c.patch("glos2026-shcho-take-domen").set({
  "metaTitle.uk": "Домен це: що таке і як обрати для сайту",
  "metaTitle.ru": "Домен это: что такое и как выбрать для сайта",
}).commit();
console.log("uk:", r.metaTitle.uk); console.log("ru:", r.metaTitle.ru);
