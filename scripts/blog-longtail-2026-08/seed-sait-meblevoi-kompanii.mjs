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

const bodyUk = [
  tldr("Коротко: сайт для меблевої компанії", [
    "Меблевий бізнес — це два принципово різні сайти: портфоліо виробника під замовлення та інтернет-магазин готових меблів. Головна помилка — змішувати їх в одному.",
    "Вилка цін: сайт-візитка виробника — від $800, каталог з адмінкою — від $3 500, повноцінний інтернет-магазин — від $6 000.",
    "Для виробника головна конверсія — заявка на прорахунок або замір, а не кнопка «купити». Форма з полями «розміри, матеріал, фото-приклад» працює краще за прайс.",
    "Для магазину вирішують фільтри (розмір, матеріал, колір, ціна) і чесна сторінка доставки габаритних меблів — саме тут губиться найбільше замовлень.",
    "Регіональні запити «меблі на замовлення + місто» — найдешевший трафік у ніші: конкуренція низька, а намір купити — максимальний.",
  ]),
  p("Розробка сайту для меблевої компанії починається з одного питання: ви виробляєте меблі під замовлення чи продаєте готові зі складу? Від відповіді залежить усе — структура, функціонал і бюджет. Візитка виробника з портфоліо коштує **від $800**, каталог продукції з адмінкою — **від $3 500**, повноцінний інтернет-магазин з кошиком і оплатою — **від $6 000**. Терміни — від 2–3 тижнів до 2–3 місяців."),
  p("Проблема більшості меблевих сайтів в Україні — вони зроблені «як у всіх»: шаблонний каталог без фільтрів, фото з одного ракурсу, телефон у шапці й жодної відповіді на питання «скільки коштуватиме мій диван». У цій статті розберемо, що насправді потрібно виробнику, що — магазину, скільки це коштує і на яких запитах меблева компанія може зібрати безкоштовний трафік із Google."),
  h2("Виробник під замовлення чи магазин готових меблів: два різні сайти"),
  p("Це найважливіша розвилка, і її варто пройти до того, як малювати дизайн. **Виробник під замовлення** продає не товар, а довіру: клієнт не може покласти в кошик «кухню за індивідуальними розмірами». Його сайт — це портфоліо виконаних робіт, прозорі етапи виробництва і форма заявки на прорахунок. **Магазин готових меблів** продає конкретні позиції з цінами: тут потрібні каталог, фільтри, кошик, оплата і зрозуміла логістика габаритних відправлень."),
  p("Коли компанія робить і те, й інше (типова ситуація: власне виробництво плюс склад ходових моделей), правильна архітектура — розділити сценарії: окремий розділ «Готові меблі» з кошиком і окремий «Меблі на замовлення» з портфоліо та заявкою. Змішаний каталог, де поруч «диван за 18 000 грн» і «ціна за запитом», знижує конверсію обох напрямків."),
  table(
    ["Блок сайту", "Виробник під замовлення", "Магазин готових меблів"],
    [
      ["Портфоліо виконаних робіт", "**Обовʼязково** — головний розділ", "Не потрібне"],
      ["Каталог з цінами", "Опційно (базові моделі «від»)", "**Обовʼязково**, з наявністю"],
      ["Фільтри за розміром / матеріалом / кольором", "Ні", "**Обовʼязково**"],
      ["Заявка на замір / прорахунок", "**Головна конверсія**", "Другорядна (для нестандарту)"],
      ["Кошик та онлайн-оплата", "Ні", "**Обовʼязково**"],
      ["Етапи виробництва, гарантії", "**Обовʼязково**", "Достатньо сторінки «Про нас»"],
      ["Калькулятор / конфігуратор", "Сильний лід-магніт", "Опційно (для модульних систем)"],
      ["Доставка та підйом габаритів", "У рамках договору", "**Окрема детальна сторінка**"],
    ]
  ),
  h2("Сайт виробника меблів: портфоліо, замір, етапи"),
  p("Розробка сайту для виробника меблів — це фактично побудова машини довіри. Людина замовляє кухню на $2 000–10 000 у компанії, якої ніколи не бачила. Сайт має зняти цей страх за три кроки."),
  h3("Портфоліо реальних робіт — а не стокові фото"),
  p("Кожен проєкт у портфоліо — окрема сторінка: 8–15 фото з різних ракурсів, розміри, матеріали (плита, фасади, фурнітура — з назвами брендів), термін виконання і, якщо можливо, орієнтовна вартість «від». Саме поле «вартість від» відсіює нецільові заявки й економить години менеджера. Стокові рендери з фотобанків працюють проти вас: клієнти їх упізнають миттєво."),
  h3("Заявка на прорахунок — головна конверсія"),
  p("Кнопка «купити» виробнику не потрібна. Потрібна форма «отримати прорахунок»: поля для розмірів приміщення, вибір типу меблів, можливість прикріпити фото або ескіз, зручний час для дзвінка. Ще сильніший хід — **калькулятор орієнтовної вартості** як лід-магніт: клієнт обирає тип (кухня, шафа, гардеробна), метраж і клас матеріалів, бачить вилку «від–до» й залишає контакт для точного розрахунку. Такий калькулятор ми зазвичай робимо як інтеграцію в межах $200–500."),
  h3("Етапи виробництва і гарантії"),
  p("Розділ «Як ми працюємо» з реальними фото цеху: замір → дизайн-проєкт → договір із фіксацією ціни → виробництво → доставка й монтаж → гарантія. Кожен етап із термінами. Це нудно писати, але саме цей розділ читають перед тим, як віддати передоплату. Технічно такий сайт — це [корпоративний сайт](/corporate-site) із каталогом-портфоліо, а не e-commerce."),
  cta(
    "Порахуйте вартість сайту для вашого меблевого бізнесу",
    "Онлайн-калькулятор: оберіть тип сайту і функції — отримайте вилку бюджету за 2 хвилини, без дзвінків менеджера.",
    "Розрахувати вартість",
    "/calculator"
  ),
  h2("Інтернет-магазин готових меблів: каталог, фільтри, доставка"),
  p("Тут працюють закони e-commerce, але з меблевою специфікою: середній чек високий, покупка обдумана (7–14 днів від першого візиту), а товар габаритний. Розробка [інтернет-магазину](/online-store) меблів — від $6 000, і ось на що йде бюджет."),
  h3("Фільтри, які відповідають на реальні питання"),
  li("Розміри: ширина/глибина/висота діапазонами — «диван до 220 см» шукають частіше, ніж конкретну модель."),
  li("Матеріал і колір: тканина/екошкіра/дерево, відтінки з прикладами текстур, а не словами «венге» без фото."),
  li("Механізм і функції: розкладка «єврокнижка», ніша для білизни, регульовані полиці."),
  li("Ціна і наявність: «в наявності — доставка за 3 дні» проти «під замовлення — 3 тижні» має бути видно ще в каталозі."),
  h3("Картка товару, що продає габаритний товар"),
  p("Мінімум 6–8 фото: загальний план, ракурси ¾, текстура матеріалу зблизька, механізм у розкладеному стані, фото в інтерʼєрі, лінійка розмірів на схемі. Плюс блок «чи пройде у двері»: розміри в упаковці. Це знімає головний страх покупця габаритних меблів і скорочує повернення."),
  h3("Доставка габаритів — окрема сторінка, а не рядок у футері"),
  p("Скільки коштує доставка по місту і по Україні, чи є підйом на поверх, що з ліфтом і без, хто заносить і збирає, що робити при пошкодженні в дорозі. Магазини, які чесно відповідають на ці питання до оформлення замовлення, отримують менше кинутих кошиків. Онлайн-оплата, розстрочка від банків і інтеграція з Новою Поштою — стандартний набір; типова інтеграція коштує $200–500, складні звʼязки з 1С чи власною CRM — $1 000–3 000. Більше про нішу — на сторінці [сайти для e-commerce](/sites-for/ecommerce)."),
  h2("Фото, 3D і матеріали: що насправді продає меблі"),
  p("Меблі купують очима, тому контент важить більше за будь-яку функцію. Пріоритет такий: спершу якісні **фото з правильних ракурсів** (це умовно безкоштовно — один знімальний день у шоурумі), потім великі плани текстур і фурнітури, і лише потім 3D. Повноцінний 3D-конфігуратор або AR-перегляд «постав диван у свою кімнату» — це десятки тисяч доларів і виправданий він лише для великих каталогів модульних систем. Для більшості українських виробників розумний компроміс — 3D-рендери базових моделей у різних кольорах: дешевше за фотосесію кожного варіанта і достатньо для вибору."),
  p("Окремий пункт — бібліотека матеріалів: сторінка з усіма тканинами, плитами й фасадами, які ви використовуєте, з фото і назвами. Вона працює і на довіру, і на SEO — за запитами типу «фасади МДФ фарбовані» приходить теплий трафік."),
  h2("Скільки коштує сайт для меблевої компанії у 2026 році"),
  p("Вилка залежить не від «краси», а від функціоналу. Ось реальні пакети нашої студії:"),
  table(
    ["Формат", "Що входить", "Вартість", "Термін"],
    [
      ["**Сайт-візитка виробника**", "Головна, портфоліо 10–20 робіт, етапи, форма заявки на замір", "від $800", "2–3 тижні"],
      ["**Каталог виробника**", "Корпоративний сайт + каталог моделей з адмінкою, калькулятор-лід-магніт, блог", "від $3 500", "4–6 тижнів"],
      ["**Інтернет-магазин**", "Каталог з фільтрами, кошик, онлайн-оплата, інтеграція доставки, адмінка складу", "від $6 000", "8–12 тижнів"],
    ]
  ),
  p("До бюджету запуску варто додати постійні витрати: технічна підтримка — **$200/міс або $40/год**, SEO-просування — **від $300/міс**. Порівняти пакети докладно можна на сторінці [цін](/pricing)."),
  h2("SEO для меблевої ніші: регіональні запити — найдешевший трафік"),
  p("Загальні запити на кшталт «купити диван» забиті маркетплейсами — туди малому виробнику шлях закритий. Але запити **«меблі на замовлення + місто»**, «кухні на замовлення Львів», «шафа-купе під замовлення Дніпро» — це низька конкуренція і максимально гарячий намір. Стратегія проста: окрема посадкова сторінка під кожне місто присутності з реальними роботами саме з цього міста, локальними відгуками і картою. Той самий підхід ми детально розбирали для будівельної ніші у статті про [сайт для будівельної компанії](/blog/sait-dlia-budivelnoi-kompanii-2026) — у меблевиків він працює ідентично."),
  p("Другий пласт — інформаційні запити: «яка плита краща для кухні», «як обрати матрац», «егер чи кроноспан». Блог із такими статтями збирає трафік на етапі вибору, а внутрішні посилання ведуть читача в каталог. Комплексне [SEO-просування](/seo) меблевого сайту від $300/міс окупається саме за рахунок цих двох пластів."),
  h2("Чеклист: що підготувати до старту розробки"),
  p("Найчастіше терміни зриває не розробник, а відсутність контенту. Ось що варто зібрати ще до підписання договору:"),
  num("Фото 10–15 найкращих виконаних проєктів — з різних ракурсів, у гарному світлі, без водяних знаків конкурентних майданчиків."),
  num("Список матеріалів і фурнітури, з якими працюєте, — з назвами брендів і фото."),
  num("Реальні вилки цін по типах виробів: «кухня від X», «шафа-купе від Y». Без них калькулятор не побудувати."),
  num("Опис етапів роботи з термінами — від заміру до монтажу."),
  num("5–10 відгуків клієнтів із фото готових робіт: скриншоти з месенджерів працюють краще за анонімні цитати."),
  num("Список міст, у яких працюєте, — під майбутні регіональні сторінки."),
  p("Із готовим контентом сайт-візитка запускається за 2–3 тижні, і перші заявки з регіональних запитів приходять уже в перший місяць після індексації."),
  h2("Приклади з нашого портфоліо"),
  p("**[Domlivo](/portfolio/domlivo)** — проєкт у сегменті дому та інтерʼєру: акуратний каталог, швидке завантаження попри велику кількість фото, структура під регіональні запити. Показовий приклад того, як «важкий» візуальний контент не має вбивати швидкість сайту."),
  p("**[Solide Renovation](/portfolio/solide-renovation)** — сайт компанії з ремонту та інтерʼєрних рішень: портфоліо виконаних обʼєктів як головний інструмент продажу і форма заявки на прорахунок. Та сама механіка довіри, яку ми описали для меблевого виробника: до заявки клієнта доводять кейси, а не прайс."),
  p("Обидва проєкти — кастомна розробка без конструкторів: свій дизайн, своя адмінка, швидкість 90+ у PageSpeed."),
  cta(
    "Готові обговорити сайт для вашої меблевої компанії?",
    "Розкажіть, що виробляєте чи продаєте — запропонуємо формат, вилку бюджету і план запуску. Безкоштовно і без зобовʼязань.",
    "Отримати пропозицію",
    "/calculator"
  ),
];

const bodyRu = [
  tldr("Коротко: сайт для мебельной компании", [
    "Мебельный бизнес — это два разных сайта: портфолио производителя под заказ и интернет-магазин готовой мебели. Смешивать их в одном — главная ошибка ниши.",
    "Вилка цен: мебельный сайт-визитка производителя — от $800, каталог с админкой — от $3 500, интернет-магазин — от $6 000.",
    "У производителя главная конверсия — заявка на просчёт или замер, а не кнопка «купить». Калькулятор ориентировочной стоимости — лучший лид-магнит ниши.",
    "В магазине решают фильтры (размер, материал, цвет) и честная страница доставки габаритной мебели — именно там теряется больше всего заказов.",
    "Региональные запросы «мебель на заказ + город» — самый дешёвый трафик: конкуренция низкая, намерение купить — максимальное.",
  ]),
  p("Создание сайта для мебельной компании начинается с развилки: вы производите мебель под заказ или продаёте готовую со склада? От ответа зависит всё — структура, функционал и бюджет. Визитка производителя с портфолио стоит **от $800**, каталог продукции с админкой — **от $3 500**, создание интернет-магазина мебели с корзиной и оплатой — **от $6 000**. Сроки — от 2–3 недель до 2–3 месяцев."),
  p("Типичный мебельный сайт выглядит одинаково: шаблонный каталог без фильтров, фото с одного ракурса и телефон в шапке. Ни ответа на вопрос «сколько будет стоить мой шкаф», ни понятной доставки. Разберём, что на самом деле нужно производителю, что — магазину, во сколько это обойдётся и на каких запросах мебельная компания соберёт бесплатный трафик из Google."),
  h2("Производитель под заказ или магазин готовой мебели: два разных сайта"),
  p("Эту развилку нужно пройти до дизайна. **Производитель под заказ** продаёт не товар, а доверие: «кухню по индивидуальным размерам» нельзя положить в корзину. Его сайт — портфолио выполненных работ, прозрачные этапы производства и форма заявки на просчёт. **Магазин готовой мебели** продаёт конкретные позиции с ценами: каталог, фильтры, корзина, оплата и внятная логистика габаритных отправлений."),
  p("Если компания совмещает оба направления (своё производство плюс склад ходовых моделей), правильная архитектура — развести сценарии: раздел «Готовая мебель» с корзиной и раздел «Мебель на заказ» с портфолио и заявкой. Смешанный каталог, где рядом «диван за 18 000 грн» и «цена по запросу», роняет конверсию обоих направлений."),
  table(
    ["Блок сайта", "Производитель под заказ", "Магазин готовой мебели"],
    [
      ["Портфолио выполненных работ", "**Обязательно** — главный раздел", "Не нужно"],
      ["Каталог с ценами", "Опционально (базовые модели «от»)", "**Обязательно**, с наличием"],
      ["Фильтры по размеру / материалу / цвету", "Нет", "**Обязательно**"],
      ["Заявка на замер / просчёт", "**Главная конверсия**", "Второстепенная (для нестандарта)"],
      ["Корзина и онлайн-оплата", "Нет", "**Обязательно**"],
      ["Этапы производства, гарантии", "**Обязательно**", "Достаточно страницы «О нас»"],
      ["Калькулятор / конфигуратор", "Сильный лид-магнит", "Опционально (для модульных систем)"],
      ["Доставка и подъём габаритов", "В рамках договора", "**Отдельная подробная страница**"],
    ]
  ),
  h2("Создание сайта для производителя мебели: портфолио, замер, этапы"),
  p("Сайт производителя — это машина доверия. Человек заказывает кухню за $2 000–10 000 у компании, которую никогда не видел вживую. Задача сайта — снять этот страх за три шага."),
  h3("Портфолио реальных работ — не стоковые рендеры"),
  p("Каждый проект — отдельная страница: 8–15 фото с разных ракурсов, размеры, материалы с названиями брендов (плита, фасады, фурнитура), срок изготовления и ориентир «стоимость от». Поле «от» отсекает нецелевые заявки и экономит часы менеджера. Стоковые картинки из фотобанков клиенты распознают мгновенно — и уходят."),
  h3("Заявка на просчёт — главная конверсия"),
  p("Кнопка «купить» производителю не нужна. Нужна форма «получить просчёт»: размеры помещения, тип мебели, возможность прикрепить фото или эскиз, удобное время звонка. Ещё сильнее работает **калькулятор ориентировочной стоимости** как лид-магнит: клиент выбирает тип (кухня, шкаф, гардеробная), метраж, класс материалов — видит вилку «от–до» и оставляет контакт за точным расчётом. Такой калькулятор мы обычно делаем как интеграцию в пределах $200–500."),
  h3("Этапы производства и гарантии"),
  p("Раздел «Как мы работаем» с реальными фото цеха: замер → дизайн-проект → договор с фиксацией цены → производство → доставка и монтаж → гарантия. Каждый этап со сроками. Скучно писать, но именно этот раздел читают перед тем, как отдать предоплату. Технически такой сайт — это [корпоративный сайт](/ru/corporate-site) с каталогом-портфолио, а не e-commerce."),
  cta(
    "Посчитайте стоимость сайта для вашего мебельного бизнеса",
    "Онлайн-калькулятор: выберите тип сайта и функции — получите вилку бюджета за 2 минуты, без звонков менеджера.",
    "Рассчитать стоимость",
    "/ru/calculator"
  ),
  h2("Создание интернет-магазина мебели: каталог, фильтры, доставка"),
  p("Разработка сайтов для мебельных магазинов подчиняется законам e-commerce, но со спецификой: высокий средний чек, обдуманная покупка (7–14 дней от первого визита) и габаритный товар. [Интернет-магазин](/ru/online-store) мебели — от $6 000, и вот на что уходит бюджет."),
  h3("Фильтры, отвечающие на реальные вопросы"),
  li("Размеры диапазонами: «диван до 220 см» ищут чаще, чем конкретную модель."),
  li("Материал и цвет: ткань/экокожа/дерево, оттенки с фото текстур, а не словом «венге» без картинки."),
  li("Механизм и функции: «еврокнижка», ниша для белья, регулируемые полки."),
  li("Цена и наличие: «в наличии — доставка за 3 дня» против «под заказ — 3 недели» должно быть видно ещё в каталоге."),
  h3("Карточка товара, продающая габаритный товар"),
  p("Минимум 6–8 фото: общий план, ракурсы ¾, текстура материала крупно, механизм в разложенном виде, фото в интерьере, схема с размерами. Плюс блок «пройдёт ли в дверь» — габариты в упаковке. Это снимает главный страх покупателя крупной мебели и сокращает возвраты."),
  h3("Доставка габаритов — отдельная страница, а не строка в футере"),
  p("Сколько стоит доставка по городу и по стране, есть ли подъём на этаж, что с лифтом и без, кто заносит и собирает, что делать при повреждении в дороге. Магазины, которые честно отвечают на эти вопросы до оформления заказа, получают меньше брошенных корзин. Онлайн-оплата, рассрочка и интеграция со службами доставки — стандартный набор; типовая интеграция стоит $200–500, сложные связки с 1С или собственной CRM — $1 000–3 000. Больше о нише — на странице [сайты для e-commerce](/ru/sites-for/ecommerce)."),
  h2("Фото, 3D и материалы: что на самом деле продаёт мебель"),
  p("Мебель покупают глазами, поэтому контент важнее любой функции. Приоритет такой: сначала качественные **фото с правильных ракурсов** (один съёмочный день в шоуруме), затем крупные планы текстур и фурнитуры, и только потом 3D. Полноценный 3D-конфигуратор или AR «поставь диван в свою комнату» — это десятки тысяч долларов, оправданные только для больших каталогов модульных систем. Для большинства производителей разумный компромисс — 3D-рендеры базовых моделей в разных цветах: дешевле фотосессии каждого варианта и достаточно для выбора."),
  p("Отдельный пункт — библиотека материалов: страница со всеми тканями, плитами и фасадами с фото и названиями. Она работает и на доверие, и на SEO: по запросам вроде «крашеные фасады МДФ» приходит тёплый трафик."),
  h2("Сколько стоит создание сайта мебельной компании в 2026 году"),
  p("Вилка зависит не от «красоты», а от функционала. Реальные пакеты нашей студии:"),
  table(
    ["Формат", "Что входит", "Стоимость", "Срок"],
    [
      ["**Мебельный сайт-визитка**", "Главная, портфолио 10–20 работ, этапы, форма заявки на замер", "от $800", "2–3 недели"],
      ["**Каталог производителя**", "Корпоративный сайт + каталог моделей с админкой, калькулятор-лид-магнит, блог", "от $3 500", "4–6 недель"],
      ["**Интернет-магазин**", "Каталог с фильтрами, корзина, онлайн-оплата, интеграция доставки, админка склада", "от $6 000", "8–12 недель"],
    ]
  ),
  p("К бюджету запуска добавьте постоянные расходы: техподдержка — **$200/мес или $40/час**, SEO-продвижение — **от $300/мес**. Сравнить пакеты подробно можно на странице [цен](/ru/pricing)."),
  h2("SEO для мебельной ниши: региональные запросы — самый дешёвый трафик"),
  p("Общие запросы вроде «купить диван» заняты маркетплейсами — малому производителю туда не пробиться. Зато запросы **«мебель на заказ + город»**, «кухни на заказ Львов», «шкаф-купе под заказ Днепр» — это низкая конкуренция при максимально горячем намерении. Стратегия простая: отдельная посадочная страница под каждый город присутствия с работами именно из этого города, локальными отзывами и картой. Тот же подход мы подробно разбирали для строительной ниши в статье про [сайт для строительной компании](/ru/blog/sayt-dlya-stroitelnoy-kompanii-2026) — у мебельщиков он работает один в один."),
  p("Второй пласт — информационные запросы: «какая плита лучше для кухни», «как выбрать матрас», «эггер или кроношпан». Блог с такими статьями собирает трафик на этапе выбора, а внутренние ссылки ведут читателя в каталог. Комплексное [SEO-продвижение](/ru/seo) мебельного сайта от $300/мес окупается именно за счёт этих двух пластов."),
  h2("Чек-лист: что подготовить до старта разработки"),
  p("Чаще всего сроки срывает не разработчик, а отсутствие контента. Вот что стоит собрать ещё до подписания договора:"),
  num("Фото 10–15 лучших выполненных проектов — с разных ракурсов, при хорошем свете, без водяных знаков чужих площадок."),
  num("Список материалов и фурнитуры, с которыми работаете, — с названиями брендов и фото."),
  num("Реальные вилки цен по типам изделий: «кухня от X», «шкаф-купе от Y». Без них калькулятор не построить."),
  num("Описание этапов работы со сроками — от замера до монтажа."),
  num("5–10 отзывов клиентов с фото готовых работ: скриншоты из мессенджеров работают лучше анонимных цитат."),
  num("Список городов, в которых работаете, — под будущие региональные страницы."),
  p("С готовым контентом сайт-визитка запускается за 2–3 недели, а первые заявки с региональных запросов приходят уже в первый месяц после индексации."),
  h2("Примеры из нашего портфолио"),
  p("**[Domlivo](/ru/portfolio/domlivo)** — проект в сегменте дома и интерьера: аккуратный каталог, быстрая загрузка несмотря на объём фото, структура под региональные запросы. Наглядный пример того, как «тяжёлый» визуальный контент не обязан убивать скорость сайта."),
  p("**[Solide Renovation](/ru/portfolio/solide-renovation)** — сайт компании по ремонту и интерьерным решениям: портфолио выполненных объектов как главный инструмент продаж и форма заявки на просчёт. Та же механика доверия, что и у мебельного производителя: к заявке клиента приводят кейсы, а не прайс."),
  p("Оба проекта — кастомная разработка без конструкторов: свой дизайн, своя админка, скорость 90+ в PageSpeed."),
  cta(
    "Готовы обсудить сайт для вашей мебельной компании?",
    "Расскажите, что производите или продаёте — предложим формат, вилку бюджета и план запуска. Бесплатно и без обязательств.",
    "Получить предложение",
    "/ru/calculator"
  ),
];

const bodyEn = [
  tldr("In short: a furniture company website", [
    "Furniture businesses need one of two very different websites: a portfolio site for a made-to-order workshop, or an online store for ready-made furniture. Mixing both in one is the industry's classic mistake.",
    "Budget range: a manufacturer's brochure site from $800, a catalogue site with a CMS from $3,500, a full online store from $6,000.",
    "For a manufacturer the key conversion is a quote or measurement request — not a Buy button. A price estimate calculator is the best lead magnet in this niche.",
    "For a store, filters (size, material, colour) and an honest bulky-delivery page decide the sale — that's where most orders are lost.",
    "Local queries like “made-to-order furniture + city” are the cheapest traffic in the niche: low competition, maximum buying intent.",
  ]),
  p("A furniture company website starts with one question: do you make furniture to order, or sell ready-made pieces from stock? Everything follows from the answer — structure, features and budget. A manufacturer's brochure site with a portfolio costs **from $800**, a product catalogue with a CMS **from $3,500**, and a full furniture store website with cart and checkout **from $6,000**. Timelines run from 2–3 weeks to 2–3 months."),
  p("Most furniture websites look interchangeable: a template catalogue with no filters, one photo per product and a phone number in the header. No answer to “what would my wardrobe cost?”, no clear delivery terms. Below we break down what a manufacturer actually needs, what a store needs, what it all costs, and which search queries bring a furniture company free Google traffic. We're a studio from Ukraine working with international clients — European quality at sensible rates, with pricing that reflects it."),
  h2("Made-to-order manufacturer vs furniture store: two different websites"),
  p("Settle this fork before anyone draws a design. A **made-to-order manufacturer** sells trust, not products: nobody can add “a kitchen built to my measurements” to a cart. Their site is a portfolio of finished projects, a transparent production process and a quote request form. A **ready-made furniture store** sells specific items at specific prices: catalogue, filters, cart, checkout and clear logistics for bulky deliveries."),
  p("If a company does both — its own workshop plus a stock of popular models — the right architecture is to separate the journeys: a “Ready to ship” section with a cart, and a “Made to order” section with a portfolio and a quote form. A mixed catalogue where “sofa, $700” sits next to “price on request” hurts conversion on both sides."),
  table(
    ["Website block", "Made-to-order manufacturer", "Ready-made furniture store"],
    [
      ["Portfolio of finished projects", "**Essential** — the main section", "Not needed"],
      ["Catalogue with prices", "Optional (base models “from”)", "**Essential**, with stock status"],
      ["Filters by size / material / colour", "No", "**Essential**"],
      ["Measurement / quote request", "**Primary conversion**", "Secondary (custom items only)"],
      ["Cart and online payment", "No", "**Essential**"],
      ["Production stages, guarantees", "**Essential**", "An About page is enough"],
      ["Calculator / configurator", "Strong lead magnet", "Optional (modular systems)"],
      ["Bulky delivery and assembly", "Covered by the contract", "**A dedicated, detailed page**"],
    ]
  ),
  h2("A furniture manufacturer website: portfolio, quotes, process"),
  p("A manufacturer's site is a trust machine. A customer is about to order a $2,000–10,000 kitchen from a company they have never visited. The site's job is to remove that fear in three steps."),
  h3("A portfolio of real projects — not stock renders"),
  p("Each project gets its own page: 8–15 photos from different angles, dimensions, materials with brand names (boards, fronts, hardware), production time and a “price from” estimate. That “from” figure filters out mismatched enquiries and saves your manager hours. Stock imagery is spotted instantly — and it costs you the sale."),
  h3("The quote request is your conversion"),
  p("A manufacturer doesn't need a Buy button. It needs a “get a quote” form: room dimensions, furniture type, an option to attach a photo or sketch, preferred call time. Even stronger is a **price estimate calculator** as a lead magnet: the visitor picks a type (kitchen, wardrobe, walk-in closet), size and material grade, sees a from–to range and leaves their contact for an exact figure. We typically build such calculators as a $200–500 integration."),
  h3("Production stages and guarantees"),
  p("A “How we work” section with real workshop photos: measurement → design project → contract with a fixed price → production → delivery and installation → warranty, each stage with timings. Dull to write, but it's exactly what customers read before paying a deposit. Technically this is a [corporate website](/en/corporate-site) with a portfolio catalogue — not e-commerce."),
  cta(
    "Price up a website for your furniture business",
    "Use the online calculator: pick a site type and features, get a budget range in 2 minutes — no sales calls.",
    "Get an estimate",
    "/en/calculator"
  ),
  h2("Furniture store website design: catalogue, filters, delivery"),
  p("An online furniture store follows e-commerce rules with a twist: high average order value, a considered purchase (7–14 days from first visit) and bulky goods. A furniture [online store](/en/online-store) starts from $6,000 — here is where that budget goes."),
  h3("Filters that answer real questions"),
  li("Dimensions as ranges: people search “sofa under 220 cm” more often than a specific model name."),
  li("Material and colour: fabric / eco-leather / solid wood, shades shown as photo swatches, not just colour names."),
  li("Mechanisms and features: sofa-bed type, storage compartments, adjustable shelves."),
  li("Price and availability: “in stock — delivered in 3 days” vs “made to order — 3 weeks” must be visible in the catalogue, not at checkout."),
  h3("A product page that sells bulky goods"),
  p("At least 6–8 photos: full view, three-quarter angles, close-ups of the material, the mechanism unfolded, the piece in an interior, and a dimensions diagram. Add a “will it fit through the door?” block with packaged dimensions. It removes the biggest fear of buying large furniture online and cuts returns."),
  h3("Bulky delivery deserves its own page — not a footer line"),
  p("Delivery cost by region, carrying to the floor, with and without a lift, who assembles, what happens if the item is damaged in transit. Stores that answer these questions honestly before checkout see fewer abandoned carts. Online payment, instalments and courier integrations are the standard kit; a typical integration costs $200–500, complex links to an ERP or a custom CRM run $1,000–3,000. More on the niche on our [e-commerce websites](/en/sites-for/ecommerce) page."),
  h2("Photos, 3D and materials: what actually sells furniture"),
  p("Furniture is bought with the eyes, so content beats any feature. The priority order: proper **photography from the right angles** first (one shooting day in a showroom), then close-ups of textures and hardware, and only then 3D. A full 3D configurator or AR “place this sofa in your room” costs tens of thousands of dollars and pays off only for large modular catalogues. For most manufacturers the sensible compromise is 3D renders of base models in different finishes — cheaper than photographing every variant and good enough to choose from."),
  p("One more asset: a materials library — a page listing every fabric, board and front you work with, photographed and named. It builds trust and earns SEO traffic from warm queries like “painted MDF fronts”."),
  h2("What a furniture company website costs in 2026"),
  p("The range depends on features, not looks. Our studio's actual packages:"),
  table(
    ["Format", "What's included", "Price", "Timeline"],
    [
      ["**Manufacturer's brochure site**", "Home, portfolio of 10–20 projects, process, quote request form", "from $800", "2–3 weeks"],
      ["**Manufacturer's catalogue**", "Corporate site + model catalogue with a CMS, calculator lead magnet, blog", "from $3,500", "4–6 weeks"],
      ["**Online store**", "Filtered catalogue, cart, online payment, delivery integration, stock admin", "from $6,000", "8–12 weeks"],
    ]
  ),
  p("Add the running costs to the launch budget: technical support at **$200/month or $40/hour**, SEO from **$300/month**. Full package comparison is on our [pricing page](/en/pricing)."),
  h2("SEO for furniture: local queries are the cheapest traffic"),
  p("Generic queries like “buy sofa” belong to marketplaces — a small manufacturer won't outrank them. But **“made-to-order furniture + city”**, “fitted wardrobes [your city]”, “custom kitchens near me” combine low competition with the hottest intent in the niche. The play is simple: a dedicated landing page per city you serve, showing projects from that city, local reviews and a map. We covered the same playbook for the construction niche in our [builder's website guide](/en/blog/builders-website-cost-uk-2026) — it maps onto furniture one to one."),
  p("The second layer is informational content: “which board is best for a kitchen”, “how to choose a mattress”, brand comparisons. A blog on these topics captures buyers at the research stage, and internal links walk them into the catalogue. Ongoing [SEO](/en/seo) from $300/month pays for itself through exactly these two layers."),
  h2("Examples from our portfolio"),
  p("**[Domlivo](/en/portfolio/domlivo)** — a home and interior project: a clean catalogue, fast loading despite heavy imagery, and a structure built for local queries. Proof that visual-heavy content doesn't have to kill site speed."),
  p("**[Solide Renovation](/en/portfolio/solide-renovation)** — a renovation and interior company site: a portfolio of finished projects as the main sales tool, plus a quote request form. The same trust mechanics we described for a furniture manufacturer: case studies, not price lists, bring the enquiry."),
  p("Both are custom builds with no site builders involved: bespoke design, own admin panel, 90+ PageSpeed scores."),
  cta(
    "Ready to discuss your furniture company website?",
    "Tell us what you make or sell — we'll suggest a format, a budget range and a launch plan. Free, no strings attached.",
    "Get a proposal",
    "/en/calculator"
  ),
];

const doc = {
  _id: "ltAug2026-sait-meblevoi-kompanii",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "sait-dlia-meblevoi-kompanii" },
    ru: { _type: "slug", current: "sayt-mebelnoy-kompanii" },
    en: { _type: "slug", current: "furniture-company-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Сайт для меблевої компанії: від виробника під замовлення до інтернет-магазину",
    ru: "Сайт для мебельной компании: от производителя под заказ до интернет-магазина",
    en: "Furniture Company Website: From Made-to-Order Workshop to Online Store",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Розробка сайту для меблевої компанії: ціни 2026",
    ru: "Создание сайта для мебельной компании: цены 2026",
    en: "Furniture Company Website: Costs & Guide 2026",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Розробка сайту для меблевої компанії: виробник під замовлення чи магазин ✔️ Візитка від $800, інтернет-магазин від $6 000 ✔️ Кейси студії ➡ Порахуйте проєкт",
    ru: "➤ Создание сайта для мебельной компании: производитель или магазин ✔️ Визитка от $800, интернет-магазин от $6 000 ✔️ Кейсы студии ➡ Рассчитайте свой проект",
    en: "➤ Furniture company website: manufacturer portfolio or online store ✔️ From $800 brochure site to $6,000+ store ✔️ Real cases ➡ Get your estimate in 2 minutes",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Платформи та e-commerce",
    ru: "Платформы и e-commerce",
    en: "Platforms & E-commerce",
  },
  lede: {
    _type: "localizedString",
    uk: "Виробнику під замовлення потрібне портфоліо і заявка на замір, магазину — каталог із фільтрами й доставка габаритів. Розбираємо обидва формати, реальні ціни від $800 до $6 000+ і SEO-стратегію на регіональних запитах.",
    ru: "Производителю под заказ нужны портфолио и заявка на замер, магазину — каталог с фильтрами и доставка габаритов. Разбираем оба формата, реальные цены от $800 до $6 000+ и SEO-стратегию на региональных запросах.",
    en: "A made-to-order workshop needs a portfolio and a quote form; a store needs a filtered catalogue and bulky delivery done right. We break down both formats, real budgets from $800 to $6,000+, and a local-query SEO strategy.",
  },
  tags: ["меблі", "інтернет-магазин", "e-commerce", "виробництво"],
  relatedPostSlugs: ["sait-dlia-budivelnoi-kompanii-2026", "vartist-rozrobky-saytu-2026", "internet-mahazyn-odiahu"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує сайт для меблевої компанії?",
        ru: "Сколько стоит сайт для мебельной компании?",
        en: "How much does a furniture company website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Сайт-візитка виробника з портфоліо — від $800, каталог продукції з адмінкою — від $3 500, інтернет-магазин із кошиком і оплатою — від $6 000. Підсумкова ціна залежить від кількості товарів, інтеграцій (оплата, доставка, CRM) і потреби в калькуляторі чи конфігураторі.",
        ru: "Мебельный сайт-визитка производителя с портфолио — от $800, каталог продукции с админкой — от $3 500, интернет-магазин с корзиной и оплатой — от $6 000. Итоговая цена зависит от количества товаров, интеграций (оплата, доставка, CRM) и необходимости калькулятора или конфигуратора.",
        en: "A manufacturer's brochure site with a portfolio starts from $800, a product catalogue with a CMS from $3,500, and a full online store with cart and checkout from $6,000. The final price depends on catalogue size, integrations (payments, delivery, CRM) and whether you need a calculator or configurator.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що краще для виробника під замовлення — візитка чи каталог?",
        ru: "Что лучше производителю под заказ — визитка или каталог?",
        en: "What's better for a made-to-order manufacturer — a brochure site or a catalogue?",
      },
      answer: {
        _type: "localizedText",
        uk: "Починайте з візитки з сильним портфоліо і формою заявки на замір — це закриває 80% задач малого виробництва. Каталог із базовими моделями й цінами «від» має сенс, коли у вас є повторювані типові вироби і потік запитів «а скільки приблизно коштує». Апгрейд візитки до каталогу дешевший, ніж переробка невдалого магазину.",
        ru: "Начинайте с визитки с сильным портфолио и формой заявки на замер — это закрывает 80% задач малого производства. Каталог с базовыми моделями и ценами «от» имеет смысл, когда есть повторяющиеся типовые изделия и поток вопросов «а сколько примерно стоит». Апгрейд визитки до каталога дешевле, чем переделка неудачного магазина.",
        en: "Start with a brochure site built around a strong portfolio and a quote request form — it covers 80% of a small workshop's needs. A catalogue with base models and “from” prices makes sense once you have repeatable standard products and a stream of “roughly how much?” questions. Upgrading a brochure site to a catalogue is cheaper than rebuilding a failed store.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібен інтернет-магазин, якщо всі меблі — під замовлення?",
        ru: "Нужен ли интернет-магазин, если вся мебель — под заказ?",
        en: "Do I need an online store if everything is made to order?",
      },
      answer: {
        _type: "localizedText",
        uk: "Ні. Кошик і оплата для індивідуальних виробів лише заплутують клієнта: він не може «купити» кухню, якої ще не існує. Ваша конверсія — заявка на прорахунок або замір, а найкращий лід-магніт — калькулятор орієнтовної вартості з вилкою «від–до».",
        ru: "Нет. Корзина и оплата для индивидуальных изделий только путают клиента: нельзя «купить» кухню, которой ещё не существует. Ваша конверсия — заявка на просчёт или замер, а лучший лид-магнит — калькулятор ориентировочной стоимости с вилкой «от–до».",
        en: "No. A cart and checkout only confuse customers when every piece is custom: you can't “buy” a kitchen that doesn't exist yet. Your conversion is a quote or measurement request, and the best lead magnet is a price estimate calculator showing a from–to range.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи потрібні 3D-моделі та конфігуратор меблів?",
        ru: "Нужны ли 3D-модели и конфигуратор мебели?",
        en: "Do I need 3D models or a furniture configurator?",
      },
      answer: {
        _type: "localizedText",
        uk: "Спершу — якісні фото з різних ракурсів і великі плани матеріалів: це дешевше і продає краще. 3D-рендери базових моделей у різних кольорах — розумний другий крок. Повноцінний 3D-конфігуратор чи AR виправданий лише для великих каталогів модульних систем — це бюджет у десятки тисяч доларів.",
        ru: "Сначала — качественные фото с разных ракурсов и крупные планы материалов: это дешевле и продаёт лучше. 3D-рендеры базовых моделей в разных цветах — разумный второй шаг. Полноценный 3D-конфигуратор или AR оправдан только для больших каталогов модульных систем — это бюджет в десятки тысяч долларов.",
        en: "Start with proper photography from multiple angles and close-ups of materials — it's cheaper and sells better. 3D renders of base models in different finishes are a sensible second step. A full 3D configurator or AR is only justified for large modular catalogues, with budgets in the tens of thousands.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає розробка меблевого сайту?",
        ru: "Сколько времени занимает разработка мебельного сайта?",
        en: "How long does a furniture website take to build?",
      },
      answer: {
        _type: "localizedText",
        uk: "Візитка виробника — 2–3 тижні, каталог із адмінкою — 4–6 тижнів, інтернет-магазин — 8–12 тижнів. Найчастіше термін затягує не розробка, а підготовка контенту: фото робіт, описи матеріалів, характеристики товарів. Почніть збирати їх до старту проєкту.",
        ru: "Визитка производителя — 2–3 недели, каталог с админкой — 4–6 недель, интернет-магазин — 8–12 недель. Чаще всего срок затягивает не разработка, а подготовка контента: фото работ, описания материалов, характеристики товаров. Начните собирать их до старта проекта.",
        en: "A brochure site takes 2–3 weeks, a catalogue with a CMS 4–6 weeks, an online store 8–12 weeks. What usually stretches the timeline isn't development but content: project photos, material descriptions, product specs. Start gathering them before the project kicks off.",
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
