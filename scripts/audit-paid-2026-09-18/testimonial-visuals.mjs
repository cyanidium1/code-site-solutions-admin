// Niche pages ran 6–10 phone screens without a photo (density check
// 2026-09-18). Each servicesBlock quotes a real client who also has a case in
// the portfolio, so the quote gets that client's case cover as its visual.
// Only pages where the quote's author and the case are unambiguous.
import { client, backup } from "../simplify-2026-09-16/lib.mjs";

const PAIRS = [
  ["auto", "raul-avto"],
  ["medicine", "efedra-clinic"],
  ["courses", "aleko-course"],
  ["legal", "oleksandr-sitnikov"],
];

for (const [pageSlug, caseSlug] of PAIRS) {
  const page = await client.fetch('*[_type=="industryPage" && slug.current==$s && !(_id in path("drafts.**"))][0]', { s: pageSlug });
  const cover = await client.fetch('*[_type=="caseStudy" && slug.current==$s && !(_id in path("drafts.**"))][0].coverImage', { s: caseSlug });
  const svc = page?.sections?.find((x) => x._type === "servicesBlock");
  if (!page || !svc || !cover?.image?.asset) {
    console.log("skip", pageSlug, !page ? "no page" : !svc ? "no servicesBlock" : "no cover");
    continue;
  }
  if (svc.testimonial?.visual?.image?.asset || svc.testimonial?.visual?.asset) {
    console.log("skip (already has a visual)", pageSlug);
    continue;
  }
  backup(`testimonial-visual-${page._id}`, page);
  const visual = { _type: "imageWithLocalizedAlt", alt: cover.alt, image: cover.image };
  await client
    .patch(page._id)
    .set({ [`sections[_key=="${svc._key}"].testimonial.visual`]: visual })
    .commit();
  console.log("set", pageSlug, "←", caseSlug);
}
