/**
 * /sites-for/medicine — секция «що входить у розробку» под striking-distance
 * запросы из GSC (см. code-site.art-audit/STRIKING-DISTANCE-2026-08-29.md).
 *
 * Страница даёт 2 678 показов при средней позиции 39.9, но коммерческие
 * формулировки стоят на 16–28 месте, и две группы слов на странице почти
 * не звучат:
 *
 *   замовити створення медичних сайтів              54 показа, поз. 22.9
 *   замовити створення сайту для медичного центру   60 показов, поз. 28.2
 *   веб дизайн для медичних сайтів                  57 показов, поз. 27.6
 *   дизайну сайту медичного центру                  56 показов, поз. 26.2
 *   верстка медичних сайтів                         56 показов, поз. 26.8
 *   програмування медичних сайтів                   59 показов, поз. 36.7
 *
 * Это ~340 показов, по которым страница ранжируется «случайно» — нужных слов
 * в тексте нет. Секция закрывает их естественным текстом о составе работ,
 * а не подстановкой ключей.
 *
 * richTextBlock выбран сознательно: он не требует изображений и рендерится
 * стандартной типографикой, поэтому не спорит с reference lock страницы
 * (docs/medicine-redesign.md) — никаких карточек и италик-свапов.
 *
 * Usage: node scripts/medicine-seo-2026-08/add-scope-section.mjs --dry-run
 *        node scripts/medicine-seo-2026-08/add-scope-section.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";

const DRY = process.argv.includes("--dry-run");
for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined)
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!token && !DRY) throw new Error("SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN missing");

const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  token,
  useCdn: false,
});

let seq = 0;
const key = () => `msc${(seq++).toString(36)}${Math.abs(seq * 7919).toString(36)}`;

const block = (text, style = "normal") => ({
  _key: key(),
  _type: "block",
  style,
  markDefs: [],
  children: [{ _key: key(), _type: "span", text, marks: [] }],
});
const h2 = (t) => block(t, "h2");
const h3 = (t) => block(t, "h3");

/* ─── uk ──────────────────────────────────────────────────────────────────── */

const UK = [
  h2("Що входить у розробку медичного сайту під ключ"),
  block(
    "Створення сайту для клініки — це не «намалювати сторінку». Нижче весь склад робіт, який ми беремо на себе: від дизайну сайту медичного центру до програмування інтеграцій із медичною CRM. Кожен пункт входить у фіксовану ціну, окремих рахунків за нього не буде.",
  ),
  h3("Дизайн"),
  block(
    "Веб-дизайн для медичних сайтів працює за іншими правилами, ніж для магазину. Пацієнт приходить стривоженим, і завдання дизайну — заспокоїти: спокійна палітра, великий читабельний шрифт, фото справжніх лікарів замість стоку, ціни без «від» і зірочок. Ми малюємо кожен екран з нуля під вашу клініку, а не адаптуємо шаблон.",
  ),
  h3("Верстка і програмування"),
  block(
    "Верстка медичних сайтів у нас адаптивна за замовчуванням: більшість пацієнтів шукає клініку з телефона, часто в дорозі й на поганому інтернеті. Програмування медичних сайтів — це насамперед інтеграції: онлайн-запис, синхронізація з розкладом лікарів, Helsi, Medesk, Dental4Windows, нагадування пацієнту в SMS чи Telegram.",
  ),
  h3("Як замовити створення медичного сайту"),
  block(
    "Щоб замовити створення медичних сайтів у нас, нічого готувати не потрібно — ні брифа, ні текстів, ні фото. Достатньо однієї розмови: ми питаємо про напрями клініки, кількість лікарів і те, як зараз ведеться запис. Далі надсилаємо фіксовану вилку ціни й терміни. Замовити створення сайту для медичного центру можна з будь-якого етапу — навіть якщо у вас уже є сайт і його треба перенести без втрати позицій.",
  ),
];

/* ─── ru ──────────────────────────────────────────────────────────────────── */

const RU = [
  h2("Что входит в разработку медицинского сайта под ключ"),
  block(
    "Создание сайта для клиники — это не «нарисовать страницу». Ниже весь состав работ, который мы берём на себя: от дизайна сайта медицинского центра до программирования интеграций с медицинской CRM. Каждый пункт входит в фиксированную цену, отдельных счетов за него не будет.",
  ),
  h3("Дизайн"),
  block(
    "Веб-дизайн для медицинских сайтов работает по другим правилам, чем для магазина. Пациент приходит встревоженным, и задача дизайна — успокоить: спокойная палитра, крупный читаемый шрифт, фотографии настоящих врачей вместо стока, цены без «от» и звёздочек. Мы рисуем каждый экран с нуля под вашу клинику, а не адаптируем шаблон.",
  ),
  h3("Вёрстка и программирование"),
  block(
    "Вёрстка медицинских сайтов у нас адаптивная по умолчанию: большинство пациентов ищет клинику с телефона, часто в дороге и на плохом интернете. Программирование медицинских сайтов — это прежде всего интеграции: онлайн-запись, синхронизация с расписанием врачей, Helsi, Medesk, Dental4Windows, напоминания пациенту в SMS или Telegram.",
  ),
  h3("Как заказать создание медицинского сайта"),
  block(
    "Чтобы заказать создание медицинских сайтов у нас, ничего готовить не нужно — ни брифа, ни текстов, ни фото. Достаточно одного разговора: мы спрашиваем о направлениях клиники, количестве врачей и о том, как сейчас ведётся запись. Дальше присылаем фиксированную вилку цены и сроки. Заказать создание сайта для медицинского центра можно с любого этапа — даже если у вас уже есть сайт и его нужно перенести без потери позиций.",
  ),
];

/* ─── en ──────────────────────────────────────────────────────────────────── */

const EN = [
  h2("What a turnkey medical website build includes"),
  block(
    "Building a clinic website is not just drawing a page. Here is the full scope we take on, from the design of a medical centre website through to programming the integrations with your practice system. Every item is inside the fixed price; none of it arrives as a separate invoice.",
  ),
  h3("Design"),
  block(
    "Web design for medical websites follows different rules than retail. Patients arrive anxious, so the design has one job: to reassure. A calm palette, large readable type, photographs of your actual clinicians instead of stock, prices without asterisks. Every screen is drawn from scratch for your clinic rather than adapted from a template.",
  ),
  h3("Build and programming"),
  block(
    "Our medical website builds are responsive by default: most patients look for a clinic on a phone, often on the move and on a poor connection. Programming a medical website is mostly integration work — online booking, syncing with clinician schedules, practice systems such as SystmOne, EMIS or Dentally, and SMS or messenger reminders to the patient.",
  ),
  h3("How to order a medical website"),
  block(
    "To order a medical website from us you need to prepare nothing — no brief, no copy, no photography. One conversation is enough: we ask about your specialities, how many clinicians you have and how bookings run today. Then you get a fixed price range and a timeline. You can order a medical centre website at any stage, including when a site already exists and needs migrating without losing rankings.",
  ),
];

const SECTION = {
  _key: "secScope",
  _type: "richTextBlock",
  content: { uk: UK, ru: RU, en: EN },
};

async function run() {
  const doc = await client.fetch(
    '*[_type=="industryPage" && slug.current=="medicine"][0]{_id, "keys": sections[]._key, "types": sections[]._type}',
  );
  if (!doc) throw new Error("medicine industryPage not found");
  console.log("doc:", doc._id);
  console.log("sections now:", doc.types.join(" > "));

  if (doc.keys.includes(SECTION._key)) {
    console.log("section already present — nothing to do");
    return;
  }

  // Place it after the comparison block, before the FAQ: the reader has just
  // seen why coded beats a template, and asks "so what do I actually get".
  const faqIdx = doc.types.indexOf("faqBlock");
  const at = faqIdx === -1 ? doc.types.length : faqIdx;
  console.log(`inserting richTextBlock at index ${at} (before faqBlock)`);

  if (DRY) {
    console.log("[dry-run] nothing written");
    console.log(JSON.stringify(SECTION, null, 1).slice(0, 700) + " …");
    return;
  }
  await client
    .patch(doc._id)
    .insert("before", `sections[${at}]`, [SECTION])
    .commit();
  console.log("inserted");
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
