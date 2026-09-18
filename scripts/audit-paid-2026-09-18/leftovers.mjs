// Two free-teardown headings the rule set missed (genitive form, "Маєте"
// instead of "Є"). Found by a follow-up scan on 2026-09-18.
import { client, backup } from "../simplify-2026-09-16/lib.mjs";

const fixes = [
  {
    id: "lOTgaDd8FU4wgJ8F4KCHn9-medicine-placeholder", // resolved below by slug
    slug: "medicine",
    type: "industryPage",
    path: 'sections[_key=="sec27"].heading.uk',
    from: "Послуги створення сайтів для медицини: почніть із безкоштовного розбору вашого сайту",
    to: "Послуги створення сайтів для медицини: почніть з аудиту сайту за $150",
  },
  {
    id: "b0a6ca40-e2fd-45c8-a3ad-5c5748e54e5b",
    path: 'body.uk[_key=="mt01d"].heading',
    from: "Маєте сайт клініки? Надішліть — розберемо за 24 години",
    to: "Аудит сайту вашої клініки — $150",
  },
];

for (const f of fixes) {
  const id = f.slug
    ? await client.fetch(`*[_type==$t && slug.current==$s][0]._id`, { t: f.type, s: f.slug })
    : f.id;
  const doc = await client.getDocument(id);
  const current = await client.fetch(`*[_id==$id][0].${f.path.replace(/\[_key=="([^"]+)"\]/g, '[_key=="$1"][0]')}`, { id });
  if (current !== f.from) {
    console.log("skip (text differs):", id, f.path, "→", current);
    continue;
  }
  backup(`audit-leftover-${id}`, doc);
  await client.patch(id).set({ [f.path]: f.to }).commit();
  console.log("fixed", id, f.path);
}
