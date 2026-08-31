/**
 * Звёздочки вместо жирного шрифта в четырёх новых статьях.
 *
 * Владелец заметил `**сесії**` прямо в тексте. Причина: в блоге два разных
 * пути рендера, и я перепутал, какой что понимает.
 *
 *   tldrBox.items и ячейки blogTable  → идут через formatLine(), который
 *                                       разбирает markdown-звёздочки
 *   обычные block-и (абзацы, списки)  → идут через renderSpan(), а это
 *                                       Portable Text: там жирность задаётся
 *                                       меткой "strong" в span.marks, и
 *                                       никакого markdown не парсится
 *
 * Я писал `**текст**` во всех трёх местах одинаково, и в абзацах со списками
 * звёздочки вылезли наружу. 82 вхождения, все в статьях от 31.08 — ни один
 * старый пост не задет.
 *
 * Правим по-честному, а не вырезанием звёздочек: renderSpan умеет
 * marks: ["strong"] → <strong>, так что жирность будет настоящей, как и
 * задумывалась. Существующие метки на спане (ссылки, em) сохраняются.
 *
 * Запуск: node scripts/icelab-2026-08-31/fix-bold-marks.mjs [--dry]
 */
import "dotenv/config";
import { createClient } from "@sanity/client";

const DRY = process.argv.includes("--dry");
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && !DRY) throw new Error("нужен SANITY_WRITE_TOKEN");

const client = createClient({
  projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", useCdn: false, token,
});

const BOLD = /\*\*([^*]+)\*\*/g;
let seq = 0;
const key = () => `bd${(seq++).toString(36)}${Date.now().toString(36).slice(-2)}`;

/** Разбивает один span на несколько, вынося `**…**` в отдельные со "strong". */
function splitSpan(span) {
  const text = span.text ?? "";
  if (!BOLD.test(text)) { BOLD.lastIndex = 0; return [span]; }
  BOLD.lastIndex = 0;

  const out = [];
  let cursor = 0;
  let m;
  while ((m = BOLD.exec(text)) !== null) {
    if (m.index > cursor) {
      out.push({ ...span, _key: key(), text: text.slice(cursor, m.index) });
    }
    const marks = [...(span.marks ?? [])];
    if (!marks.includes("strong")) marks.push("strong");
    out.push({ ...span, _key: key(), marks, text: m[1] });
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) {
    out.push({ ...span, _key: key(), text: text.slice(cursor) });
  }
  return out;
}

async function run() {
  const docs = await client.fetch('*[_type == "blogPost"]{_id, "s": slugs.uk.current, body, faq, lede}');
  let touched = 0, converted = 0;
  const otherFields = [];

  for (const d of docs) {
    const patch = {};

    for (const [loc, arr] of Object.entries(d.body || {})) {
      if (!Array.isArray(arr)) continue;
      let changed = 0;
      const next = arr.map((b) => {
        if (b._type !== "block" || !Array.isArray(b.children)) return b;
        const children = b.children.flatMap((ch) => {
          const parts = splitSpan(ch);
          if (parts.length > 1) changed += parts.filter((p) => (p.marks || []).includes("strong")).length;
          return parts;
        });
        return changed ? { ...b, children } : b;
      });
      if (changed) { patch[`body.${loc}`] = next; converted += changed; }
    }

    // faq и lede рендерятся как простой текст — там звёздочки тоже вылезли бы
    const faqHits = JSON.stringify(d.faq || []).match(/\\*\\*[^*]+\\*\\*/g) || [];
    const ledeHits = JSON.stringify(d.lede || {}).match(/\\*\\*[^*]+\\*\\*/g) || [];
    if (faqHits.length || ledeHits.length) {
      otherFields.push(`${d.s}: faq ${faqHits.length}, lede ${ledeHits.length}`);
    }

    if (!Object.keys(patch).length) continue;
    touched++;
    console.log(`  ${d.s} — ${Object.keys(patch).map((k) => k.split(".")[1]).join(", ")}`);
    if (!DRY) await client.patch(d._id).set(patch).commit();
  }

  console.log(`\nстатей исправлено: ${touched}, фрагментов переведено в <strong>: ${converted}`);
  if (otherFields.length) {
    console.log("\nзвёздочки в faq/lede (требуют внимания):");
    otherFields.forEach((x) => console.log("  " + x));
  } else {
    console.log("в faq и lede звёздочек нет");
  }
}

console.log(DRY ? "СУХОЙ ПРОГОН\n" : "ЗАПИСЬ В SANITY\n");
run().then(() => console.log("готово"), (e) => { console.error("ОШИБКА", e.message); process.exit(1); });
