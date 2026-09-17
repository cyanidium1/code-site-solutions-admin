// Shared string rewriter for the paid-audit rollout (2026-09-18).
// Dry run + review lived in the site repo; this module is the reviewed rules.
const HIT = /безкоштовн|бесплатн|\bfree\b|за 24 годин|за 24 час|within 24 hours|\$300|£300|експрес-перевір|экспресс-провер/i;
// Legitimately free / unrelated to audits: warranty, SSL, hosting tiers, Google's
// own tools, a free lesson on a course site, free delivery, CMS seats, organic
// ("free") traffic, DIY checks the reader runs, and the intro call itself.
const KEEP = /SSL|хостинг|hosting|урок|lesson|доставк|delivery|Search Console|PageSpeed|Clarity|Analytics|Reminders|Напомин|списан|гарант|warrant|тариф|\bplan\b|tier|Sanity|редактор|editors|команд|team|дзвінок-знайомство|звонок-знакомство|intro call|школ|school|пробн|trial|Google Sites|видач|выдач|трафік|трафик|traffic|повторні візити|повторные визиты|repeat visits|самостійно|самостоятельно|yourself|за 2 хвилини|за 2 минуты|in 2 minutes|comission|commission/i;

const AUDIT = /аудит|audit|розбір|разбор|teardown/i;
const SEO_CTX = /SEO|пошук|поиск|позици|позиці|ранж|семантик|індексац|индексац|indexing/i;

function rewrite(t, docCtx = "") {
  let s = t;
  // A one-off audit in an SEO context is now the $450 deep SEO audit; anywhere
  // else it is the $150 site audit. The document decides when the sentence
  // itself is silent (a price line inside an SEO guide, say).
  const price = SEO_CTX.test(t) || SEO_CTX.test(docCtx) ? "450" : "150";

  // 1. "send us the link and we'll teardown your site for free" CTAs.
  //    Explicit sentences: a generic pattern produced broken grammar.
  const CTA = [
    ["Надішліть посилання — за 24 години повернемо розбір: що в дизайні працює проти вас і скільки коштує виправити.",
     "Надішліть посилання — на аудиті сайту за $$150 розберемо за годину: що в дизайні працює проти вас і скільки коштує виправити."],
    ["Пришлите ссылку — за 24 часа вернём разбор: что в дизайне работает против вас и сколько стоит исправить.",
     "Пришлите ссылку — на аудите сайта за $$150 разберём за час: что в дизайне работает против вас и сколько стоит исправить."],
    ["Send the link — within 24 hours you'll get a teardown: what in the design works against you and what it costs to fix.",
     "Send the link — the $$150 website audit covers it in an hour: what in the design works against you and what it costs to fix."],
    ["Надішліть посилання — за 24 години повернемо звіт зі швидкості та SEO: що гальмує, що виправляється правками, а що впирається в платформу.",
     "Надішліть посилання — на аудиті сайту за $$150 розберемо швидкість і SEO: що гальмує, що виправляється правками, а що впирається в платформу."],
    ["Пришлите ссылку — за 24 часа вернём отчёт по скорости и SEO: что тормозит, что исправляется правками, а что упирается в платформу.",
     "Пришлите ссылку — на аудите сайта за $$150 разберём скорость и SEO: что тормозит, что исправляется правками, а что упирается в платформу."],
    ["Send the link — within 24 hours you'll get a speed and SEO report: what's braking, what's fixable with edits, and what's capped by the platform.",
     "Send the link — the $$150 website audit covers speed and SEO: what's braking, what's fixable with edits, and what's capped by the platform."],
    ["Надішліть посилання на сайт — за 24 години повернемо розбір: які з 9 прийомів у вас відсутні і що це коштує в заявках.",
     "Надішліть посилання на сайт — на аудиті сайту за $$150 покажемо, які з 9 прийомів у вас відсутні і що це коштує в заявках."],
    ["Пришлите ссылку на сайт — за 24 часа вернём разбор: какие из 9 приёмов у вас отсутствуют и что это стоит в заявках.",
     "Пришлите ссылку на сайт — на аудите сайта за $$150 покажем, каких из 9 приёмов у вас нет и что это стоит в заявках."],
    ["Send your site's link — within 24 hours you'll get a teardown: which of the 9 moves you're missing and what that costs in enquiries.",
     "Send your site's link — the $$150 website audit shows which of the 9 moves you're missing and what that costs in enquiries."],
    ["Надішліть посилання — за 24 години повернемо розбір із пріоритетами: що втрачає пацієнтів уже сьогодні і скільки коштує виправити.",
     "Надішліть посилання — на аудиті сайту за $$150 розберемо за пріоритетами: що втрачає пацієнтів уже сьогодні і скільки коштує виправити."],
    ["Пришлите ссылку — за 24 часа вернём разбор с приоритетами: что теряет пациентов уже сегодня и сколько стоит исправить.",
     "Пришлите ссылку — на аудите сайта за $$150 разберём по приоритетам: что теряет пациентов уже сегодня и сколько стоит исправить."],
    ["Send the link — within 24 hours you'll get a prioritised teardown: what's losing patients today and what it costs to fix.",
     "Send the link — the $$150 website audit gives a prioritised teardown: what's losing patients today and what it costs to fix."],
    ["Надішліть посилання на сайт — за 24 години повернемо безкоштовний розбір із пріоритетами: що втрачає пацієнтів і скільки коштує виправлення. Без зобовʼязань.",
     "Надішліть посилання на сайт — на аудиті сайту за $$150 розберемо за пріоритетами: що втрачає пацієнтів і скільки коштує виправлення. Запис і PDF лишаються у вас."],
    ["Пришлите ссылку на сайт — за 24 часа вернём бесплатный разбор с приоритетами: что теряет пациентов и сколько стоит исправление. Без обязательств.",
     "Пришлите ссылку на сайт — на аудите сайта за $$150 разберём по приоритетам: что теряет пациентов и сколько стоит исправление. Запись и PDF остаются у вас."],
    ["Send us your link — within 24 hours you'll get a free prioritised teardown: what's losing patients and what fixes cost. No obligations.",
     "Send us your link — the $$150 website audit gives a prioritised teardown: what's losing patients and what the fixes cost. The recording and the PDF are yours."],
    ["Есть сайт клиники? Пришлите — разберём за 24 часа", "Аудит сайта вашей клиники — $$150"],
    ["Є сайт клініки? Надішліть — розберемо за 24 години", "Аудит сайту вашої клініки — $$150"],
    ["Калькулятор за 60 секунд порахує вилку під ваш проєкт — з розбивкою, без email і розмови з менеджером. Або надішліть посилання на поточний сайт: за 24 години повернемо безкоштовний розбір.",
     "Калькулятор за 60 секунд порахує вилку під ваш проєкт — з розбивкою, без email і розмови з менеджером. Або замовте аудит сайту за $$150: година розбору на відеодзвінку, запис і PDF."],
    ["Калькулятор за 60 секунд посчитает вилку под ваш проект — с разбивкой, без email и разговора с менеджером. Или пришлите ссылку на текущий сайт: за 24 часа вернём бесплатный разбор.",
     "Калькулятор за 60 секунд посчитает вилку под ваш проект — с разбивкой, без email и разговора с менеджером. Или закажите аудит сайта за $$150: час разбора на видеозвонке, запись и PDF."],
    ["The calculator prices your project in 60 seconds — full breakdown, no email gate, no sales call. Or send us your current site: within 24 hours you'll get a free teardown.",
     "The calculator prices your project in 60 seconds — full breakdown, no email gate, no sales call. Or order the $$150 website audit: an hour on a call, the recording and a PDF."],
  ];
  for (const [a, b] of CTA) if (s === a) return b.replace(/\$\$/g, "$");

  // (The "no obligations" tail is rewritten inside the explicit CTA map above;
  //  as a standalone rule it also hit unrelated free-quote sentences.)

  // 3. express check / free quote-by-teardown
  s = s.replace(/Розбір за \$300, експрес-перевірка безкоштовна\./i, "Аудит сайту — $$150. Перед оплатою — безкоштовний 30-хвилинний дзвінок-знайомство.");
  s = s.replace(/Разбор за \$300, экспресс-проверка бесплатно\./i, "Аудит сайта — $$150. Перед оплатой — бесплатный 30-минутный звонок-знакомство.");
  s = s.replace(/Точну цифру дає безкоштовний розбір за 24 години\./i, "Точну цифру назвемо на безкоштовному 30-хвилинному дзвінку-знайомстві.");
  s = s.replace(/Точную цифру даёт бесплатный разбор за 24 часа\./i, "Точную цифру назовём на бесплатном 30-минутном звонке-знакомстве.");
  s = s.replace(/The free 24-hour teardown gives you the exact number\./i, "A free 30-minute intro call gives you the exact number.");
  s = s.replace(/після безкоштовного розбору/i, "після безкоштовного дзвінка-знайомства");
  s = s.replace(/после бесплатного разбора/i, "после бесплатного звонка-знакомства");
  s = s.replace(/after a free teardown/i, "after a free intro call");

  // 4. free CTA review offers
  s = s.replace(/і ми безкоштовно подивимося на CTA вашої сторінки/i, "і на безкоштовному дзвінку-знайомстві подивимося на CTA вашої сторінки");
  s = s.replace(/и мы бесплатно посмотрим на CTA вашей страницы/i, "и на бесплатном звонке-знакомстве посмотрим на CTA вашей страницы");
  s = s.replace(/we will review its calls to action for free/i, "we'll look at its calls to action on a free intro call");

  // 5. "the free audit will show yours"
  s = s.replace(/Безкоштовний аудит покаже свої\./i, "Аудит сайту за $$150 покаже ваші.");
  s = s.replace(/Бесплатный аудит покажет свои\./i, "Аудит сайта за $$150 покажет ваши.");
  s = s.replace(/The free audit will show yours\./i, "The $$150 website audit will show yours.");

  // 6. meta-description tails
  s = s.replace(/➡ безкоштовний розбір сайту/i, "➡ аудит сайту від $$150");
  s = s.replace(/➡ бесплатный разбор сайта/i, "➡ аудит сайта от $$150");
  s = s.replace(/➡ free website review/i, "➡ website audit from $$150");
  s = s.replace(/➡ Безкоштовна консультація\./i, "➡ Безкоштовний дзвінок-знайомство.");
  s = s.replace(/➡ Бесплатная консультация\./i, "➡ Бесплатный звонок-знакомство.");
  s = s.replace(/➡ Free consultation\./i, "➡ Free intro call.");

  // 7. short labels
  s = s.replace(/^Отримати розбір за 24 години$/i, "Замовити аудит сайту");
  s = s.replace(/^Получить разбор за 24 часа$/i, "Заказать аудит сайта");
  s = s.replace(/^Отримати безкоштовний аудит$/i, "Замовити аудит сайту");
  s = s.replace(/^Получить бесплатный аудит$/i, "Заказать аудит сайта");
  s = s.replace(/^Get (my|a) free audit$/i, "Order the website audit");
  s = s.replace(/^Безкоштовний розбір$/i, "Аудит сайту — $$150");
  s = s.replace(/^Бесплатный разбор$/i, "Аудит сайта — $$150");
  s = s.replace(/^Free teardown$/i, "Website audit — $$150");
  s = s.replace(/^Безкоштовний розбір вашого сайту$/i, "Аудит вашого сайту — $$150");
  s = s.replace(/^Бесплатный разбор вашего сайта$/i, "Аудит вашего сайта — $$150");
  s = s.replace(/^A free review of your website$/i, "A $$150 audit of your website");
  s = s.replace(/^Получите бесплатный разбор сайта вашей клиники$/i, "Аудит сайта вашей клиники — $$150");
  s = s.replace(/^Get a free audit of your clinic website$/i, "A $$150 audit of your clinic website");
  s = s.replace(/^Безкоштовний аудит (.+)$/i, "Аудит $1 — $$150");
  s = s.replace(/^Бесплатный аудит (.+)$/i, "Аудит $1 — $$150");
  s = s.replace(/^Free audit of (.+)$/i, "A $$150 audit of $1");

  // 8. the old $300 one-off audit → deep SEO $450 (SEO context) or site audit $150.
  //    Retainers ($300/mo, £300–500/mo, "from £300") keep their number.
  if (AUDIT.test(s)) {
    // Retainers keep their numbers: "$300/мес", "from £300/mo", "£300–500/mo",
    // "£300 to £2,000+ a month". Only a standalone audit price moves.
    const KEEP_NUM = /^\s*(\/|–|-|—\s*[£$]?\d|(to|до|per)\b|a month\b|в месяц|в місяць|на місяць|на месяц)/i;
    s = s.replace(/([$£])300/g, (m, sym, idx) => {
      if (KEEP_NUM.test(s.slice(idx + m.length))) return m;
      // The price must belong to an audit, not to a CRM integration that
      // happens to share a sentence with the word "аудит".
      return AUDIT.test(s.slice(Math.max(0, idx - 60), idx + 60)) ? `${sym}${price}` : m;
    });
    s = s.replace(/Разовий SEO-аудит/g, "Глибокий SEO-аудит").replace(/Разовый SEO-аудит/g, "Глубокий SEO-аудит")
      .replace(/One-off SEO audit/g, "Deep SEO audit").replace(/one-off SEO audit/g, "deep SEO audit")
      .replace(/Разовий аудит/g, "Глибокий SEO-аудит").replace(/Разовый аудит/g, "Глубокий SEO-аудит")
      .replace(/A one-off audit/g, "The deep SEO audit").replace(/a one-off audit/g, "the deep SEO audit");
  }

  return s;
}


export { HIT, KEEP, AUDIT, SEO_CTX, rewrite };
