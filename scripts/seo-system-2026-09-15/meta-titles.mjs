// Follow-up to apply.mjs: the retargeted articles render metaTitle (not title)
// in <title>, and several metaDescriptions still opened with the commercial
// phrase the service page owns. City pages «розробка сайтів у Києві» and the
// medical-centre service page now own those; the articles answer «як обрати».
// The medical-centre metaDescription also quoted "from $3,500" against the
// $2 500 on /sites-for/medicine/medychnyi-tsentr.
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
for (const line of readFileSync(join(HERE, "..", "..", ".env"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false, perspective: "raw" });
const P = {
  "city2026-rozrobka-saitu-kyiv": {
    "metaTitle.uk": "Як обрати студію в Києві: чому оцінки різняться в 10 разів",
    "metaTitle.ru": "Как выбрать студию в Киеве: почему оценки отличаются в 10 раз",
    "metaDescription.uk": "➤ Як обрати студію в Києві: чому за одне ТЗ називають $800 і $8 000 ✔️ Реальні дані попиту ✔️ Таблиця з 5 питань для порівняння підрядників ➡ Розбір ринку.",
    "metaDescription.ru": "➤ Как выбрать студию в Киеве: почему за одно ТЗ называют $800 и $8 000 ✔️ Реальные данные спроса ✔️ Таблица из 5 вопросов для сравнения подрядчиков ➡ Разбор рынка.",
  },
  "city2026-rozrobka-saitu-lviv": {
    "metaTitle.uk": "Як обрати студію у Львові: попит, ціни і чекліст підрядника",
    "metaTitle.ru": "Как выбрать студию во Львове: спрос, цены и чеклист подрядчика",
    "metaDescription.uk": "➤ Як обрати студію у Львові: 420 пошуків на місяць ✔️ Скільки коштує лендінг і багатосторінковий сайт ✔️ Чекліст перевірки підрядника ➡ Розбір ринку.",
    "metaDescription.ru": "➤ Как выбрать студию во Львове: 420 поисков в месяц ✔️ Сколько стоит лендинг и многостраничный сайт ✔️ Чеклист проверки подрядчика ➡ Разбор рынка.",
  },
  "city2026-rozrobka-saitu-odesa": {
    "metaDescription.uk": "➤ Сайт для бізнесу в Одесі: попит 110 запитів на місяць ✔️ Ціни без міської надбавки ✔️ Чому сезонному бізнесу сайт треба робити взимку ➡ Розбір ринку.",
    "metaDescription.ru": "➤ Сайт для бизнеса в Одессе: спрос 110 запросов в месяц ✔️ Цены без городской надбавки ✔️ Почему сезонному бизнесу сайт надо делать зимой ➡ Разбор рынка.",
  },
  "city2026-rozrobka-saitu-dnipro": {
    "metaDescription.uk": "➤ Сайт для бізнесу в Дніпрі: попит 150 запитів на місяць ✔️ Ціни без надбавки за місто ✔️ Чому швидкість важить більше за дизайн ➡ Розбір ринку.",
    "metaDescription.ru": "➤ Сайт для бизнеса в Днепре: спрос 150 запросов в месяц ✔️ Цены без надбавки за город ✔️ Почему скорость важнее дизайна ➡ Разбор рынка.",
  },
  "28710b68-e06f-436d-a207-2866e0538728": {
    "metaTitle.uk": "Бюджет на просування сайту 2026: з чого складається ціна SEO",
    "metaTitle.ru": "Бюджет на продвижение сайта 2026: из чего складывается цена SEO",
  },
  "b0a6ca40-e2fd-45c8-a3ad-5c5748e54e5b": {
    "metaTitle.uk": "Етапи розробки сайту медичного центру: 4 тижні покроково",
    "metaTitle.ru": "Этапы разработки сайта медицинского центра: 4 недели пошагово",
    "metaDescription.uk": "➤ Етапи розробки сайту медичного центру за 4 тижні ✔️ Бриф, дизайн, інтеграції, запуск ✔️ Ваша участь — 5 годин ➡ Що відбувається на кожному тижні.",
    "metaDescription.ru": "➤ Этапы разработки сайта медицинского центра за 4 недели ✔️ Бриф, дизайн, интеграции, запуск ✔️ Ваше участие — 5 часов ➡ Что происходит на каждой неделе.",
  },
};
const docs = await client.fetch(`*[_id in $ids]`, { ids: Object.keys(P) });
writeFileSync(join(HERE, "backup", `before-meta-titles-${Date.now()}.json`), JSON.stringify(docs, null, 1));
const tx = client.transaction();
for (const d of docs) tx.patch(client.patch(d._id).ifRevisionId(d._rev).set(P[d._id]));
console.log("committed", (await tx.commit()).transactionId, docs.length);
