import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const DRY = process.argv.includes("--dry-run");

function loadEnvFile(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!TOKEN && !DRY) throw new Error("SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN missing");

const client = createClient({
  projectId: "4lk0x7o9", dataset: "production", apiVersion: "2024-10-01", token: TOKEN, useCdn: false,
});

let keySeq = 0;
const key = () => `lt${(keySeq++).toString(36)}${Math.abs(keySeq * 7919).toString(36)}`;

/** Абзац; поддерживает **жирный** и [текст](/href). */
function p(text, style = "normal") {
  const children = []; const markDefs = [];
  const re = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0; let m;
  while ((m = re.exec(text))) {
    if (m.index > last) children.push({ _key: key(), _type: "span", text: text.slice(last, m.index), marks: [] });
    if (m[1]) children.push({ _key: key(), _type: "span", text: m[1].slice(2, -2), marks: ["strong"] });
    else {
      const label = m[2].slice(1, m[2].indexOf("]"));
      const href = m[2].slice(m[2].indexOf("(") + 1, -1);
      const dk = key();
      markDefs.push({ _key: dk, _type: "link", href });
      children.push({ _key: key(), _type: "span", text: label, marks: [dk] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) children.push({ _key: key(), _type: "span", text: text.slice(last), marks: [] });
  return { _key: key(), _type: "block", style, markDefs, children };
}
const h2 = (t) => p(t, "h2");
const h3 = (t) => p(t, "h3");
const li = (t) => ({ ...p(t), listItem: "bullet", level: 1 });
const num = (t) => ({ ...p(t), listItem: "number", level: 1 });
const tldr = (title, items) => ({ _key: key(), _type: "tldrBox", title, items });
/** Таблица: headers 2–6 колонок, у каждой row.cells ровно столько же ячеек. **жирный** поддерживается. */
const table = (headers, rows) => ({
  _key: key(), _type: "blogTable", headers,
  rows: rows.map((cells) => ({ _key: key(), _type: "blogTableRow", cells })),
});
/** CTA: пишем ОБА набора ключей (heading/sub/ctaLabel/ctaHref — текущий фронт; title/text/buttonLabel/buttonHref — легаси). */
const cta = (heading, sub, label, href) => ({
  _key: key(), _type: "ctaCallout",
  heading, sub, ctaLabel: label, ctaHref: href,
  title: heading, text: sub, buttonLabel: label, buttonHref: href,
});

const AUTHOR = {
  name: "Кристина Бондаренко", role: "SEO Specialist",
  bio: "SEO-спеціалістка Code-Site.Art. Веде пошукові кампанії клієнтів студії — від локального SEO клінік до e-commerce.",
  photoUrl: "/team/kristina.jpg",
};
const NOW = "2026-08-26T12:00:00.000Z";

const doc = {
  _id: "ltAug2026-sait-bukhhalterskykh-posluh",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "3dda2459-8805-4c53-ae6f-88ea595e2c0f" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-bukhhalterskykh-posluh" },
    ru: { _type: "slug", current: "sayt-buhgalterskih-uslug" },
    en: { _type: "slug", current: "accounting-firm-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для бухгалтерських послуг і аутсорсингу: як отримувати клієнтів на абонплату з пошуку",
    ru: "Создание сайта бухгалтерских услуг: как получать клиентов на абонплату из поиска",
    en: "Accounting Firm Website: What It Needs to Win Monthly Retainer Clients",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Сайт для бухгалтерських послуг: структура і ціни 2026",
    ru: "Сайт бухгалтерских услуг: создание, структура, цены",
    en: "Accounting Firm Website: Structure + Cost 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Що має бути на сайті бухгалтерської фірми ✔️ Пакети з цінами ФОП/ТОВ ✔️ Калькулятор і блок довіри ➡ Вилка цін: візитка від $800, сайт фірми від $3 500.",
    ru: "➤ Создание сайта бухгалтерских услуг ✔️ Пакеты с ценами ФОП/ООО ✔️ Калькулятор обслуживания ✔️ Блок доверия ➡ Визитка от $800, сайт фирмы от $3 500.",
    en: "➤ What an accounting firm website needs ✔️ Retainer packages with prices ✔️ Fee calculator ✔️ Trust signals ➡ Cost: from $800 for a one-pager, from $3,500 for a full site.",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Бухгалтерські послуги",
    ru: "Бухгалтерские услуги",
    en: "Accounting & Bookkeeping",
  },
  lede: {
    _type: "localizedString",
    uk: "Клієнт на абонплаті платить бухгалтерській фірмі щомісяця роками. Розбираємо, яким має бути сайт, щоб такі клієнти приходили з Google: прозорий прайс, калькулятор, сертифікати й контент про податки.",
    ru: "Клиент на абонплате платит бухгалтерской фирме каждый месяц годами. Разбираем, каким должен быть сайт, чтобы такие клиенты приходили из Google: прозрачный прайс, калькулятор, сертификаты и контент о налогах.",
    en: "A retainer client pays an accounting firm every month for years. Here is what the firm's website needs so those clients come from search: transparent pricing, a fee calculator, credentials and tax content that ranks.",
  },
  tags: ["бухгалтерські послуги", "сайт для бухгалтера", "фінанси", "аутсорсинг бухгалтерії"],
  relatedPostSlugs: ["sait-dlia-advokata", "vartist-rozrobky-saytu-2026", "shcho-vkhodyt-u-vartist-rozrobky-saitu"],
  body: {
    uk: [
      tldr("Коротко: сайт, що продає абонплату", [
        "Сайт бухгалтерської фірми продає не «послуги», а спокій підприємця: прозорі ціни, сертифікати, зрозумілі відповіді.",
        "Головний конвертер — сторінка пакетів з цінами (ФОП 2–3 група / ТОВ) плюс калькулятор вартості обслуговування.",
        "Вилка цін: сайт-візитка приватного бухгалтера — від $800, сайт аутсорс-фірми з калькулятором — від $3 500.",
        "Відповіді на часті питання клієнтів (зміна бухгалтера, строки звітності) — це готовий SEO-контент.",
        "Блог про податки дає постійний трафік без реклами; SEO-супровід — від $300/міс.",
      ]),
      p("Сайт для бухгалтерських послуг окупається тоді, коли він продає **абонентське обслуговування**, а не просто розповідає про компанію. Для цього потрібні чотири речі: пакети з прозорими цінами для ФОП і ТОВ, калькулятор вартості обслуговування, блок довіри з сертифікатами й відгуками та контент, що відповідає на реальні запитання підприємців. Сайт-візитка приватного бухгалтера коштує від **$800**, сайт аутсорсингової фірми з калькулятором — від **$3 500**."),
      p("Математика ніші проста: один клієнт на абонплаті — це 2 000–10 000 грн щомісяця протягом років. Навіть 3–5 лідів з пошуку на місяць окуповують сайт за один квартал. Тому бухгалтерія — одна з найвдячніших ніш для SEO: ми детально розбираємо її на сторінці [сайти для фінансових компаній](/sites-for/finance)."),
      h2("Візитка бухгалтера чи сайт фірми: що обрати"),
      p("Приватному бухгалтеру, який веде 10–20 ФОП, достатньо акуратної візитки: хто ви, що робите, скільки коштує, як зв'язатися. Аутсорсинговій фірмі з командою потрібен повноцінний сайт зі сторінками під кожну послугу й систему оподаткування — інакше він не збиратиме пошуковий трафік за десятками запитів."),
      table(
        ["Критерій", "Візитка приватного бухгалтера", "Сайт аутсорс-фірми"],
        [
          ["Мета", "Підтвердити кваліфікацію, зібрати контакти", "Генерувати лідів на абонплату з пошуку"],
          ["Сторінки", "1–5: про мене, послуги, ціни, контакти", "15–40: послуги, пакети, ніші клієнтів, блог"],
          ["Функціонал", "Форма заявки, месенджери", "Калькулятор, прайс-пакети, блог, квіз-форма"],
          ["Строк розробки", "2–3 тижні", "4–8 тижнів"],
          ["Ціна", "від **$800**", "від **$3 500**"],
        ]
      ),
      p("Формат візитки ми робимо на базі [лендінгу](/landing), сайт фірми — це вже [корпоративний сайт](/corporate-site) з CMS, куди ваш маркетолог сам додає статті й оновлює ціни."),
      h3("Обов'язкові сторінки сайту аутсорс-фірми"),
      num("Головна: кому допомагаєте, головні цифри фірми, пакети, форма."),
      num("Окрема сторінка під кожну послугу: супровід ФОП, бухгалтерія для ТОВ, зарплата і кадри, відновлення обліку."),
      num("Прайс з пакетами і калькулятором — найвідвідуваніша сторінка після головної."),
      num("Про команду: фото, сертифікати, спеціалізації кожного бухгалтера."),
      num("Відгуки й кейси клієнтів за нішами: e-commerce, послуги, виробництво."),
      num("Блог про податки і звітність — джерело органічного трафіку."),
      num("Контакти з месенджерами: підприємці пишуть у Telegram частіше, ніж дзвонять."),
      p("Кожна сторінка послуги — це окрема точка входу з пошуку. Сайт з 5 сторінками конкурує за 5 запитів, сайт з 30 сторінками — за кількасот. Саме тому структура важливіша за дизайн: її ми проєктуємо до макетів, на етапі семантики."),
      h2("Прозорий прайс — головний конвертер"),
      p("Підприємець, який шукає бухгалтера, боїться двох речей: що йому назвуть ціну «після дзвінка» і що потім вона виросте. Тому сторінка з пакетами й цінами конвертує краще за будь-який слоган. Фірми, що ховають прайс, віддають клієнтів тим, хто його показує."),
      p("Робочий формат — 3–4 пакети, прив'язані до форми власності й системи оподаткування. Ось приклад структури прайсу, яку ми виносимо на окрему сторінку сайту:"),
      table(
        ["Пакет", "Кому підходить", "Що входить", "Ціна/міс"],
        [
          ["Старт", "ФОП 2 група без працівників", "Звітність, ЄП, консультації в месенджері", "від 1 200 грн"],
          ["ФОП+", "ФОП 3 група, з ПДВ або працівниками", "Звітність, ПДВ, зарплата, первинка", "від 2 500 грн"],
          ["ТОВ", "ТОВ до 50 операцій/міс", "Повний облік, звітність, зарплата", "від 6 000 грн"],
          ["ТОВ Pro", "ТОВ з ЗЕД чи великим оборотом", "Облік, ЗЕД, валютний контроль, аудит-підтримка", "індивідуально"],
        ]
      ),
      p("Ціни в таблиці — приклад для ринку Києва 2026 року; ваші будуть своїми. Важливий принцип: **конкретна цифра «від» біля кожного пакета** плюс список того, що входить. Пункт «індивідуально» допустимий лише для найдорожчого пакета."),
      h2("Калькулятор вартості обслуговування"),
      p("Калькулятор — це інтерактивний прайс. Відвідувач відповідає на 4–6 запитань: форма власності, група оподаткування, кількість операцій, чи є працівники, чи є ПДВ і ЗЕД — і бачить орієнтовну вартість обслуговування. Далі форма: «Залиште контакт — зафіксуємо цю ціну»."),
      num("Калькулятор фільтрує нецільових відвідувачів: до менеджера доходять ті, хто вже бачив ціну."),
      num("Дає привід залишити контакт: розрахунок надсилаємо на email або у месенджер."),
      num("Збирає аналітику: ви бачите, які конфігурації запитують найчастіше."),
      p("Технічно це нескладна розробка: типовий калькулятор коштує **$200–500** як інтеграція до сайту, складна логіка з відправкою в CRM — **$1 000–3 000**. Саме такий підхід ми використовуємо у власному [калькуляторі вартості сайту](/calculator) — можете подивитися, як це працює наживо."),
      cta(
        "Порахуйте вартість сайту для вашої фірми",
        "Відповіді на 6 запитань — і ви побачите вилку цін для візитки бухгалтера чи сайту аутсорс-фірми з калькулятором.",
        "Відкрити калькулятор",
        "/calculator"
      ),
      h2("Довіра: сертифікати, досвід, відгуки"),
      p("Бухгалтерія — це доступ до грошей і документів бізнесу. Клієнт віддає його лише тому, кому довіряє, тож блок довіри на сайті працює нарівні з прайсом."),
      h3("Сертифікати й досвід"),
      li("Дипломи, сертифікати САР/CAP, ACCA, свідоцтва про підвищення кваліфікації — сканами, а не словами."),
      li("Цифри фірми: років на ринку, клієнтів на обслуговуванні, зданих звітів, галузей."),
      li("Фото команди з іменами й посадами: «безлика фірма» програє бухгалтеру з обличчям."),
      h3("Відгуки підприємців"),
      p("Найкраще працюють відгуки з конкретикою: ім'я, ніша, що саме зробили («перевели з 3 групи на ТОВ, закрили борг з ЄСВ»). Відео на 30–60 секунд — ще сильніше. Просіть відгук у момент, коли клієнт задоволений: після успішно зданого кварталу."),
      h3("Конфіденційність"),
      p("Окремий блок про те, як ви зберігаєте дані: NDA у договорі, доступи за ролями, шифровані бекапи первинки. Для клієнтів, що передають вам банківські виписки й кадрові документи, це аргумент не слабший за ціну."),
      h2("Часті питання клієнтів — це SEO-контент"),
      p("Запити на кшталт «як змінити бухгалтера», «строки подання звітності ФОП 3 група», «що буде за несвоєчасну звітність» — це ваші майбутні клієнти на ранній стадії. Зробіть під кожне питання розділ на сайті або статтю — і ви зустрінете їх раніше за конкурентів."),
      li("«Як безболісно змінити бухгалтера» — стаття-інструкція з чеклістом передачі справ."),
      li("«Календар звітності ФОП і ТОВ на 2026 рік» — сторінка, на яку повертаються щокварталу."),
      li("«Штрафи за несвоєчасну звітність» — запит з високою тривожністю і готовністю платити."),
      li("«Бухгалтер у штат чи аутсорсинг» — порівняння, що продає саме вашу модель."),
      p("Ці ж питання додаємо блоком FAQ зі structured data — так сайт потрапляє в розширені сніпети Google і у відповіді AI-пошуку."),
      h2("Блог про податки = постійний трафік"),
      p("Податкове законодавство змінюється щороку — і це подарунок для SEO: контент про ставки ЄП, ліміти ФОП, нові форми звітності завжди має свіжий попит. Фірма, що веде блог, за рік збирає сотні переходів на місяць без реклами. Двигун тут — регулярність: 2–4 статті на місяць стабільно кращі за 10 статей раз на пів року."),
      p("Якщо писати нема кому, [SEO-супровід](/seo) від **$300/міс** закриває це під ключ: семантика, тексти, технічна оптимізація. Схожу стратегію ми описували для юристів у статті [сайт для адвоката](/blog/sait-dlia-advokata) — ніші-близнюки за механікою довіри."),
      p("Не забудьте про локальний пошук: профіль Google Business із відгуками плюс сторінка з адресою офісу приводять клієнтів за запитами на кшталт «бухгалтер Київ Поділ». Для фірми, що працює дистанційно по всій країні, навпаки, важливіші сторінки під послуги й ніші, а не геозапити."),
      h2("Скільки коштує сайт бухгалтерської фірми"),
      p("Вилка залежить від формату й функціоналу. Орієнтири нашої студії:"),
      li("**Сайт-візитка бухгалтера** ([лендінг](/landing)): від **$800**, 2–3 тижні."),
      li("**Сайт аутсорс-фірми** ([корпоративний сайт](/corporate-site) з CMS, прайс-пакетами і блогом): від **$3 500**, 4–8 тижнів."),
      li("**Калькулятор обслуговування**: **$200–500**, складний з CRM-логікою — **$1 000–3 000**."),
      li("**Підтримка**: **$200/міс** або **$40/год** — оновлення цін, статей, банерів."),
      li("**SEO-просування**: від **$300/міс**."),
      p("Що саме ховається за цими цифрами — дизайн, верстка, CMS, тексти — ми розклали в статтях [скільки коштує сайт у 2026](/blog/vartist-rozrobky-saytu-2026) і [що входить у вартість розробки](/blog/shcho-vkhodyt-u-vartist-rozrobky-saitu)."),
      h2("Приклади: як це працює в нішах довіри"),
      p("Бухгалтерія продається так само, як медицина чи персональна експертиза: людина спершу перевіряє, чи можна вам довіряти, і лише потім дивиться на ціну. Кілька наших робіт із суміжних ніш:"),
      li("[Сайт експерта Олександра Сітнікова](/portfolio/oleksandr-sitnikov) — персональний бренд: та сама механіка, що й у візитки приватного бухгалтера — обличчя, регалії, послуги, форма."),
      li("[Клініка E-Fedra](/portfolio/efedra-clinic) — ніша, де довіра й прозорість цін вирішують усе: структура «послуги → ціни → лікарі → відгуки» переноситься на бухгалтерську фірму один в один."),
      li("[Solide Renovation](/portfolio/solide-renovation) — сервісний бізнес із пакетними пропозиціями та чітким процесом, як у аутсорсингу обліку."),
      p("У кожному проєкті конверсійна логіка однакова: зрозуміла послуга, прозора ціна, доказ експертності, проста форма звернення."),
      cta(
        "Потрібен сайт, що приводить клієнтів на абонплату?",
        "Зробимо візитку бухгалтера від $800 або сайт аутсорс-фірми з калькулятором від $3 500. Строк — від 2 тижнів.",
        "Розрахувати вартість",
        "/calculator"
      ),
    ],
    ru: [
      tldr("Коротко: сайт, который продаёт абонплату", [
        "Сайт бухгалтерской фирмы продаёт не «услуги», а спокойствие предпринимателя: прозрачные цены, сертификаты, понятные ответы.",
        "Главный конвертер — страница пакетов с ценами (ФОП 2–3 группа / ООО) плюс калькулятор стоимости обслуживания.",
        "Вилка цен: сайт-визитка бухгалтера — от $800, сайт аутсорс-фирмы с калькулятором — от $3 500.",
        "Ответы на частые вопросы клиентов (смена бухгалтера, сроки отчётности) — готовый SEO-контент.",
        "Блог о налогах даёт постоянный трафик без рекламы; SEO-сопровождение — от $300/мес.",
      ]),
      p("Создание сайта бухгалтерских услуг имеет смысл только тогда, когда сайт продаёт **абонентское обслуживание**, а не просто «представляет компанию в интернете». Для этого нужны четыре элемента: пакеты с прозрачными ценами для ФОП и ООО, калькулятор стоимости обслуживания, блок доверия с сертификатами и отзывами и контент, отвечающий на реальные вопросы предпринимателей. Сайт-визитка бухгалтера стоит от **$800**, сайт аутсорсинговой фирмы с калькулятором — от **$3 500**."),
      p("Экономика ниши считается легко: один клиент на абонплате приносит фирме деньги каждый месяц годами. Даже 3–5 лидов из поиска в месяц окупают разработку за квартал. Поэтому бухгалтерия — одна из самых благодарных ниш для SEO; подробно мы разбираем её на странице [сайты для финансовых компаний](/ru/sites-for/finance)."),
      h2("Сайт-визитка бухгалтера или сайт фирмы: что выбрать"),
      p("Частному бухгалтеру, который ведёт 10–20 ФОП, достаточно аккуратной визитки: кто вы, что делаете, сколько стоит, как связаться. Аутсорсинговой фирме с командой нужен полноценный сайт со страницами под каждую услугу и систему налогообложения — иначе он не соберёт поисковый трафик по десяткам запросов."),
      table(
        ["Критерий", "Визитка частного бухгалтера", "Сайт аутсорс-фирмы"],
        [
          ["Цель", "Подтвердить квалификацию, собрать контакты", "Генерировать лиды на абонплату из поиска"],
          ["Страницы", "1–5: обо мне, услуги, цены, контакты", "15–40: услуги, пакеты, ниши клиентов, блог"],
          ["Функционал", "Форма заявки, мессенджеры", "Калькулятор, прайс-пакеты, блог, квиз-форма"],
          ["Срок разработки", "2–3 недели", "4–8 недель"],
          ["Цена", "от **$800**", "от **$3 500**"],
        ]
      ),
      p("Визитку мы делаем в формате [лендинга](/ru/landing), сайт фирмы — это уже [корпоративный сайт](/ru/corporate-site) с CMS, где ваш маркетолог сам публикует статьи и обновляет цены."),
      h3("Обязательные страницы сайта аутсорс-фирмы"),
      num("Главная: кому помогаете, ключевые цифры фирмы, пакеты, форма."),
      num("Отдельная страница под каждую услугу: сопровождение ФОП, бухгалтерия для ООО, зарплата и кадры, восстановление учёта."),
      num("Прайс с пакетами и калькулятором — самая посещаемая страница после главной."),
      num("О команде: фото, сертификаты, специализация каждого бухгалтера."),
      num("Отзывы и кейсы клиентов по нишам: e-commerce, услуги, производство."),
      num("Блог о налогах и отчётности — источник органического трафика."),
      num("Контакты с мессенджерами: предприниматели пишут в Telegram чаще, чем звонят."),
      p("Каждая страница услуги — отдельная точка входа из поиска. Сайт из 5 страниц конкурирует за 5 запросов, сайт из 30 страниц — за несколько сотен. Поэтому структура важнее дизайна: мы проектируем её до макетов, на этапе семантики."),
      h2("Прозрачный прайс — главный конвертер"),
      p("Предприниматель, который ищет бухгалтера, боится двух вещей: что цену назовут «после звонка» и что потом она вырастет. Поэтому страница с пакетами и ценами конвертирует лучше любого слогана. Фирмы, прячущие прайс, отдают клиентов тем, кто его показывает."),
      p("Рабочий формат — 3–4 пакета, привязанные к форме собственности и системе налогообложения. Пример структуры прайса, который мы выносим на отдельную страницу сайта:"),
      table(
        ["Пакет", "Кому подходит", "Что входит", "Цена/мес"],
        [
          ["Старт", "ФОП 2 группа без сотрудников", "Отчётность, ЕН, консультации в мессенджере", "от 1 200 грн"],
          ["ФОП+", "ФОП 3 группа, с НДС или сотрудниками", "Отчётность, НДС, зарплата, первичка", "от 2 500 грн"],
          ["ООО", "ООО до 50 операций/мес", "Полный учёт, отчётность, зарплата", "от 6 000 грн"],
          ["ООО Pro", "ООО с ВЭД или большим оборотом", "Учёт, ВЭД, валютный контроль, аудит-поддержка", "индивидуально"],
        ]
      ),
      p("Цифры в таблице — пример для рынка Киева 2026 года; ваши будут своими. Принцип важнее цифр: **конкретное «от» у каждого пакета** плюс список того, что входит. «Индивидуально» допустимо только для самого дорогого тарифа."),
      h2("Калькулятор стоимости обслуживания"),
      p("Калькулятор — это интерактивный прайс. Посетитель отвечает на 4–6 вопросов: форма собственности, группа налогообложения, количество операций, есть ли сотрудники, НДС, ВЭД — и видит ориентировочную стоимость обслуживания. Дальше форма: «Оставьте контакт — зафиксируем эту цену»."),
      num("Калькулятор отсеивает нецелевых посетителей: до менеджера доходят те, кто уже видел цену."),
      num("Даёт повод оставить контакт: расчёт отправляем на email или в мессенджер."),
      num("Собирает аналитику: видно, какие конфигурации спрашивают чаще всего."),
      p("Технически это несложно: типовой калькулятор стоит **$200–500** как интеграция, сложная логика с отправкой в CRM — **$1 000–3 000**. Такой же подход мы используем в собственном [калькуляторе стоимости сайта](/ru/calculator) — посмотрите, как это работает вживую."),
      cta(
        "Посчитайте стоимость сайта для вашей фирмы",
        "Ответьте на 6 вопросов — и увидите вилку цен для визитки бухгалтера или сайта аутсорс-фирмы с калькулятором.",
        "Открыть калькулятор",
        "/ru/calculator"
      ),
      h2("Доверие: сертификаты, опыт, отзывы"),
      p("Бухгалтерия — это доступ к деньгам и документам бизнеса. Клиент отдаёт его только тому, кому доверяет, поэтому блок доверия работает наравне с прайсом."),
      h3("Сертификаты и опыт"),
      li("Дипломы, сертификаты САР/CAP, ACCA, свидетельства о повышении квалификации — сканами, а не словами."),
      li("Цифры фирмы: лет на рынке, клиентов на обслуживании, сданных отчётов, отраслей."),
      li("Фото команды с именами и должностями: «безликая фирма» проигрывает бухгалтеру с лицом."),
      h3("Отзывы предпринимателей"),
      p("Лучше всего работают отзывы с конкретикой: имя, ниша, что именно сделали («перевели с 3 группы на ООО, закрыли долг по ЕСВ»). Видео на 30–60 секунд — ещё сильнее. Просите отзыв в момент, когда клиент доволен: после успешно сданного квартала."),
      h3("Конфиденциальность"),
      p("Отдельный блок о том, как вы храните данные: NDA в договоре, доступы по ролям, шифрованные бэкапы первички. Для клиента, который передаёт вам банковские выписки и кадровые документы, это аргумент не слабее цены."),
      h2("Частые вопросы клиентов — это SEO-контент"),
      p("Запросы вроде «как сменить бухгалтера», «сроки сдачи отчётности ФОП 3 группа», «что будет за несвоевременную отчётность» — это ваши будущие клиенты на ранней стадии. Сделайте под каждый вопрос раздел на сайте или статью — и встретите их раньше конкурентов."),
      li("«Как безболезненно сменить бухгалтера» — инструкция с чеклистом передачи дел."),
      li("«Календарь отчётности ФОП и ООО на 2026 год» — страница, на которую возвращаются каждый квартал."),
      li("«Штрафы за несвоевременную отчётность» — запрос с высокой тревожностью и готовностью платить."),
      li("«Бухгалтер в штат или аутсорсинг» — сравнение, продающее именно вашу модель."),
      p("Эти же вопросы добавляем блоком FAQ со structured data — так сайт попадает в расширенные сниппеты Google и в ответы AI-поиска."),
      h2("Блог о налогах = постоянный трафик"),
      p("Налоговое законодательство меняется каждый год — и это подарок для SEO: контент о ставках единого налога, лимитах ФОП, новых формах отчётности всегда в спросе. Фирма, которая ведёт блог, за год собирает сотни переходов в месяц без рекламы. Двигатель — регулярность: 2–4 статьи в месяц стабильно лучше, чем 10 статей раз в полгода."),
      p("Если писать некому, [SEO-сопровождение](/ru/seo) от **$300/мес** закрывает это под ключ: семантика, тексты, техническая оптимизация. Похожую стратегию мы описывали для юристов в статье [сайт для адвоката](/ru/blog/sayt-dlya-advokata) — ниши-близнецы по механике доверия."),
      p("Не забывайте про локальный поиск: профиль Google Business с отзывами плюс страница с адресом офиса приводят клиентов по запросам вида «бухгалтер Киев Подол». Если фирма работает дистанционно по всей стране — наоборот, важнее страницы под услуги и ниши, а не геозапросы."),
      h2("Сколько стоит сайт бухгалтерской фирмы"),
      p("Вилка зависит от формата и функционала. Ориентиры нашей студии:"),
      li("**Сайт-визитка бухгалтера** ([лендинг](/ru/landing)): от **$800**, 2–3 недели."),
      li("**Сайт аутсорс-фирмы** ([корпоративный сайт](/ru/corporate-site) с CMS, прайс-пакетами и блогом): от **$3 500**, 4–8 недель."),
      li("**Калькулятор обслуживания**: **$200–500**, сложный с CRM-логикой — **$1 000–3 000**."),
      li("**Поддержка**: **$200/мес** или **$40/час** — обновление цен, статей, баннеров."),
      li("**SEO-продвижение**: от **$300/мес**."),
      p("Что именно скрывается за этими цифрами — дизайн, вёрстка, CMS, тексты — мы разложили в статье [сколько стоит сайт в 2026](/ru/blog/skolko-stoit-sayt-2026)."),
      h2("Примеры: как это работает в нишах доверия"),
      p("Бухгалтерия продаётся так же, как медицина или персональная экспертиза: человек сначала проверяет, можно ли вам доверять, и только потом смотрит на цену. Несколько наших работ из смежных ниш:"),
      li("[Сайт эксперта Александра Ситникова](/ru/portfolio/oleksandr-sitnikov) — персональный бренд: та же механика, что у визитки частного бухгалтера — лицо, регалии, услуги, форма."),
      li("[Клиника E-Fedra](/ru/portfolio/efedra-clinic) — ниша, где доверие и прозрачность цен решают всё: структура «услуги → цены → врачи → отзывы» переносится на бухгалтерскую фирму один в один."),
      li("[Solide Renovation](/ru/portfolio/solide-renovation) — сервисный бизнес с пакетными предложениями и понятным процессом, как в аутсорсинге учёта."),
      p("Во всех проектах конверсионная логика одна: понятная услуга, прозрачная цена, доказательство экспертности, простая форма обращения."),
      cta(
        "Нужен сайт, который приводит клиентов на абонплату?",
        "Сделаем визитку бухгалтера от $800 или сайт аутсорс-фирмы с калькулятором от $3 500. Срок — от 2 недель.",
        "Рассчитать стоимость",
        "/ru/calculator"
      ),
    ],
    en: [
      tldr("In short: a website that sells retainers", [
        "An accounting firm's website sells peace of mind, not \"services\": transparent pricing, credentials and clear answers.",
        "The main converter is a packages page with monthly prices plus a fee calculator.",
        "Cost range: a solo accountant's one-pager from $800, a full firm website with a calculator from $3,500.",
        "Clients' frequent questions (switching accountants, filing deadlines) are ready-made SEO content.",
        "A tax blog brings compounding organic traffic; ongoing SEO starts at $300/month.",
      ]),
      p("An accounting firm website pays for itself when it sells **monthly retainers**, not when it merely introduces the company. Four elements do the selling: service packages with visible prices, a fee calculator, a trust block with credentials and client reviews, and content that answers the questions business owners actually type into Google. A solo accountant's one-page site costs from **$800**; a full bookkeeping firm website with a calculator starts at **$3,500**."),
      p("The economics are compelling: one retainer client pays the firm every month for years, so even 3–5 organic leads a month recoup the website within a quarter. We've already covered the visual side of this niche in [web design for accountants](/en/blog/web-design-for-accountants) — this article is about the other half: what the site must contain and what it costs. The wider niche playbook lives on our [websites for finance companies](/en/sites-for/finance) page."),
      h2("Solo accountant page vs. full firm website"),
      p("A sole practitioner serving 10–20 small clients needs a tidy one-pager: who you are, what you do, what it costs, how to get in touch. An outsourced bookkeeping firm needs a proper multi-page site with a page per service and per client type — otherwise it will never collect search traffic across dozens of queries."),
      table(
        ["Criterion", "Solo accountant one-pager", "Bookkeeping firm website"],
        [
          ["Goal", "Prove credentials, capture enquiries", "Generate retainer leads from search"],
          ["Pages", "1–5: about, services, fees, contact", "15–40: services, packages, client niches, blog"],
          ["Features", "Enquiry form, messengers", "Fee calculator, pricing packages, blog, quiz form"],
          ["Timeline", "2–3 weeks", "4–8 weeks"],
          ["Price", "from **$800**", "from **$3,500**"],
        ]
      ),
      p("We build the one-pager as a [landing page](/en/landing); the firm website is a [corporate site](/en/corporate-site) with a CMS, so your team can publish articles and update fees without a developer."),
      h2("Transparent pricing is your best converter"),
      p("A business owner shopping for an accountant fears two things: being told the price \"after a call\", and the price creeping up later. That is why a packages page with visible monthly fees converts better than any slogan. Firms that hide their rates hand clients to firms that publish them."),
      p("The format that works is 3–4 packages tied to business type and complexity. Here is an example pricing structure we would put on a dedicated page:"),
      table(
        ["Package", "Best for", "What's included", "Monthly fee"],
        [
          ["Starter", "Self-employed, no staff", "Filings, tax returns, chat support", "from $60"],
          ["Growing", "VAT-registered sole trader", "Filings, VAT, payroll for 1–3, bookkeeping", "from $150"],
          ["Company", "Small Ltd, up to 50 transactions/mo", "Full bookkeeping, accounts, payroll", "from $350"],
          ["Company Pro", "Ltd with foreign trade or high volume", "Bookkeeping, multi-currency, audit support", "custom quote"],
        ]
      ),
      p("The figures are illustrative — yours will differ by market. The principle matters more than the numbers: **a concrete \"from\" price on every package** plus a bulleted list of what's included. \"Custom quote\" is acceptable only on the top tier."),
      h2("A fee calculator turns visitors into leads"),
      p("A calculator is an interactive price list. The visitor answers 4–6 questions — business type, VAT status, transaction volume, payroll headcount — and sees an estimated monthly fee, followed by a form: \"Leave your email and we'll lock in this quote.\""),
      num("It filters out poor-fit visitors: only people who have seen a price reach your inbox."),
      num("It earns the contact: the quote is emailed, which feels like a fair trade."),
      num("It gathers intelligence: you see which configurations prospects ask for most."),
      p("Technically it's a modest build: a typical calculator costs **$200–500** as a website integration; complex logic wired into a CRM runs **$1,000–3,000**. We use exactly this pattern in our own [website cost calculator](/en/calculator) — try it to see the mechanics live."),
      cta(
        "Price up a website for your firm",
        "Answer 6 questions and see the cost range — from a solo accountant one-pager to a full firm site with a fee calculator.",
        "Open the calculator",
        "/en/calculator"
      ),
      h2("Trust signals: credentials, experience, reviews"),
      p("Accounting means access to a business's money and records. Clients grant that access only to firms they trust, so the trust block on your site works as hard as the pricing page."),
      h3("Credentials and track record"),
      li("Certificates and memberships — ACCA, CPA, local chartered bodies — shown as scans and badges, not just claimed in text."),
      li("Firm numbers: years in practice, clients on retainer, filings submitted, industries served."),
      li("Team photos with names and roles: a faceless firm loses to an accountant with a face."),
      h3("Reviews from business owners"),
      p("Specific reviews outperform generic praise: a name, an industry, and what exactly was done (\"migrated us to a Ltd structure, cleared a payroll tax backlog\"). A 30–60 second video is stronger still. Ask at the moment of satisfaction — right after a clean quarter-end."),
      h3("Confidentiality"),
      p("Add a dedicated section on how you handle data: NDAs in the engagement letter, role-based access, encrypted backups of source documents. For a client handing over bank statements and payroll files, this argument weighs as much as price."),
      h2("Clients' frequent questions are SEO content"),
      p("Searches like \"how to switch accountants\", \"filing deadlines for small companies\" or \"penalties for late accounts\" are your future clients at an early stage. Build a page or article for each question and you meet them before your competitors do."),
      li("\"How to switch accountants painlessly\" — a step-by-step guide with a handover checklist."),
      li("\"Filing calendar for 2026\" — a page clients bookmark and return to every quarter."),
      li("\"Late filing penalties explained\" — a high-anxiety query with high willingness to pay."),
      li("\"In-house bookkeeper vs. outsourcing\" — a comparison that sells your model."),
      p("Mark the same questions up as an FAQ block with structured data, and the site becomes eligible for rich snippets and AI search answers."),
      h2("A tax blog compounds into steady traffic"),
      p("Tax rules change every year, which is a gift for SEO: content about rates, thresholds and new filing forms never runs out of fresh demand. A firm that publishes consistently collects hundreds of organic visits a month within a year — no ad spend. Consistency beats volume: 2–4 articles a month outperform 10 articles twice a year."),
      p("If nobody on the team writes, our [SEO retainer](/en/seo) from **$300/month** covers it end to end: keyword research, articles, technical optimisation. We described the same trust-driven playbook for law firms in [attorney website essentials](/en/blog/attorney-website-essentials) — a twin niche in conversion mechanics."),
      h2("What an accounting firm website costs"),
      p("The range depends on format and features. Our studio's benchmarks — a Ukrainian team delivering European quality at sensible rates:"),
      li("**Solo accountant one-pager** ([landing page](/en/landing)): from **$800**, 2–3 weeks."),
      li("**Bookkeeping firm website** ([corporate site](/en/corporate-site) with CMS, pricing packages and blog): from **$3,500**, 4–8 weeks."),
      li("**Fee calculator**: **$200–500**; complex CRM-connected logic — **$1,000–3,000**."),
      li("**Support**: **$200/month** or **$40/hour** — updating fees, articles and banners."),
      li("**SEO**: from **$300/month**."),
      p("For a full breakdown of where the money goes — design, build, CMS, copy — see [how much a website costs in 2026](/en/blog/custom-website-cost-uk-2026)."),
      h2("Examples from trust-driven niches"),
      p("Accounting sells the way medicine or personal expertise sells: prospects verify trust first and compare prices second. A few of our projects from adjacent niches:"),
      li("[Oleksandr Sitnikov](/en/portfolio/oleksandr-sitnikov) — a personal-brand site with the same mechanics as a solo accountant's page: face, credentials, services, enquiry form."),
      li("[E-Fedra clinic](/en/portfolio/efedra-clinic) — a niche where trust and price transparency decide everything; the \"services → prices → specialists → reviews\" structure maps onto an accounting firm one to one."),
      li("[Solide Renovation](/en/portfolio/solide-renovation) — a service business with packaged offers and a clear process, just like outsourced bookkeeping."),
      p("The conversion logic is identical in every project: a clear service, a transparent price, proof of expertise, and a short form."),
      cta(
        "Want a website that wins retainer clients?",
        "A solo accountant one-pager from $800, or a full firm website with a fee calculator from $3,500. Delivery from 2 weeks.",
        "Get an estimate",
        "/en/calculator"
      ),
    ],
  },
  faq: [
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для бухгалтерських послуг?",
        ru: "Сколько стоит создание сайта бухгалтерских услуг?",
        en: "How much does an accounting firm website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Сайт-візитка приватного бухгалтера — від $800 і 2–3 тижні роботи. Сайт аутсорсингової фірми з прайс-пакетами, блогом і CMS — від $3 500. Калькулятор вартості обслуговування додає $200–500, складна логіка з CRM — $1 000–3 000.",
        ru: "Сайт-визитка частного бухгалтера — от $800 и 2–3 недели работы. Сайт аутсорсинговой фирмы с прайс-пакетами, блогом и CMS — от $3 500. Калькулятор стоимости обслуживания добавляет $200–500, сложная логика с CRM — $1 000–3 000.",
        en: "A solo accountant's one-page site starts at $800 and takes 2–3 weeks. A full bookkeeping firm website with pricing packages, a blog and a CMS starts at $3,500. A fee calculator adds $200–500; complex CRM-connected logic runs $1,000–3,000.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібно публікувати ціни на сайті бухгалтерської фірми?",
        ru: "Нужно ли публиковать цены на сайте бухгалтерской фирмы?",
        en: "Should an accounting firm publish its prices online?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так. Прозорий прайс — головний конвертер у цій ніші: підприємець боїться ціни «після дзвінка». Достатньо вказати «від» для кожного пакета (ФОП 2–3 група, ТОВ) і список того, що входить. «Індивідуально» лишайте тільки для найдорожчого тарифу.",
        ru: "Да. Прозрачный прайс — главный конвертер в этой нише: предприниматель боится цены «после звонка». Достаточно указать «от» для каждого пакета (ФОП 2–3 группа, ООО) и список того, что входит. «Индивидуально» оставляйте только для самого дорогого тарифа.",
        en: "Yes. Transparent pricing is the strongest converter in this niche — prospects fear the \"price after a call\". A \"from\" figure per package with a list of inclusions is enough; reserve \"custom quote\" for the top tier only.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що обов'язково має бути на сайті бухгалтера?",
        ru: "Что обязательно должно быть на сайте бухгалтера?",
        en: "What must a bookkeeping services website include?",
      },
      answer: {
        _type: "localizedText",
        uk: "Мінімум: пакети послуг з цінами, сертифікати і досвід, відгуки підприємців з конкретикою, відповіді на часті питання (зміна бухгалтера, строки звітності), блок про конфіденційність даних і проста форма звернення. Для фірми — плюс калькулятор і блог про податки.",
        ru: "Минимум: пакеты услуг с ценами, сертификаты и опыт, отзывы предпринимателей с конкретикой, ответы на частые вопросы (смена бухгалтера, сроки отчётности), блок о конфиденциальности данных и простая форма обращения. Для фирмы — плюс калькулятор и блог о налогах.",
        en: "At minimum: service packages with prices, credentials and track record, specific client reviews, answers to frequent questions (switching accountants, filing deadlines), a data-confidentiality section and a short enquiry form. A firm should add a fee calculator and a tax blog.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Як бухгалтерській фірмі отримувати клієнтів з Google?",
        ru: "Как бухгалтерской фирме получать клиентов из Google?",
        en: "How does an accounting firm get clients from Google?",
      },
      answer: {
        _type: "localizedText",
        uk: "Через сторінки під комерційні запити («бухгалтерський супровід ФОП», «аутсорсинг бухгалтерії для ТОВ») і блог під інформаційні («строки звітності», «як змінити бухгалтера»). Плюс локальне SEO і профіль Google Business. Системний SEO-супровід коштує від $300/міс і зазвичай окупається 2–3 клієнтами на абонплаті.",
        ru: "Через страницы под коммерческие запросы («бухгалтерское сопровождение ФОП», «аутсорсинг бухгалтерии для ООО») и блог под информационные («сроки отчётности», «как сменить бухгалтера»). Плюс локальное SEO и профиль Google Business. Системное SEO-сопровождение стоит от $300/мес и обычно окупается 2–3 клиентами на абонплате.",
        en: "Through service pages targeting commercial queries (\"outsourced bookkeeping for small companies\") and a blog targeting informational ones (\"filing deadlines\", \"how to switch accountants\"), plus local SEO and a Google Business profile. An SEO retainer from $300/month typically pays for itself with 2–3 new retainer clients.",
      } },
    { _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає розробка сайту бухгалтерської фірми?",
        ru: "Сколько времени занимает разработка сайта бухгалтерской фирмы?",
        en: "How long does it take to build an accounting firm website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Візитка приватного бухгалтера — 2–3 тижні. Сайт аутсорс-фірми з калькулятором, прайс-пакетами і блогом — 4–8 тижнів залежно від кількості сторінок і інтеграцій. Найдовший етап — контент: тексти послуг і прайси варто готувати паралельно з дизайном.",
        ru: "Визитка частного бухгалтера — 2–3 недели. Сайт аутсорс-фирмы с калькулятором, прайс-пакетами и блогом — 4–8 недель в зависимости от количества страниц и интеграций. Самый долгий этап — контент: тексты услуг и прайсы стоит готовить параллельно с дизайном.",
        en: "A solo accountant's one-pager takes 2–3 weeks. A full firm website with a calculator, pricing packages and a blog takes 4–8 weeks depending on page count and integrations. Content is the slowest stage — prepare service copy and fee tables in parallel with design.",
      } },
  ],
};

async function run() {
  const outDir = join(HERE, "out");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, doc._id + ".json"), JSON.stringify(doc, null, 2));
  if (DRY) { console.log("[dry-run] wrote out/" + doc._id + ".json"); return; }
  const res = await client.createOrReplace(doc);
  console.log("created", res._id);
}
run().catch((e) => { console.error(e.message); process.exit(1); });
