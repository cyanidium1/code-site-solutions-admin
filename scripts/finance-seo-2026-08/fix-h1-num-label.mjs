import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
for (const f of [".env.local", ".env"]) { if(!existsSync(f)) continue;
  for (const l of readFileSync(f,"utf8").split("\n")) { const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if(m&&process.env[m[1]]===undefined) process.env[m[1]]=m[2].replace(/^["']|["']$/g,""); } }
const c = createClient({projectId:"4lk0x7o9",dataset:"production",apiVersion:"2024-10-01",token:process.env.SANITY_API_WRITE_TOKEN||process.env.SANITY_API_TOKEN,useCdn:false});
// "applications per month" is a literal rendering of "заявок на місяць"; in UK
// English on a finance page it reads as loan or job applications.
const r = await c.patch("lOTgaDd8FU4wgJ8F4KCGuB").set({"hero.h1NumLabel.en":"enquiries\nper month"}).commit();
console.log("patched h1NumLabel.en ->", r.hero.h1NumLabel.en.replace("\n"," "));
