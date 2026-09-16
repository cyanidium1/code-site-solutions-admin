import { client } from "./lib.mjs";
const types = (process.argv[3] || "industryPage,testimonial,caseStudy,homepageCases,pricingPlan").split(",");
const re = new RegExp(process.argv[2], "i");
const docs = await client.fetch(`*[_type in $types && !(_id in path("drafts.**"))]`, { types });
for (const d of docs) {
  (function walk(o, p) {
    if (typeof o === "string") { if (re.test(o)) console.log(`${d._type}:${d.slug?.current || d._id} ${p} = ${o.slice(0, 200)}`); return; }
    if (o && typeof o === "object") for (const k in o) walk(o[k], p + "." + k);
  })(d, "");
}
