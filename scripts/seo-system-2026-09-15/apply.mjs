// SEO system 2026-09-15 — CMS half of the plan in
// code-site-solutions/code-site.art-audit/SEO-SYSTEM-2026-09-15.md.
//
//   node scripts/seo-system-2026-09-15/apply.mjs --dry-run   # prints the change list, writes nothing
//   node scripts/seo-system-2026-09-15/apply.mjs             # backs up every touched doc, then one transaction
//
// What it changes and why:
//  A. Blog categories. Price articles (SEO price, dev price) and the builders
//     article sat under "finance", so /sites-for/finance listed them and their
//     "related service" link pointed at "сайт для фінансової компанії". Niche
//     articles sat under "platforms", so /sites-for/{auto,ecommerce,…} linked
//     none of them. New "renovation" category (UUID id — dotted ids are
//     invisible to the public client, see docs/sanity-document-ids.md).
//  B. Retitles that stop articles competing with service pages for the same
//     intent: price estimates vs /pricing, SEO budget vs /seo, clinic
//     "під ключ" vs /sites-for/medicine/medychnyi-tsentr, city articles vs
//     /rozrobka-saitiv-{city}. Each retargeted article also gets one link to
//     the page that owns the commercial intent.
//  C. /blog/seo-dlia-medychnykh-saitiv merged into /sites-for/medicine/seo:
//     uk + ru slugs removed (the frontend 301s them), EN guide stays. Links to
//     the old uk/ru URLs in other articles are repointed.
//  D. Glossary articles: one contextual link to the service they lead to.
//  E. RU article bodies linking to UA pages that have a RU version.
//  F. Industry pages: headings with the wording people search, EN titles.
import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const DRY = process.argv.includes("--dry-run");
for (const f of [".env.local", ".env"]) {
  const p = join(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const client = createClient({
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false,
  perspective: "raw",
});

let seq = 0;
const key = () => `ss15${(seq++).toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
/** Paragraph with [label](/href) links. */
function para(text) {
  const children = [];
  const markDefs = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) children.push({ _key: key(), _type: "span", text: text.slice(last, m.index), marks: [] });
    const dk = key();
    markDefs.push({ _key: dk, _type: "link", href: m[2] });
    children.push({ _key: key(), _type: "span", text: m[1], marks: [dk] });
    last = m.index + m[0].length;
  }
  if (last < text.length) children.push({ _key: key(), _type: "span", text: text.slice(last), marks: [] });
  return { _key: key(), _type: "block", style: "normal", markDefs, children };
}
const bodyText = (blocks) =>
  JSON.stringify(blocks ?? []);

const CAT = {
  legal: "28b8d6fe-07b6-4ee6-8f40-87bf838df79b",
  finance: "3dda2459-8805-4c53-ae6f-88ea595e2c0f",
  medicine: "46501974-af48-4456-9e60-02157b4aa031",
  platforms: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a",
  realEstate: "10c16de9-82a6-4d3e-a5ac-0ae99056d446",
  ecommerce: "17bbbe63-1af4-4006-abe5-f0fbdf97efd1",
  auto: "a12f4725-fad7-414d-81d8-3286208a614e",
  courses: "dbb12d10-d979-4809-89ae-bac914091068",
};

const all = await client.fetch(`*[_type=="blogPost" && !(_id in path("drafts.**"))]`);
const bySlug = (uk) => {
  const d = all.find((p) => p.slugs?.uk?.current === uk);
  if (!d) throw new Error(`post not found: ${uk}`);
  return d;
};
const industry = await client.fetch(`*[_type=="industryPage" && !(_id in path("drafts.**"))]`);
const ind = (slug) => {
  const d = industry.find((p) => (p.slug?.current ?? p.slug) === slug);
  if (!d) throw new Error(`industry not found: ${slug}`);
  return d;
};

/** docId -> { doc, set: {}, unset: [], notes: [] } */
const plan = new Map();
const touch = (doc) => {
  if (!plan.has(doc._id)) plan.set(doc._id, { doc, set: {}, unset: [], notes: [] });
  return plan.get(doc._id);
};
const creates = [];

/* ── A. Categories ─────────────────────────────────────────────────────── */
let renovationId = (await client.fetch(`*[_type=="blogCategoryOption" && slug.current=="renovation"][0]._id`)) ?? null;
if (!renovationId) {
  renovationId = randomUUID();
  creates.push({
    _id: renovationId,
    _type: "blogCategoryOption",
    color: "#F97316",
    name: { _type: "localizedString", uk: "Будівництво", ru: "Строительство", en: "Construction" },
    order: 0,
    slug: { _type: "slug", current: "renovation" },
  });
}
const recat = {
  "prosuvannia-saitu-tsina-2026": CAT.platforms,
  "vartist-rozrobky-saytu-2026": CAT.platforms,
  "sait-dlia-budivelnoi-kompanii-2026": renovationId,
  "sait-dlia-avtoservisu": CAT.auto,
  "internet-mahazyn-avtozapchastyn": CAT.auto,
  "internet-mahazyn-odiahu": CAT.ecommerce,
  "internet-mahazyn-kosmetyky": CAT.ecommerce,
  "sait-dlia-meblevoi-kompanii": CAT.ecommerce,
  "sait-dlia-ahentsii-nerukhomosti": CAT.realEstate,
  "sait-dlia-shkoly": CAT.courses,
};
for (const [slug, ref] of Object.entries(recat)) {
  const d = bySlug(slug);
  if (d.category?._ref === ref) continue;
  const t = touch(d);
  t.set.category = { _type: "reference", _ref: ref };
  t.notes.push(`category → ${ref}`);
}

/* ── B. Retitles + one link to the page that owns the intent ───────────── */
function setLocalized(t, field, locale, value) {
  const cur = t.doc[field]?.[locale];
  if (cur === value) return;
  t.set[`${field}.${locale}`] = value;
  t.notes.push(`${field}.${locale}: «${cur ?? "∅"}» → «${value}»`);
}
/** Insert a paragraph after the first normal paragraph of body[locale], once. */
function insertLead(t, locale, text, marker) {
  const body = t.doc.body?.[locale];
  if (!Array.isArray(body)) return;
  if (bodyText(body).includes(marker)) return;
  const i = body.findIndex((b) => b._type === "block" && (b.style ?? "normal") === "normal" && !b.listItem);
  const at = i === -1 ? 0 : i + 1;
  const next = [...body.slice(0, at), para(text), ...body.slice(at)];
  t.set[`body.${locale}`] = next;
  t.doc.body[locale] = next;
  t.notes.push(`body.${locale}: +lead link ${marker}`);
}
/** Append a paragraph before a trailing CTA callout (or at the end), once. */
function appendLink(t, locale, text, marker) {
  const body = t.doc.body?.[locale];
  if (!Array.isArray(body)) return;
  if (bodyText(body).includes(`"href":"${marker}"`)) return;
  const lastIsCta = body.length && body[body.length - 1]._type === "ctaCallout";
  const at = lastIsCta ? body.length - 1 : body.length;
  const next = [...body.slice(0, at), para(text), ...body.slice(at)];
  t.set[`body.${locale}`] = next;
  t.doc.body[locale] = next;
  t.notes.push(`body.${locale}: +service link ${marker}`);
}

{
  const t = touch(bySlug("vartist-rozrobky-saytu-2026"));
  setLocalized(t, "title", "uk", "Кошторис на розробку сайту 2026: реальні приклади і з чого складається сума");
  setLocalized(t, "metaTitle", "uk", "Кошторис на розробку сайту 2026: реальні приклади і з чого складається сума");
  setLocalized(t, "title", "ru", "Смета на разработку сайта 2026: реальные примеры и из чего складывается сумма");
  setLocalized(t, "metaTitle", "ru", "Смета на разработку сайта 2026: реальные примеры | Code-Site.Art");
  insertLead(t, "uk", "Готові пакети з фіксованою ціною в доларах і гривнях — на сторінці [ціни на створення сайту](/pricing). Тут — як складається кошторис усередині цих цифр.", "](/pricing)");
  insertLead(t, "ru", "Готовые пакеты с фиксированной ценой в долларах и гривнах — на странице [цены на создание сайта](/ru/pricing). Здесь — как складывается смета внутри этих цифр.", "](/ru/pricing)");
}
{
  const t = touch(bySlug("prosuvannia-saitu-tsina-2026"));
  setLocalized(t, "title", "uk", "Бюджет на просування сайту у 2026: з чого складається і чому «гарантій топ-1» не буває");
  setLocalized(t, "title", "ru", "Бюджет на продвижение сайта в 2026: из чего складывается и почему «гарантий топ-1» не бывает");
  insertLead(t, "uk", "Наші пакети й ціни в гривнях — на сторінці [просування сайту: ціна](/seo). Нижче — з чого складається будь-який SEO-бюджет і як перевірити пропозицію підрядника.", "](/seo)");
  insertLead(t, "ru", "Наши пакеты и цены в гривнах — на странице [продвижение сайта: цена](/ru/seo). Ниже — из чего складывается любой SEO-бюджет и как проверить предложение подрядчика.", "](/ru/seo)");
}
{
  const t = touch(bySlug("rozrobka-saitu-medychnoho-tsentru-pid-kliuch"));
  setLocalized(t, "title", "uk", "Етапи розробки сайту медичного центру: що відбувається на кожному з 4 тижнів");
  setLocalized(t, "title", "ru", "Этапы разработки сайта медицинского центра: что происходит на каждой из 4 недель");
  insertLead(t, "uk", "Якщо вам потрібен не опис процесу, а підрядник, — склад робіт і ціни на сторінці [сайт під ключ для медичного центру](/sites-for/medicine/medychnyi-tsentr).", "](/sites-for/medicine/medychnyi-tsentr)");
  insertLead(t, "ru", "Если вам нужен не рассказ о процессе, а подрядчик, — состав работ и цены на странице [создание сайта для клиники](/ru/sites-for/medicine).", "](/ru/sites-for/medicine)");
}
const CITY = [
  ["rozrobka-saitu-kyiv", "/rozrobka-saitiv-kyiv", "Як обрати студію в Києві: ціни на сайти, розкид оцінок і як їх порівнювати", "Как выбрать студию в Киеве: цены на сайты, разброс оценок и как их сравнивать", "у Києві", "в Киеве"],
  ["rozrobka-saitu-lviv", "/rozrobka-saitiv-lviv", "Як обрати підрядника для сайту у Львові: попит, ціни і на що дивитися", "Как выбрать подрядчика для сайта во Львове: спрос, цены и на что смотреть", "у Львові", "во Львове"],
  ["rozrobka-saitu-odesa", "/rozrobka-saitiv-odesa", "Сайт для бізнесу в Одесі: попит, ціни і сезонність, яку варто закласти заздалегідь", "Сайт для бизнеса в Одессе: спрос, цены и сезонность, которую стоит заложить заранее", "в Одесі", "в Одессе"],
  ["rozrobka-saitu-dnipro", "/rozrobka-saitiv-dnipro", "Сайт для бізнесу в Дніпрі: попит, ціни і чому швидкість вирішує більше за дизайн", "Сайт для бизнеса в Днепре: спрос, цены и почему скорость решает больше дизайна", "у Дніпрі", "в Днепре"],
];
for (const [slug, landing, ukTitle, ruTitle, ukIn, ruIn] of CITY) {
  const t = touch(bySlug(slug));
  setLocalized(t, "title", "uk", ukTitle);
  setLocalized(t, "title", "ru", ruTitle);
  insertLead(t, "uk", `Шукаєте не огляд ринку, а підрядника? Ціни, кейси і склад робіт — на сторінці [розробка сайтів ${ukIn}](${landing}).`, `](${landing})`);
  insertLead(t, "ru", `Ищете не обзор рынка, а подрядчика? Цены, кейсы и состав работ — на странице [разработка сайтов ${ruIn}](/ru${landing}).`, `](/ru${landing})`);
}

/* ── C. Merge the medical SEO article ──────────────────────────────────── */
{
  const t = touch(bySlug("seo-dlia-medychnykh-saitiv"));
  t.unset.push("slugs.uk", "slugs.ru");
  t.notes.push("unset slugs.uk + slugs.ru (301 in next.config.ts), EN guide stays");
}
const REPOINT = [
  ["/blog/seo-dlia-medychnykh-saitiv", "/sites-for/medicine/seo"],
  ["/ru/blog/seo-dlya-medicinskih-saytov", "/ru/sites-for/medicine"],
];

/* ── E. RU bodies → RU pages ───────────────────────────────────────────── */
const RU_FIX = [
  [/^\/calculator$/, "/ru/calculator"],
  [/^\/pricing$/, "/ru/pricing"],
  [/^\/portfolio(\/.*)?$/, (m) => `/ru/portfolio${m[1] ?? ""}`],
  [/^\/audit$/, "/ru/audit"],
  [/^\/contacts$/, "/ru/contacts"],
];
function rewriteHrefs(blocks, fn) {
  let changed = 0;
  const walk = (v) => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out = {};
      for (const [k, val] of Object.entries(v)) {
        if (typeof val === "string" && ["href", "ctaHref", "ctaSecondaryHref", "buttonHref"].includes(k)) {
          const nv = fn(val);
          if (nv !== val) changed++;
          out[k] = nv;
        } else out[k] = walk(val);
      }
      return out;
    }
    return v;
  };
  return { blocks: walk(blocks), changed };
}
for (const d of all) {
  for (const locale of ["uk", "ru", "en"]) {
    const body = (plan.get(d._id)?.doc ?? d).body?.[locale];
    if (!Array.isArray(body)) continue;
    const { blocks, changed } = rewriteHrefs(body, (href) => {
      for (const [from, to] of REPOINT) if (href === from) return to;
      if (locale === "ru") {
        for (const [re, to] of RU_FIX) {
          const m = href.match(re);
          if (m) return typeof to === "function" ? to(m) : to;
        }
      }
      return href;
    });
    if (!changed) continue;
    const t = touch(d);
    t.doc.body[locale] = blocks;
    t.set[`body.${locale}`] = blocks;
    t.notes.push(`body.${locale}: ${changed} href(s) repointed`);
  }
}

/* ── D. Glossary → service ─────────────────────────────────────────────── */
const GLOSSARY = {
  "shcho-take-lending": {
    uk: ["Коли лендінг потрібен під конкретну послугу, подивіться, що входить у [розробку лендінгу під ключ](/landing) і скільки це коштує.", "/landing"],
    ru: ["Когда лендинг нужен под конкретную услугу, посмотрите, что входит в [разработку лендинга под ключ](/ru/landing) и сколько это стоит.", "/ru/landing"],
    en: ["If you need a landing page for a specific service, see what goes into [landing page development](/en/landing) and what it costs.", "/en/landing"],
  },
  "shcho-take-seo": {
    uk: ["Коли сайт уже є і потрібні заявки з пошуку, почніть із того, [скільки коштує просування сайту](/seo) і що входить у щомісячну роботу.", "/seo"],
    ru: ["Когда сайт уже есть и нужны заявки из поиска, начните с того, [сколько стоит продвижение сайта](/ru/seo) и что входит в ежемесячную работу.", "/ru/seo"],
    en: ["When the site exists and you need enquiries from search, start with [what SEO services cost](/en/seo) and what the monthly work includes.", "/en/seo"],
  },
  "shcho-take-cms": {
    uk: ["CMS входить у кожен наш [корпоративний сайт під ключ](/corporate-site): тексти, ціни й сторінки ви редагуєте самі.", "/corporate-site"],
    ru: ["CMS входит в каждый наш [корпоративный сайт под ключ](/ru/corporate-site): тексты, цены и страницы вы редактируете сами.", "/ru/corporate-site"],
    en: ["A CMS comes with every [corporate website we build](/en/corporate-site): you edit copy, prices and pages yourself.", "/en/corporate-site"],
  },
  "shcho-take-api": {
    uk: ["Інтеграції з CRM, оплатою й обліковими системами ми закладаємо в [корпоративні сайти](/corporate-site) і рахуємо окремим рядком кошторису.", "/corporate-site"],
    ru: ["Интеграции с CRM, оплатой и учётными системами мы закладываем в [корпоративные сайты](/ru/corporate-site) и считаем отдельной строкой сметы.", "/ru/corporate-site"],
    en: ["CRM, payment and accounting integrations are part of the [corporate websites we build](/en/corporate-site), priced as a separate line.", "/en/corporate-site"],
  },
  "shcho-take-core-web-vitals": {
    uk: ["Перевірити Core Web Vitals і все, що гальмує ваш сайт, можна в межах [аудиту сайту за $300](/audit).", "/audit"],
    ru: ["Проверить Core Web Vitals и всё, что тормозит ваш сайт, можно в рамках [аудита сайта за $300](/ru/audit).", "/ru/audit"],
    en: ["Core Web Vitals are part of the technical work in our [SEO services](/en/seo).", "/en/seo"],
  },
  "shcho-take-domen": {
    uk: ["Домен, хостинг, SSL і оновлення після запуску — частина [обслуговування сайту](/support); для наших проєктів перший рік у ціні.", "/support"],
    ru: ["Домен, хостинг и SSL для наших проектов оформляются на клиента, первый год поддержки — в [цене разработки сайта](/ru/pricing).", "/ru/pricing"],
    en: ["For the sites we build, the domain is registered to you and the first year of hosting is included in the [website price](/en/pricing).", "/en/pricing"],
  },
  "shcho-take-hosting": {
    uk: ["Хостинг, бекапи і моніторинг після запуску бере на себе [обслуговування сайту](/support); для наших проєктів перший рік у ціні.", "/support"],
    ru: ["Хостинг для наших проектов первый год включён в [цену разработки сайта](/ru/pricing), дальше — поддержка от $200/мес.", "/ru/pricing"],
    en: ["For the sites we build, the first year of hosting is included in the [website price](/en/pricing).", "/en/pricing"],
  },
  "shcho-take-favicon": {
    uk: ["Фавікон, мета-теги й інші дрібниці, які роблять сайт впізнаваним у видачі, ми перевіряємо під час [аудиту сайту](/audit).", "/audit"],
    ru: ["Фавикон, мета-теги и другие мелочи, которые делают сайт узнаваемым в выдаче, мы проверяем во время [аудита сайта](/ru/audit).", "/ru/audit"],
    en: ["Favicons, meta tags and the other details that make a site recognisable in search are part of our [SEO services](/en/seo).", "/en/seo"],
  },
  "shcho-take-cta": {
    uk: ["Якщо заклики до дії є, а заявок немає, проблема зазвичай у структурі сторінки — з цим працює [редизайн сайту без втрати позицій](/redesign).", "/redesign"],
    ru: ["Если призывы к действию есть, а заявок нет, проблема обычно в структуре страницы — с этим работает [редизайн сайта без потери позиций](/ru/redesign).", "/ru/redesign"],
    en: ["If the calls to action are there but enquiries are not, the page structure is usually the problem — see how we build a [landing page that converts](/en/landing).", "/en/landing"],
  },
  "shcho-take-yuzabiliti": {
    uk: ["Юзабіліті-розбір вашого сайту зі списком правок за пріоритетами входить в [аудит сайту за $300](/audit).", "/audit"],
    ru: ["Юзабилити-разбор вашего сайта со списком правок по приоритетам входит в [аудит сайта за $300](/ru/audit).", "/ru/audit"],
    en: ["Usability is designed in from the first screen of every [landing page we build](/en/landing).", "/en/landing"],
  },
  "konversiia-saitu-yak-rakhuvaty": {
    uk: ["Коли трафік є, а конверсія низька, переробити сторінки дешевше, ніж купувати більше реклами, — див. [редизайн сайту](/redesign).", "/redesign"],
    ru: ["Когда трафик есть, а конверсия низкая, переделать страницы дешевле, чем покупать больше рекламы, — см. [редизайн сайта](/ru/redesign).", "/ru/redesign"],
  },
  "shvydkist-zavantazhennia-saitu": {
    uk: ["Що саме гальмує ваш сайт і скільки коштує це виправити, покаже [аудит сайту](/audit).", "/audit"],
    ru: ["Что именно тормозит ваш сайт и сколько стоит это исправить, покажет [аудит сайта](/ru/audit).", "/ru/audit"],
  },
  "shcho-take-llms-txt": {
    uk: ["llms.txt — лише одна деталь видимості в AI-пошуку; решту закриває [просування сайту](/seo).", "/seo"],
    ru: ["llms.txt — лишь одна деталь видимости в AI-поиске; остальное закрывает [продвижение сайта](/ru/seo).", "/ru/seo"],
  },
};
for (const [slug, byLocale] of Object.entries(GLOSSARY)) {
  const t = touch(bySlug(slug));
  for (const [locale, [text, href]] of Object.entries(byLocale)) appendLink(t, locale, text, href);
}

/* ── F. Industry pages ─────────────────────────────────────────────────── */
function setIndustry(slug, path, value, note) {
  const d = ind(slug);
  const t = touch(d);
  t.set[path] = value;
  t.notes.push(note);
}
const sectionIndex = (slug, k) => ind(slug).sections.findIndex((s) => s._key === k);
{
  const i = sectionIndex("medicine", "sect");
  setIndustry("medicine", `sections[_key=="sect"].heading`, {
    ...ind("medicine").sections[i].heading,
    uk: "WordPress чи розробка з нуля:\nщо краще для сайту клініки",
    ru: "WordPress или разработка с нуля:\nчто лучше для сайта клиники",
  }, "medicine comparison heading (no «кодовий»)");
}
{
  const i = sectionIndex("legal", "leg-sec-47");
  setIndustry("legal", `sections[_key=="leg-sec-47"].heading`, {
    ...ind("legal").sections[i].heading,
    uk: "Сайт для адвоката і юр-фірми: що ми будуємо",
    ru: "Сайт для адвоката и юр-фирмы: что мы строим",
  }, "legal services heading + «сайт для адвоката»");
}
{
  const i = sectionIndex("real-estate", "rea-sec-47");
  setIndustry("real-estate", `sections[_key=="rea-sec-47"].heading`, {
    ...ind("real-estate").sections[i].heading,
    uk: "Сайт для агентства нерухомості: що ми будуємо",
    ru: "Сайт для агентства недвижимости: что мы строим",
  }, "real-estate services heading + «агентства нерухомості»");
}
{
  const d = ind("legal");
  setIndustry("legal", "seo.title", { ...d.seo.title, en: "Websites for Solicitors & Law Firms in the UK | Code-Site.Art" }, "legal EN title: solicitors first");
  setIndustry("legal", "hero.heading", { ...d.hero.heading, en: "Websites for solicitors that *get enquiries*" }, "legal EN H1 with «solicitors»");
}
{
  const d = ind("finance");
  setIndustry("finance", "seo.title", { ...d.seo.title, en: "Website Design for Accountants & Financial Services, UK | Code-Site.Art" }, "finance EN title: accountants");
}
{
  // Renovation: the WordPress comparison («розробка сайтів на wordpress для
  // будівельних компаній», 14,6) sat 7th of 9 sections — move it right after
  // the before/after case.
  const d = ind("renovation");
  const secs = [...d.sections];
  const from = secs.findIndex((s) => s._key === "sec16");
  const caseAt = secs.findIndex((s) => s._key === "secn");
  if (from > caseAt + 1) {
    const [moved] = secs.splice(from, 1);
    secs.splice(caseAt + 1, 0, moved);
    setIndustry("renovation", "sections", secs, "renovation: WordPress comparison moved after the case");
  }
}

/* ── Report / apply ────────────────────────────────────────────────────── */
for (const [id, t] of plan) if (!Object.keys(t.set).length && !t.unset.length) plan.delete(id);
console.log(`creates: ${creates.length}`);
for (const c of creates) console.log("  +", c._type, c._id, c.slug.current);
console.log(`patched docs: ${plan.size}`);
for (const [id, t] of plan) {
  console.log(`\n${id}  (${t.doc._type} ${t.doc.slugs?.uk?.current ?? t.doc.slug?.current ?? ""})`);
  for (const n of t.notes) console.log("  -", n);
}
if (DRY) {
  console.log("\n--dry-run: nothing written");
  process.exit(0);
}
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(HERE, "backup", `before-apply-${stamp}`);
mkdirSync(backupDir, { recursive: true });
const originals = await client.fetch(`*[_id in $ids]`, { ids: [...plan.keys()] });
writeFileSync(join(backupDir, "docs.json"), JSON.stringify(originals, null, 1));
console.log(`\nbackup: ${backupDir}`);
const tx = client.transaction();
for (const c of creates) tx.createIfNotExists(c);
for (const [id, t] of plan) {
  let p = client.patch(id).ifRevisionId(t.doc._rev);
  if (Object.keys(t.set).length) p = p.set(t.set);
  if (t.unset.length) p = p.unset(t.unset);
  tx.patch(p);
}
const res = await tx.commit({ autoGenerateArrayKeys: false });
console.log("committed:", res.transactionId, "results:", res.results.length);
