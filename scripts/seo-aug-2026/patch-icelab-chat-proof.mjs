/**
 * IceLab case study — attach the client-chat proof under the testimonial.
 *
 * The owner supplied a Telegram screenshot in which the client confirms a
 * large B2B enquiry arrived through the site, the contract was signed, the
 * first shipment was made, and that search — not ads — delivered it.
 *
 * PUBLISHED AS TWO CONTIGUOUS EXCERPTS, NOT ONE STITCHED IMAGE. The middle
 * of the thread carries the client's private market intel and a third
 * party's misfortune (a fire at another producer); that has no place on a
 * public page. Cropping two separate, unaltered runs of messages keeps the
 * quote honest — nothing inside either image has been rearranged.
 *
 * `testimonialBlock` has no image field (only authorAvatar / video), so
 * the proof rides in a mediaGalleryBlock placed directly after it — no
 * Studio schema change needed.
 *
 * Usage (admin repo root):
 *   node scripts/seo-aug-2026/patch-icelab-chat-proof.mjs --dry-run
 *   node scripts/seo-aug-2026/patch-icelab-chat-proof.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DRY = process.argv.includes("--dry-run");

function loadEnvFile(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));
loadEnvFile(join(ROOT, "..", "code-site-solutions", ".env.local"));

const TOKEN = process.env.SANITY_API_TOKEN;
if (!TOKEN && !DRY) throw new Error("SANITY_API_TOKEN missing");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  token: TOKEN,
  useCdn: false,
});

const SCRATCH =
  "C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-GitHub-code-site-solutions/2fdeb486-2efc-4cce-bf58-563109879c9b/scratchpad";

const TILES = [
  {
    key: "icl-chat-1",
    file: `${SCRATCH}/icelab-chat-1.png`,
    alt: {
      uk: "Переписка з клієнтом IceLab: B2B-заявка із сайту, договір підписано",
      ru: "Переписка с клиентом IceLab: B2B-заявка с сайта, договор подписан",
      en: "IceLab client chat: a B2B enquiry from the site, contract signed",
    },
    caption: {
      uk: "B2B-заявка із сайту — договір підписано",
      ru: "B2B-заявка с сайта — договор подписан",
      en: "A B2B enquiry from the site — contract signed",
    },
  },
  {
    key: "icl-chat-2",
    file: `${SCRATCH}/icelab-chat-2.png`,
    alt: {
      uk: "Переписка з клієнтом IceLab: спрацювало SEO, зроблено перше відвантаження",
      ru: "Переписка с клиентом IceLab: сработало SEO, сделана первая отгрузка",
      en: "IceLab client chat: SEO delivered it, first shipment made",
    },
    caption: {
      uk: "Спрацювало SEO, а не реклама — перше відвантаження зроблено",
      ru: "Сработало SEO, а не реклама — первая отгрузка сделана",
      en: "SEO delivered it, not ads — first shipment made",
    },
  },
];

const doc = await client.fetch(`*[_type=="caseStudy" && slug.current=="icelab"][0]`);
if (!doc) throw new Error("icelab case study not found");

const backupDir = join(ROOT, "backups", "seo-round-2");
mkdirSync(backupDir, { recursive: true });
writeFileSync(
  join(backupDir, "caseStudy-icelab-chat-proof.json"),
  JSON.stringify(doc, null, 2),
  "utf8",
);

for (const t of TILES) {
  if (!existsSync(t.file)) throw new Error(`missing crop: ${t.file}`);
}

if (DRY) {
  console.log("would upload:");
  for (const t of TILES) console.log(`  ${t.file}`);
  console.log("\nand insert a mediaGalleryBlock after icl-testimonial");
  console.log("--dry-run: no mutations sent");
  process.exit(0);
}

const images = [];
for (const t of TILES) {
  const asset = await client.assets.upload("image", readFileSync(t.file), {
    filename: `${t.key}.png`,
  });
  console.log(`uploaded ${t.key}: ${asset._id}`);
  images.push({
    _key: t.key,
    _type: "mediaGalleryImageItem",
    alt: { _type: "localizedString", ...t.alt },
    caption: { _type: "localizedString", ...t.caption },
    displayMode: "general",
    objectPosition: "center",
    image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
  });
}

const block = {
  _key: "icl-chat-proof",
  _type: "mediaGalleryBlock",
  enableLightbox: true,
  images,
};

const sections = (doc.sections ?? []).filter((s) => s._key !== block._key);
const at = sections.findIndex((s) => s._key === "icl-testimonial");
if (at === -1) throw new Error("testimonial block not found — run patch-icelab-testimonial first");
sections.splice(at + 1, 0, block);

const res = await client.patch(doc._id).set({ sections }).commit();
console.log("committed:", res._id);
sections.forEach((s, i) => console.log(`  ${i}. ${s._type} (${s._key})`));
