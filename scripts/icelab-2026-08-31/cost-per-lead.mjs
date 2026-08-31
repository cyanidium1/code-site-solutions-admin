/**
 * Экономика обращения в кейсе IceLab и в статье про конверсию.
 *
 * Владелец предложил указать, сколько клиент платит за рекламу, и придумать
 * цифру. Придумывать не стал: это утверждение о финансах названной компании,
 * и оно ничем не отличается от «Lighthouse 98», которое на этой неделе с
 * сайта снимали.
 *
 * Формулировка без выдумки работает сильнее, потому что подставляет цифру
 * читателя, а не нашу: «поделите свой месячный бюджет на три — это цена
 * обращения из рекламы; те же 495 сессий из органики дали сорок одно».
 * Читатель считает по своему бюджету, и оспорить это нечем.
 *
 * Числа те же: Clarity `xnw4p46kh9`, 30 дней, 1 156 сессий.
 *
 * Запуск: node scripts/icelab-2026-08-31/cost-per-lead.mjs [--dry]
 */
import "dotenv/config";
import { createClient } from "@sanity/client";

const DRY = process.argv.includes("--dry");
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token && !DRY) throw new Error("нужен SANITY_WRITE_TOKEN");

const client = createClient({
  projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", useCdn: false, token,
});

let seq = 0;
const key = () => `cpl${(seq++).toString(36)}`;
const block = (text) => ({
  _key: key(), _type: "block", style: "normal", markDefs: [],
  children: [{ _key: key(), _type: "span", marks: [], text }],
});

const CASE_ID = "teYo5SgUrFJ21nkOqz75NQ";
const ART_ID = "art2026-konversiia-saitu";

const TAIL = {
  uk: " Порахувати економіку можна без наших цифр: поділіть свій місячний бюджет на рекламу на три — це ціна одного звернення з неї на цьому проєкті. Ті самі 495 сесій з органіки дали сорок одне.",
  ru: " Посчитать экономику можно без наших цифр: разделите свой месячный бюджет на рекламу на три — это цена одного обращения из неё на этом проекте. Те же 495 сессий из органики дали сорок одно.",
  en: " The economics work without our numbers: divide your monthly ad budget by three and that is what one enquiry cost on this project. The same 495 organic sessions produced forty-one.",
};

async function run() {
  // 1. кейс — дописываем в секцию «Результат для клієнта»
  const doc = await client.fetch('*[_id == $id][0]{sections}', { id: CASE_ID });
  const sections = [...(doc.sections || [])];
  const i = sections.findIndex(
    (s) => s._type === "imageTextBlock" && String(s.heading?.uk || "").includes("Результат"),
  );
  if (i < 0) throw new Error("секция «Результат» не найдена");

  const body = { ...sections[i].body };
  for (const loc of ["uk", "ru", "en"]) {
    const arr = body[loc] || [];
    const last = arr[arr.length - 1];
    const text = (last?.children || []).map((c) => c.text).join("");
    if (text.includes("поділіть свій") || text.includes("разделите свой") || text.includes("divide your")) {
      console.log(`  кейс [${loc}]: уже дописано`); continue;
    }
    body[loc] = [...arr.slice(0, -1), block(text + TAIL[loc])];
    console.log(`  кейс [${loc}]: +${TAIL[loc].trim().length} символов`);
  }
  sections[i] = { ...sections[i], body };

  // 2. статья — отдельным абзацем после таблицы каналов
  const art = await client.fetch('*[_id == $id][0]{"uk": body.uk, "ru": body.ru}', { id: ART_ID });
  const patched = {};
  for (const loc of ["uk", "ru"]) {
    const arr = [...(art[loc] || [])];
    if (JSON.stringify(arr).includes(loc === "uk" ? "поділіть свій" : "разделите свой")) {
      console.log(`  статья [${loc}]: уже дописано`); patched[`body.${loc}`] = arr; continue;
    }
    const at = arr.findIndex(
      (b) => b._type === "block" && (b.children || []).map((c) => c.text).join("").startsWith(
        loc === "uk" ? "Реклама привела" : "Реклама привела",
      ),
    );
    if (at < 0) { console.error(`  ✗ статья [${loc}]: якорь не найден`); continue; }
    const add = block(
      loc === "uk"
        ? "Ціну звернення порахуйте на своїх цифрах, не на наших: поділіть місячний бюджет на рекламу на кількість заявок, які вона принесла. Далі те саме зробіть з органікою — витрати на неї теж не нульові, це робота над сайтом і контентом. У проєкті з прикладу різниця вийшла чотирнадцятикратною, і саме тому дивитися треба на ціну заявки, а не на обсяг трафіку."
        : "Цену обращения посчитайте на своих цифрах, не на наших: разделите месячный бюджет на рекламу на количество заявок, которые она принесла. Дальше то же самое сделайте с органикой — расходы на неё тоже не нулевые, это работа над сайтом и контентом. В проекте из примера разница вышла четырнадцатикратной, и именно поэтому смотреть надо на цену заявки, а не на объём трафика.",
    );
    arr.splice(at + 1, 0, add);
    patched[`body.${loc}`] = arr;
    console.log(`  статья [${loc}]: абзац вставлен после блока ${at}`);
  }

  if (DRY) return;
  await client.patch(CASE_ID).set({ sections }).commit();
  await client.patch(ART_ID).set(patched).commit();
  console.log("\n✓ записано");
}

console.log(DRY ? "СУХОЙ ПРОГОН\n" : "ЗАПИСЬ В SANITY\n");
run().then(() => console.log("готово"), (e) => { console.error("ОШИБКА", e.message); process.exit(1); });
