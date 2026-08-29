import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
const DRY = process.argv.includes("--dry-run");
for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
const c = createClient({ projectId:"4lk0x7o9", dataset:"production", apiVersion:"2024-10-01", token, useCdn:false });

// 1) pricingPlan.corporate — the USD market price shown on /pricing and homepage tiers.
//    EN reads £3,500 back via TIER_AMOUNT_OVERRIDES in the frontend.
const plan = await c.fetch('*[_type=="pricingPlan" && planKey=="corporate"][0]{_id,priceFrom}');
console.log("pricingPlan corporate:", plan?.priceFrom, "->", 2500);

// 2) calculatorConfig.projectTypes[multiPage].basePrice
const cfg = await c.fetch('*[_id=="calculatorConfig"][0]{ "i": projectTypes[]{_key,projectKey,basePrice} }');
const mp = cfg?.i?.find((x) => x.projectKey === "multiPage");
console.log("calculator multiPage:", mp?.basePrice, "->", 2500, "(_key", mp?._key + ")");

if (DRY) { console.log("[dry-run] nothing written"); process.exit(0); }
await c.patch(plan._id).set({ priceFrom: 2500 }).commit();
console.log("patched pricingPlan");
await c.patch("calculatorConfig").set({ [`projectTypes[_key=="${mp._key}"].basePrice`]: 2500 }).commit();
console.log("patched calculatorConfig");
