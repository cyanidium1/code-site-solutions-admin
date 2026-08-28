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

// ---------------------------------------------------------------- UK BODY
const bodyUk = [
  tldr("Коротко", [
    "Сайт для продажу одягу продає тоді, коли картка товару відповідає на три питання: як річ сидить, який розмір брати і як її повернути.",
    "Мінімальний робочий набір: фото на моделі, розмірна сітка в сантиметрах, фільтри за розміром і кольором, онлайн-оплата та Нова Пошта.",
    "Вилка цін: лендінг-вітрина від $800, корпоративний e-commerce від $3 500, кастомна платформа з фідами постачальників від $6 000.",
    "Instagram — це канал трафіку, а не магазин: без власного сайту ви не отримуєте пошуковий трафік і не володієте базою клієнтів.",
    "Ті самі принципи працюють для взуття, косметики та ювелірки — движок один, змінюється лише картка товару.",
  ]),
  p("Щоб створити сайт для продажу одягу, який реально продає, потрібні чотири речі: чесна картка товару з фото на моделі та розмірною сіткою, швидкі фільтри за розміром, кольором і брендом, помітний блок про повернення та обмін і оплата з доставкою у два кліки. Усе інше — дизайн, банери, сторітелінг бренду — працює лише тоді, коли ці чотири елементи вже на місці."),
  p("Одяг — найскладніша ніша e-commerce саме тому, що покупець не може приміряти річ. Він ухвалює рішення за фотографіями і таблицею замірів, а частка повернень у fashion сягає 20–30%. У цій статті розберемо, як інтернет-магазин одягу знімає ці ризики: від структури картки товару до інтеграцій з оплатою, поштою та фідами постачальників — і скільки це коштує у 2026 році."),

  h2("Чим магазин одягу відрізняється від решти e-commerce"),
  p("Коли ви продаєте павербанк, покупець знає, що отримає. Коли продаєте сукню — ні: та сама «М» у двох брендів відрізняється на розмір. Тому сайт для продажу одягу будується навколо зняття сумнівів, а не навколо каталогу як такого."),
  li("**Рішення ухвалюється очима.** Фото — це 80% продажу. Погані фото не витягне жоден дизайн."),
  li("**Повернення — норма, а не збій.** У fashion повертають до третини замовлень. Процес повернення має бути частиною воронки, а не дрібним шрифтом у підвалі."),
  li("**Асортимент живе сезонами.** Колекції змінюються двічі-чотири рази на рік, тож адмінка мусить дозволяти масово завантажувати й архівувати товари без програміста."),
  li("**Залишки за розмірами.** Товар не «є або нема» — є 42-й і 44-й, а 46-й закінчився. Облік ведеться на рівні варіацій."),
  p("Додайте сюди мобільний трафік: 70–80% покупців одягу заходять з телефона, найчастіше просто зі сторіс. Тому магазин проєктується mobile-first: великі фото на весь екран, кнопка покупки без скролу, чекаут без обов'язкової реєстрації. Повільний сайт у цій ніші карається миттєво — поки сторінка вантажиться три секунди, покупчиня вже гортає стрічку далі."),
  p("Це загальні вимоги ніші — детальніше про побудову магазинів ми пишемо на сторінці [сайти для e-commerce](/sites-for/ecommerce)."),

  h2("Картка товару: фото на моделі й розмірна сітка"),
  p("Картка товару — головна сторінка магазину одягу. Покупець потрапляє на неї з реклами чи пошуку і або кладе річ у кошик, або йде до конкурента. Що на ній має бути:"),
  h3("Фото, які замінюють примірку"),
  li("5–8 фото: спереду, ззаду, збоку, деталі тканини та фурнітури, повний зріст."),
  li("Фото на моделі з підписом: «на моделі розмір S, зріст 172 см» — це найдешевший спосіб відповісти на питання «як сидить»."),
  li("Коротке відео чи фото в русі для суконь і костюмів — тканина в статиці й у русі виглядає по-різному."),
  h3("Розмірна сітка, а не літери"),
  p("Таблиця «S–M–L» без сантиметрів не працює. Робоча розмірна сітка — це заміри виробу в сантиметрах: обхват грудей, талії, стегон, довжина. Ще краще — підказка «оберіть свій звичний розмір» або калькулятор розміру за параметрами. Додайте склад тканини, правила догляду і наявність по кожному розміру — і кількість питань у діректі впаде вдвічі."),

  h2("Фільтри, які продають: розмір, колір, бренд"),
  p("Каталог на 300+ позицій без фільтрів — це склад, а не магазин. Обов'язковий набір для одягу:"),
  li("**Розмір** — і фільтр має показувати лише те, що є в наявності у вибраному розмірі. Ніщо не дратує сильніше, ніж закохатися в річ, якої немає у твоєму 48-му."),
  li("**Колір** — свотчами, а не словами: «пильна троянда» кожен уявляє по-своєму."),
  li("**Бренд, ціна, сезон, тканина** — комбінуються між собою і застосовуються без перезавантаження сторінки."),
  p("Окремо — пошук по сайту. Він має розуміти одруківки, синоніми й транслітерацію: «худі», «hoodie» і «толстовка» повинні вести до одного результату. Користувачі, які скористалися пошуком, купують у два-три рази частіше за тих, хто просто гортає каталог, — тож поле пошуку заслуговує на помітне місце в шапці."),
  p("Бонус для SEO: сторінки популярних комбінацій фільтрів («чорні сукні», «джинси mom») отримують власні URL, заголовки й тексти — і збирають пошуковий трафік за сотнями низькочастотних запитів. Так працює [розробка інтернет-магазину](/online-store) в нашій студії: фільтри проєктуються одразу і під покупця, і під Google."),

  cta(
    "Плануєте інтернет-магазин одягу?",
    "Порахуйте вартість за 2 хвилини: оберіть функції — калькулятор покаже вилку цін і строки.",
    "Розрахувати вартість",
    "/calculator"
  ),

  h2("Повернення та примірка — блок довіри, а не дрібний шрифт"),
  p("Головне заперечення покупця одягу онлайн: «а раптом не підійде». Найкраща відповідь — зробити повернення частиною оферу. Що працює:"),
  li("Умови повернення прямо на картці товару, поруч із кнопкою «Купити»: «Обмін і повернення 14 днів. Не підійшов розмір — обміняємо за наш рахунок»."),
  li("Примірка у відділенні Нової Пошти перед оплатою — для дорогих речей це знімає бар'єр повністю."),
  li("Окрема сторінка «Доставка і повернення» з покроковою інструкцією: як оформити, хто платить за пересилку, коли повернуться гроші."),
  p("Пропишіть і операційний бік: хто перевіряє стан речі, як швидко гроші повертаються на картку, чи пропонуєте ви бонус за обмін замість повернення. Саме ці дрібниці перетворюють розчаровану покупчиню на постійну клієнтку. Парадокс fashion-e-commerce: що простіше повернути річ, то рідше її повертають — і то частіше купують удруге."),

  h2("Instagram-магазин, маркетплейс чи власний сайт"),
  p("Більшість українських брендів одягу починають з Instagram — і впираються в стелю: продажі через дірект не масштабуються, менеджер відповідає години, а базу підписників у вас може забрати один бан. Сайт не замінює Instagram — він його доповнює: таргет веде на картку товару, покупка відбувається без листування, а контакти клієнтів лишаються у вас."),
  table(
    ["Канал", "Плюси", "Мінуси", "Кому підходить"],
    [
      ["**Instagram-магазин**", "Швидкий старт, живий контакт з аудиторією", "Продажі через дірект, немає пошукового трафіку, акаунт вам не належить", "Старт бренду, до ~30 замовлень на місяць"],
      ["**Маркетплейс**", "Готовий трафік із першого дня", "Комісія 10–20%, цінові війни, чужа база клієнтів", "Розпродаж стоку, тест попиту"],
      ["**Власний сайт**", "Без комісій, SEO-трафік, своя база, ремаркетинг", "Потрібні вкладення на старті й трафік", "Бренд, що будує довгостроковий бізнес"],
    ]
  ),
  p("Оптимальна зв'язка для бренду одягу: Instagram для контенту й прогріву, власний сайт для продажів і пошукового трафіку, маркетплейси — як додатковий канал збуту."),

  h2("Інтеграції: оплата, Нова Пошта, дропшипінг"),
  p("Магазин одягу — це не лише вітрина, а й зв'язки з сервісами, які закривають операційку:"),
  li("**Оплата:** LiqPay, monobank, WayForPay, Apple Pay / Google Pay. Оплата частинами від банків помітно піднімає середній чек у сегменті від 2 000 грн."),
  li("**Нова Пошта:** віджет вибору відділення в чекауті, автоматичне створення ТТН з адмінки, трекінг для клієнта."),
  li("**Дропшипінг-фіди:** якщо працюєте від постачальника, його XML/CSV-фід підключається до сайту — ціни й залишки за розмірами оновлюються автоматично, без ручної роботи."),
  li("**Каталог для соцмереж:** товарний фід для Instagram Shopping і Google Merchant — картки товарів підтягуються в рекламу самі."),
  p("Типова інтеграція коштує $200–500, складні сценарії на кшталт двостороннього обміну з обліковою системою — $1 000–3 000."),

  h2("Скільки коштує інтернет-магазин одягу у 2026 році"),
  p("Ціна залежить не від кількості товарів, а від функціоналу. Три робочі формати:"),
  table(
    ["Формат", "Що всередині", "Ціна", "Строки"],
    [
      ["**Лендінг-вітрина**", "Каталог без кошика: колекція, лукбук, кнопка «Замовити в дірект»", "від $800", "2–3 тижні"],
      ["**Корпоративний e-commerce**", "Повний магазин: кошик, оплата, Нова Пошта, фільтри, адмінка", "від $3 500", "4–8 тижнів"],
      ["**Кастомна платформа**", "Фіди постачальників, мультивалютність, програми лояльності, ролі", "від $6 000", "8–16 тижнів"],
    ]
  ),
  p("Що рухає ціну всередині вилки: кількість унікальних дизайн-шаблонів сторінок, складність фільтрів, число інтеграцій і мультимовність каталогу. Зекономити на старті можна чесно: запустити магазин на відпрацьованих патернах студії, а унікальні розділи — лукбук, сторінку історії бренду — додати другим етапом після перших продажів."),
  p("Після запуску закладіть бюджет на розвиток: підтримка — $200/міс або $40/год, [SEO-просування](/seo) — від $300/міс. Для магазину одягу SEO окупається швидко: запити на кшталт «купити лляну сукню» приводять людей, які вже готові платити."),

  h2("Кейси та суміжні ніші"),
  p("У портфоліо студії є e-commerce-проєкти, побудовані саме за цими принципами. [Le Muse Nature](/portfolio/le-muse-nature) — магазин натуральної косметики: каталог з фільтрами, акцент на склад продукту й довіру до бренду. [Grontland](/portfolio/grontland) — e-commerce для європейського ринку з каталогом, кошиком і онлайн-оплатою. А як ті самі підходи працюють у зовсім іншій ніші, ми розібрали в статті про [інтернет-магазин автозапчастин](/blog/internet-mahazyn-avtozapchastyn)."),
  p("Принципи цієї статті переносяться на суміжні візуальні ніші майже без змін:"),
  li("**Взуття:** розмірна сітка ще критичніша — додайте довжину устілки в сантиметрах і поради щодо повноти."),
  li("**Косметика:** замість замірів — склад, сертифікати й відгуки; повернення заміняється пробниками."),
  li("**Ювелірка:** макрофото, розміри каблучок, гравіювання як опція в картці товару."),
  p("Движок магазину один і той самий — змінюються поля картки товару та логіка фільтрів. Тож якщо плануєте розширення з одягу на взуття чи аксесуари, закладіть це в архітектуру одразу."),

  cta(
    "Готові продавати зі свого сайту, а не з діректу?",
    "Розкажіть про свій бренд — запропонуємо формат, порахуємо вартість і строки без передоплати.",
    "Обговорити проєкт",
    "/calculator"
  ),
];

// ---------------------------------------------------------------- RU BODY
const bodyRu = [
  tldr("Коротко", [
    "Создание интернет-магазина одежды упирается в три вопроса покупателя: как вещь сидит, какой размер брать и как её вернуть. Сайт, который отвечает на них, — продаёт.",
    "Рабочий минимум: фото на модели с ростом и размером, таблица замеров в сантиметрах, фильтры по размеру и цвету, онлайн-оплата и доставка.",
    "Цены: витрина-лендинг от $800, полноценный магазин от $3 500, кастомная платформа с фидами поставщиков от $6 000.",
    "Instagram и маркетплейсы — каналы трафика; база клиентов и продажи без комиссий живут только на собственном сайте.",
    "Обувь, косметика и украшения строятся на том же движке — меняется только карточка товара.",
  ]),
  p("Создание интернет-магазина одежды — это не «каталог плюс корзина». Вещь нельзя примерить через экран, поэтому сайт должен снять сомнения покупателя до кнопки «Купить»: показать, как ткань ведёт себя на человеке, помочь угадать размер и пообещать лёгкий обмен, если не подойдёт. Магазины, которые решают эти три задачи, конвертируют в разы лучше «красивых» сайтов с общими фото."),
  p("Разберём по шагам, из чего складывается создание сайта магазина одежды: карточка товара, фильтры, блок доверия, связка с Instagram, интеграции с оплатой и доставкой — и во сколько всё это обойдётся в 2026 году."),

  h2("Почему одежда — особый случай в e-commerce"),
  p("Электронику покупают по характеристикам, одежду — по ощущению «это моё». Отсюда четыре особенности ниши, которые определяют требования к сайту:"),
  li("**Продают фотографии.** Никакой дизайн не спасёт съёмку «на вешалке у стены»."),
  li("**Возвраты — часть модели.** В fashion возвращают 20–30% заказов; процесс обмена должен быть продуман так же тщательно, как оформление покупки."),
  li("**Размерный учёт.** Остатки ведутся не по товару, а по вариациям: S закончился, M остался в двух цветах."),
  li("**Сезонность.** Коллекции обновляются несколько раз в год — админка обязана позволять массовую загрузку и архивирование без разработчика."),
  p("Прибавьте мобильный трафик: 70–80% покупателей одежды заходят с телефона, чаще всего прямо из сторис. Поэтому магазин проектируется mobile-first: крупные фото на весь экран, кнопка покупки без скролла, оформление заказа без обязательной регистрации. Медленный сайт в этой нише наказывается мгновенно — пока страница грузится три секунды, покупательница уже листает ленту дальше."),
  p("Это справедливо для любой визуальной ниши — подробнее о том, как мы строим магазины, см. страницу [сайты для e-commerce](/ru/sites-for/ecommerce)."),

  h2("Карточка товара: фото на модели и размерная сетка"),
  p("Карточка — точка принятия решения. Реклама и SEO приводят покупателя именно сюда, и здесь он либо кладёт вещь в корзину, либо закрывает вкладку."),
  h3("Фото вместо примерочной"),
  li("5–8 ракурсов: фронт, спина, бок, крупно ткань и фурнитура."),
  li("Подпись под фото: «на модели размер S, рост 172 см» — самый дешёвый ответ на вопрос «как сидит»."),
  li("Для платьев и костюмов — короткое видео: ткань в движении выглядит иначе, чем в статике."),
  h3("Замеры в сантиметрах, а не буквы"),
  p("«S–M–L» у каждого бренда своё, поэтому рабочая размерная сетка — это таблица замеров изделия: грудь, талия, бёдра, длина. Сильный ход — подсказка «какой размер выбрать» или калькулятор по параметрам. Добавьте состав ткани, уход и наличие по каждому размеру — и половина вопросов в директ исчезнет."),
  p("Отдельный ускоритель конверсии — отзывы с фотографиями покупательниц. Они закрывают вопрос «а как сидит на обычной фигуре» лучше любой студийной съёмки, дают бесплатный контент для соцсетей и работают на SEO: живой текст в отзывах содержит те же слова, которыми люди ищут вещи в Google."),

  h2("Фильтры: размер, цвет, бренд"),
  p("В каталоге на сотни позиций покупатель без фильтров теряется и уходит. Для одежды обязательны:"),
  li("**Размер** — с показом только тех вещей, которые есть в наличии в выбранном размере."),
  li("**Цвет** — цветовыми плашками, а не словами: «пыльная роза» у всех разная."),
  li("**Бренд, цена, сезон, ткань** — с комбинированием без перезагрузки страницы."),
  p("Не забудьте про поиск по сайту: он должен понимать опечатки, синонимы и транслит — «худи», «hoodie» и «толстовка» обязаны вести к одному результату. Покупатели, воспользовавшиеся поиском, оформляют заказ в два-три раза чаще тех, кто просто листает каталог."),
  p("Отдельный плюс для SEO: страницы популярных комбинаций («чёрные платья», «джинсы mom») получают свои URL и заголовки и собирают трафик по сотням низкочастотных запросов. При [разработке интернет-магазина](/ru/online-store) мы проектируем фильтры сразу под покупателя и под поиск."),

  cta(
    "Планируете магазин одежды?",
    "Соберите конфигурацию в калькуляторе — он покажет вилку цен и сроки за пару минут.",
    "Рассчитать стоимость",
    "/ru/calculator"
  ),

  h2("Возврат и примерка — блок доверия"),
  p("Главный страх покупателя: «не подойдёт — намучаюсь с возвратом». Лучший ответ — вынести условия возврата на самое видное место:"),
  li("Условия прямо в карточке, рядом с кнопкой покупки: «Обмен и возврат 14 дней. Не подошёл размер — обменяем за наш счёт»."),
  li("Примерка в отделении перевозчика до оплаты — для дорогих вещей это снимает барьер полностью."),
  li("Страница «Доставка и возврат» с пошаговой инструкцией: как оформить, кто платит за пересылку, когда вернутся деньги."),
  p("Продумайте и операционную часть: кто проверяет состояние вещи, за сколько дней деньги возвращаются на карту, предлагаете ли вы бонус за обмен вместо возврата. Проверено практикой: чем проще вернуть вещь, тем реже её возвращают и тем чаще покупают повторно."),

  h2("Instagram, маркетплейс или свой сайт"),
  p("Типичный путь бренда: продажи в директе растут до 20–30 заказов в месяц, потом менеджер перестаёт успевать, а любой сбой аккаунта останавливает бизнес. Сайт не отменяет Instagram — он забирает у него рутину: таргет ведёт на карточку, покупка проходит без переписки, контакты клиентов остаются в вашей базе."),
  table(
    ["Канал", "Плюсы", "Минусы", "Кому подходит"],
    [
      ["**Instagram-магазин**", "Быстрый старт, живая аудитория", "Продажи через директ, нет поискового трафика, аккаунт не ваш", "Старт бренда, до ~30 заказов в месяц"],
      ["**Маркетплейс**", "Готовый трафик с первого дня", "Комиссия 10–20%, демпинг, чужая база клиентов", "Слив стока, проверка спроса"],
      ["**Свой сайт**", "Без комиссий, SEO-трафик, своя база, ретаргетинг", "Вложения на старте, трафик надо приводить", "Бренд с горизонтом в годы"],
    ]
  ),
  p("Практичный сценарий переезда из директа: сначала запустите витрину с каталогом и заказом в один клик, переведите на неё трафик из шапки профиля и сторис, а корзину с онлайн-оплатой добавьте, когда появится стабильный поток заказов. Так вы не замораживаете крупный бюджет и проверяете экономику на каждом шаге. Рабочая связка в итоге: Instagram греет аудиторию, сайт продаёт и собирает поисковый трафик, маркетплейсы подключаются как дополнительный канал."),

  h2("Интеграции: оплата, доставка, дропшиппинг"),
  li("**Оплата:** эквайринг, Apple Pay / Google Pay, оплата частями — последняя заметно поднимает средний чек."),
  li("**Доставка:** виджет выбора отделения в чекауте, создание накладной из админки, трекинг для клиента."),
  li("**Дропшиппинг-фиды:** XML/CSV поставщика подключается к сайту, цены и остатки по размерам обновляются автоматически. Для магазина женской одежды, работающего от поставщика, это ключевая функция: ассортимент в сотни позиций ведётся без ручного труда."),
  li("**Товарные фиды** для Instagram Shopping и Google Merchant — карточки сами подтягиваются в рекламу."),
  li("**CRM и учёт:** заказы с сайта падают в единую систему — статусы, история покупок, повторные продажи через рассылки."),
  p("Порядок подключения тоже имеет значение: на старте достаточно эквайринга и доставки, фиды и CRM добавляются по мере роста. Начинать создание сайта интернет-магазина одежды со всех интеграций сразу — типичная ошибка: половина из них не понадобится в первые полгода. Типовая интеграция стоит $200–500, сложные сценарии вроде двустороннего обмена с учётной системой — $1 000–3 000."),

  h2("Сколько стоит интернет-магазин одежды"),
  p("Создание интернет-магазина женской одежды с нуля, мультибрендового магазина или шоурума укладывается в три формата — цена зависит от функционала, а не от числа товаров:"),
  table(
    ["Формат", "Что внутри", "Цена", "Сроки"],
    [
      ["**Витрина-лендинг**", "Каталог без корзины: коллекция, лукбук, заказ через мессенджер", "от $800", "2–3 недели"],
      ["**Полноценный магазин**", "Корзина, оплата, доставка, фильтры, админка", "от $3 500", "4–8 недель"],
      ["**Кастомная платформа**", "Фиды поставщиков, мультивалютность, программы лояльности", "от $6 000", "8–16 недель"],
    ]
  ),
  p("Что двигает цену внутри вилки: количество уникальных дизайн-шаблонов страниц, сложность фильтров, число интеграций и мультиязычность каталога. Сэкономить на старте можно честно: запустить магазин на отработанных паттернах студии, а уникальные разделы — лукбук, страницу истории бренда — добавить вторым этапом после первых продаж."),
  p("После запуска: поддержка — $200/мес или $40/час, [SEO-продвижение](/ru/seo) — от $300/мес. В одежде SEO окупается быстро: запросы вида «купить льняное платье» приводят людей с деньгами в руках."),

  h2("Кейсы и смежные ниши"),
  p("Примеры из портфолио студии: [Le Muse Nature](/ru/portfolio/le-muse-nature) — магазин натуральной косметики с фильтрами и акцентом на состав и доверие; [Grontland](/ru/portfolio/grontland) — e-commerce для европейского рынка с каталогом и онлайн-оплатой. Как те же принципы работают в технической нише, мы показали в статье про [интернет-магазин автозапчастей](/ru/blog/internet-magazin-avtozapchastey)."),
  p("Подходы из этой статьи без изменений переносятся на соседние ниши:"),
  li("**Обувь:** создание интернет-магазина обуви — это та же схема, но размерная сетка ещё критичнее: добавьте длину стельки в сантиметрах и подсказки по полноте."),
  li("**Косметика:** вместо замеров — состав, сертификаты и отзывы."),
  li("**Украшения:** макросъёмка, размеры колец, гравировка как опция в карточке."),
  p("Движок один — меняются поля карточки и логика фильтров. Если планируете расширяться с одежды на обувь или аксессуары, заложите это в архитектуру сразу. Отдельная выгода такого подхода — общая корзина и единая база клиентов: покупательница платья охотно добавит к заказу серьги или уходовую косметику."),

  cta(
    "Готовы продавать с сайта, а не из директа?",
    "Расскажите о бренде — предложим формат, посчитаем стоимость и сроки без предоплаты.",
    "Обсудить проект",
    "/ru/calculator"
  ),
];

// ---------------------------------------------------------------- EN BODY
const bodyEn = [
  tldr("TL;DR", [
    "A clothing store website sells when the product page answers three questions: how the garment fits, which size to pick, and how easy returns are.",
    "The working minimum: on-model photos with the model's size and height, a size chart in centimetres, size and colour filters, online payment and shipping.",
    "Budgets: a lookbook landing page from $800, a full e-commerce site from $3,500, a custom platform with supplier feeds from $6,000.",
    "Instagram and marketplaces are traffic channels; commission-free sales and a customer base you own live only on your own site.",
    "Footwear, cosmetics and jewellery run on the same engine — only the product card changes.",
  ]),
  p("To build a clothing store website that actually sells, you need four things: an honest product page with on-model photos and a real size chart, fast filters by size, colour and brand, a visible returns promise, and a checkout that takes two clicks. Everything else — branding, lookbooks, editorial content — only works once those four are in place."),
  p("Fashion is the hardest e-commerce niche because the customer cannot try anything on. Decisions are made from photos and measurements, and return rates in apparel reach 20–30%. This guide walks through fashion ecommerce website design step by step — from the product card to payment, shipping and supplier-feed integrations — and what it costs in 2026."),

  h2("Why selling clothes online is a special case"),
  p("A power bank is bought on specs; a dress is bought on the feeling of «this is me». That gives the niche four traits that shape the website:"),
  li("**Photos do the selling.** No layout rescues garments shot flat against a wall."),
  li("**Returns are part of the model.** Apparel sees 20–30% of orders come back; the exchange flow deserves as much design as the checkout."),
  li("**Stock lives at variant level.** An item is not simply in or out of stock — the S is gone while the M remains in two colours."),
  li("**Collections rotate.** New drops land several times a year, so the admin panel must support bulk upload and archiving without a developer."),
  p("Add mobile to the picture: 70–80% of clothing shoppers browse on a phone, usually straight from social media. That makes mobile-first design non-negotiable — full-width photos, a buy button visible without scrolling, guest checkout. Slow pages are punished instantly in this niche: while yours loads for three seconds, the shopper is already back in her feed."),
  p("These are baseline requirements for the niche — we cover how we build stores on our [e-commerce websites](/en/sites-for/ecommerce) page."),

  h2("The product page: on-model photos and size charts"),
  p("The product page is where ads and search traffic land — and where the sale is won or lost."),
  h3("Photography that replaces the fitting room"),
  li("5–8 angles: front, back, side, fabric and hardware close-ups, full length."),
  li("A caption under the photo — «model wears size S, height 172 cm» — is the cheapest possible answer to «how does it fit?»."),
  li("A short clip for dresses and tailoring: fabric moves differently than it photographs."),
  h3("Centimetres, not letters"),
  p("«S–M–L» means something different at every brand. A working size chart lists garment measurements — chest, waist, hips, length — in centimetres. Better still, add a «which size should I pick?» hint or a size calculator. Round it off with fabric composition, care instructions and per-size availability, and half of your DMs disappear."),

  h2("Filters that sell: size, colour, brand"),
  p("A catalogue of several hundred items without filters is a warehouse, not a shop. For apparel the essentials are:"),
  li("**Size** — showing only items actually in stock in the selected size."),
  li("**Colour** — as swatches, not words: everyone pictures «dusty rose» differently."),
  li("**Brand, price, season, fabric** — combinable, applied without a page reload."),
  p("Don't overlook site search: it should forgive typos and understand synonyms, so «hoodie» and «sweatshirt» lead to the same rail. Shoppers who use search convert two to three times more often than those who simply browse."),
  p("There is an SEO bonus: popular filter combinations («black dresses», «mom jeans») get their own URLs, titles and copy, and quietly collect long-tail search traffic. That is how we approach [online store development](/en/online-store): filters are designed for the shopper and for Google at the same time."),

  cta(
    "Planning a clothing store?",
    "Pick your features in the calculator — it returns a price range and timeline in two minutes.",
    "Get an estimate",
    "/en/calculator"
  ),

  h2("Returns and try-on as a trust block"),
  p("The number-one objection to buying clothes online: «what if it doesn't fit?» The best answer is to make returns part of the offer:"),
  li("Return terms right on the product page, next to the buy button: «14-day exchange and refund. Wrong size — we swap it at our cost»."),
  li("A dedicated «Delivery and returns» page with a step-by-step guide: how to send an item back, who pays the postage, when the refund arrives."),
  li("Where your carrier supports it, try-on at the pickup point before payment removes the barrier entirely."),
  p("The paradox of fashion e-commerce: the easier the return, the fewer returns you get — and the more repeat purchases."),

  h2("Instagram shop, marketplace or your own website"),
  p("Most fashion brands start on Instagram and hit a ceiling: DM sales don't scale, replies take hours, and one account ban can erase the audience. A website doesn't replace Instagram — it completes it: ads lead to a product page, the purchase happens without messaging, and the customer data stays with you."),
  table(
    ["Channel", "Pros", "Cons", "Best for"],
    [
      ["**Instagram shop**", "Fast start, direct contact with the audience", "DM-based sales, no search traffic, you don't own the account", "Brand launch, up to ~30 orders/month"],
      ["**Marketplace**", "Ready-made traffic from day one", "10–20% commission, price wars, the customer base isn't yours", "Clearing stock, testing demand"],
      ["**Own website**", "No commission, SEO traffic, your own base, retargeting", "Upfront investment, you bring the traffic", "A brand built for the long run"],
    ]
  ),
  p("The combination that works: Instagram warms the audience, the website converts and earns search traffic, marketplaces act as an extra sales channel."),

  h2("Integrations: payments, shipping, dropshipping"),
  li("**Payments:** card acquiring, Apple Pay / Google Pay, buy-now-pay-later — the latter visibly lifts average order value."),
  li("**Shipping:** carrier pickers in the checkout (Royal Mail, DPD, InPost or your local carrier), labels generated from the admin panel, tracking for the customer."),
  li("**Dropshipping feeds:** a supplier's XML/CSV feed plugs into the site so prices and per-size stock update automatically — hundreds of SKUs with no manual work."),
  li("**Product feeds** for Instagram Shopping and Google Merchant, so ads pull product cards automatically."),
  p("A typical integration costs $200–500; complex scenarios such as two-way sync with an inventory system run $1,000–3,000."),

  h2("What a clothing store website costs in 2026"),
  p("Price follows functionality, not catalogue size. Three working formats:"),
  table(
    ["Format", "What's inside", "Price", "Timeline"],
    [
      ["**Lookbook landing page**", "Catalogue without a cart: collection, lookbook, order via messenger", "from $800", "2–3 weeks"],
      ["**Full e-commerce site**", "Cart, payments, shipping, filters, admin panel", "from $3,500", "4–8 weeks"],
      ["**Custom platform**", "Supplier feeds, multi-currency, loyalty programmes, roles", "from $6,000", "8–16 weeks"],
    ]
  ),
  p("What moves the price within each range: the number of unique page templates, filter complexity, the count of integrations, and whether the catalogue is multilingual. There is an honest way to save at launch — start on the studio's proven store patterns and add bespoke sections such as a lookbook or brand story page as a second phase, once the first sales are in."),
  p("We are a Ukrainian studio working with European and UK clients — European quality at sensible rates. After launch, budget for growth: support at $200/month or $40/hour, and [SEO](/en/seo) from $300/month. In fashion, SEO pays back fast: queries like «linen midi dress» bring shoppers who are ready to buy."),

  h2("Case studies and adjacent niches"),
  p("From our portfolio: [Le Muse Nature](/en/portfolio/le-muse-nature) — a natural cosmetics store built around ingredient transparency and trust, with a filtered catalogue; [Grontland](/en/portfolio/grontland) — an e-commerce site for the European market with a catalogue, cart and online payments. For the same principles applied to a technical niche, see our guide to an [auto parts online store](/en/blog/auto-parts-online-store)."),
  p("Everything above transfers to neighbouring visual niches almost unchanged:"),
  li("**Footwear:** size charts matter even more — add insole length in centimetres and width guidance."),
  li("**Cosmetics:** ingredients, certificates and reviews replace measurements."),
  li("**Jewellery:** macro photography, ring sizes, engraving as a product-page option."),
  p("The engine is the same — only the product card fields and filter logic change. If you plan to expand from clothing into shoes or accessories, design the architecture for it from day one."),

  cta(
    "Ready to sell from your own site, not your DMs?",
    "Tell us about your brand — we'll suggest a format and give you a price and timeline, no prepayment.",
    "Discuss the project",
    "/en/calculator"
  ),
];

const doc = {
  _id: "ltAug2026-internet-mahazyn-odiahu",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW, updatedAt: NOW,
  readingTimeMinutes: 9,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "internet-mahazyn-odiahu" },
    ru: { _type: "slug", current: "internet-magazin-odezhdy" },
    en: { _type: "slug", current: "clothing-store-website" },
  },
  title: {
    _type: "localizedString",
    uk: "Інтернет-магазин одягу: як створити сайт, який продає речі",
    ru: "Создание интернет-магазина одежды: как сделать сайт, который продаёт",
    en: "Clothing Store Website: How to Build a Site That Sells",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Інтернет-магазин одягу: сайт, який продає | Ціни 2026",
    ru: "Создание интернет-магазина одежды: цены 2026 | Гайд",
    en: "Clothing Store Website That Sells: 2026 Guide & Costs",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Як створити сайт для продажу одягу ✔️ Розмірні сітки, фільтри, повернення ✔️ Вітрина від $800, магазин від $3 500 ➡ Гайд і вилка цін 2026.",
    ru: "➤ Создание интернет-магазина одежды с нуля ✔️ Карточка товара, фильтры, возвраты ✔️ Витрина от $800, магазин от $3 500 ➡ Гайд с ценами 2026.",
    en: "➤ How to build a clothing store website that sells ✔️ Size charts, filters, returns ✔️ From $800 lookbook to $3,500 store ➡ Full 2026 guide.",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "E-commerce",
    ru: "E-commerce",
    en: "E-commerce",
  },
  lede: {
    _type: "localizedString",
    uk: "Одяг не можна приміряти через екран — тому сайт має зняти сумніви до кнопки «Купити»: фото на моделі, розмірні сітки, чесні повернення. Розбираємо, як це побудувати і скільки коштує.",
    ru: "Одежду нельзя примерить через экран — сайт должен снять сомнения до кнопки «Купить»: фото на модели, замеры, честные возвраты. Разбираем, как это построить и сколько это стоит.",
    en: "You can't try clothes on through a screen — the website has to remove doubt before the buy button: on-model photos, size charts, honest returns. Here's how to build it and what it costs.",
  },
  tags: ["e-commerce", "інтернет-магазин", "одяг", "fashion"],
  relatedPostSlugs: ["internet-mahazyn-avtozapchastyn", "vartist-rozrobky-saytu-2026", "nextjs-proty-wordpress-ta-konstruktoriv"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: [
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки коштує створити інтернет-магазин одягу?",
        ru: "Сколько стоит создание сайта интернет-магазина одежды?",
        en: "How much does a clothing store website cost?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг-вітрина без кошика — від $800, повноцінний магазин з оплатою, Новою Поштою і фільтрами — від $3 500, кастомна платформа з фідами постачальників — від $6 000. Ціна залежить від функціоналу, а не від кількості товарів у каталозі.",
        ru: "Витрина-лендинг без корзины — от $800, полноценный магазин с оплатой, доставкой и фильтрами — от $3 500, кастомная платформа с фидами поставщиков — от $6 000. Цена зависит от функционала, а не от количества товаров.",
        en: "A lookbook landing page without a cart starts at $800, a full store with payments, shipping and filters at $3,500, and a custom platform with supplier feeds at $6,000. Price follows functionality, not catalogue size.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи можна продавати одяг лише через Instagram, без сайту?",
        ru: "Можно ли продавать одежду только через Instagram, без сайта?",
        en: "Can I sell clothes through Instagram alone, without a website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Можна — приблизно до 30 замовлень на місяць. Далі дірект перестає масштабуватися: менеджер не встигає, немає пошукового трафіку, а акаунт вам не належить. Оптимальна зв'язка — Instagram для контенту й прогріву, власний сайт для продажів і бази клієнтів.",
        ru: "Да — примерно до 30 заказов в месяц. Дальше директ перестаёт масштабироваться: менеджер не успевает отвечать, поискового трафика нет, а аккаунт вам не принадлежит. Рабочая связка — Instagram для прогрева, свой сайт для продаж и базы клиентов.",
        en: "Yes — up to roughly 30 orders a month. Beyond that, DM sales stop scaling: replies lag, there is no search traffic, and you don't own the account. The working combination is Instagram for audience warming and your own website for sales and customer data.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Скільки часу займає розробка магазину одягу?",
        ru: "Как создать сайт магазина одежды и сколько это займёт времени?",
        en: "How long does it take to build a clothing store website?",
      },
      answer: {
        _type: "localizedText",
        uk: "Лендінг-вітрина — 2–3 тижні, повноцінний магазин — 4–8 тижнів, кастомна платформа — 8–16 тижнів. Найчастіше строки затягуються не через розробку, а через контент: фотосесії та заповнення карток товару варто запускати паралельно з дизайном.",
        ru: "Начните с формата: витрина делается 2–3 недели, полноценный магазин — 4–8 недель, кастомная платформа — 8–16 недель. Чаще всего сроки сдвигает не разработка, а контент: фотосессии и заполнение карточек стоит запускать параллельно с дизайном.",
        en: "A lookbook landing page takes 2–3 weeks, a full store 4–8 weeks, a custom platform 8–16 weeks. Delays usually come from content, not code: schedule photo shoots and product data entry in parallel with the design phase.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Що підготувати перед стартом розробки?",
        ru: "Что подготовить до старта разработки?",
        en: "What should I prepare before development starts?",
      },
      answer: {
        _type: "localizedText",
        uk: "Фото товарів на моделі, таблиці замірів по кожній моделі одягу, тексти про бренд, умови доставки й повернення, а якщо працюєте від постачальника — його фід із цінами й залишками. Що раніше зібраний контент, то швидший запуск.",
        ru: "Фото товаров на модели, таблицы замеров по каждой модели одежды, тексты о бренде, условия доставки и возврата, а при работе от поставщика — его фид с ценами и остатками. Чем раньше собран контент, тем быстрее запуск.",
        en: "On-model product photos, measurement tables for each garment, brand copy, delivery and returns terms, and — if you work with a supplier — their price and stock feed. The earlier the content is ready, the faster the launch.",
      },
    },
    {
      _key: key(), _type: "faqItem",
      question: {
        _type: "localizedString",
        uk: "Чи підійде такий сайт для взуття, косметики або ювелірки?",
        ru: "Подойдёт ли такой сайт для обуви, косметики или украшений?",
        en: "Will the same site work for footwear, cosmetics or jewellery?",
      },
      answer: {
        _type: "localizedText",
        uk: "Так, движок той самий — змінюються поля картки товару та фільтри. Для взуття критична довжина устілки в сантиметрах, для косметики — склад і сертифікати, для ювелірки — макрофото й розміри. Якщо плануєте розширення асортименту, закладіть це в архітектуру одразу.",
        ru: "Да, движок тот же — меняются поля карточки и фильтры. Создание интернет-магазина обуви требует длины стельки в сантиметрах, косметики — состава и сертификатов, украшений — макрофото и размеров. Планируете расширяться — заложите это в архитектуру сразу.",
        en: "Yes — the engine is identical, only the product card fields and filters change. Footwear needs insole length in centimetres, cosmetics need ingredients and certificates, jewellery needs macro photos and ring sizes. If you plan to expand your range, design for it upfront.",
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
