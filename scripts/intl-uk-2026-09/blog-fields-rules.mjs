/**
 * Rules for blog-fields.mjs that run before the 2026-09-22 rules.
 * Figures mirror src/constants/pricing.ts (frontend) as of 2026-09-27:
 * en (intl, EUR): landing €1,200 / 3 working days, business €2,500 /
 * 7 working days, industry €4,500 / 14–21 working days, custom from €9,000 /
 * from 6 weeks, SEO from €800/month, audit free.
 */

const CLINIC_COST = "691506aa-d76b-492c-b85d-62cc492db317";
const CLINIC_TURNKEY = "b0a6ca40-e2fd-45c8-a3ad-5c5748e54e5b";
const HOSPITAL = "f5eb3ad4-86b9-4923-97ae-4c513ff93264";
const MED_SEO = "b83bb99b-0289-4f44-a937-3263b8f8fcf3";
const MED_TRUST = "545055df-57c5-4936-80aa-af8f0b818f42";
const CLINIC_MISTAKES = "7ec1328a-38a9-4517-944a-cbde747e402e";
const LAWYER = "ltAug2026-sait-dlia-advokata";
const SOLICITORS = "seoArt2026-websites-for-solicitors";
const ACCOUNTING = "ltAug2026-sait-bukhhalterskykh-posluh";
const ACCOUNTANTS = "seoArt2026-web-design-for-accountants";

/** Whole-string rules, per document and locale. */
export const FIELD_EXACT = {
  [CLINIC_COST]: {
    en: {
      "A clinic website costs £3,500 to £12,000+ in 2026. Here's what sits behind the number, a line-by-line quote for a core site — and the items where saving money costs you patients.":
        "A clinic website costs €4,500 with us in 2026, while UK quotes run from £300 to £15,000. Here's what sits behind the number, our quote line by line — and the items where saving money costs you patients.",
      "➤ A UK clinic website costs £3,500–£12,000+ ✔️ Line-by-line quote: online booking, practitioner directory, price list ✔️ Where not to cut costs ➡ Breakdown.":
        "➤ What a UK clinic website costs in 2026 ✔️ Our €4,500 quote line by line: online booking, practitioner directory, price list ✔️ Where not to cut costs ➡ Breakdown.",
      "The core package is 4 weeks from brief to release; extended is 6. The deadline is fixed in the contract — if we miss it through our own fault, we pay a 30% rebate.":
        "The core package takes 14–21 working days from brief to release; an extended build takes longer. The deadline is fixed in the contract — if we miss it through our own fault, we pay a 30% rebate.",
      "I run a small practice, not a clinic. Anything below £3,500?": "I run a small practice, not a clinic. Anything below €4,500?",
      "Yes — a landing page from £800: one page with services, fees and an enquiry form. No online booking or practitioner directory, but for a solo practice at the start it's often enough. The architecture scales — you can grow it into a full site later without a rebuild.":
        "Yes — a landing page for €1,200: one page with services, fees and an enquiry form. No online booking or practitioner directory, but for a solo practice at the start it's often enough. The architecture scales — you can grow it into a full site later without a rebuild.",
    },
  },
  [CLINIC_TURNKEY]: {
    en: {
      "➤ A turnkey clinic website in 4 weeks from £3,500 ✔️ The step-by-step process: brief, design, integrations, launch ✔️ Your involvement — 5 hours ➡ How it works.":
        "➤ A turnkey clinic website in 14–21 working days for €4,500 ✔️ The step-by-step process: brief, design, integrations, launch ✔️ Your involvement — 5 hours ➡ How it works.",
    },
  },
  [HOSPITAL]: {
    en: {
      'A practice, a clinic and a hospital all ask for "a website" — but mean three different tools with budgets from £800 to £12,000+. Here\'s which format is yours and how not to overpay.':
        'A practice, a clinic and a hospital all ask for "a website" — but mean three different tools with budgets from €1,200 to €9,000+. Here\'s which format is yours and how not to overpay.',
      "➤ A practice needs a landing from £800, a clinic a site from £3,500, a hospital from £12,000 ✔️ A format comparison table ✔️ How not to overbuy ➡ The breakdown.":
        "➤ A practice needs a €1,200 landing, a clinic a €4,500 site, a hospital a custom build from €9,000 ✔️ A format comparison table ✔️ How not to overbuy ➡ The breakdown.",
      'We have two locations. Is that already a £12,000 "group"?': 'We have two locations. Is that already a €9,000 "group"?',
      "Not necessarily. Two locations often fit the extended format: separate location pages with addresses and schedules. £12,000+ is for groups with distinct service structures, heavy integrations and an SLA.":
        "Not necessarily. Two locations often fit the extended format: separate location pages with addresses and schedules. A custom build from €9,000 is for groups with distinct service structures, heavy integrations and an SLA.",
      "A landing page takes 1–2 weeks, a clinic site 4, extended 6, a group 8–10. Deadlines are fixed in the contract — if we miss ours, we pay a 30% rebate.":
        "A landing page takes 3 working days, a clinic site 14–21 working days, an extended site about 6 weeks, a group 8–10 weeks. Deadlines are fixed in the contract — if we miss ours, we pay a 30% rebate.",
    },
  },
  [MED_SEO]: {
    en: {
      "80% of patients never scroll past page one of Google. Code-Site.Art's SEO specialist breaks down what medical SEO is made of — and why local search beats generic queries.":
        "Most patients never scroll past page one of Google. Code-Site.Art's SEO specialist breaks down what medical SEO is made of — and why local search beats generic queries.",
      "A one-off audit is £300. A clinic retainer typically runs £300–500/mo depending on local competition and the number of services. Every month you see a report with rankings, traffic and the work done.":
        "A one-off audit is free. A clinic retainer is from €800/mo depending on local competition and the number of services. Every month you see a report with rankings, traffic and the work done.",
      "Yes, after a £450 audit. If the site runs on a builder or old WordPress, we'll show the platform's ceiling honestly and price both routes: promote as-is, or migrate first.":
        "Yes, after a free audit. If the site runs on a builder or old WordPress, we'll show the platform's ceiling honestly and price both routes: promote as-is, or migrate first.",
    },
  },
  [MED_TRUST]: {
    en: {
      "We don't sell design on its own — it's part of clinic website development from £3,500, together with the build, integrations and launch. A redesign of an existing site is quoted after a free intro call.":
        "We don't sell design on its own — it's part of a €4,500 clinic website, together with the build, integrations and launch. A redesign of an existing site is quoted after a free intro call.",
    },
  },
  [CLINIC_MISTAKES]: {
    en: {
      "It depends on the site. Targeted fixes on custom code are hours of work. If you're on a builder and half the list is technically impossible, a new clinic site from £3,500 closes all 15 items at once.":
        "It depends on the site. Targeted fixes on custom code are hours of work. If you're on a builder and half the list is technically impossible, a new €4,500 clinic site closes all 15 items at once.",
    },
  },
  [LAWYER]: {
    en: {
      "The full anatomy of an attorney website: practice-area pages, a credentialed profile, ethics-safe case results and honest pricing — from an £800 solo site to a £3,500+ firm website.":
        "The full anatomy of an attorney website: practice-area pages, a credentialed profile, ethics-safe case results and honest pricing — from a €1,200 solo site to a €4,500 firm website.",
      "➤ Attorney website essentials in one guide. ✔️ Must-have pages and trust blocks ✔️ Solo site from £800, firm site from £3,500 ➡ Real examples inside.":
        "➤ Attorney website essentials in one guide. ✔️ Must-have pages and trust blocks ✔️ Solo site €1,200, firm site €4,500 ➡ Real examples inside.",
      "A solo attorney website starts at £800 and takes 2–3 weeks. A law firm website with dedicated practice-area pages starts at £3,500 and takes 4–8 weeks. A custom platform with a client portal starts at £6,000. The main cost drivers are the number of practice-area pages, language versions and integrations.":
        "A solo attorney website is €1,200 and takes 3 working days. A law firm website with dedicated practice-area pages is €4,500 and takes 14–21 working days. A custom platform with a client portal starts at €9,000. The main cost drivers are the number of practice-area pages, language versions and integrations.",
      "A solo attorney site takes 2–3 weeks. A law firm website with 5–8 practice-area pages, team profiles and case results takes 4–8 weeks. The longest stage is usually not design but content: gathering practice details and getting client consent for case studies.":
        "A solo attorney site takes 3 working days. A law firm website with 5–8 practice-area pages, team profiles and case results takes 14–21 working days. The longest stage is usually not design but content: gathering practice details and getting client consent for case studies.",
    },
  },
  [SOLICITORS]: {
    en: {
      "A realistic bracket for a custom law-firm site is £3,500–£6,500: practice-area architecture, SRA-compliant fee pages, solicitor profiles, review integration and a year of support. Multi-office firms with bespoke calculators or client portals sit above that.":
        "With us a custom law-firm site is €4,500: practice-area architecture, fee pages built to the SRA Transparency Rules, solicitor profiles, review integration and a year of support. Multi-office firms with bespoke calculators or client portals are a custom build from €9,000.",
    },
  },
  [ACCOUNTING]: {
    en: {
      "➤ What an accounting firm website needs ✔️ Retainer packages with prices ✔️ Fee calculator ✔️ Trust signals ➡ Cost: from £800 for a one-pager, from £3,500 for a full site.":
        "➤ What an accounting firm website needs ✔️ Retainer packages with prices ✔️ Fee calculator ✔️ Trust signals ➡ Cost: €1,200 for a one-pager, from €2,500 for a full site.",
      "A solo accountant's one-page site starts at £800 and takes 2–3 weeks. A full bookkeeping firm website with pricing packages, a blog and a CMS starts at £3,500. A fee calculator adds £200–500; complex CRM-connected logic runs £1,000–3,000.":
        "A solo accountant's one-page site is €1,200 and takes 3 working days. A full bookkeeping firm website with pricing packages, a blog and a CMS starts at €2,500. A fee calculator adds €240–600; complex CRM-connected logic runs €1,200–3,600.",
      "A solo accountant's one-pager takes 2–3 weeks. A full firm website with a calculator, pricing packages and a blog takes 4–8 weeks depending on page count and integrations. Content is the slowest stage — prepare service copy and fee tables in parallel with design.":
        "A solo accountant's one-pager takes 3 working days. A full firm website with a calculator, pricing packages and a blog takes from 7 working days, depending on page count and integrations. Content is the slowest stage — prepare service copy and fee tables in parallel with design.",
    },
  },
  [ACCOUNTANTS]: {
    en: {
      "➤ Web design for accountants and accountancy firms in the UK ✔️ Fixed prices from £800, no quote-on-a-call ✔️ Trust signals, a page per service, fee transparency ➡ What to ask before you sign.":
        "➤ Web design for accountants and accountancy firms in the UK ✔️ Fixed prices from €1,200, no quote-on-a-call ✔️ Trust signals, a page per service, fee transparency ➡ What to ask before you sign.",
      "A credible bracket for a custom accountancy-firm site is £3,500–£6,500: service-per-page structure, copywriting, a review widget, booking integration and a year of support. Template rebuilds are cheaper but usually inherit the one-page-services problem that keeps firms invisible in search.":
        "With us a custom accountancy-firm site starts at €2,500: a page per service, copy written from your brief, a review widget and a year of support; online booking is a €600 add-on. Template rebuilds are cheaper but usually inherit the one-page-services problem that keeps firms invisible in search.",
    },
  },
};

/**
 * Whole-string rules, any document. A value equal to its key pins a string
 * the shared rules would otherwise get wrong (a tour price, a market figure).
 */
export const FIELD_EXACT_ALL = {
  // Hand-checked UA/RU strings: ranges, industry prices, the tour budget (kept), «24/7».
  uk: {
    "Лендінг — 1–2 тижні, сайт клініки — 4, розширений — 6, мережа — 8–10. Терміни фіксуються в договорі; за зрив із нашої вини платимо неустойку 30%.":
      "Лендінг — 3 робочі дні, сайт клініки — 14–21 робочий день, розширений — близько 6 тижнів, мережа — 8–10 тижнів. Терміни фіксуються в договорі; за зрив із нашої вини платимо неустойку 30%.",
    "Лендінг для майстра — від $800, повноцінний сайт салону з онлайн-записом — $1 500–3 000, сайт мережі салонів — від $2 500. Інтеграція з altegio чи DIKIDI додає $200–500. Точна ціна залежить від кількості сторінок, галереї та інтеграцій.":
      "Лендінг для майстра — $600, сайт салону — $1 000 і ще $300 за онлайн-запис, сайт мережі салонів — від $1 000. Інтеграція з altegio чи DIKIDI додає $300. Точна ціна залежить від кількості сторінок, галереї та інтеграцій.",
    "У мене маленький кабінет, а не клініка. Чи є щось дешевше за $3,500?":
      "У мене маленький кабінет, а не клініка. Чи є щось дешевше за $1 800?",
    "У нашому прайсі кампанія починається від $300 на місяць для сайтів послуг і від $500 для магазинів, разовий аудит — $450. Клієнт із данського прикладу платить близько €600 на місяць — там дорожчий ринок і в бюджет входять статті. Головне при виборі підрядника — не ціна, а чи показує він вам ціну заявки, а не кількість позицій у топі.":
      "У нашому прайсі кампанія починається від $400 на місяць для сайтів послуг і від $600 для магазинів, аудит — безкоштовний. Клієнт із данського прикладу платить близько €600 на місяць — там дорожчий ринок і в бюджет входять статті. Головне при виборі підрядника — не ціна, а чи показує він вам ціну заявки, а не кількість позицій у топі.",
    "У нас дві філії. Це вже «мережа» за $12,000?":
      "У нас дві філії. Це вже «мережа» за $4 000?",
    "Не обовʼязково. Дві локації часто вкладаються в розширений формат: окремі сторінки локацій з адресами і розкладами. $12,000+ — це коли у філій різні структури послуг, великі інтеграції і потрібен SLA.":
      "Не обовʼязково. Дві локації часто вкладаються в розширений формат: окремі сторінки локацій з адресами і розкладами. Кастомна платформа від $4 000 — це коли у філій різні структури послуг, великі інтеграції і потрібен SLA.",
    "Самі системи здебільшого безкоштовні — платять за налаштування під ваш контент і за підтримку. У нас CMS входить у проєкти від $2 500, зокрема в корпоративний сайт від $2 500, окремо ми її не рахуємо. Конструктори працюють інакше: підписка $10–50 на місяць, і платити доводиться весь час, поки сайт живий.":
      "Самі системи здебільшого безкоштовні — платять за налаштування під ваш контент і за підтримку. У нас CMS входить у кожен проєкт від $1 000, починаючи із сайту для бізнесу, окремо ми її не рахуємо. Конструктори працюють інакше: підписка $10–50 на місяць, і платити доводиться весь час, поки сайт живий.",
    "➤ Юзабіліті це зручність користування сайтом ✔️ 5 ознак поганого юзабіліті ✔️ як перевірити самому без інструментів ➡ аудит сайту від $150":
      "➤ Юзабіліті це зручність користування сайтом ✔️ 5 ознак поганого юзабіліті ✔️ як перевірити самому без інструментів ➡ безкоштовний аудит сайту",
    "Чесний прайс: лендинг від $800, корпоративний сайт від $3,500, кастомна платформа від $6,000. Що формує ціну, фікс vs погодинна, і реальні цифри з 50+ проєктів.":
      "Чесний прайс: лендинг $600, сайт для бізнесу $1 000, кастомна платформа від $4 000. Що формує ціну, фікс vs погодинна, і реальні цифри з 50+ проєктів.",
    "Реальна вилка — від $800 за лендинг до $6,000+ за кастомну платформу. Більшість МСБ потрапляє в пакет «Корпоративний сайт» $3,500 (сайт із CMS, інтеграціями і compliance).":
      "Реальна вилка — від $600 за лендинг до $4 000+ за кастомну платформу. Більшість МСБ потрапляє в пакет «Сайт для бізнесу» за $1 000 (сайт із CMS, формами і базовим SEO).",
    "$800–$2,500. Дешевше — це шаблон на конструкторі з усіма мінусами. Дорожче — це вже багатосторінковий сайт.":
      "$600. Дешевше — це шаблон на конструкторі з усіма мінусами. Дорожче — це вже багатосторінковий сайт.",
    "$6,000–$10,000 для каталогу до 200 SKU з оплатою і доставкою. Мультивендор чи B2B-портал — це пакет від $6,000.":
      "$1 500 за інтернет-магазин з оплатою і доставкою; великий каталог — з фіксованою доплатою за кількість товарів. Мультивендор чи B2B-портал — це кастомна платформа від $4 000.",
    "➤ Інтернет-магазин автозапчастин під ключ від $2 500 ✔️ VIN-підбір, фіди TecDoc, синхронізація залишків ✔️ Строки 6–12 тижнів ➡ Реальні ціни студії":
      "➤ Інтернет-магазин автозапчастин під ключ від $1 500 ✔️ VIN-підбір, фіди TecDoc, синхронізація залишків ✔️ Строки 6–12 тижнів ➡ Реальні ціни студії",
    "Від $2 500 за магазин на базі корпоративної платформи з одним фідом постачальника і від $6 000 за кастомну платформу з VIN-підбором, крос-номерами та автоматичною синхронізацією залишків. Додатково закладайте $200–500 за кожну типову інтеграцію і $1 000–3 000 за складні (1С, склад, кілька API).":
      "Від $1 500 за магазин з одним фідом постачальника і від $4 000 за кастомну платформу з VIN-підбором, крос-номерами та автоматичною синхронізацією залишків. Додатково закладайте $300 за кожну типову інтеграцію і $1 000–3 000 за складні (1С, склад, кілька API).",
    "Повний розбір сайту для адвоката і юрфірми: структура зі сторінками практик, профіль з номером свідоцтва, законна публікація кейсів і вилка цін — від візитки за $800 до сайту фірми від $2 500.":
      "Повний розбір сайту для адвоката і юрфірми: структура зі сторінками практик, профіль з номером свідоцтва, законна публікація кейсів і вилка цін — від візитки за $600 до сайту фірми за $1 800.",
    "➤ Сайт для адвоката, якому довіряють. ✔️ Структура та обов'язкові блоки ✔️ Візитка від $800, сайт фірми від $2 500 ➡ Кейси, етика, SEO-поради.":
      "➤ Сайт для адвоката, якому довіряють. ✔️ Структура та обов'язкові блоки ✔️ Візитка $600, сайт фірми $1 800 ➡ Кейси, етика, SEO-поради.",
    "Сайт-візитка приватного адвоката коштує від $800 і робиться за 2–3 тижні. Сайт юридичної фірми з окремими сторінками практик — від $2 500 і 4–8 тижнів. Кастомна платформа з особистим кабінетом клієнта — від $6 000. На ціну найбільше впливають кількість сторінок практик, мовні версії та інтеграції.":
      "Сайт-візитка приватного адвоката коштує $600 і робиться за 3 робочі дні. Сайт юридичної фірми з окремими сторінками практик — $1 800 і 14–21 робочий день. Кастомна платформа з особистим кабінетом клієнта — від $4 000. На ціну найбільше впливають кількість сторінок практик, мовні версії та інтеграції.",
    "Візитка приватного адвоката — 2–3 тижні. Сайт юридичної фірми з 5–8 сторінками практик, профілями команди і кейсами — 4–8 тижнів. Найдовший етап зазвичай не дизайн, а контент: збір інформації про практики і погодження кейсів з клієнтами.":
      "Візитка приватного адвоката — 3 робочі дні. Сайт юридичної фірми з 5–8 сторінками практик, профілями команди і кейсами — 14–21 робочий день. Найдовший етап зазвичай не дизайн, а контент: збір інформації про практики і погодження кейсів з клієнтами.",
    "Так, якщо ви хочете клієнток із Google. Instagram майже не ранжується в пошуку, охоплення постів падає, а директ уночі ніхто не читає. Сайт закриває запис 24/7, відкритий прайс і локальний пошук «послуга + район» — Instagram при цьому лишається каналом прогріву.":
      "Так, якщо ви хочете клієнток із Google. Instagram майже не ранжується в пошуку, охоплення постів падає, а директ уночі ніхто не читає. Сайт дає цілодобовий запис, відкритий прайс і локальний пошук «послуга + район» — Instagram при цьому лишається каналом прогріву.",
    "Будь-хто зі співробітників через адмін-панель: вчитель інформатики, секретар або завуч. Додати новину — 10–15 хвилин, як пост у соцмережі, без коду. Технічну частину (оновлення, безпеку, бекапи) закриває підтримка студії від $200/міс або від $40/год разово.":
      "Будь-хто зі співробітників через адмін-панель: вчитель інформатики, секретар або завуч. Додати новину — 10–15 хвилин, як пост у соцмережі, без коду. Технічну частину (оновлення, безпеку, бекапи) закриває підтримка студії: перший рік входить у ціну пакета.",
    "У 90% випадків — ні. Ціни на тури змінюються щодня, місця треба підтверджувати в оператора, а чек $800–2000 люди не платять без розмови з менеджером. Робочий гібрид: заявка з сайту плюс посилання на онлайн-передоплату після підтвердження туру.":
      "У 90% випадків — ні. Ціни на тури змінюються щодня, місця треба підтверджувати в оператора, а чек $800–2000 люди не платять без розмови з менеджером. Робочий гібрид: заявка з сайту плюс посилання на онлайн-передоплату після підтвердження туру.",
    "Ринкова вилка — $100–500/міс залежно від обсягу. У нас перший рік входить у ціну розробки, далі пакет від $200/міс або разові роботи за $40/год.":
      "Ринкова вилка — $100–500/міс залежно від обсягу. У нас перший рік входить у ціну розробки, далі — хостинг $60 на рік, а доробки рахуємо за фіксованим прайсом.",
    "➤ Вартість просування сайту у 2026: від $300/міс для сайтів послуг, від $500/міс для магазинів ✔️ Разовий аудит $300 ✔️ З чого складається ціна розкрутки ➡ Без «гарантій топ-1».":
      "➤ Вартість просування сайту у 2026: від $400/міс для сайтів послуг, від $600/міс для магазинів ✔️ Аудит безкоштовно ✔️ З чого складається ціна розкрутки ➡ Без «гарантій топ-1».",
  },
  ru: {
    "Лендинг — 1–2 недели, сайт клиники — 4, расширенный — 6, сеть — 8–10. Сроки фиксируются в договоре; за срыв по нашей вине платим неустойку 30%.":
      "Лендинг — 3 рабочих дня, сайт клиники — 14–21 рабочий день, расширенный — около 6 недель, сеть — 8–10 недель. Сроки фиксируются в договоре; за срыв по нашей вине платим неустойку 30%.",
    "Лендинг мастера — от $800, полноценный сайт салона с онлайн-записью — $1 500–3 000, сайт сети салонов — от $2 500. Интеграция с altegio или DIKIDI добавляет $200–500. Точная цена зависит от количества страниц, галереи и интеграций.":
      "Лендинг мастера — $600, сайт салона — $1 000 и ещё $300 за онлайн-запись, сайт сети салонов — от $1 000. Интеграция с altegio или DIKIDI добавляет $300. Точная цена зависит от количества страниц, галереи и интеграций.",
    "У меня маленький кабинет, а не клиника. Есть ли что-то дешевле $3,500?":
      "У меня маленький кабинет, а не клиника. Есть ли что-то дешевле $1 800?",
    "В нашем прайсе кампания начинается от $300 в месяц для сайтов услуг и от $500 для магазинов, разовый аудит — $450. Клиент из датского примера платит около €600 в месяц — там дороже рынок и в бюджет входят статьи. Главное при выборе подрядчика — не цена, а показывает ли он вам цену заявки, а не количество позиций в топе.":
      "В нашем прайсе кампания начинается от $400 в месяц для сайтов услуг и от $600 для магазинов, аудит — бесплатный. Клиент из датского примера платит около €600 в месяц — там дороже рынок и в бюджет входят статьи. Главное при выборе подрядчика — не цена, а показывает ли он вам цену заявки, а не количество позиций в топе.",
    "У нас два филиала. Это уже «сеть» за $12,000?":
      "У нас два филиала. Это уже «сеть» за $4 000?",
    "Не обязательно. Две локации часто укладываются в расширенный формат: отдельные страницы локаций с адресами и расписаниями. $12,000+ — это когда у филиалов разные структуры услуг, крупные интеграции и нужен SLA.":
      "Не обязательно. Две локации часто укладываются в расширенный формат: отдельные страницы локаций с адресами и расписаниями. Кастомная платформа от $4 000 — это когда у филиалов разные структуры услуг, крупные интеграции и нужен SLA.",
    "Сами системы в большинстве бесплатны — платят за настройку под ваш контент и за поддержку. У нас CMS входит в пакеты от $2 500 — это корпоративный сайт, отдельно мы её не считаем. Конструкторы работают иначе: подписка $10–50 в месяц, и платить приходится всё время, пока сайт жив.":
      "Сами системы в большинстве бесплатны — платят за настройку под ваш контент и за поддержку. У нас CMS входит в каждый пакет от $1 000, начиная с сайта для бизнеса, отдельно мы её не считаем. Конструкторы работают иначе: подписка $10–50 в месяц, и платить приходится всё время, пока сайт жив.",
    "➤ Юзабилити это удобство пользования сайтом ✔️ 5 признаков плохого юзабилити ✔️ как проверить самому без инструментов ➡ аудит сайта от $150":
      "➤ Юзабилити это удобство пользования сайтом ✔️ 5 признаков плохого юзабилити ✔️ как проверить самому без инструментов ➡ бесплатный аудит сайта",
    "Честный прайс: лендинг от $800, корпоративный сайт от $3,500, кастомная платформа от $6,000. Что формирует цену, фикс vs почасовая, и реальные цифры из 50+ проектов.":
      "Честный прайс: лендинг $600, сайт для бизнеса $1 000, кастомная платформа от $4 000. Что формирует цену, фикс vs почасовая, и реальные цифры из 50+ проектов.",
    "Реальная вилка — от $800 за лендинг до $6,000+ за кастомную платформу. Большинство МСБ попадает в пакет «Корпоративный сайт» $3,500 (сайт с CMS, интеграциями и compliance).":
      "Реальная вилка — от $600 за лендинг до $4 000+ за кастомную платформу. Большинство МСБ попадает в пакет «Сайт для бизнеса» за $1 000 (сайт с CMS, формами и базовым SEO).",
    "$800–$2,500. Дешевле — это шаблон на конструкторе со всеми минусами. Дороже — это уже многостраничный сайт.":
      "$600. Дешевле — это шаблон на конструкторе со всеми минусами. Дороже — это уже многостраничный сайт.",
    "$6,000–$10,000 для каталога до 200 SKU с оплатой и доставкой. Мультивендор или B2B-портал — это пакет от $6,000.":
      "$1 500 за интернет-магазин с оплатой и доставкой; большой каталог — с фиксированной доплатой за количество товаров. Мультивендор или B2B-портал — это кастомная платформа от $4 000.",
    "➤ Создание интернет-магазина автозапчастей под ключ от $2 500 ✔️ VIN-подбор, фиды TecDoc, синхронизация остатков ✔️ Сроки 6–12 недель ➡ Цены студии":
      "➤ Создание интернет-магазина автозапчастей под ключ от $1 500 ✔️ VIN-подбор, фиды TecDoc, синхронизация остатков ✔️ Сроки 6–12 недель ➡ Цены студии",
    "От $2 500 за магазин на базе корпоративной платформы с одним фидом поставщика и от $6 000 за кастомную платформу с VIN-подбором, кросс-номерами и автоматической синхронизацией остатков. Дополнительно закладывайте $200–500 за каждую типовую интеграцию и $1 000–3 000 за сложные (1С, склад, несколько API).":
      "От $1 500 за магазин с одним фидом поставщика и от $4 000 за кастомную платформу с VIN-подбором, кросс-номерами и автоматической синхронизацией остатков. Дополнительно закладывайте $300 за каждую типовую интеграцию и $1 000–3 000 за сложные (1С, склад, несколько API).",
    "Полный разбор сайта адвоката и юрфирмы: структура со страницами практик, профиль со свидетельством, законная публикация кейсов и вилка цен — от визитки за $800 до сайта фирмы от $2 500.":
      "Полный разбор сайта адвоката и юрфирмы: структура со страницами практик, профиль со свидетельством, законная публикация кейсов и вилка цен — от визитки за $600 до сайта фирмы за $1 800.",
    "➤ Как создать сайт адвоката с нуля. ✔️ Сайт-визитка юриста от $800 ✔️ Сайт фирмы под ключ от $2 500 ➡ Структура, этика кейсов, SEO.":
      "➤ Как создать сайт адвоката с нуля. ✔️ Сайт-визитка юриста $600 ✔️ Сайт фирмы под ключ $1 800 ➡ Структура, этика кейсов, SEO.",
    "Сайт-визитка юриста стоит от $800 и делается за 2–3 недели. Сайт юридической фирмы с отдельными страницами практик — от $2 500 и 4–8 недель. Кастомная платформа с личным кабинетом клиента — от $6 000. Больше всего на цену влияют количество страниц практик, языковые версии и интеграции.":
      "Сайт-визитка юриста стоит $600 и делается за 3 рабочих дня. Сайт юридической фирмы с отдельными страницами практик — $1 800 и 14–21 рабочий день. Кастомная платформа с личным кабинетом клиента — от $4 000. Больше всего на цену влияют количество страниц практик, языковые версии и интеграции.",
    "Визитка частного адвоката — 2–3 недели. Сайт юридической фирмы с 5–8 страницами практик, профилями команды и кейсами — 4–8 недель. Самый долгий этап обычно не дизайн, а контент: сбор информации о практиках и согласование кейсов с клиентами.":
      "Визитка частного адвоката — 3 рабочих дня. Сайт юридической фирмы с 5–8 страницами практик, профилями команды и кейсами — 14–21 рабочий день. Самый долгий этап обычно не дизайн, а контент: сбор информации о практиках и согласование кейсов с клиентами.",
    "Да, если нужны клиентки из Google. Instagram почти не ранжируется в поиске, охват постов падает, а директ ночью никто не читает. Сайт закрывает запись 24/7, открытый прайс и локальный поиск «услуга + район» — Instagram при этом остаётся каналом прогрева.":
      "Да, если нужны клиентки из Google. Instagram почти не ранжируется в поиске, охват постов падает, а директ ночью никто не читает. Сайт даёт круглосуточную запись, открытый прайс и локальный поиск «услуга + район» — Instagram при этом остаётся каналом прогрева.",
    "Любой сотрудник через админ-панель: учитель информатики, секретарь или завуч. Добавить новость — 10–15 минут, как пост в соцсети, без кода. Техническую часть (обновления, безопасность, бэкапы) закрывает поддержка студии от $200/мес или от $40/час разово.":
      "Любой сотрудник через админ-панель: учитель информатики, секретарь или завуч. Добавить новость — 10–15 минут, как пост в соцсети, без кода. Техническую часть (обновления, безопасность, бэкапы) закрывает поддержка студии: первый год входит в цену пакета.",
    "В 90% случаев — нет. Цены на туры меняются ежедневно, места нужно подтверждать у оператора, а чек $800–2000 люди не платят без разговора с менеджером. Рабочий гибрид: заявка с сайта плюс ссылка на онлайн-предоплату после подтверждения тура.":
      "В 90% случаев — нет. Цены на туры меняются ежедневно, места нужно подтверждать у оператора, а чек $800–2000 люди не платят без разговора с менеджером. Рабочий гибрид: заявка с сайта плюс ссылка на онлайн-предоплату после подтверждения тура.",
    "➤ Продвижение сайта стоит от $300/мес, аудит — $450 разово ✔️ Из чего складывается цена SEO ✔️ Красные флаги подрядчиков ➡ Честный разбор цен.":
      "➤ Продвижение сайта стоит от $400/мес, аудит — бесплатно ✔️ Из чего складывается цена SEO ✔️ Красные флаги подрядчиков ➡ Честный разбор цен.",
  },
  en: {
    // A customer's tour budget, not our price.
    "In 90% of cases — no. Tour prices change daily, availability must be confirmed with the operator, and travellers rarely pay £800–2,000 without speaking to a manager. The working hybrid: an enquiry from the site plus an online deposit link sent after the tour is confirmed.":
      "In 90% of cases — no. Tour prices change daily, availability must be confirmed with the operator, and travellers rarely pay £800–2,000 without speaking to a manager. The working hybrid: an enquiry from the site plus an online deposit link sent after the tour is confirmed.",
    // Construction is the €4,500 industry package.
    "A builder's website costs £800 to £4,500 — and pays for itself with one closed deal. Here's the quote breakdown and the 4 things a construction site can't win work without.":
      "A builder's website costs €1,200 to €4,500 — and pays for itself with one closed deal. Here's the quote breakdown and the 4 things a construction site can't win work without.",
    "➤ A builder's website costs £800–£4,500 ✔️ Portfolio, service pages, local SEO ✔️ Case: 300+ enquiries in a year ➡ Full price breakdown.":
      "➤ A builder's website costs €1,200–€4,500 ✔️ Portfolio, service pages, local SEO ✔️ Case: 300+ enquiries in a year ➡ Full price breakdown.",
    "A single-service landing page is from £800. A full site with a portfolio, service pages and local SEO is from £3,500. A bilingual site for cross-border work is from £4,000. The price is fixed in the contract.":
      "A single-service landing page is €1,200. A full site with a portfolio, service pages and local SEO is €2,500; the construction industry package is €4,500. A second language is a €400 add-on. The price is fixed in the contract.",
    "Any staff member, through the admin panel: an IT teacher, a secretary or a deputy head. Adding a news item takes 10–15 minutes, like a social media post, with no code. The technical side (updates, security, backups) is covered by studio support from £200/month or £40/hour ad hoc.":
      "Any staff member, through the admin panel: an IT teacher, a secretary or a deputy head. Adding a news item takes 10–15 minutes, like a social media post, with no code. The technical side (updates, security, backups) is covered by studio support, included for the first year.",
    "A single-stylist landing page starts at £800, a full salon website with online booking runs $1,500–3,000, and a multi-location chain site starts at £3,500. An altegio or DIKIDI integration adds £200–500. The exact price depends on page count, gallery and integrations.":
      "A single-stylist landing page is €1,200, a full salon website is €2,500 with online booking as a €600 add-on, and a multi-location chain site starts at €2,500. An altegio or DIKIDI integration adds €240–600. The exact price depends on page count, gallery and integrations.",
    "A one-pager from £800 or a delivery site with a basket from £3,500? Digital menus, online payments, table bookings and the honest maths of your own site vs the marketplaces.":
      "A €1,200 one-pager or a €3,900 delivery site with a basket? Digital menus, online payments, table bookings and the honest maths of your own site vs the marketplaces.",
    // Shop articles: a store is the €3,900 shop package (as in their bodies).
    "➤ Auto parts online store from £3,500 ✔️ VIN lookup, TecDoc feeds, stock sync ✔️ Launch in 6–12 weeks ➡ Real studio pricing and a stage-by-stage breakdown":
      "➤ Auto parts online store from €3,900 ✔️ VIN lookup, TecDoc feeds, stock sync ✔️ Launch in 6–12 weeks ➡ Real studio pricing and a stage-by-stage breakdown",
    "From £3,500 for a store on a corporate platform base with one supplier feed, and from £6,000 for a custom platform with VIN lookup, cross-references and automatic stock sync. Budget an extra £200–500 per standard integration and £1,000–3,000 for complex ones (ERP, warehouse, multiple APIs).":
      "From €3,900 for a store with one supplier feed, and from €9,000 for a custom platform with VIN lookup, cross-references and automatic stock sync. Budget an extra €240–600 per standard integration and €1,200–3,600 for complex ones (ERP, warehouse, multiple APIs).",
    "➤ How to build a clothing store website that sells ✔️ Size charts, filters, returns ✔️ From £800 lookbook to £3,500 store ➡ Full 2026 guide.":
      "➤ How to build a clothing store website that sells ✔️ Size charts, filters, returns ✔️ From a €1,200 lookbook to a €3,900 store ➡ Full 2026 guide.",
    "A lookbook landing page without a cart starts at £800, a full store with payments, shipping and filters at £3,500, and a custom platform with supplier feeds at £6,000. Price follows functionality, not catalogue size.":
      "A lookbook landing page without a cart is €1,200, a full store with payments, shipping and filters €3,900, and a custom platform with supplier feeds from €9,000. Price follows functionality, not catalogue size.",
    // SEO: retainer from €800/mo, audit free.
    "➤ SEO costs from £300/mo, the deep SEO audit is £450 ✔️ What makes up the price ✔️ Contractor red flags ➡ An honest pricing breakdown.":
      "➤ Our SEO starts at €800/mo and the audit is free ✔️ What makes up the price ✔️ Contractor red flags ➡ An honest pricing breakdown.",
    "A base retainer is from £300/mo. Competitive niches (healthcare, legal, finance) run £500–2,000/mo. The deep SEO audit with a fix list is £450.":
      "Our base retainer is from €800/mo; competitive niches (healthcare, legal, finance) cost more, depending on the market. The SEO audit with a fix list is free.",
    "What's in the £450 SEO audit?": "What's in the free SEO audit?",
    "The profile and reviews — absolutely, using this article's plan. Location pages, markup and speed are developer territory. A £300 audit shows exactly what keeps you out of the three.":
      "The profile and reviews — absolutely, using this article's plan. Location pages, markup and speed are developer territory. A free audit shows exactly what keeps you out of the three.",
    "Don't panic: that's the normal state of most small-business sites — and the explanation for why search brings no clients. Priority: indexing → service pages → speed. Or the full £300 audit, where we build the plan for you.":
      "Don't panic: that's the normal state of most small-business sites — and the explanation for why search brings no clients. Priority: indexing → service pages → speed. Or the free full audit, where we build the plan for you.",
    "Like a normal build of the matching format — a landing from £800, a full site from £3,500 — plus the migration block: the redirect map and content transfer, usually £500–2,000 depending on the old site's size.":
      "Like a normal build of the matching format — a €1,200 landing page or a €2,500 full site — plus the migration block: the redirect map and content transfer, a €400 add-on for a typical site.",
    "A custom website in the UK runs from £800 to £14,000+. Here’s what sits behind each number, and how to tell an honest quote from a vague one.":
      "A custom website runs from €1,200 to €9,000+ with us. Here’s what sits behind each number, and how to tell an honest quote from a vague one.",
    "Yes. We handle migrations with full 301 redirect mapping and a Search Console hand-off, so SEO history is preserved. From £500.":
      "Yes. We handle migrations with full 301 redirect mapping and a Search Console hand-off, so SEO history is preserved. A €400 add-on for a typical site.",
    "A private-practice landing page with trust blocks and online booking starts at £800 and takes 7–14 days. A therapy centre website with a team of practitioners starts at £3,500. A typical calendar or payment integration adds £200–500.":
      "A private-practice landing page with trust blocks and online booking is €1,200 and takes 3 working days. A therapy centre website with a team of practitioners starts at €2,500. A typical calendar or payment integration adds €240–600.",
    "Most systems are free in themselves — you pay for setting them up around your content and for support. With us a CMS is included on projects from £3,500, a corporate website from £3,500 among them, never as a separate line. Builders work differently: $10–50 a month, for as long as the site exists.":
      "Most systems are free in themselves — you pay for setting them up around your content and for support. With us a CMS is included on every project from €2,500, the business website among them, never as a separate line. Builders work differently: $10–50 a month, for as long as the site exists.",
  },
};

/** Substring rules for these fields, before the shared SUB list. */
export const FIELD_SUB = {
  en: [
    // The old ladder's landing term; only where the sentence is about a landing page.
    [
      /(landing page|one-pager|one-page site|brochure site|solo [\w ]*?site)([^.]*?)\b(?:1–2|2–3) weeks/g,
      (_m, what, mid) => `${what}${mid}3 working days`,
    ],
    [/([Ll])anding page from £800/g, "$1anding page for €1,200"],
    [/prices from £800/g, "prices from €1,200"],
  ],
  // UA/RU list (USD): landing $600, business $1 000, shop $1 500, industry
  // $1 800, custom from $4 000, SEO from $400/міс, audit free.
  uk: [
    // Ranges: the shared rules drop «від» and break «від $X до $Y».
    [/від \$800 до \$12,000\+/g, "від $600 до $4 000+"],
    [/від \$3,500 до \$12,000\+/g, "від $1 800 до $4 000+"],
    [/від \$800 до \$6,000\+/g, "від $600 до $4 000+"],
    [/від \$800 до \$4,500/g, "від $600 до $1 800"],
    // A clinic, a hospital or a law firm is the $1 800 industry package, not the $1 000 business site.
    [/(?<=(?:клінік|кабінет|лікарн|адвокат|юрист|юридичн)[^.]*?)(?:від )?\$3,500/g, "$1 800"],
    [/SEO-аудит за \$450\?/g, "безкоштовний SEO-аудит?"],
    [/Разовий аудит — \$300\./g, "Разовий аудит — безкоштовний."],
    [/Разовий аудит \$300/g, "Аудит безкоштовно"],
    [/від \$6,000/g, "від $4 000"],
    // The landing term of the old ladder, only in a sentence about a landing / business card.
    [/(?<=(?:[Лл]ендінг|[Вв]ізитк|[Оо]дносторінков)[^.]*?)(?:1–2|2–3) тижн(?:і|ів)/g, "3 робочі дні"],
    // A shop is the $1 500 shop package.
    [/(?<=(?:[Мм]агазин|кошик)[^.]*?)(?:від )?\$2[\s ]500/g, "$1 500"],
  ],
  ru: [
    [/от \$800 до \$12,000\+/g, "от $600 до $4 000+"],
    [/от \$3,500 до \$12,000\+/g, "от $1 800 до $4 000+"],
    [/от \$800 до \$6,000\+/g, "от $600 до $4 000+"],
    [/от \$800 до \$4,500/g, "от $600 до $1 800"],
    [/(?<=(?:клиник|кабинет|больниц|адвокат|юрист|юридическ)[^.]*?)(?:от )?\$3,500/g, "$1 800"],
    [/SEO-аудит за \$450\?/g, "бесплатный SEO-аудит?"],
    [/Разовый аудит — \$300\./g, "Разовый аудит — бесплатный."],
    [/аудит — \$450 разово/g, "аудит — бесплатно"],
    [/от \$6,000/g, "от $4 000"],
    [/(?<=(?:[Лл]ендинг|[Вв]изитк|[Оо]дностраничн)[^.]*?)(?:1–2|2–3) недел(?:и|ь)/g, "3 рабочих дня"],
    [/(?<=(?:[Мм]агазин|корзин)[^.]*?)(?:от )?\$2[\s ]500/g, "$1 500"],
  ],
};

/** After every other rule. */
export const FIELD_POST = {
  en: [[/\ban €/g, "a €"]],
};
