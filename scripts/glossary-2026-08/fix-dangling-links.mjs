/**
 * Пять внутренних ссылок в словарном кластере вели в никуда.
 *
 * Три — опечатки в слаге существующей статьи (агенты угадывали EN-слаг вместо
 * того, чтобы взять его из Sanity). Две — ссылки на статьи, которых мы вообще
 * не писали: «адаптивна верстка» и сравнение типов сайтов. Их не на что
 * перенаправить, поэтому текст переписан так, чтобы он ничего не обещал.
 *
 * Запуск: SANITY_WRITE_TOKEN=… node scripts/glossary-2026-08/fix-dangling-links.mjs [--dry]
 */
import { createClient } from "@sanity/client";

const DRY = process.argv.includes("--dry");
const token = process.env.SANITY_WRITE_TOKEN;
if (!token && !DRY) throw new Error("нужен SANITY_WRITE_TOKEN");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
  token,
});

/** Простые опечатки: старый href → верный слаг из Sanity. */
const REHREF = {
  "/en/blog/what-is-core-web-vitals": "/en/blog/what-are-core-web-vitals",
  "/en/blog/what-is-cta": "/en/blog/what-is-a-cta",
};

const IDS = [
  "glos2026-shcho-take-hosting",
  "glos2026-shcho-take-seo",
  "glos2026-shcho-take-yuzabiliti",
  "glos2026-shcho-take-favicon",
  "glos2026-shcho-take-lending",
];

/** Снять ссылку, оставив текст: убрать markDef и его ключ из marks. */
function unlink(block, href) {
  const def = (block.markDefs || []).find((m) => m.href === href);
  if (!def) return false;
  block.markDefs = block.markDefs.filter((m) => m._key !== def._key);
  for (const ch of block.children || []) {
    if (ch.marks?.includes(def._key)) ch.marks = ch.marks.filter((k) => k !== def._key);
  }
  return true;
}

const changes = [];

for (const id of IDS) {
  const doc = await client.getDocument(id);
  if (!doc) throw new Error(`нет документа ${id}`);
  const body = structuredClone(doc.body);
  let touched = 0;

  for (const blocks of Object.values(body)) {
    if (!Array.isArray(blocks)) continue;
    for (const block of blocks) {
      for (const def of block.markDefs || []) {
        if (REHREF[def.href]) {
          changes.push(`${id}: ${def.href} → ${REHREF[def.href]}`);
          def.href = REHREF[def.href];
          touched++;
        }
      }
    }
  }

  // Статьи про адаптивную вёрстку не существует — просто снимаем ссылку.
  if (id === "glos2026-shcho-take-favicon") {
    for (const block of body.uk || []) {
      if (unlink(block, "/blog/shcho-take-adaptyvna-verstka")) {
        changes.push(`${id}: снята ссылка «адаптивна верстка»`);
        touched++;
      }
    }
  }

  // Обещанного сравнения типов сайтов у нас нет — переписываем предложение
  // и ведём на страницу цен, где типы и их состав как раз разложены.
  if (id === "glos2026-shcho-take-lending") {
    const block = (body.uk || []).find((b) =>
      (b.markDefs || []).some((m) => m.href === "/blog/sait-vizytka-lending-chy-korporatyvnyi"),
    );
    if (block) {
      const def = block.markDefs.find(
        (m) => m.href === "/blog/sait-vizytka-lending-chy-korporatyvnyi",
      );
      def.href = "/pricing";
      const linked = block.children.find((ch) => ch.marks?.includes(def._key));
      const tail = block.children[block.children.length - 1];
      const lead = block.children.find((ch) => ch.text?.startsWith(", поряд із"));
      lead.text =
        ", поряд із сайтом-візиткою, корпоративним сайтом та інтернет-магазином. " +
        "Тут ми розбираємо тільки сам лендінг — що це і як він влаштований, " +
        "а склад і ціни решти типів зібрані на ";
      linked.text = "сторінці цін";
      tail.text = ".";
      changes.push(`${id}: переписан абзац про типи сайтів, ссылка → /pricing`);
      touched++;
    }
  }

  if (!touched) continue;
  if (DRY) continue;
  await client.patch(id).set({ body }).commit();
}

console.log(changes.length ? changes.join("\n") : "нечего править");
console.log(DRY ? "\n(dry run, ничего не записано)" : `\nзаписано правок: ${changes.length}`);
