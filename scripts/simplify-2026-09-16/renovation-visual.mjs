// Renovation page: real Solide Renovation site on a tablet (AI-made scene,
// real screen) next to the client testimonial. Plan 2026-09-16, §10.
import { createReadStream } from "node:fs";
import { client, backup } from "./lib.mjs";
const DRY = process.argv.includes("--dry-run");
const file = process.argv.find((a) => a.endsWith(".webp"));
const ID = "lOTgaDd8FU4wgJ8F4KCHn9";
const doc = await client.getDocument(ID);
backup("renovation-visual", doc);
if (DRY) { console.log("would upload", file); process.exit(0); }
const asset = await client.assets.upload("image", createReadStream(file), { filename: "renovation-tablet-solide.webp" });
await client.patch(ID).set({
  'sections[_key=="secz"].testimonial.visual': {
    _type: "imageWithLocalizedAlt",
    image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
    alt: {
      uk: "Сайт Solide Renovation на планшеті на столярному верстаті",
      ru: "Сайт Solide Renovation на планшете на столярном верстаке",
      en: "The Solide Renovation website on a tablet on a workbench",
    },
  },
}).commit();
console.log("done", asset._id);
