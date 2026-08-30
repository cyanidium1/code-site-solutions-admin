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

/* ─────────────────────────── UK ─────────────────────────── */

const bodyUk = [
  tldr("Коротко про домен", [
    "Домен — це адреса сайту, яку вводять у браузері: code-site.art або rozetka.com.ua.",
    "Домен і хостинг — дві різні послуги: адреса й місце, де фізично лежать файли сайту.",
    "Базовий вибір для бізнесу в Україні — .com.ua або .com, приблизно $10–15 на рік.",
    "Домен орендують, а не купують назавжди: не продовжили вчасно — адресу забере хтось інший.",
    "Реєструвати домен треба на власника бізнесу, а не на студію чи фрилансера.",
  ]),

  p("**Домен — це адреса сайту в інтернеті**, яку людина набирає в браузері замість числової IP-адреси сервера: code-site.art, rozetka.com.ua, google.com. Технічно це запис у глобальній системі DNS, який каже браузеру, на якому сервері шукати ваш сайт. Практично — це ім’я, за яким вас знаходять, і майже єдина частина сайту, яку клієнт запам’ятовує на слух."),

  p("Домен нічого не зберігає і не робить сайт швидшим — він лише вказує шлях. Його реєструють окремо від сайту, у реєстратора, мінімум на рік, і продовжують щороку. Зазвичай це найдешевша позиція в кошторисі проєкту й водночас та, через яку найчастіше виникають проблеми через рік-два."),

  h2("Простими словами: домен — це адреса, а не приміщення"),
  p("Уявіть кав’ярню. Хостинг — це саме приміщення: стіни, електрика, площа, за яку ви платите щомісяця. Домен — це адреса на табличці: «вул. Хрещатик, 12». Адреса не варить каву й не займає місця, але без неї ніхто не знайде двері."),
  p("З цієї аналогії випливають дві речі, які часто плутають. По-перше, адресу можна змінити, залишивши те саме приміщення: перенести домен на інший хостинг — це питання кількох годин. По-друге, приміщення можна змінити, залишивши адресу: переїхали на швидший сервер — відвідувачі навіть не помітять. Домен і хостинг живуть окремо саме тому, що це різні за природою речі."),

  h2("З чого складається доменне ім’я"),
  p("Доменне ім’я читається справа наліво, від загального до конкретного. У code-site.art частин дві, у blog.code-site.art — три:"),
  li("**Доменна зона (TLD)** — те, що після останньої крапки: .art, .com, .ua, .com.ua. Це верхній рівень, ним керує реєстратура зони, а не ви."),
  li("**Домен другого рівня** — власне ваше ім’я: code-site. Саме його ви обираєте, реєструєте й оплачуєте. Це те, що зазвичай і мають на увазі, коли кажуть «купити домен»."),
  li("**Піддомен (третій рівень)** — blog.code-site.art, shop.code-site.art, uk.code-site.art. Піддомени безкоштовні: маючи домен другого рівня, ви створюєте їх скільки завгодно у налаштуваннях DNS."),
  p("Окремий випадок — www. Це технічно теж піддомен, просто історичний. Сучасні сайти працюють і з ним, і без нього, але одна з версій має бути головною, а друга — переадресовувати на неї. Якщо цього не зробити, пошуковик бачить дві копії сайту за різними адресами."),

  h2("Доменні зони: яку обрати бізнесу"),
  p("Зона — це не просто закінчення, а сигнал: кому ви продаєте і в якій країні працюєте. Ось найпоширеніші варіанти для українського бізнесу з орієнтовними цінами реєстратора на рік:"),
  table(
    ["Зона", "Для кого", "Ціна за рік, орієнтовно"],
    [
      [".com.ua", "Бізнес, що працює в Україні. Найпопулярніший робочий варіант: дешево, зрозуміло, без бюрократії.", "$8–12"],
      [".ua", "Компанії із зареєстрованою торговою маркою. Без свідоцтва на ТМ зону просто не видадуть.", "$25–40"],
      [".com", "Міжнародний або орієнтований на експорт бізнес. Найбільш нейтральна зона у світі.", "$12–15"],
      [".art", "Студії, дизайн, креативні й портфоліо-проєкти. Коротко й запам’ятовується.", "$15–20"],
      [".ua-регіональні (.kyiv.ua, .lviv.ua)", "Локальний бізнес одного міста. Ніша, але буває доречно.", "$8–12"],
    ]
  ),
  p("Практичне правило: якщо ви працюєте тільки в Україні — беріть .com.ua. Якщо плануєте вихід за кордон — .com. Якщо є торгова марка й бюджет — .ua виглядає солідніше за все інше. Дешеві екзотичні зони на кшталт .site чи .xyz для комерційного сайту краще не брати: до них менше довіри в користувачів, а частина поштових сервісів агресивніше фільтрує листи з таких доменів."),

  h2("Чим домен відрізняється від хостингу"),
  p("Це найчастіша плутанина серед власників бізнесу, і вона коштує грошей. **Домен — це адреса. Хостинг — це сервер, де лежать файли сайту й база даних.** Це дві окремі послуги, часто від різних компаній, з різними рахунками й різними датами продовження."),
  p("Практичний наслідок: якщо не сплатити хостинг — сайт зникне, але адреса залишиться вашою, і після оплати все повернеться. Якщо не сплатити домен — сайт теж зникне, а адресу через певний час зможе зареєструвати будь-хто, у тому числі конкурент. Друга ситуація значно гірша, бо зворотного шляху може вже не бути. Детальніше про другу половину пари — у статті [що таке хостинг](/blog/shcho-take-hosting)."),

  h2("Як обрати домен для бізнесу"),
  p("Домен обирають один раз і надовго: зміна адреси через два роки означає втрату частини пошукових позицій і всіх посилань, які на вас поставили. Тому короткий чекліст:"),
  num("**Коротко.** До 15 символів. Домен диктують по телефону — довгий не продиктуєш."),
  num("**Однозначно на слух.** Якщо після назви доводиться уточнювати «через дефіс» або «з двома с» — назва не підходить."),
  num("**Ближче до бренду, ніж до ключових слів.** «kupyty-vikna-kyiv» виглядає як однорічний проєкт. Бренд працює довше й краще запам’ятовується."),
  num("**Вільний у соцмережах.** Перевірте, чи вільний такий самий нік в Instagram і Facebook — інакше бренд розпадеться на різні імена."),
  num("**Без чужої торгової марки.** Домен із назвою відомого бренду відберуть, а гроші за реєстрацію ніхто не поверне."),
  num("**Перевірений на історію.** Вживані домени іноді мають за плечима спам і фільтри. Погугліть адресу перед покупкою."),

  h2("Типові помилки з доменом"),
  li("**Дефіси й цифри.** Кожен дефіс — це плюс одне уточнення в кожній телефонній розмові й мінус до довіри."),
  li("**Транслітерація навмання.** «kviti», «kvity», «cvety» — три різні написання того самого. Оберіть одне і зафіксуйте його всюди: на сайті, у візитках, у рекламі."),
  li("**Чужий бренд у назві.** «apple-service-kyiv» відберуть за скаргою правовласника, і жоден реєстратор не захистить."),
  li("**Забуте продовження.** Домен не куплений назавжди — це щорічна оренда. Вмикайте автопродовження й тримайте на карті кошти."),
  li("**Реєстрація на підрядника.** Найдорожча помилка, і про неї — окремо нижче."),

  p("**Домен має бути зареєстрований на вас, а не на студію, фрилансера чи «того хлопця, який робив сайт».** Власник акаунта в реєстратора — це і є власник адреси; усе інше (хто платив, хто налаштовував, що написано в договорі) вторинне. Ми в Code-Site.Art реєструємо домен на клієнта як частину пакета «під ключ»: акаунт у реєстратора оформлюється на ваші дані, доступи ми передаємо разом із сайтом. Це не жест доброї волі, а нормальна практика — просто далеко не всі так роблять, і саме тому історії «підрядник зник разом із доменом» досі трапляються щомісяця."),

  cta(
    "Зробимо сайт під ключ — разом із доменом",
    "Реєструємо домен на вас, налаштовуємо DNS, пошту й SSL, передаємо всі доступи. Лендінг від $800, корпоративний сайт від $2 500.",
    "Обговорити проєкт",
    "/landing"
  ),

  p("Якщо ви на етапі «є ідея, треба сайт» — домен це перший крок, але не найдорожчий. Порахувати весь проєкт можна на сторінці [цін](/pricing), а якщо потрібен не односторінковик, а структура з розділами — дивіться [корпоративний сайт](/corporate-site)."),
];

const faqUk = [
  {
    q: "Скільки коштує домен на рік?",
    a: "Для бізнесу в Україні реальні цифри такі: .com.ua — приблизно $8–12 на рік, .com — $12–15, .art — $15–20, .ua — $25–40 і лише за наявності свідоцтва на торгову марку. Це щорічний платіж: домен не купують назавжди, його орендують.",
  },
  {
    q: "Чи можна перенести домен на іншого хостинг-провайдера?",
    a: "Так, і це нормальна процедура. Домен і хостинг не пов’язані: щоб переїхати на інший сервер, достатньо змінити DNS-записи домену. Сам домен теж можна перенести до іншого реєстратора — за кодом трансферу, зазвичай за кілька днів.",
  },
  {
    q: "Що станеться, якщо не продовжити домен вчасно?",
    a: "Спочатку сайт і пошта на цьому домені просто перестануть працювати. Далі домен проходить пільговий період (зазвичай близько 30 днів), коли його ще можна відновити з доплатою. Після цього адреса звільняється, і зареєструвати її може будь-хто.",
  },
  {
    q: "На кого треба реєструвати домен?",
    a: "На власника бізнесу — фізичну особу чи компанію. Той, на чиї дані оформлений акаунт у реєстратора, і є власником домену. Якщо домен зареєстрований на підрядника, ви орендуєте власну адресу в нього, навіть якщо самі за неї платите.",
  },
];

/* ─────────────────────────── RU ─────────────────────────── */

const bodyRu = [
  tldr("Коротко о домене", [
    "Домен — это адрес сайта, который набирают в браузере: code-site.art или rozetka.com.ua.",
    "Домен и хостинг — две разные услуги: адрес и место, где физически лежат файлы сайта.",
    "Базовый выбор для бизнеса в Украине — .com.ua или .com, примерно $10–15 в год.",
    "Домен арендуют, а не покупают навсегда: не продлили вовремя — адрес заберёт кто-то другой.",
    "Регистрировать домен нужно на владельца бизнеса, а не на студию или фрилансера.",
  ]),

  p("**Домен — это адрес сайта в интернете**, который человек набирает в браузере вместо числового IP-адреса сервера: code-site.art, rozetka.com.ua, google.com. Технически это запись в глобальной системе DNS, которая говорит браузеру, на каком сервере искать ваш сайт. Практически — это имя, по которому вас находят, и почти единственная часть сайта, которую клиент запоминает на слух."),

  p("Домен ничего не хранит и не делает сайт быстрее — он только указывает путь. Его регистрируют отдельно от сайта, у регистратора, минимум на год, и продлевают ежегодно. Обычно это самая дешёвая строка в смете проекта и одновременно та, из-за которой чаще всего возникают проблемы через год-два."),

  h2("Простыми словами: домен — это адрес, а не помещение"),
  p("Представьте кофейню. Хостинг — это само помещение: стены, электричество, площадь, за которую вы платите каждый месяц. Домен — адрес на табличке: «ул. Крещатик, 12». Адрес не варит кофе и не занимает места, но без него никто не найдёт дверь."),
  p("Из этой аналогии следуют две вещи, которые часто путают. Во-первых, адрес можно сохранить, сменив помещение: переезд на другой хостинг занимает несколько часов и посетители его не заметят. Во-вторых, помещение можно оставить, сменив адрес. Домен и хостинг живут отдельно именно потому, что это разные по природе вещи и разные счета."),

  h2("Из чего состоит доменное имя"),
  p("Доменное имя читается справа налево, от общего к частному. В code-site.art частей две, в blog.code-site.art — три:"),
  li("**Доменная зона (TLD)** — то, что после последней точки: .art, .com, .ua, .com.ua. Это верхний уровень, им управляет регистратура зоны, а не вы."),
  li("**Домен второго уровня** — собственно ваше имя: code-site. Именно его вы выбираете, регистрируете и оплачиваете. Это и имеют в виду, когда говорят «купить домен»."),
  li("**Поддомен (третий уровень)** — blog.code-site.art, shop.code-site.art. Поддомены бесплатны: имея домен второго уровня, вы создаёте их сколько угодно в настройках DNS."),
  p("Отдельный случай — www. Технически это тоже поддомен, просто исторический. Современные сайты работают и с ним, и без него, но одна версия должна быть главной, а вторая — переадресовывать на неё. Иначе поисковик видит две копии сайта по разным адресам."),

  h2("Доменные зоны: какую выбрать бизнесу"),
  p("Зона — это не просто окончание, а сигнал: кому вы продаёте и в какой стране работаете. Вот основные варианты для украинского бизнеса с ориентировочными ценами регистратора за год:"),
  table(
    ["Зона", "Для кого", "Цена за год, ориентировочно"],
    [
      [".com.ua", "Бизнес, работающий в Украине. Самый рабочий вариант: дёшево, понятно, без бюрократии.", "$8–12"],
      [".ua", "Компании с зарегистрированной торговой маркой. Без свидетельства на ТМ зону просто не выдадут.", "$25–40"],
      [".com", "Международный или экспортно ориентированный бизнес. Самая нейтральная зона в мире.", "$12–15"],
      [".art", "Студии, дизайн, креативные и портфолио-проекты. Коротко и запоминается.", "$15–20"],
      ["Региональные (.kyiv.ua, .lviv.ua)", "Локальный бизнес одного города. Ниша, но иногда уместно.", "$8–12"],
    ]
  ),
  p("Практическое правило: работаете только в Украине — берите .com.ua. Планируете выход за рубеж — .com. Есть торговая марка и бюджет — .ua выглядит солиднее всего. Дешёвые экзотические зоны вроде .site или .xyz для коммерческого сайта лучше не брать: доверия к ним меньше, а часть почтовых сервисов агрессивнее фильтрует письма с таких доменов."),

  h2("Чем домен отличается от хостинга"),
  p("Это самая частая путаница у владельцев бизнеса, и она стоит денег. **Домен — это адрес. Хостинг — это сервер, где лежат файлы сайта и база данных.** Две отдельные услуги, часто от разных компаний, с разными счетами и разными датами продления."),
  p("Практическое следствие: не оплатили хостинг — сайт исчезнет, но адрес останется вашим и после оплаты всё вернётся. Не оплатили домен — сайт тоже исчезнет, а адрес через некоторое время сможет зарегистрировать кто угодно, включая конкурента. Вторая ситуация намного хуже, потому что обратного пути может уже не быть. Подробнее о второй половине пары — в статье [что такое хостинг](/ru/blog/chto-takoe-hosting)."),

  h2("Как выбрать домен для бизнеса"),
  p("Домен выбирают один раз и надолго: смена адреса через два года означает потерю части поисковых позиций и всех ссылок, которые на вас поставили. Поэтому короткий чеклист:"),
  num("**Коротко.** До 15 символов. Домен диктуют по телефону — длинный не продиктуешь."),
  num("**Однозначно на слух.** Если после названия приходится уточнять «через дефис» или «с двумя с» — название не подходит."),
  num("**Ближе к бренду, чем к ключевым словам.** «kupit-okna-kiev» выглядит как проект на один сезон. Бренд работает дольше."),
  num("**Свободен в соцсетях.** Проверьте, свободен ли такой же ник в Instagram и Facebook — иначе бренд распадётся на разные имена."),
  num("**Без чужой торговой марки.** Домен с названием известного бренда отберут, а деньги за регистрацию никто не вернёт."),
  num("**Проверен на историю.** У б/у доменов иногда за плечами спам и фильтры. Погуглите адрес до покупки."),

  h2("Типичные ошибки с доменом"),
  li("**Дефисы и цифры.** Каждый дефис — это лишнее уточнение в каждом телефонном разговоре и минус к доверию."),
  li("**Транслитерация наугад.** «kviti», «kvity», «cvety» — три написания одного и того же. Выберите одно и зафиксируйте везде: на сайте, на визитках, в рекламе."),
  li("**Чужой бренд в названии.** «apple-service-kiev» отберут по жалобе правообладателя, и ни один регистратор не защитит."),
  li("**Забытое продление.** Домен не куплен навсегда — это ежегодная аренда. Включайте автопродление и держите деньги на карте."),
  li("**Регистрация на подрядчика.** Самая дорогая ошибка, и о ней — отдельно ниже."),

  p("**Домен должен быть зарегистрирован на вас, а не на студию, фрилансера или «того парня, который делал сайт».** Владелец аккаунта у регистратора и есть владелец адреса; всё остальное — кто платил, кто настраивал, что написано в переписке — вторично. Мы в Code-Site.Art регистрируем домен на клиента как часть пакета «под ключ»: аккаунт у регистратора оформляется на ваши данные, доступы передаём вместе с сайтом. Это не жест доброй воли, а нормальная практика — просто так делают далеко не все, и поэтому истории «подрядчик исчез вместе с доменом» случаются до сих пор каждый месяц."),

  cta(
    "Сделаем сайт под ключ — вместе с доменом",
    "Регистрируем домен на вас, настраиваем DNS, почту и SSL, передаём все доступы. Лендинг от $800, корпоративный сайт от $2 500.",
    "Обсудить проект",
    "/ru/landing"
  ),

  p("Если вы на этапе «есть идея, нужен сайт» — домен это первый шаг, но не самый дорогой. Посчитать весь проект можно на странице [цен](/ru/pricing), а если нужен не одностраничник, а структура с разделами — смотрите [корпоративный сайт](/ru/corporate-site)."),
];

const faqRu = [
  {
    q: "Сколько стоит домен в год?",
    a: "Для бизнеса в Украине реальные цифры такие: .com.ua — примерно $8–12 в год, .com — $12–15, .art — $15–20, .ua — $25–40 и только при наличии свидетельства на торговую марку. Это ежегодный платёж: домен не покупают навсегда, его арендуют.",
  },
  {
    q: "Можно ли перенести домен на другой хостинг?",
    a: "Да, это штатная процедура. Домен и хостинг не связаны: чтобы переехать на другой сервер, достаточно изменить DNS-записи домена. Сам домен тоже можно перенести к другому регистратору — по коду трансфера, обычно за несколько дней.",
  },
  {
    q: "Что будет, если не продлить домен вовремя?",
    a: "Сначала сайт и почта на этом домене просто перестанут работать. Затем домен проходит льготный период (обычно около 30 дней), когда его ещё можно восстановить с доплатой. После этого адрес освобождается, и зарегистрировать его может любой желающий.",
  },
  {
    q: "На кого нужно регистрировать домен?",
    a: "На владельца бизнеса — физлицо или компанию. Тот, на чьи данные оформлен аккаунт у регистратора, и является владельцем домена. Если домен зарегистрирован на подрядчика, вы фактически арендуете у него собственный адрес, даже если сами за него платите.",
  },
];

/* ─────────────────────────── EN ─────────────────────────── */

const bodyEn = [
  tldr("Domain names in short", [
    "A domain is the address people type into a browser: code-site.art or bbc.co.uk.",
    "Domain and hosting are two separate services: the address, and the place your files live.",
    "For most businesses the sensible choice is .com or a local zone, roughly $10–15 a year.",
    "You rent a domain, you do not buy it forever — miss the renewal and someone else can take it.",
    "Register the domain in the business owner's name, never in the agency's.",
  ]),

  p("**A domain name is the address of a website** — what a person types into a browser instead of the server's numeric IP address: code-site.art, bbc.co.uk, google.com. Technically it is a record in the global DNS system that tells the browser which server to ask for your site. In practice it is the name people remember, repeat over the phone and type from a business card."),

  p("A domain stores nothing and makes nothing faster; it only points the way. You register it separately from the site itself, through a registrar, for at least a year, and you renew it every year. It is usually the cheapest line in a project budget and, one or two years later, the most common source of trouble."),

  h2("In plain words: a domain is the address, not the premises"),
  p("Think of a coffee shop. Hosting is the premises: walls, power, floor space you pay for monthly. The domain is the address on the sign — «12 High Street». The address does not brew coffee and takes up no space, but without it nobody finds the door."),
  p("Two consequences follow, and they are the ones people mix up. You can keep the address and change the premises: moving to a faster server takes hours and visitors never notice. And you can keep the premises and change the address. Domain and hosting live apart because they are different things with different invoices."),

  h2("What a domain name is made of"),
  p("A domain name reads right to left, from general to specific. code-site.art has two parts; blog.code-site.art has three:"),
  li("**The domain zone (TLD)** — everything after the last dot: .art, .com, .co.uk, .ua. It is the top level, run by a zone registry rather than by you."),
  li("**The second-level domain** — your actual name: code-site. This is what you choose, register and pay for, and what people mean by «buying a domain»."),
  li("**Subdomains (third level)** — blog.code-site.art, shop.code-site.art. Subdomains are free: once you own the second-level name, you create as many as you like in your DNS settings."),
  p("www is a special case — technically a subdomain too, just a historic one. Modern sites work with and without it, but one version must be the primary and the other must redirect to it. Otherwise search engines see two copies of the same site at two addresses."),

  h2("Domain zones: which one to pick"),
  p("A zone is not just an ending; it signals who you sell to and where you operate. Typical options with rough registrar prices per year:"),
  table(
    ["Zone", "Who it suits", "Approx. price per year"],
    [
      [".com", "International businesses and anything export-facing. The most neutral zone in the world.", "$12–15"],
      [".com.ua", "Companies trading inside Ukraine. Cheap, well understood, no paperwork.", "$8–12"],
      [".ua", "Ukrainian companies holding a registered trademark — no trademark certificate, no .ua domain.", "$25–40"],
      [".art", "Studios, design and creative or portfolio projects. Short and memorable.", "$15–20"],
      ["Country zones (.co.uk, .de, .pl)", "Businesses selling in one specific national market.", "$8–20"],
    ]
  ),
  p("The rule of thumb: sell in one country, take that country's zone; sell across borders, take .com. Cheap novelty zones such as .site or .xyz are best avoided for a commercial project — users trust them less, and some mail providers filter messages from them more aggressively."),

  h2("Domain versus hosting"),
  p("This is the single most common confusion among business owners, and it costs money. **The domain is the address. Hosting is the server where your files and database actually sit.** Two separate services, often from two different companies, with two invoices and two renewal dates."),
  p("The practical difference: miss a hosting payment and your site goes down, but the address stays yours and everything returns once you pay. Miss a domain payment and the site goes down too — except that after a grace period anyone, competitors included, can register that address. The second case may have no way back. There is more on the other half of the pair in our guide to [what hosting is](/en/blog/what-is-hosting)."),

  h2("How to choose a domain for a business"),
  p("You choose a domain once and live with it: changing the address two years in means losing part of your search rankings and every link anyone ever pointed at you. A short checklist:"),
  num("**Keep it short.** Under 15 characters. Domains get dictated over the phone; long ones do not survive that."),
  num("**Make it unambiguous when spoken.** If you have to add «with a hyphen» or «double s», pick another name."),
  num("**Favour brand over keywords.** «buy-windows-london» reads as a one-season project. A brand name ages far better."),
  num("**Check social handles.** Make sure the same handle is free on Instagram and Facebook, or your brand splits into several names."),
  num("**Avoid other people's trademarks.** A domain carrying a known brand will be taken from you, and nobody refunds the registration."),
  num("**Check the history.** Second-hand domains sometimes carry old spam and penalties. Search the address before you buy."),

  h2("Common mistakes"),
  li("**Hyphens and digits.** Every hyphen is one more clarification in every phone call and a small dent in trust."),
  li("**Inconsistent spelling.** Pick one spelling of your name and lock it everywhere — site, cards, ads — instead of running two variants."),
  li("**Someone else's brand in the name.** A complaint from the rights holder is enough; no registrar will defend you."),
  li("**Forgotten renewal.** A domain is an annual rental, not a purchase. Turn on auto-renew and keep a valid card on file."),
  li("**Registering it in the agency's name.** The most expensive mistake of the list — see below."),

  p("**The domain must be registered in your name, not your agency's, not a freelancer's, not «the guy who built the site».** Whoever owns the registrar account owns the address; who paid and who configured it are secondary. At Code-Site.Art we register the domain in the client's name as part of the turnkey package: the registrar account carries your details, and the credentials are handed over with the site. That is not generosity, it is simply how it should work — and because plenty of studios still do it the other way, «the contractor disappeared along with our domain» remains a monthly story."),

  cta(
    "A turnkey website, domain included",
    "We register the domain in your name, set up DNS, email and SSL, and hand over every credential. Landing page from $800, corporate site from $3,500 — European quality at sensible rates.",
    "Discuss your project",
    "/en/landing"
  ),

  p("If you are at the «we have an idea, we need a site» stage, the domain is the first step and by far the cheapest one. You can price the whole project on our [pricing page](/en/pricing), and if you need a structured site rather than a single page, look at [corporate websites](/en/corporate-site)."),
];

const faqEn = [
  {
    q: "How much does a domain cost per year?",
    a: "Roughly $12–15 a year for a .com, $8–12 for .com.ua, $15–20 for .art, and $25–40 for a .ua, which also requires a registered trademark. It is a recurring annual fee — you rent a domain rather than buy it outright.",
  },
  {
    q: "Can I move a domain to a different host?",
    a: "Yes, and it is a routine job. Domain and hosting are independent: to move to another server you simply change the domain's DNS records. The domain itself can also be transferred to a different registrar using a transfer code, usually within a few days.",
  },
  {
    q: "What happens if I forget to renew my domain?",
    a: "First the site and any email on that domain stop working. The domain then enters a grace period, typically around 30 days, during which you can still restore it for an extra fee. After that the address is released and anyone can register it.",
  },
  {
    q: "Whose name should the domain be registered in?",
    a: "The business owner's — an individual or the company itself. Whoever's details are on the registrar account is the legal holder of the domain. If it sits in a contractor's account, you are effectively renting your own address from them even though you pay for it.",
  },
];

/* ─────────────────────────── DOC ─────────────────────────── */

const faqPairs = faqUk.map((item, i) => ({
  _key: key(),
  _type: "faqItem",
  question: { _type: "localizedString", uk: item.q, ru: faqRu[i].q, en: faqEn[i].q },
  answer: { _type: "localizedText", uk: item.a, ru: faqRu[i].a, en: faqEn[i].a },
}));

const doc = {
  _id: "glos2026-shcho-take-domen",
  _type: "blogPost",
  status: "published",
  publishedAt: NOW,
  updatedAt: NOW,
  readingTimeMinutes: 6,
  category: { _type: "reference", _ref: "65de7a1a-bfde-4e47-ab70-7e0ecf161f0a" },
  author: AUTHOR,
  slugs: {
    uk: { _type: "slug", current: "shcho-take-domen" },
    ru: { _type: "slug", current: "chto-takoe-domen" },
    en: { _type: "slug", current: "what-is-a-domain" },
  },
  title: {
    _type: "localizedString",
    uk: "Домен — що це і як обрати домен для сайту",
    ru: "Домен — что это и как выбрать домен для сайта",
    en: "What Is a Domain Name and How to Choose One",
  },
  metaTitle: {
    _type: "localizedString",
    uk: "Домен це що таке — як обрати домен для сайту",
    ru: "Домен это что такое и как выбрать домен сайта",
    en: "What Is a Domain Name and How to Choose One",
  },
  metaDescription: {
    _type: "localizedString",
    uk: "➤ Домен — це адреса сайту в інтернеті ✔️ з чого складається ім’я ✔️ зони .ua, .com.ua, .com і ціни ✔️ чим домен відрізняється від хостингу ➡ як обрати без помилок",
    ru: "➤ Домен — это адрес сайта в интернете ✔️ из чего состоит имя ✔️ зоны .ua, .com.ua, .com и цены ✔️ чем домен отличается от хостинга ➡ как выбрать без ошибок",
    en: "➤ A domain is your website address ✔️ how a domain name is built ✔️ zones and prices ✔️ domain vs hosting ➡ how to choose one you will not regret",
  },
  eyebrow: {
    _type: "localizedString",
    uk: "Словник",
    ru: "Словарь",
    en: "Glossary",
  },
  lede: {
    _type: "localizedString",
    uk: "Домен — це адреса сайту, за якою вас знаходять. Розбираємо, з чого складається доменне ім’я, які зони обрати бізнесу, чим домен відрізняється від хостингу і чому реєструвати його треба на себе.",
    ru: "Домен — это адрес сайта, по которому вас находят. Разбираем, из чего состоит доменное имя, какие зоны выбрать бизнесу, чем домен отличается от хостинга и почему регистрировать его нужно на себя.",
    en: "A domain is the address people use to find you. What a domain name is made of, which zones suit which businesses, how domains differ from hosting, and why the name on the registrar account must be yours.",
  },
  tags: ["домен", "словник", "хостинг", "сайт для бізнесу"],
  relatedPostSlugs: ["shcho-take-hosting", "vartist-rozrobky-saytu-2026", "yak-pratsyuye-admin-panel-saytu"],
  body: { uk: bodyUk, ru: bodyRu, en: bodyEn },
  faq: faqPairs,
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
