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
  _id: "ltAug2026-internet-mahazyn-kosmetyky",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "internet-mahazyn-kosmetyky" },
    ru: { _type: "slug", current: "internet-magazin-kosmetiki" },
    en: { _type: "slug", current: "cosmetics-store-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Інтернет-магазин косметики: сайт, якому довіряють шкіру",
    ru: "Создание интернет-магазина косметики: сайт, которому доверяют кожу",
    en: "Cosmetics Ecommerce Website: a Store Customers Trust Their Skin To",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Інтернет-магазин косметики: створити сайт | Code-Site.Art",
    ru: "Создание интернет-магазина косметики: цены 2026",
    en: "Cosmetics Ecommerce Website: Cost & Guide 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Як створити інтернет-магазин косметики, якому довіряють. ✔️ Склад і сертифікати ✔️ Свотчі та підписки ✔️ Ціни від $800. ➡ Кейс Le Muse Nature.",
    ru: "➤ Создание интернет-магазина косметики: карточка с составом, свотчи, подписки. ✔️ Цены от $800 ✔️ Кейс натуральной косметики. ➡ Расчёт за 2 минуты.",
    en: "➤ How to build a cosmetics ecommerce website buyers trust. ✔️ INCI & certificates ✔️ Shades, reviews, bundles ✔️ From $800. ➡ Real beauty-brand case inside.",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "E-commerce для б'юті",
    ru: "E-commerce для бьюти",
    en: "Beauty e-commerce",
  },
  lede: {
    _type: "localizedString",
    uk: "Косметику наносять на шкіру, тому перед покупкою людина перевіряє склад, сертифікати й відтінок. Розбираємо, як зробити магазин, що витримує цю перевірку, — з цінами й кейсом натуральної косметики.",
    ru: "Косметику наносят на кожу, поэтому перед покупкой человек проверяет состав, сертификаты и оттенок. Разбираем, как сделать магазин, который выдерживает эту проверку, — с ценами и кейсом натуральной косметики.",
    en: "Cosmetics go on skin, so buyers check ingredients, certificates and shades before paying. Here is how to build a store that survives that scrutiny — with prices and a real natural-cosmetics case.",
  },
  tags: ["e-commerce", "косметика", "beauty"],
  relatedPostSlugs: ["internet-mahazyn-odiahu", "vartist-rozrobky-saytu-2026", "9-dyzain-pryiomiv-dlia-konversii"],
  body: {
    uk: [
      tldr("Коротко: сайт для продажу косметики", [
        "Покупці косметики читають склад і шукають сертифікати — картка товару має відповідати на це сама, без походу в Google.",
        "Свотчі, відтінки та фото «на шкірі» знижують кількість повернень і страх помилитися з тоном.",
        "Набори й підписки підіймають середній чек: косметика закінчується, і магазин має нагадати про це першим.",
        "Дропшипінг дозволяє стартувати без складу, але для б'юті критичні терміни придатності й умови зберігання.",
        "Ціни: лендінг бренду — від $800, повноцінний магазин — від $3 500, платформа з підписками — від $6 000.",
      ]),
      p("**Інтернет-магазин косметики** — це магазин, де головний товар не флакон, а довіра: продукт наносять на шкіру, тому перед оплатою покупець перевіряє склад, сертифікати, відтінок і відгуки реальних людей. Створити сайт для продажу косметики можна у трьох форматах: лендінг бренду від **$800**, повноцінний магазин від **$3 500** і платформа з підписками та кабінетом від **$6 000**."),
      p("У цій статті — що саме відрізняє б'юті-магазин від решти e-commerce, які елементи обов'язкові в картці товару, як працюють набори й підписки, що обрати між дропшипінгом і власним складом, і скільки все це коштує. Наприкінці — детальний розбір нашого кейсу [Le Muse Nature](/portfolio/le-muse-nature), магазину натуральної косметики."),
      h2("Чим магазин косметики відрізняється від «звичайного» e-commerce"),
      p("Ми вже розбирали [інтернет-магазин одягу](/blog/internet-mahazyn-odiahu): там усе крутиться навколо розмірних сіток і повернень. У косметики інша фізика покупки. Одяг можна повернути, якщо не підійшов; відкритий крем — ні. Тому рішення ухвалюється **до** покупки, і сайт має зняти всі сумніви заздалегідь."),
      li("**Склад важливіший за фасон.** Людина з реактивною шкірою чи алергією читає INCI-список так само уважно, як склад дитячого харчування."),
      li("**Відтінок не можна поміряти.** Тональний крем чи помаду не приміряєш, як сукню, — потрібні свотчі й фото на різних тонах шкіри."),
      li("**Товар витратний.** Крем закінчується за 2–3 місяці — повторні покупки важать більше, ніж перша."),
      li("**Регуляторика.** Терміни придатності, умови зберігання, маркування — це не бюрократія, а частина довіри."),
      p("Тому шаблонний магазин «каталог + кошик» для косметики працює погано. Потрібна архітектура під нішу — ми описали загальні принципи на сторінці [сайтів для e-commerce](/sites-for/ecommerce), а тут розберемо саме б'юті."),
      h2("Картка товару: склад, сертифікати, відтінки"),
      p("Картка товару — це 80% продажу в косметиці. Якщо покупець пішов гуглити «що таке phenoxyethanol» — ви його, ймовірно, втратили: він повернеться з пошуку не до вас, а до конкурента з нормальною карткою."),
      h3("Склад як контент, а не дрібний шрифт"),
      p("Повний INCI-список — обов'язковий, але недостатній. Сильні магазини перекладають склад людською мовою: активні компоненти виносять окремим блоком із поясненням, що кожен робить («ніацинамід 5% — вирівнює тон»), а до спірних інгредієнтів додають чесний коментар. Це реальний пошуковий патерн: люди вводять у Google назву продукту плюс «склад» — і сторінка, яка відповідає на це запитання, збирає цей трафік."),
      h3("Сертифікати й «чесні» позначки"),
      p("COSMOS, Ecocert, cruelty-free, vegan — якщо сертифікати є, вони мають бути в картці з посиланням на реєстр, а не тільки дрібною іконкою у футері. Якщо сертифікатів немає — не малюйте самодіяльні «еко»-значки: одна викрита фальшива позначка коштує дорожче, ніж її відсутність."),
      h3("Свотчі та відтінки"),
      p("Для декоративної косметики свотчі — це must: викладка відтінку на 3–4 тонах шкіри, фото при денному світлі, порівняння сусідніх тонів. Технічно це окрема сутність «відтінок» у CMS: свій артикул, свій залишок на складі, свої фото — а не десять товарів-клонів «Помада 01», «Помада 02»."),
      table(
        ["Елемент картки", "Навіщо він потрібен"],
        [
          ["Повний INCI + переклад активів", "Знімає головне заперечення: «що я наношу на шкіру»"],
          ["Сертифікати з посиланням на реєстр", "Перетворює маркетингове «натуральна» на факт, який можна перевірити"],
          ["Свотчі на різних тонах шкіри", "Замінює тестер у магазині, знижує повернення й негатив"],
          ["Фото «у використанні» та текстура", "Показує консистенцію — те, що не видно на рендері флакона"],
          ["Відгуки з фото покупців", "Соціальний доказ від людей зі схожим типом шкіри"],
          ["Термін придатності та зберігання", "Обов'язкова інформація, критична для натуральної косметики"],
          ["Об'єм і ціна за 100 мл", "Дає чесно порівняти продукти різного формату"],
        ],
      ),
      cta(
        "Не знаєте, з якого формату почати?",
        "Порахуйте вартість магазину косметики в калькуляторі — 2 хвилини, без дзвінків і менеджерів.",
        "Розрахувати вартість",
        "/calculator",
      ),
      h2("Контент, який продає: фото, відгуки, бренд-сторі"),
      p("Косметика — візуальна категорія з емоційною покупкою, тож стокові фото флаконів на білому тлі тут не працюють. Мінімальний контент-набір для картки: продукт у руках, текстура крупним планом, застосування на шкірі. Для крафтових брендів додається виробництво: фото варіння, інгредієнтів, пакування — це не «милі дрібниці», а доказ, що за брендом стоять реальні люди."),
      p("**Відгуки з фото** — окремий двигун. Текстовий відгук «класний крем» не важить нічого; фото результату чи свотча на шкірі покупця — важить багато. Тому в магазині має бути механіка збору: лист після доставки з проханням про відгук і бонусом за фото. А **бренд-сторі** для натуральної косметики — це не сторінка «Про нас» із трьома абзацами, а наскрізна лінія: хто засновник, чому такий склад, звідки інгредієнти."),
      p("Як подати це все без візуального шуму — ми розбирали у статті про [9 дизайн-прийомів для конверсії](/blog/9-dyzain-pryiomiv-dlia-konversii)."),
      h2("Набори, підписки й повторні покупки"),
      p("Головна економічна особливість косметики: товар закінчується. Це означає, що магазин, який продає лише «разово», втрачає більшу частину прибутку. Три механіки, які варто закласти в архітектуру одразу:"),
      num("**Набори.** Готові комбінації («догляд для сухої шкіри») і конструктор наборів підіймають середній чек на 30–60% та вирішують проблему подарунків."),
      num("**Підписка.** Крем на 60 днів → пропозиція автодоставки кожні 2 місяці зі знижкою. Для бренду це передбачуваний дохід, для клієнта — нижча ціна."),
      num("**Нагадування про поповнення.** Лист або повідомлення «ваш тонік, імовірно, закінчується» за тиждень до розрахункової дати — найдешевший канал повторних продажів."),
      p("Технічно підписки — це вже не просто магазин, а платформа: особистий кабінет, збережені оплати, керування графіком доставки. Саме тому в таблиці цін нижче цей формат стоїть окремо."),
      h2("Дропшипінг чи власний склад"),
      p("Для старту б'юті-магазину дропшипінг виглядає привабливо: не треба заморожувати гроші в стоку. Але в косметики є нюанси, які роблять його ризикованішим, ніж в інших нішах: ви не контролюєте умови зберігання (крем, що проїхав літо у фурі, — це рекламація), не бачите реальні терміни придатності й не можете вкласти в посилку семпл чи листівку — головні інструменти повторних продажів."),
      p("Робоча схема для більшості брендів: **власний склад для свого бренду й хітів + дропшипінг для довгого хвоста** асортименту. Сайт при цьому має підтримувати обидві моделі: різні джерела залишків, різні терміни доставки в картці, чесний статус «під замовлення, 5–7 днів». Це питання інтеграцій з постачальниками — типова обходиться в **$200–500**, складна синхронізація залишків — **$1 000–3 000**."),
      h2("Скільки коштує інтернет-магазин косметики у 2026"),
      p("Вилка залежить не від «краси», а від функціоналу: кількості SKU, відтінків, підписок та інтеграцій. Наші пакети для [розробки інтернет-магазину](/online-store):"),
      table(
        ["Формат", "Що всередині", "Ціна від", "Коли обирати"],
        [
          ["Лендінг бренду", "Сторінка бренду, 1–5 продуктів, бренд-сторі, форма замовлення", "**$800**", "Крафт-бренд на старті, перевірка попиту"],
          ["Інтернет-магазин", "Каталог, картки зі складом і свотчами, кошик, оплата, доставка, відгуки", "**$3 500**", "20+ SKU, регулярні продажі"],
          ["Платформа", "Усе з магазину + підписки, конструктор наборів, кабінет, програма лояльності", "**$6 000**", "Масштабування, ставка на повторні покупки"],
        ],
      ),
      p("Далі до бюджету додаються підтримка (**$200/міс** або **$40/год**) і SEO-просування від **$300/міс** — для косметики це критично, бо запити на кшталт «сироватка з ніацинамідом купити» приводять найтепліший трафік. Детальний розбір, з чого складається ціна будь-якого сайту, — у статті про [вартість розробки у 2026](/blog/vartist-rozrobky-saytu-2026)."),
      h2("Кейс: Le Muse Nature — магазин натуральної косметики"),
      p("[Le Muse Nature](/portfolio/le-muse-nature) — бренд натуральної косметики, для якого ми робили сайт саме за логікою з цієї статті. Завдання: продукт крафтовий, аудиторія прискіплива до складу, а конкурувати з мас-маркетом за ціною неможливо — отже, сайт має продавати довіру й історію, а не знижки."),
      li("**Бренд-сторі як каркас.** Головна сторінка веде від філософії бренду до продуктів, а не навпаки: спочатку «чому натуральна», потім «що купити»."),
      li("**Картки з акцентом на склад.** Активні інгредієнти винесені окремим блоком із поясненнями — картка відповідає на питання про склад до того, як покупець його поставив."),
      li("**Візуальна мова замість стоку.** Фотографії продукту, текстур та інгредієнтів у єдиній теплій гамі — сайт впізнається без логотипа."),
      li("**Результат.** Бренд отримав вітрину, яка витримує головну перевірку ніші — «покажіть склад і доведіть натуральність» — і конвертує читачів історії в покупців."),
      p("Цей кейс добре показує різницю форматів: Le Muse Nature стартував як брендова вітрина з невеликим каталогом — рівень між лендінгом і магазином. Коли асортимент і трафік ростуть, та сама архітектура добудовується до повноцінного магазину з підписками без переробки з нуля."),
      cta(
        "Готові будувати магазин, якому довіряють шкіру?",
        "Розкажіть про свій бренд — порахуємо вартість і зберемо план запуску під ваш асортимент.",
        "Порахувати мій магазин",
        "/calculator",
      ),
    ],
    ru: [
      tldr("Коротко: создание интернет-магазина косметики", [
        "Покупатели косметики читают состав и ищут сертификаты — карточка товара должна отвечать на это сама, без похода в Google.",
        "Свотчи, оттенки и фото «на коже» снижают возвраты и страх ошибиться с тоном.",
        "Наборы и подписки поднимают средний чек: косметика заканчивается, и магазин должен напомнить об этом первым.",
        "Дропшиппинг позволяет стартовать без склада, но для бьюти критичны сроки годности и условия хранения.",
        "Цены: лендинг бренда — от $800, полноценный магазин — от $3 500, платформа с подписками — от $6 000.",
      ]),
      p("**Создание интернет-магазина косметики** отличается от любого другого e-commerce одним фактом: продукт наносят на кожу. Поэтому перед оплатой покупатель проверяет состав, сертификаты, оттенок и отзывы реальных людей — и сайт должен выдержать эту проверку. По формату есть три варианта: лендинг бренда от **$800**, полноценный магазин от **$3 500** и платформа с подписками и личным кабинетом от **$6 000**."),
      p("В этой статье — чем бьюти-магазин отличается от остального e-commerce, что обязательно должно быть в карточке товара, как работают наборы и подписки, что выбрать между дропшиппингом и своим складом и сколько всё это стоит. В конце — подробный разбор нашего кейса [Le Muse Nature](/ru/portfolio/le-muse-nature), магазина натуральной косметики."),
      h2("Чем магазин косметики отличается от «обычного» e-commerce"),
      p("Мы уже разбирали [интернет-магазин одежды](/ru/blog/internet-magazin-odezhdy): там всё вращается вокруг размерных сеток и возвратов. У косметики другая физика покупки: платье можно вернуть, вскрытый крем — нет. Решение принимается **до** оплаты, и сайт обязан снять сомнения заранее."),
      li("**Состав важнее фасона.** Человек с реактивной кожей или аллергией читает INCI-список так же внимательно, как состав детского питания."),
      li("**Оттенок нельзя примерить.** Тональному крему и помаде нужны свотчи и фото на разных тонах кожи — примерочной здесь нет."),
      li("**Товар расходуется.** Крем заканчивается за 2–3 месяца — повторные покупки значат больше, чем первая."),
      li("**Регуляторика.** Сроки годности, условия хранения, маркировка — это не бюрократия, а часть доверия."),
      p("Поэтому шаблонный магазин «каталог + корзина» в косметике работает плохо. Нужна архитектура под нишу — общие принципы мы описали на странице [сайтов для e-commerce](/ru/sites-for/ecommerce), а здесь разберём именно бьюти."),
      h2("Карточка товара: состав, сертификаты, оттенки"),
      p("Карточка товара — это 80% продажи в косметике. Если покупатель ушёл гуглить «что такое phenoxyethanol», вы его, скорее всего, потеряли: из поиска он вернётся не к вам, а к конкуренту с нормальной карточкой."),
      h3("Состав как контент, а не мелкий шрифт"),
      p("Полный INCI-список обязателен, но недостаточен. Сильные магазины переводят состав на человеческий язык: активные компоненты вынесены отдельным блоком с пояснением, что каждый делает («ниацинамид 5% — выравнивает тон»), а к спорным ингредиентам добавлен честный комментарий. Это реальный поисковый паттерн: люди вводят в Google название продукта плюс «состав» — и страница, которая отвечает на этот вопрос, собирает этот трафик."),
      h3("Сертификаты и «честные» пометки"),
      p("COSMOS, Ecocert, cruelty-free, vegan — если сертификаты есть, они должны стоять в карточке со ссылкой на реестр, а не только мелкой иконкой в футере. Если сертификатов нет — не рисуйте самодельные «эко»-значки: одна разоблачённая фальшивая пометка стоит дороже, чем её отсутствие."),
      h3("Свотчи и оттенки"),
      p("Для декоративной косметики свотчи — это must: выкладка оттенка на 3–4 тонах кожи, фото при дневном свете, сравнение соседних тонов. Технически оттенок — отдельная сущность в CMS: свой артикул, свой остаток, свои фото, а не десять товаров-клонов «Помада 01», «Помада 02»."),
      table(
        ["Элемент карточки", "Зачем он нужен"],
        [
          ["Полный INCI + перевод активов", "Снимает главное возражение: «что я наношу на кожу»"],
          ["Сертификаты со ссылкой на реестр", "Превращает маркетинговое «натуральная» в проверяемый факт"],
          ["Свотчи на разных тонах кожи", "Заменяют тестер в магазине, снижают возвраты и негатив"],
          ["Фото «в использовании» и текстура", "Показывают консистенцию — то, чего не видно на рендере флакона"],
          ["Отзывы с фото покупателей", "Социальное доказательство от людей с похожим типом кожи"],
          ["Срок годности и условия хранения", "Обязательная информация, критичная для натуральной косметики"],
          ["Объём и цена за 100 мл", "Позволяют честно сравнить продукты разного формата"],
        ],
      ),
      cta(
        "Не знаете, с какого формата начать?",
        "Посчитайте стоимость магазина косметики в калькуляторе — 2 минуты, без звонков и менеджеров.",
        "Рассчитать стоимость",
        "/ru/calculator",
      ),
      h2("Контент, который продаёт: фото, отзывы, бренд-стори"),
      p("Косметика — визуальная категория с эмоциональной покупкой, поэтому стоковые фото флаконов на белом фоне здесь не работают. Минимальный контент-набор карточки: продукт в руках, текстура крупным планом, применение на коже. Для крафтовых брендов добавляется производство: фото варки, ингредиентов, упаковки — это не «милые мелочи», а доказательство, что за брендом стоят живые люди."),
      p("**Отзывы с фото** — отдельный двигатель. Текстовый отзыв «классный крем» не весит ничего; фото результата или свотча на коже покупателя весит много. Поэтому в магазин закладывается механика сбора: письмо после доставки с просьбой об отзыве и бонусом за фото. А **бренд-стори** для натуральной косметики — не страница «О нас» из трёх абзацев, а сквозная линия: кто основатель, почему такой состав, откуда ингредиенты."),
      p("Как подать всё это без визуального шума — разбирали в статье про [9 дизайн-приёмов для конверсии](/ru/blog/9-dizayn-priyomov-dlya-konversii)."),
      h2("Наборы, подписки и повторные покупки"),
      p("Главная экономическая особенность косметики: товар заканчивается. Магазин, который продаёт только «разово», теряет большую часть прибыли. Три механики, которые стоит заложить в архитектуру сразу:"),
      num("**Наборы.** Готовые комбинации («уход для сухой кожи») и конструктор наборов поднимают средний чек на 30–60% и закрывают сценарий подарков."),
      num("**Подписка.** Крем на 60 дней → предложение автодоставки каждые 2 месяца со скидкой. Бренду — предсказуемый доход, клиенту — цена ниже."),
      num("**Напоминание о пополнении.** Письмо «ваш тоник, вероятно, заканчивается» за неделю до расчётной даты — самый дешёвый канал повторных продаж."),
      p("Технически подписки — это уже не просто магазин, а платформа: личный кабинет, сохранённые оплаты, управление графиком доставки. Именно поэтому в таблице цен ниже этот формат стоит отдельно."),
      h2("Дропшиппинг или свой склад"),
      p("Для старта дропшиппинг выглядит привлекательно: деньги не заморожены в стоке. Но у косметики есть нюансы, которые делают его рискованнее, чем в других нишах: вы не контролируете условия хранения (крем, проехавший лето в фуре, — это рекламация), не видите реальные сроки годности и не можете вложить в посылку сэмпл или открытку — главные инструменты повторных продаж."),
      p("Рабочая схема для большинства брендов: **свой склад для собственного бренда и хитов + дропшиппинг для длинного хвоста** ассортимента. Сайт должен поддерживать обе модели: разные источники остатков, разные сроки доставки в карточке, честный статус «под заказ, 5–7 дней». Это вопрос интеграций с поставщиками: типовая обходится в **$200–500**, сложная синхронизация остатков — **$1 000–3 000**."),
      h2("Сколько стоит интернет-магазин косметики в 2026"),
      p("Вилка зависит не от «красоты», а от функционала: количества SKU, оттенков, подписок и интеграций. Наши пакеты на [разработку интернет-магазина](/ru/online-store):"),
      table(
        ["Формат", "Что внутри", "Цена от", "Когда выбирать"],
        [
          ["Лендинг бренда", "Страница бренда, 1–5 продуктов, бренд-стори, форма заказа", "**$800**", "Крафт-бренд на старте, проверка спроса"],
          ["Интернет-магазин", "Каталог, карточки с составом и свотчами, корзина, оплата, доставка, отзывы", "**$3 500**", "20+ SKU, регулярные продажи"],
          ["Платформа", "Всё из магазина + подписки, конструктор наборов, кабинет, программа лояльности", "**$6 000**", "Масштабирование, ставка на повторные покупки"],
        ],
      ),
      p("Дальше к бюджету добавляются поддержка (**$200/мес** или **$40/час**) и SEO-продвижение от **$300/мес** — для косметики это критично: запросы вроде «сыворотка с ниацинамидом купить» приводят самый тёплый трафик. Подробный разбор, из чего складывается цена любого сайта, — в статье [сколько стоит сайт в 2026](/ru/blog/skolko-stoit-sayt-2026)."),
      h2("Кейс: Le Muse Nature — магазин натуральной косметики"),
      p("[Le Muse Nature](/ru/portfolio/le-muse-nature) — бренд натуральной косметики, для которого мы делали сайт ровно по логике этой статьи. Задача: продукт крафтовый, аудитория придирчива к составу, а конкурировать с масс-маркетом по цене невозможно — значит, сайт должен продавать доверие и историю, а не скидки."),
      li("**Бренд-стори как каркас.** Главная ведёт от философии бренда к продуктам, а не наоборот: сначала «почему натуральная», потом «что купить»."),
      li("**Карточки с акцентом на состав.** Активные ингредиенты вынесены отдельным блоком с пояснениями — карточка отвечает на вопрос о составе раньше, чем покупатель его задал."),
      li("**Визуальный язык вместо стока.** Фотографии продукта, текстур и ингредиентов в единой тёплой гамме — сайт узнаваем без логотипа."),
      li("**Результат.** Бренд получил витрину, которая выдерживает главную проверку ниши — «покажите состав и докажите натуральность» — и превращает читателей истории в покупателей."),
      p("Кейс хорошо показывает разницу форматов: Le Muse Nature стартовал как брендовая витрина с небольшим каталогом — уровень между лендингом и магазином. Когда ассортимент и трафик растут, та же архитектура достраивается до полноценного магазина с подписками без переделки с нуля."),
      cta(
        "Готовы строить магазин, которому доверяют кожу?",
        "Расскажите о своём бренде — посчитаем стоимость и соберём план запуска под ваш ассортимент.",
        "Посчитать мой магазин",
        "/ru/calculator",
      ),
    ],
    en: [
      tldr("In short: a cosmetics store that earns trust", [
        "Cosmetics buyers read ingredient lists and look for certificates — the product page must answer those questions itself, without a trip to Google.",
        "Swatches, shade photos and on-skin shots cut returns and the fear of picking the wrong tone.",
        "Bundles and subscriptions lift average order value: cosmetics run out, and your store should be the first to remind the customer.",
        "Dropshipping lets you launch without stock, but shelf life and storage conditions make it riskier in beauty than elsewhere.",
        "Prices: brand landing page from $800, full store from $3,500, subscription platform from $6,000.",
      ]),
      p("A **cosmetics ecommerce website** sells something no other store does: permission to touch skin. Before paying, buyers check the INCI list, certificates, shades and real customers' reviews — and the site has to survive that scrutiny. Format-wise there are three options: a beauty brand website (landing page) from **$800**, a full online store from **$3,500**, and a platform with subscriptions and customer accounts from **$6,000**."),
      p("This guide covers what makes beauty different from the rest of ecommerce, which product-page elements are non-negotiable, how bundles and subscriptions work, the dropshipping vs own-warehouse decision, and what it all costs. We are a Ukrainian studio working with European and UK clients — European quality at sensible rates — and at the end we walk through our natural-cosmetics case, [Le Muse Nature](/en/portfolio/le-muse-nature)."),
      h2("Why a cosmetics store is not \"just another ecommerce site\""),
      p("We have already covered the [clothing store playbook](/en/blog/clothing-store-website): there, everything revolves around size charts and returns. Cosmetics has a different purchase physics — a dress can go back, an opened jar of cream cannot. The decision happens **before** checkout, so the site must remove every doubt in advance."),
      li("**Ingredients beat aesthetics.** A customer with reactive skin reads the INCI list as carefully as baby-food labels."),
      li("**You cannot try on a shade.** Foundation and lipstick need swatches and photos on different skin tones — there is no fitting room."),
      li("**The product runs out.** A cream lasts 2–3 months, so repeat purchases matter more than the first one."),
      li("**Regulation is part of trust.** Shelf life, storage conditions and labelling are legal requirements, not fine print."),
      p("That is why a template \"catalogue + cart\" store underperforms in beauty. You need niche-specific architecture — the general principles live on our [ecommerce websites](/en/sites-for/ecommerce) page; here we focus on beauty specifically."),
      h2("The product page: ingredients, certificates, shades"),
      p("In cosmetics the product page does 80% of the selling. If a shopper leaves to google \"what is phenoxyethanol\", you have probably lost them — they will return from search to a competitor whose page answers the question."),
      h3("Ingredients as content, not small print"),
      p("The full INCI list is mandatory but not sufficient. Strong stores translate it into plain language: active ingredients get their own block explaining what each one does (\"niacinamide 5% — evens skin tone\"), and controversial ingredients get an honest note. This is a real search pattern — people google a product name plus \"ingredients\", and the page that answers wins that traffic."),
      h3("Certificates and honest claims"),
      p("COSMOS, Ecocert, cruelty-free, vegan — if you hold certificates, show them on the product page with a link to the registry, not as a tiny footer icon. If you do not, resist inventing home-made \"eco\" badges: one exposed fake claim costs more than having none."),
      h3("Swatches and shades"),
      p("For colour cosmetics swatches are a must: each shade on 3–4 skin tones, daylight photos, side-by-side comparison of neighbouring tones. Technically a shade should be a first-class entity in the CMS — its own SKU, its own stock level, its own photos — not ten clone products named \"Lipstick 01\", \"Lipstick 02\"."),
      table(
        ["Product page element", "Why it matters"],
        [
          ["Full INCI + plain-language actives", "Answers the core objection: \"what am I putting on my skin\""],
          ["Certificates linked to the registry", "Turns the marketing word \"natural\" into a verifiable fact"],
          ["Swatches on different skin tones", "Replaces the in-store tester, cuts returns and complaints"],
          ["In-use photos and texture shots", "Shows consistency — the thing a bottle render never conveys"],
          ["Customer reviews with photos", "Social proof from people with a similar skin type"],
          ["Shelf life and storage conditions", "Legally required and critical for natural cosmetics"],
          ["Volume and price per 100 ml", "Lets shoppers compare products of different sizes honestly"],
        ],
      ),
      cta(
        "Not sure which format fits your brand?",
        "Price your cosmetics store in our calculator — two minutes, no calls, no sales managers.",
        "Get an estimate",
        "/en/calculator",
      ),
      h2("Content that sells: photos, reviews, brand story"),
      p("Beauty is a visual category with an emotional purchase, so stock photos of bottles on white backgrounds do not work. The minimum content set per product: the product in hands, a close-up of the texture, application on skin. Craft brands add production shots — making, raw ingredients, packing. Those are not \"nice touches\"; they are proof that real people stand behind the brand."),
      p("**Reviews with photos** are their own engine. A text review saying \"great cream\" weighs nothing; a photo of the result or a swatch on a customer's skin weighs a lot. Build the collection mechanics into the store: a post-delivery email asking for a review, with a bonus for adding a photo. And for natural cosmetics the **brand story** is not a three-paragraph About page — it is a through-line: who the founder is, why this formulation, where the ingredients come from."),
      p("For how to present all of this without visual noise, see our piece on [9 design moves that lift conversion](/en/blog/9-design-moves-that-lift-conversion)."),
      h2("Bundles, subscriptions and repeat purchases"),
      p("The defining economics of cosmetics: the product runs out. A store that only sells one-off orders leaves most of its profit on the table. Three mechanics worth building into the architecture from day one:"),
      num("**Bundles.** Ready-made routines (\"dry skin set\") and a build-your-own-set constructor lift average order value by 30–60% and cover the gifting scenario."),
      num("**Subscriptions.** A 60-day cream becomes an auto-delivery offer every two months at a discount — predictable revenue for the brand, a lower price for the customer."),
      num("**Replenishment reminders.** An email saying \"your toner is probably running low\" a week before the estimated run-out date is the cheapest repeat-sales channel there is."),
      p("Technically, subscriptions turn a store into a platform: customer accounts, saved payments, delivery schedule management. That is exactly why the pricing table below lists it as a separate tier."),
      h2("Dropshipping vs your own warehouse"),
      p("Dropshipping looks tempting at launch — no money frozen in stock. But beauty adds risks other niches do not have: you cannot control storage conditions (a cream that spent the summer in a lorry is a complaint waiting to happen), you cannot verify real expiry dates, and you cannot slip a sample or a thank-you card into the parcel — the main tools of repeat sales."),
      p("The scheme that works for most brands: **own warehouse for your own products and bestsellers, dropshipping for the long tail**. The site must support both models — separate stock sources, different delivery estimates per product, an honest \"made to order, 5–7 days\" status. This is a supplier-integration question: a typical integration costs **$200–500**, complex stock synchronisation **$1,000–3,000**."),
      h2("What a cosmetics ecommerce website costs in 2026"),
      p("The price fork depends on functionality, not looks: SKU count, shades, subscriptions, integrations. Our packages for [online store development](/en/online-store):"),
      table(
        ["Format", "What is inside", "Price from", "When to choose it"],
        [
          ["Brand landing page", "Brand page, 1–5 products, brand story, order form", "**$800**", "A craft brand at launch, validating demand"],
          ["Online store", "Catalogue, ingredient-rich product pages, swatches, cart, payments, delivery, reviews", "**$3,500**", "20+ SKUs, regular sales"],
          ["Platform", "Everything in the store + subscriptions, bundle builder, accounts, loyalty programme", "**$6,000**", "Scaling with a bet on repeat purchases"],
        ],
      ),
      p("On top of that: support at **$200/month** (or $40/hour) and SEO from **$300/month** — critical in beauty, where queries like \"niacinamide serum buy\" bring the warmest traffic there is. For a full breakdown of what goes into any website budget, see [what a custom website costs in 2026](/en/blog/custom-website-cost-uk-2026)."),
      h2("Case study: Le Muse Nature — a natural cosmetics store"),
      p("[Le Muse Nature](/en/portfolio/le-muse-nature) is a natural cosmetics brand we built following exactly the logic of this article. The brief: a craft product, an audience obsessive about ingredients, and no way to compete with mass market on price — so the site had to sell trust and story, not discounts."),
      li("**Brand story as the skeleton.** The homepage moves from the brand's philosophy to the products, not the other way round: first \"why natural\", then \"what to buy\"."),
      li("**Ingredient-first product pages.** Active ingredients sit in their own explained block — the page answers the ingredient question before the shopper asks it."),
      li("**A visual language instead of stock.** Product, texture and ingredient photography in one warm palette — the site is recognisable without its logo."),
      li("**The result.** The brand got a storefront that passes the niche's core test — \"show the ingredients and prove it is natural\" — and turns story readers into buyers."),
      p("The case also illustrates the format ladder: Le Muse Nature launched as a brand storefront with a compact catalogue — between a landing page and a store. As the range and traffic grow, the same architecture extends into a full store with subscriptions, with no rebuild from scratch."),
      cta(
        "Ready to build a store customers trust their skin to?",
        "Tell us about your brand — we will price it and map a launch plan for your product range.",
        "Price my store",
        "/en/calculator",
      ),
    ],
  },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує створити інтернет-магазин косметики?",
        ru: "Сколько стоит создание интернет-магазина косметики?",
        en: "How much does a cosmetics ecommerce website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг бренду з кількома продуктами — від $800, повноцінний магазин з каталогом, оплатою та відгуками — від $3 500, платформа з підписками й особистим кабінетом — від $6 000. Фінальна ціна залежить від кількості SKU, відтінків та інтеграцій — точну цифру дає калькулятор на сайті.",
        ru: "Лендинг бренда с несколькими продуктами — от $800, полноценный магазин с каталогом, оплатой и отзывами — от $3 500, платформа с подписками и личным кабинетом — от $6 000. Финальная цена зависит от количества SKU, оттенков и интеграций — точную цифру даёт калькулятор на сайте.",
        en: "A brand landing page with a few products starts at $800, a full store with a catalogue, payments and reviews at $3,500, and a subscription platform with customer accounts at $6,000. The final price depends on SKU count, shades and integrations — our online calculator gives an exact figure.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна продавати косметику через Instagram без сайту?",
        ru: "Можно ли продавать косметику через Instagram без сайта?",
        en: "Can I sell cosmetics through Instagram without a website?",
      },
      answer: {
        _type: "localizedText",
        uk: "На старті — так, але з двома обмеженнями: у директі неможливо показати повний склад і сертифікати структуровано, а профіль не збирає пошуковий трафік за запитами типу «сироватка з ніацинамідом купити». Робоча зв'язка — Instagram для трафіку, сайт для довіри й оплати.",
        ru: "На старте — да, но с двумя ограничениями: в директе невозможно структурированно показать полный состав и сертификаты, а профиль не собирает поисковый трафик по запросам вроде «сыворотка с ниацинамидом купить». Рабочая связка — Instagram для трафика, сайт для доверия и оплаты.",
        en: "At launch, yes — with two limits: DMs cannot present full ingredient lists and certificates in a structured way, and a profile collects no search traffic for queries like \"niacinamide serum buy\". The working combination is Instagram for traffic, the website for trust and checkout.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що обов'язково має бути в картці товару косметики?",
        ru: "Что обязательно должно быть в карточке товара косметики?",
        en: "What must a cosmetics product page include?",
      },
      answer: {
        _type: "localizedText",
        uk: "Повний INCI-склад з поясненням активних компонентів, сертифікати з посиланням на реєстр, свотчі відтінків на різних тонах шкіри, фото текстури та застосування, відгуки з фото, термін придатності й умови зберігання. Це мінімум, який знімає заперечення до покупки.",
        ru: "Полный INCI-состав с пояснением активных компонентов, сертификаты со ссылкой на реестр, свотчи оттенков на разных тонах кожи, фото текстуры и применения, отзывы с фото, срок годности и условия хранения. Это минимум, который снимает возражения до покупки.",
        en: "The full INCI list with plain-language actives, certificates linked to their registries, shade swatches on different skin tones, texture and in-use photos, customer reviews with photos, and shelf life with storage conditions. That is the minimum that removes objections before purchase.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Дропшипінг чи власний склад — з чого почати бренду косметики?",
        ru: "Дропшиппинг или свой склад — с чего начать бренду косметики?",
        en: "Dropshipping or my own warehouse — where should a beauty brand start?",
      },
      answer: {
        _type: "localizedText",
        uk: "Для власного бренду — тільки свій склад: ви контролюєте зберігання, терміни придатності й можете класти семпли в посилки. Дропшипінг має сенс як доповнення для довгого хвоста чужих брендів. Сайт має підтримувати обидві моделі одночасно — це питання інтеграцій із постачальниками.",
        ru: "Для собственного бренда — только свой склад: вы контролируете хранение, сроки годности и можете класть сэмплы в посылки. Дропшиппинг имеет смысл как дополнение для длинного хвоста чужих брендов. Сайт должен поддерживать обе модели одновременно — это вопрос интеграций с поставщиками.",
        en: "For your own brand — your own warehouse only: you control storage, expiry dates and can add samples to parcels. Dropshipping makes sense as a supplement for a long tail of third-party brands. The site should support both models at once — that is a supplier-integration question.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає розробка магазину косметики?",
        ru: "Сколько времени занимает разработка магазина косметики?",
        en: "How long does it take to build a cosmetics store?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг бренду — 2–3 тижні, повноцінний магазин — 6–10 тижнів, платформа з підписками — від 10 тижнів. Найдовший етап зазвичай не код, а контент: фото продуктів, свотчі й тексти складів — їх варто готувати паралельно з розробкою.",
        ru: "Лендинг бренда — 2–3 недели, полноценный магазин — 6–10 недель, платформа с подписками — от 10 недель. Самый долгий этап обычно не код, а контент: фото продуктов, свотчи и тексты составов — их стоит готовить параллельно с разработкой.",
        en: "A brand landing page takes 2–3 weeks, a full store 6–10 weeks, a subscription platform 10+ weeks. The longest stage is usually not the code but the content: product photos, swatches and ingredient copy — prepare them in parallel with development.",
      },
    },
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
