// Finance has no niche cases to break its 7-screen text run, but its
// testimonial is from the client of its own before/after block (FinLiga), so
// the quote gets that client's "after" screenshot.
import { client, backup } from "../simplify-2026-09-16/lib.mjs";

const page = await client.fetch('*[_type=="industryPage" && slug.current=="finance" && !(_id in path("drafts.**"))][0]');
const svc = page.sections.find((x) => x._type === "servicesBlock");
const cb = page.sections.find((x) => x._type === "caseBlock");
const img = cb?.after?.image;
if (!svc || !img?.image?.asset) throw new Error("missing servicesBlock or after image");
backup(`testimonial-visual-${page._id}`, page);
await client
  .patch(page._id)
  .set({ [`sections[_key=="${svc._key}"].testimonial.visual`]: { _type: "imageWithLocalizedAlt", alt: img.alt, image: img.image } })
  .commit();
console.log("set finance ← caseBlock.after");
