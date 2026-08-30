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
const table = (headers, rows) => ({
  _key: key(), _type: "blogTable", headers,
  rows: rows.map((cells) => ({ _key: key(), _type: "blogTableRow", cells })),
});
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

/* ─────────────────────────── UK ─────────────────────────── */
const bodyUk = [
  tldr("Коротко", [
    "Лендінг — це односторінковий сайт, побудований навколо однієї цільової дії.",
    "Класична структура: перший екран, оффер, докази, зняття заперечень, заклик до дії.",
    "Підходить під рекламу, один продукт, послугу чи подію. Не підходить, коли послуг багато й потрібне SEO вглиб.",
    "У нас лендінг коштує від $800 і робиться 1–2 тижні.",
    "Найчастіша помилка — кілька різних призивів на одній сторінці замість одного.",
  ]),
  p("Лендінг — це односторінковий сайт, який веде відвідувача до **однієї конкретної дії**: залишити заявку, записатися на консультацію, оформити замовлення. Уся сторінка працює на цю дію: немає меню з десятьма розділами, немає бічних гілок, немає варіантів «а можна ще подивитися тут»."),
  p("Назва буквальна. Landing page — «сторінка приземлення»: саме на неї «приземляється» людина, яка клікнула по рекламі, перейшла з розсилки або з посту в соцмережах. Рекламний бюджет привів людину сюди — і завдання сторінки не розповісти про компанію, а довести людину до форми."),
  p("Формально лендінг — це один із **типів сайту**, поряд із сайтом-візиткою, корпоративним сайтом та інтернет-магазином. Якщо ви саме обираєте між ними, у нас є окреме порівняння: [сайт-візитка, лендінг чи корпоративний сайт](/blog/sait-vizytka-lending-chy-korporatyvnyi). Тут ми розбираємо тільки сам лендінг — що це і як він влаштований."),

  h2("Простими словами"),
  p("Уявіть хорошого продавця в залі. Він не показує весь склад і не пропонує обійти всі відділи. Він з'ясовує, за чим ви прийшли, показує один товар, відповідає на два-три сумніви й доводить до каси. Лендінг — це той самий сценарій, тільки на екрані: одна розмова, одна пропозиція, один вихід."),
  p("Звідси головна властивість формату: **лендінг не універсальний**. Він добре продає одну річ одній аудиторії. Спроба вмістити на нього три послуги для трьох різних сегментів перетворює його на звичайну сторінку сайту, тільки довгу."),

  h2("З чого складається класичний лендінг"),
  p("Порядок блоків може змінюватися, але п'ять елементів є практично завжди."),
  h3("1. Перший екран"),
  p("Те, що видно без прокрутки. Тут за 3–5 секунд людина має зрозуміти: що ви пропонуєте, кому і що робити далі. Заголовок із конкретикою замість «Ласкаво просимо», короткий підзаголовок, кнопка. Якщо перший екран не спрацював, решта сторінки вже не має значення."),
  h3("2. Оффер"),
  p("Сама пропозиція: що людина отримає, у якому обсязі, за скільки, за який час. Оффер — це не список ваших переваг, а результат для клієнта. «Робимо ремонт» — не оффер. «Ремонт квартири під ключ за 60 днів із фіксованим кошторисом» — оффер."),
  h3("3. Докази"),
  p("Кейси, цифри, фото робіт, відгуки з іменами, сертифікати, логотипи клієнтів. Усе, що перетворює обіцянку на факт. Один розгорнутий кейс із результатом працює краще, ніж дванадцять анонімних відгуків «все сподобалось»."),
  h3("4. Зняття заперечень"),
  p("Блок, який відповідає на те, через що людина зазвичай не залишає заявку: дорого, довго, а якщо не сподобається, а хто це робитиме. Сюди добре лягають гарантії, опис процесу поетапно і FAQ."),
  h3("5. Заклик до дії"),
  p("Форма або кнопка з одним зрозумілим призивом. Що таке CTA і чому їх не має бути п'ять різних — розписали окремо: [що таке CTA](/blog/shcho-take-cta). Коротко: на лендінгу призив повторюється кілька разів по ходу сторінки, але він **один і той самий**."),

  h2("Коли лендінг підходить, а коли потрібен багатосторінковий сайт"),
  p("Це головне практичне питання. Лендінг дешевший і швидший, але він вирішує вузьке завдання — і там, де завдання ширше, економія обертається переробкою через півроку."),
  table(
    ["Ситуація", "Що краще", "Чому"],
    [
      ["Запускаєте рекламу на один продукт або послугу", "Лендінг", "Уся сторінка під один запит і один призив — конверсія вища"],
      ["Подія, набір на курс, акція з дедлайном", "Лендінг", "Живе обмежений час, глибина структури не потрібна"],
      ["Тестуєте попит на нову ідею", "Лендінг", "Швидко зібрати, швидко зняти показники, дешево помилитися"],
      ["5–15 послуг, кожну шукають окремо в Google", "Багатосторінковий сайт", "Під кожен запит потрібна своя сторінка, інакше SEO не буде"],
      ["Каталог товарів, кошик, оплата", "Інтернет-магазин", "Лендінг фізично не тримає каталог і фільтри"],
      ["Потрібні блог, вакансії, документи, кілька філій", "Корпоративний сайт", "Контенту більше, ніж вміщує одна сторінка"],
    ],
  ),
  p("Проміжний варіант теж робочий: лендінг під платний трафік плюс основний сайт під органіку. Це два різні інструменти, і вони не конкурують між собою."),

  h2("Скільки коштує лендінг і скільки його роблять"),
  p("У нашій студії лендінг коштує **від $800** і займає **1–2 тижні** — від брифу до запуску, з адаптивом під мобільні, підключеною формою та базовою аналітикою. Терміни зсуваються переважно через контент: якщо текстів і фото ще немає, збір матеріалу зазвичай довший за саму розробку."),
  p("Ціна залежить від обсягу блоків, кількості мов, складності анімацій та інтеграцій — наприклад, підключення CRM чи онлайн-оплати. Повний перелік пакетів і того, що входить у кожен, є на сторінці [цін](/pricing), а деталі формату — на сторінці [розробки лендінгів](/landing)."),

  h2("Типові помилки"),
  p("Більшість лендінгів, які не конвертують, ламаються на одному й тому самому."),
  li("**Кілька різних призивів.** «Замовити», «Отримати каталог», «Підписатися», «Зателефонувати» на одній сторінці — людина не обирає, вона йде."),
  li("**Немає доказів.** Обіцянки без кейсів, цифр і відгуків читаються як реклама і не працюють."),
  li("**Довга форма.** Сім полів на першому кроці вбивають конверсію. Ім'я і телефон — решту з'ясуєте у розмові."),
  li("**Сторінка про себе, а не про клієнта.** «Ми на ринку з 2012 року» — не аргумент, поки не сказано, що це дає замовнику."),
  li("**Мобільна версія за залишковим принципом.** Більша частина реклами відкривається з телефона, і саме там частіше все розсипається."),
  li("**Трафік не той.** Ідеальний лендінг із нецільовою рекламою дасть нуль. Спершу перевіряйте, за яким запитом приходять люди."),
  p("Ще один шар — дизайн: як розставлені акценти, куди веде погляд, що видно без прокрутки. Про це у нас окремий розбір із прикладами: [9 дизайн-прийомів для конверсії](/blog/9-dyzain-pryiomiv-dlia-konversii)."),

  h2("Як це виглядає на практиці"),
  p("Наочний приклад формату — [лендінг курсу Aleko](/portfolio/aleko-course): один продукт, одна аудиторія, одна дія — записатися. Уся сторінка вибудувана як послідовність аргументів, а не як меню розділів."),

  cta(
    "Потрібен лендінг, який справді збирає заявки?",
    "Зберемо структуру під ваш продукт, зробимо за 1–2 тижні. Від $800.",
    "Обговорити проєкт",
    "/landing",
  ),
];

/* ─────────────────────────── RU ─────────────────────────── */
const bodyRu = [
  tldr("Коротко", [
    "Лендинг — это одностраничный сайт, построенный вокруг одного целевого действия.",
    "Классическая структура: первый экран, оффер, доказательства, снятие возражений, призыв к действию.",
    "Подходит под рекламу, один продукт, услугу или событие. Не подходит, когда услуг много и нужно SEO вглубь.",
    "У нас лендинг стоит от $800 и делается за 1–2 недели.",
    "Самая частая ошибка — несколько разных призывов на одной странице вместо одного.",
  ]),
  p("Лендинг — это одностраничный сайт, который ведёт посетителя к **одному конкретному действию**: оставить заявку, записаться на консультацию, оформить заказ. Вся страница работает на это действие: нет меню из десяти разделов, нет боковых веток, нет вариантов «а можно ещё посмотреть вот тут»."),
  p("Название буквальное. Landing page — «страница приземления»: именно на неё «приземляется» человек, кликнувший по рекламе, перешедший из рассылки или из поста в соцсетях. Рекламный бюджет привёл человека сюда — и задача страницы не рассказать о компании, а довести человека до формы."),
  p("Формально лендинг — один из **типов сайта**, наряду с сайтом-визиткой, корпоративным сайтом и интернет-магазином. Если вы как раз выбираете между ними, у нас есть отдельное сравнение типов сайтов в блоге. Здесь разбираем только сам лендинг — что это и как он устроен."),

  h2("Простыми словами"),
  p("Представьте хорошего продавца в зале. Он не показывает весь склад и не предлагает обойти все отделы. Он выясняет, за чем вы пришли, показывает один товар, отвечает на два-три сомнения и доводит до кассы. Лендинг — тот же сценарий, только на экране: один разговор, одно предложение, один выход."),
  p("Отсюда главное свойство формата: **лендинг не универсален**. Он хорошо продаёт одну вещь одной аудитории. Попытка уместить на нём три услуги для трёх разных сегментов превращает его в обычную страницу сайта, только длинную."),

  h2("Из чего состоит классический лендинг"),
  p("Порядок блоков может меняться, но пять элементов есть практически всегда."),
  h3("1. Первый экран"),
  p("То, что видно без прокрутки. Здесь за 3–5 секунд человек должен понять: что вы предлагаете, кому и что делать дальше. Заголовок с конкретикой вместо «Добро пожаловать», короткий подзаголовок, кнопка. Если первый экран не сработал, остальная страница уже не имеет значения."),
  h3("2. Оффер"),
  p("Само предложение: что человек получит, в каком объёме, за сколько и за какой срок. Оффер — это не список ваших преимуществ, а результат для клиента. «Делаем ремонт» — не оффер. «Ремонт квартиры под ключ за 60 дней с фиксированной сметой» — оффер."),
  h3("3. Доказательства"),
  p("Кейсы, цифры, фото работ, отзывы с именами, сертификаты, логотипы клиентов. Всё, что превращает обещание в факт. Один развёрнутый кейс с результатом работает лучше, чем двенадцать анонимных отзывов «всё понравилось»."),
  h3("4. Снятие возражений"),
  p("Блок, который отвечает на то, из-за чего человек обычно не оставляет заявку: дорого, долго, а если не понравится, а кто это будет делать. Сюда хорошо ложатся гарантии, описание процесса по этапам и FAQ."),
  h3("5. Призыв к действию"),
  p("Форма или кнопка с одним понятным призывом. Что такое CTA и почему их не должно быть пять разных — расписали отдельно: [что такое CTA](/ru/blog/chto-takoe-cta). Коротко: на лендинге призыв повторяется несколько раз по ходу страницы, но он **один и тот же**."),

  h2("Когда подходит лендинг, а когда нужен многостраничник"),
  p("Это главный практический вопрос. Лендинг дешевле и быстрее, но решает узкую задачу — и там, где задача шире, экономия оборачивается переделкой через полгода."),
  table(
    ["Ситуация", "Что лучше", "Почему"],
    [
      ["Запускаете рекламу на один продукт или услугу", "Лендинг", "Вся страница под один запрос и один призыв — конверсия выше"],
      ["Событие, набор на курс, акция с дедлайном", "Лендинг", "Живёт ограниченное время, глубина структуры не нужна"],
      ["Тестируете спрос на новую идею", "Лендинг", "Быстро собрать, быстро снять показатели, дёшево ошибиться"],
      ["5–15 услуг, каждую ищут в Google отдельно", "Многостраничный сайт", "Под каждый запрос нужна своя страница, иначе SEO не будет"],
      ["Каталог товаров, корзина, оплата", "Интернет-магазин", "Лендинг физически не держит каталог и фильтры"],
      ["Нужны блог, вакансии, документы, несколько филиалов", "Корпоративный сайт", "Контента больше, чем помещается на одну страницу"],
    ],
  ),
  p("Промежуточный вариант тоже рабочий: лендинг под платный трафик плюс основной сайт под органику. Это два разных инструмента, и они не конкурируют между собой."),

  h2("Сколько стоит лендинг и сколько его делают"),
  p("В нашей студии лендинг стоит **от $800** и занимает **1–2 недели** — от брифа до запуска, с адаптивом под мобильные, подключённой формой и базовой аналитикой. Сроки сдвигаются в основном из-за контента: если текстов и фото ещё нет, сбор материала обычно дольше самой разработки."),
  p("Цена зависит от объёма блоков, количества языков, сложности анимаций и интеграций — например, подключения CRM или онлайн-оплаты. Полный перечень пакетов и того, что входит в каждый, есть на странице [цен](/ru/pricing), а детали формата — на странице [разработки лендингов](/ru/landing)."),

  h2("Типичные ошибки"),
  p("Большинство лендингов, которые не конвертируют, ломаются на одном и том же."),
  li("**Несколько разных призывов.** «Заказать», «Получить каталог», «Подписаться», «Позвонить» на одной странице — человек не выбирает, он уходит."),
  li("**Нет доказательств.** Обещания без кейсов, цифр и отзывов читаются как реклама и не работают."),
  li("**Длинная форма.** Семь полей на первом шаге убивают конверсию. Имя и телефон — остальное выясните в разговоре."),
  li("**Страница о себе, а не о клиенте.** «Мы на рынке с 2012 года» — не аргумент, пока не сказано, что это даёт заказчику."),
  li("**Мобильная версия по остаточному принципу.** Большая часть рекламы открывается с телефона, и именно там чаще всё рассыпается."),
  li("**Трафик не тот.** Идеальный лендинг с нецелевой рекламой даст ноль. Сначала проверяйте, по какому запросу приходят люди."),
  p("Ещё один слой — дизайн: как расставлены акценты, куда ведёт взгляд, что видно без прокрутки. Об этом у нас отдельный разбор с примерами: [9 дизайн-приёмов для конверсии](/ru/blog/9-dizayn-priyomov-dlya-konversii)."),

  h2("Как это выглядит на практике"),
  p("Наглядный пример формата — [лендинг курса Aleko](/ru/portfolio/aleko-course): один продукт, одна аудитория, одно действие — записаться. Вся страница выстроена как последовательность аргументов, а не как меню разделов."),

  cta(
    "Нужен лендинг, который действительно собирает заявки?",
    "Соберём структуру под ваш продукт, сделаем за 1–2 недели. От $800.",
    "Обсудить проект",
    "/ru/landing",
  ),
];

/* ─────────────────────────── EN ─────────────────────────── */
const bodyEn = [
  tldr("In short", [
    "A landing page is a single-page site built around one target action.",
    "The classic structure: hero, offer, proof, objection handling, call to action.",
    "Good for ad campaigns, one product, one service or an event. Wrong choice when you have many services and need SEO depth.",
    "We build landing pages from $800 in 1–2 weeks.",
    "The most common mistake is several competing calls to action instead of one.",
  ]),
  p("A landing page is a single-page website that moves a visitor towards **one specific action**: submit an enquiry, book a call, place an order. Every part of the page serves that action — no ten-item navigation, no side branches, no «you could also look over here»."),
  p("The name is literal. It is the page a visitor lands on after clicking an ad, an email link or a social post. The ad budget has already brought the person here, so the job of the page is not to describe the company — it is to get the person to the form."),
  p("Formally, a landing page is one of the **website types**, alongside a business card site, a corporate site and an online store. If you are choosing between those, we compare them in a separate article. Here we only define the landing page itself and explain how it is built."),

  h2("In plain English"),
  p("Think of a good shop assistant. They do not walk you through the whole warehouse or suggest visiting every department. They find out what you came for, show one product, answer two or three doubts and take you to the till. A landing page is that same script on screen: one conversation, one offer, one exit."),
  p("Hence the defining property of the format: **a landing page is not universal**. It sells one thing to one audience well. Cramming three services for three different segments onto it turns it into an ordinary website page that just happens to be long."),

  h2("What a classic landing page is made of"),
  p("The order of blocks varies, but five elements are almost always there."),
  h3("1. Hero"),
  p("Everything visible without scrolling. In 3–5 seconds the visitor should understand what you offer, who it is for and what to do next. A specific headline instead of «Welcome», a short subheading, a button. If the hero fails, the rest of the page never gets read."),
  h3("2. Offer"),
  p("The proposition itself: what the person gets, in what scope, for how much, in what timeframe. An offer is not a list of your strengths — it is an outcome for the client. «We do renovations» is not an offer. «Full flat renovation in 60 days at a fixed quote» is."),
  h3("3. Proof"),
  p("Case studies, numbers, photos of real work, named testimonials, certificates, client logos. Anything that turns a promise into a fact. One detailed case with a measurable result beats twelve anonymous «great service» quotes."),
  h3("4. Objection handling"),
  p("The block that answers whatever normally stops people from enquiring: too expensive, too slow, what if I do not like it, who will actually do the work. Guarantees, a step-by-step process description and an FAQ all belong here."),
  h3("5. Call to action"),
  p("A form or a button with one clear ask. We covered what a CTA is and why you should not have five different ones in a separate piece: [what is a CTA](/en/blog/what-is-a-cta). In short: on a landing page the call repeats several times down the page, but it stays **the same call**."),

  h2("When a landing page fits and when you need a multi-page site"),
  p("This is the practical question. A landing page is cheaper and faster, but it solves a narrow task — and where the task is wider, the saving turns into a rebuild six months later."),
  table(
    ["Situation", "Better choice", "Why"],
    [
      ["Running ads for one product or service", "Landing page", "The whole page serves one query and one action — higher conversion"],
      ["An event, a course intake, a deadline-driven promo", "Landing page", "Short lifespan, no need for structural depth"],
      ["Testing demand for a new idea", "Landing page", "Fast to build, fast to measure, cheap to be wrong"],
      ["5–15 services, each searched separately on Google", "Multi-page site", "Each query needs its own page or there is no SEO"],
      ["Product catalogue, cart, payments", "Online store", "A landing page cannot physically hold a catalogue and filters"],
      ["Blog, careers, documents, several locations", "Corporate site", "More content than one page can carry"],
    ],
  ),
  p("The hybrid works too: a landing page for paid traffic plus a main site for organic search. They are two different instruments and they do not compete."),

  h2("Cost and timeline"),
  p("At our studio a landing page starts at **$800** and takes **1–2 weeks** from brief to launch, including mobile layouts, a working form and basic analytics. Timelines usually slip because of content: when copy and photos do not exist yet, gathering them takes longer than the build."),
  p("Price depends on the number of blocks, languages, animation complexity and integrations such as a CRM or online payments. Full packages are listed on our [pricing](/en/pricing) page, and format details on the [landing page development](/en/landing) page. We are a studio based in Ukraine — European standards, sensible rates."),

  h2("Common mistakes"),
  p("Most landing pages that fail to convert break in the same few places."),
  li("**Several competing calls to action.** «Order», «Get the catalogue», «Subscribe», «Call us» on one page — the visitor does not choose, they leave."),
  li("**No proof.** Promises without cases, numbers or testimonials read as advertising and are ignored."),
  li("**A long form.** Seven fields at the first step kill conversion. Name and phone — ask the rest in the conversation."),
  li("**A page about you, not about the client.** «Established in 2012» means nothing until you say what it gives the buyer."),
  li("**Mobile treated as an afterthought.** Most ad traffic opens on a phone, and that is exactly where things fall apart."),
  li("**The wrong traffic.** A perfect landing page fed by irrelevant ads returns zero. Check what people actually searched for first."),
  p("There is a design layer on top of this: where the accents sit, where the eye travels, what is visible without scrolling. We covered that separately with examples: [9 design moves that lift conversion](/en/blog/9-design-moves-that-lift-conversion)."),

  h2("What it looks like in practice"),
  p("A clear example of the format is the [Aleko course landing page](/en/portfolio/aleko-course): one product, one audience, one action — sign up. The whole page is built as a sequence of arguments rather than a menu of sections."),

  cta(
    "Need a landing page that actually collects enquiries?",
    "We will build the structure around your product and ship in 1–2 weeks. From $800.",
    "Discuss your project",
    "/en/landing",
  ),
];

const doc = {
  _id: "glos2026-shcho-take-lending",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 5,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "shcho-take-lending" },
    ru: { _type: "slug", current: "chto-takoe-lending" },
    en: { _type: "slug", current: "what-is-a-landing-page" },
  },
  title: {
    _type: "localizedString",
    uk: "Лендінг — що це і коли він потрібен",
    ru: "Лендинг — что это и когда он нужен",
    en: "What is a landing page and when do you need one",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Лендінг це: що таке лендінг простими словами",
    ru: "Лендинг это: что такое лендинг простыми словами",
    en: "What Is a Landing Page? A Plain-English Definition",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Лендінг це односторінковий сайт під одну дію ✔️ структура з 5 блоків ✔️ коли підходить, а коли ні ✔️ ціна від $800 ➡ пояснюємо простими словами",
    ru: "➤ Лендинг это одностраничный сайт под одно действие ✔️ структура из 5 блоков ✔️ когда подходит, а когда нет ✔️ цена от $800 ➡ объясняем простыми словами",
    en: "➤ A landing page is a one-page site built for a single action ✔️ the 5-block structure ✔️ when it fits ✔️ from $800 ➡ a plain-English definition",
  },
  eyebrow: { _type: "localizedString", uk: "Словник", ru: "Словарь", en: "Glossary" },
  lede: {
    _type: "localizedString",
    uk: "Односторінковий сайт під одну дію: розбираємо структуру, ціну, терміни і помилки, через які лендінги не конвертують.",
    ru: "Одностраничный сайт под одно действие: разбираем структуру, цену, сроки и ошибки, из-за которых лендинги не конвертируют.",
    en: "A one-page site built for a single action: structure, cost, timeline and the mistakes that stop landing pages converting.",
  },
  tags: ["лендінг", "словник", "конверсія"],
  relatedPostSlugs: ["shcho-take-cta", "9-dyzain-pryiomiv-dlia-konversii", "vartist-rozrobky-saytu-2026"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чим лендінг відрізняється від сайту?",
        ru: "Чем лендинг отличается от сайта?",
        en: "How is a landing page different from a website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг — це одна сторінка з однією цільовою дією, сайт — це структура з кількох розділів під різні запити й сценарії. Лендінг заточений під рекламний трафік і конверсію, багатосторінковий сайт — під пошук, глибину контенту та довгу роботу з аудиторією.",
        ru: "Лендинг — это одна страница с одним целевым действием, сайт — структура из нескольких разделов под разные запросы и сценарии. Лендинг заточен под рекламный трафик и конверсию, многостраничный сайт — под поиск, глубину контента и долгую работу с аудиторией.",
        en: "A landing page is a single page with one target action; a website is a structure of several sections covering different queries and scenarios. A landing page is tuned for paid traffic and conversion, a multi-page site for search, content depth and long-term audience work.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує зробити лендінг?",
        ru: "Сколько стоит сделать лендинг?",
        en: "How much does a landing page cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "У нашій студії лендінг коштує від $800 і робиться за 1–2 тижні. Підсумкова сума залежить від кількості блоків, мов, анімацій та інтеграцій — наприклад, підключення CRM чи онлайн-оплати. Пакети й що входить у кожен — на сторінці цін.",
        ru: "В нашей студии лендинг стоит от $800 и делается за 1–2 недели. Итоговая сумма зависит от количества блоков, языков, анимаций и интеграций — например, подключения CRM или онлайн-оплаты. Пакеты и их состав — на странице цен.",
        en: "At our studio a landing page starts at $800 and takes 1–2 weeks. The final figure depends on the number of blocks, languages, animations and integrations such as a CRM or online payments. Packages and their scope are listed on the pricing page.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи просувається лендінг у Google?",
        ru: "Продвигается ли лендинг в Google?",
        en: "Can a landing page rank on Google?",
      },
      answer: {
        _type: "localizedText",
        uk: "Одна сторінка може ранжуватися за одним-двома запитами, не більше. Для органіки потрібні окремі сторінки під кожен запит, тому лендінг зазвичай працює у парі з платною рекламою, а SEO будують на багатосторінковому сайті.",
        ru: "Одна страница может ранжироваться по одному-двум запросам, не больше. Для органики нужны отдельные страницы под каждый запрос, поэтому лендинг обычно работает в паре с платной рекламой, а SEO строят на многостраничном сайте.",
        en: "A single page can realistically rank for one or two queries, no more. Organic search needs a separate page per query, so a landing page usually runs alongside paid ads while SEO is built on a multi-page site.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Якою має бути довжина лендінга?",
        ru: "Какой должна быть длина лендинга?",
        en: "How long should a landing page be?",
      },
      answer: {
        _type: "localizedText",
        uk: "Рівно такою, щоб зняти всі заперечення й довести до дії — зазвичай це 5–9 блоків. Проста й дешева пропозиція вимагає короткої сторінки, дорога послуга з довгим циклом рішення — довшої, з кейсами, процесом і гарантіями.",
        ru: "Ровно такой, чтобы снять все возражения и довести до действия — обычно это 5–9 блоков. Простое и дешёвое предложение требует короткой страницы, дорогая услуга с длинным циклом решения — длиннее, с кейсами, процессом и гарантиями.",
        en: "Exactly long enough to clear every objection and reach the action — usually 5 to 9 blocks. A simple, low-cost offer needs a short page; an expensive service with a long decision cycle needs more, with cases, process and guarantees.",
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
