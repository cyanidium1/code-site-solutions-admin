/**
 * Кейсы → keyword-rich SEO (август 2026).
 *
 * Проблема: seo.title у кейсов был «{Client} — кейс | Code-Site.Art» (ноль ключей),
 * а описания — обрезанные дампы metricsLine. Патчим на формулу
 * «{нишевый запрос} — кейс {Client}» + чистые описания 120–160 символов.
 * Ключи взяты из Ahrefs-исследования (scripts/blog-longtail-2026-08/_KEYWORDS.md).
 *
 * Usage: node scripts/case-seo-2026-08/patch-case-seo.mjs --dry-run
 *        node scripts/case-seo-2026-08/patch-case-seo.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
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
  projectId: "4lk0x7o9",
  dataset: "production",
  apiVersion: "2024-10-01",
  token: TOKEN,
  useCdn: false,
});

const L = (uk, ru, en) => ({ _type: "localizedString", uk, ru, en });

/** slug → новые seo.title / seo.description */
const PATCHES = {
  "raul-avto": {
    title: L(
      "Сайт для пригону авто зі США — кейс Raul Avto",
      "Сайт для пригона авто из США — кейс Raul Avto",
      "US Car Import Company Website — Raul Avto Case",
    ),
    description: L(
      "➤ Розробка сайту для компанії з пригону авто зі США під ключ ✔️ Калькулятор вартості з розмитненням ✔️ 3 мови ✔️ SEO-структура ➡ Кейс Code-Site.Art.",
      "➤ Разработка сайта для компании по пригону и доставке авто из США ✔️ Калькулятор стоимости с растаможкой ✔️ 3 языка ✔️ SEO-структура ➡ Кейс Code-Site.Art.",
      "➤ Website for a US car import company ✔️ Landed-cost calculator with customs ✔️ 3 languages ✔️ SEO-ready structure ➡ Full Code-Site.Art case study.",
    ),
  },
  "right-cars": {
    title: L(
      "Сайт автосалону з каталогом 1000+ авто — Right Cars",
      "Сайт автосалона с каталогом 1000+ авто — Right Cars",
      "Car Dealership Website, 1,000+ Listings — Right Cars",
    ),
    description: L(
      "➤ Кастомна платформа для автодилера: каталог 1000+ авто ✔️ 20+ фільтрів пошуку ✔️ Аукціон і особистий кабінет ✔️ Бронювання авто ➡ Кейс Code-Site.Art.",
      "➤ Кастомная платформа для автодилера: каталог 1000+ авто ✔️ 20+ фильтров поиска ✔️ Аукцион и личный кабинет ✔️ Бронирование авто ➡ Кейс Code-Site.Art.",
      "➤ Custom platform for a vehicle dealer ✔️ 1,000+ car catalogue with 20+ filters ✔️ Auction section & user accounts ✔️ Reservations ➡ Code-Site.Art case study.",
    ),
  },
  "efedra-clinic": {
    title: L(
      "Сайт для стоматології: ×3.2 заявок — кейс Efedra",
      "Сайт для стоматологии в Одессе: ×3.2 заявок — Efedra",
      "Dental Clinic Website, 3.2× Inquiries — Efedra Case",
    ),
    description: L(
      "➤ Редизайн сайту стоматологічної клініки в Одесі ✔️ ×3.2 заявок ✔️ LCP 0.8s і Top-3 Google ✔️ Next.js + Sanity CMS ➡ Повний кейс Code-Site.Art з цифрами.",
      "➤ Редизайн сайта стоматологической клиники в Одессе ✔️ ×3.2 заявок ✔️ LCP 0.8s и Top-3 Google ✔️ Next.js + Sanity CMS ➡ Полный кейс Code-Site.Art с цифрами.",
      "➤ Dental clinic website redesign in Odesa ✔️ 3.2× more inquiries ✔️ LCP 0.8s, Top-3 on Google ✔️ Next.js + Sanity CMS ➡ Full Code-Site.Art case with numbers.",
    ),
  },
  "e-fedra-beauty": {
    title: L(
      "Сайт для клініки косметології — кейс E-Fedra Beauty",
      "Сайт клиники косметологии — кейс E-Fedra Beauty",
      "Aesthetic Medicine Clinic Website — E-Fedra Beauty",
    ),
    description: L(
      "➤ Розробка сайту для клініки естетичної медицини та косметології ✔️ Структурований прайс ✔️ Запис на процедури ✔️ SEO-блог ➡ Кейс Code-Site.Art.",
      "➤ Разработка сайта для клиники эстетической медицины и косметологии ✔️ Структурированный прайс ✔️ Запись на процедуры ✔️ SEO-блог ➡ Кейс Code-Site.Art.",
      "➤ Website for an aesthetic medicine & cosmetology clinic ✔️ Structured price list ✔️ Procedure booking ✔️ SEO blog ➡ Full Code-Site.Art case study.",
    ),
  },
  "boulevard-salon": {
    title: L(
      "Сайт для салону краси з онлайн-записом — Boulevard",
      "Сайт салона красоты с онлайн-записью — Boulevard",
      "Beauty Salon Website with Online Booking — Boulevard",
    ),
    description: L(
      "➤ Розробка сайту для салону краси ✔️ Онлайн-запис на процедури ✔️ 10+ категорій послуг з прайсом ✔️ Структура залучення клієнтів ➡ Кейс Code-Site.Art.",
      "➤ Разработка сайта для салона красоты ✔️ Онлайн-запись на процедуры ✔️ 10+ категорий услуг с прайсом ✔️ Структура привлечения клиентов ➡ Кейс Code-Site.Art.",
      "➤ Beauty salon website ✔️ Online booking for procedures ✔️ 10+ service categories with pricing ✔️ Client-acquisition structure ➡ Code-Site.Art case study.",
    ),
  },
  "aleko-course": {
    title: L(
      "Сайт для продажу онлайн-курсу — кейс Aleko Course",
      "Сайт для продажи онлайн-курса — кейс Aleko Course",
      "Online Course Sales Website — Aleko Course Case",
    ),
    description: L(
      "➤ Сайт для продажу онлайн-курсу блогера з аудиторією 1.3M ✔️ ×2.4 переходів до оплати ✔️ 48 відеоуроків ✔️ 3 тарифи з онлайн-оплатою ➡ Кейс Code-Site.Art.",
      "➤ Сайт для продажи онлайн-курса блогера с аудиторией 1.3M ✔️ ×2.4 переходов к оплате ✔️ 48 видеоуроков ✔️ 3 тарифа с онлайн-оплатой ➡ Кейс Code-Site.Art.",
      "➤ Course sales website for a creator with a 1.3M audience ✔️ 2.4× more checkout clicks ✔️ 48 video lessons ✔️ 3 tiers with online payment ➡ Full case study.",
    ),
  },
  domlivo: {
    title: L(
      "Сайт нерухомості з каталогом і фільтрами — Domlivo",
      "Сайт недвижимости с каталогом и фильтрами — Domlivo",
      "Real Estate Platform Website for Albania — Domlivo",
    ),
    description: L(
      "➤ Платформа нерухомості: купівля, оренда, подобово ✔️ Каталог з 11 фільтрами й картою ✔️ 5 мов і валюти ✔️ Сценарій для агентів ➡ Кейс Code-Site.Art.",
      "➤ Платформа недвижимости: покупка, аренда, посуточно ✔️ Каталог с 11 фильтрами и картой ✔️ 5 языков и валюты ✔️ Сценарий для агентов ➡ Кейс Code-Site.Art.",
      "➤ Property platform: buy, rent & short-lets ✔️ Catalogue with 11 filters and map ✔️ 5 languages with currencies ✔️ Agent submission flow ➡ Full case study.",
    ),
  },
  "rich-tour": {
    title: L(
      "Сайт для турагентства з кабінетом агентів — Rich Tour",
      "Сайт турагентства с кабинетом агентов — Rich Tour",
      "Travel Agency Website with Agent Portal — Rich Tour",
    ),
    description: L(
      "➤ Розробка сайту для туристичної агенції ✔️ Каталог турів з пошуком за країною та місяцем ✔️ Кабінет агентів і CRM ✔️ SMART-тури ➡ Кейс Code-Site.Art.",
      "➤ Разработка сайта для турагентства ✔️ Каталог туров с поиском по стране и месяцу ✔️ Кабинет агентов и CRM ✔️ SMART-туры ➡ Кейс Code-Site.Art.",
      "➤ Travel agency website ✔️ Tour catalogue with country & month search ✔️ Agent portal and CRM for enquiries ✔️ Corporate travel tracks ➡ Full case study.",
    ),
  },
  grontland: {
    title: L(
      "Сайт будівельної компанії в Данії — Grønt Land DK",
      "Сайт строительной компании в Дании — Grønt Land DK",
      "Renovation Company Website in Copenhagen — Grønt Land",
    ),
    description: L(
      "➤ Розробка сайту для ремонтно-будівельної компанії в Копенгагені ✔️ 8 послуг і 6 проєктів ✔️ Данське SEO ✔️ Заявки з фото в Telegram ➡ Кейс Code-Site.Art.",
      "➤ Разработка сайта для ремонтно-строительной компании в Копенгагене ✔️ 8 услуг и 6 проектов ✔️ Датское SEO ✔️ Заявки с фото в Telegram ➡ Кейс Code-Site.Art.",
      "➤ Website for a renovation & construction firm in Copenhagen ✔️ 8 services, 6 projects ✔️ Danish SEO ✔️ Photo enquiries straight to Telegram ➡ Full case study.",
    ),
  },
  "nbyg-kobenhavn": {
    title: L(
      "Сайт будівельної компанії: 300+ заявок — кейс NBYG",
      "Сайт строительной компании: 300+ заявок — кейс NBYG",
      "Construction Website, 300+ Enquiries a Year — NBYG",
    ),
    description: L(
      "➤ Сайт для будівельної компанії в Данії ✔️ 300+ заявок за перший рік ✔️ 302 000 показів у Google ✔️ Дві мови EN/DA і галерея проєктів ➡ Кейс Code-Site.Art.",
      "➤ Сайт для строительной компании в Дании ✔️ 300+ заявок за первый год ✔️ 302 000 показов в Google ✔️ Два языка EN/DA и галерея проектов ➡ Кейс Code-Site.Art.",
      "➤ Construction company website in Denmark ✔️ 300+ enquiries in year one ✔️ 302,000 Google impressions ✔️ Bilingual EN/DA with project gallery ➡ Full case study.",
    ),
  },
  "solide-renovation": {
    title: L(
      "Сайт для ремонту квартир під ключ — кейс Solide",
      "Сайт для ремонта квартир под ключ — кейс Solide",
      "Turnkey Renovation Company Website — Solide Case",
    ),
    description: L(
      "➤ Сайт для компанії з дизайнерського ремонту під ключ ✔️ Калькулятор оцінки ремонту ✔️ 13+ напрямів послуг ✔️ 3 мови й локальне SEO ➡ Кейс Code-Site.Art.",
      "➤ Сайт для компании по дизайнерскому ремонту под ключ ✔️ Калькулятор оценки ремонта ✔️ 13+ направлений услуг ✔️ 3 языка и локальное SEO ➡ Кейс Code-Site.Art.",
      "➤ Designer-led turnkey renovation website ✔️ Renovation estimate calculator ✔️ 13+ service lines ✔️ 3 languages, local SEO structure ➡ Full case study.",
    ),
  },
  "mono-pools": {
    title: L(
      "Сайт виробника басейнів: Top-1 Google — Mono Pools",
      "Сайт производителя бассейнов: Top-1 Google — Mono Pools",
      "Pool Manufacturer Website Ranking Top-1 — Mono Pools",
    ),
    description: L(
      "➤ Сайт для виробника композитних басейнів ✔️ Top-1/Top-2 Google за ~2 місяці ✔️ Каталог, доставка, блог ✔️ Кастомний Next.js без плагінів ➡ Кейс Code-Site.Art.",
      "➤ Сайт для производителя композитных бассейнов ✔️ Top-1/Top-2 Google за ~2 месяца ✔️ Каталог, доставка, блог ✔️ Кастомный Next.js без плагинов ➡ Кейс Code-Site.Art.",
      "➤ Composite pool manufacturer website ✔️ Top-1/Top-2 on Google in ~2 months ✔️ Catalogue, delivery, blog ✔️ Custom Next.js, zero paid plugins ➡ Full case study.",
    ),
  },
  icelab: {
    title: L(
      "Інтернет-магазин: позиція 2 в Google — кейс IceLab",
      "Интернет-магазин: позиция 2 в Google — кейс IceLab",
      "Online Store Ranking #2 on Google — IceLab Case",
    ),
    description: L(
      "➤ Інтернет-магазин сухого льоду під ключ ✔️ Позиція 2.1 за комерційним запитом ✔️ 267 переходів і CTR 6% за 3 місяці ✔️ 10 локальних SEO-сторінок ➡ Кейс.",
      "➤ Интернет-магазин сухого льда под ключ ✔️ Позиция 2.1 по коммерческому запросу ✔️ 267 переходов и CTR 6% за 3 месяца ✔️ 10 локальных SEO-страниц ➡ Кейс.",
      "➤ Dry ice online store built from scratch ✔️ Position 2.1 on a commercial query ✔️ 267 clicks at 6% CTR in 3 months ✔️ 10 local SEO pages ➡ Full case study.",
    ),
  },
  glimmer: {
    title: L(
      "Інтернет-магазин книг: окупність за тиждень — Glimmer",
      "Интернет-магазин книг: окупаемость за неделю — Glimmer",
      "Book Store Website That Paid Back in a Week — Glimmer",
    ),
    description: L(
      "➤ Інтернет-магазин видавництва книг ✔️ Окупність за ~1 тиждень після запуску ✔️ Каталог, передзамовлення, акції ✔️ 0 зайвих кроків до покупки ➡ Кейс.",
      "➤ Интернет-магазин книжного издательства ✔️ Окупаемость за ~1 неделю после запуска ✔️ Каталог, предзаказы, акции ✔️ 0 лишних шагов до покупки ➡ Кейс.",
      "➤ Publisher's book e-commerce site ✔️ Investment recouped in ~1 week ✔️ Catalogue, pre-orders and deal blocks ✔️ Zero extra steps to purchase ➡ Full case study.",
    ),
  },
  "kondor-device": {
    title: L(
      "Інтернет-магазин ігрових девайсів — Kondor Device",
      "Интернет-магазин игровых девайсов — Kondor Device",
      "Gaming Gear E-commerce Website — Kondor Device Case",
    ),
    description: L(
      "➤ Інтернет-магазин українського бренду ігрових девайсів ✔️ 8 категорій каталогу ✔️ 2 кліки до замовлення ✔️ Продажі зросли після запуску ➡ Кейс Code-Site.Art.",
      "➤ Интернет-магазин украинского бренда игровых девайсов ✔️ 8 категорий каталога ✔️ 2 клика до заказа ✔️ Рост продаж после запуска ➡ Кейс Code-Site.Art.",
      "➤ E-commerce site for a Ukrainian gaming-peripherals brand ✔️ 8 catalogue categories ✔️ 2 clicks to order ✔️ Sales up after launch ➡ Full Code-Site.Art case.",
    ),
  },
  "le-muse-nature": {
    title: L(
      "Інтернет-магазин косметики — кейс Le'Muse Nature",
      "Интернет-магазин косметики — кейс Le'Muse Nature",
      "Cosmetics Brand E-commerce Website — Le'Muse Nature",
    ),
    description: L(
      "➤ Інтернет-магазин українського бренду дерматокосметики ✔️ 7 категорій каталогу ✔️ Блоки складу й довіри ✔️ Шлях до покупки без зайвих кроків ➡ Кейс.",
      "➤ Интернет-магазин украинского бренда дерматокосметики ✔️ 7 категорий каталога ✔️ Блоки состава и доверия ✔️ Путь к покупке без лишних шагов ➡ Кейс.",
      "➤ E-commerce site for a Ukrainian dermacosmetics brand ✔️ 7 catalogue categories ✔️ Ingredient & trust blocks ✔️ Frictionless path to purchase ➡ Full case.",
    ),
  },
  "oleksandr-sitnikov": {
    title: L(
      "Сайт для юриста й адвокатських курсів — кейс Ситникова",
      "Сайт для юриста и адвокатских курсов — кейс Сытникова",
      "Legal Expert & Law Courses Website — Sytnykov Case",
    ),
    description: L(
      "➤ Сайт для юридичного експерта: послуги, курси, публікації ✔️ Персональний бренд колишнього судді ✔️ 2 мови, Sanity CMS ✔️ SEO під юридичні запити ➡ Кейс.",
      "➤ Сайт для юридического эксперта: услуги, курсы, публикации ✔️ Персональный бренд бывшего судьи ✔️ 2 языка, Sanity CMS ✔️ SEO под юридические запросы ➡ Кейс.",
      "➤ Website for a legal expert: services, courses, publications ✔️ Personal brand of a former judge ✔️ Bilingual, Sanity CMS ✔️ Legal-intent SEO ➡ Full case.",
    ),
  },
  urmodels: {
    title: L(
      "Сайт для модельної агенції — кейс URmodels",
      "Сайт модельного агентства — кейс URmodels",
      "Model Agency Website — URmodels Case Study",
    ),
    description: L(
      "➤ Платформа модельної агенції ✔️ Онлайн-заявка для талантів ✔️ Дві аудиторії: моделі та клієнти ✔️ Структура росту модельної бази ➡ Кейс Code-Site.Art.",
      "➤ Платформа модельного агентства ✔️ Онлайн-заявка для талантов ✔️ Две аудитории: модели и клиенты ✔️ Структура роста модельной базы ➡ Кейс Code-Site.Art.",
      "➤ Model agency platform ✔️ Online talent application ✔️ Dual audience: models and clients ✔️ Structure built to grow the model base ➡ Full case study.",
    ),
  },
  "glenn-garbo": {
    title: L(
      "Сайт музиканта з продажем мерчу — кейс Glenn Garbo",
      "Сайт музыканта с продажей мерча — кейс Glenn Garbo",
      "Artist Website with Merch Store — Glenn Garbo Case",
    ),
    description: L(
      "➤ Сайт музичного проєкту з e-commerce модулем ✔️ Продаж авторської продукції ✔️ CMS для музики, блогу й магазину ✔️ Онлайн-оплата ➡ Кейс Code-Site.Art.",
      "➤ Сайт музыкального проекта с e-commerce модулем ✔️ Продажа авторской продукции ✔️ CMS для музыки, блога и магазина ✔️ Онлайн-оплата ➡ Кейс Code-Site.Art.",
      "➤ Artist website with an e-commerce module ✔️ Direct merch sales ✔️ CMS covering music, blog and store ✔️ Online payments ➡ Full Code-Site.Art case study.",
    ),
  },
  "tatarka-franchise": {
    title: L(
      "Сайт для продажу франшизи — кейс Tatarka Franchise",
      "Сайт для продажи франшизы — кейс Tatarka Franchise",
      "Franchise Sales Website — Tatarka Franchise Case",
    ),
    description: L(
      "➤ Сайт для продажу франшизи ресторанного бренду ✔️ Продаюча структура з цифрами моделі ✔️ Форма партнерських заявок ✔️ Масштабування мережі ➡ Кейс.",
      "➤ Сайт для продажи франшизы ресторанного бренда ✔️ Продающая структура с цифрами модели ✔️ Форма партнёрских заявок ✔️ Масштабирование сети ➡ Кейс.",
      "➤ Restaurant franchise sales website ✔️ Conversion structure with business-model numbers ✔️ Partner lead form ✔️ Built to scale the chain ➡ Full case study.",
    ),
  },
  bravo: {
    title: L(
      "Сайт доставки їжі з дизайном меню — кейс Bravo",
      "Сайт доставки еды с дизайном меню — кейс Bravo",
      "Food Delivery Website & Menu Design — Bravo Case",
    ),
    description: L(
      "➤ Сайт для бренду доставки їжі ✔️ Меню, доставка, акції та блог ✔️ Дизайн меню як окремий напрям ✔️ Короткий шлях до замовлення ➡ Кейс Code-Site.Art.",
      "➤ Сайт для бренда доставки еды ✔️ Меню, доставка, акции и блог ✔️ Дизайн меню как отдельное направление ✔️ Короткий путь к заказу ➡ Кейс Code-Site.Art.",
      "➤ Food delivery brand website ✔️ Menu, delivery, deals and blog ✔️ Menu design as a separate work stream ✔️ Short path to ordering ➡ Full case study.",
    ),
  },
  co2lab: {
    title: L(
      "B2B сайт для промислової компанії — кейс CO2LAB",
      "B2B сайт промышленной компании — кейс CO2LAB",
      "Industrial B2B Company Website — CO2LAB Case Study",
    ),
    description: L(
      "➤ Корпоративний B2B сайт для промислових CO₂-рішень ✔️ Складна інженерія простою мовою ✔️ 4 напрями діяльності ✔️ Залучення партнерів ➡ Кейс Code-Site.Art.",
      "➤ Корпоративный B2B сайт для промышленных CO₂-решений ✔️ Сложная инженерия простым языком ✔️ 4 направления деятельности ✔️ Привлечение партнёров ➡ Кейс.",
      "➤ Corporate B2B site for industrial CO₂ solutions ✔️ Complex engineering explained simply ✔️ 4 activity directions ✔️ Partner acquisition flow ➡ Full case.",
    ),
  },
  "clarion-solutions": {
    title: L(
      "Сайт агенції AI-автоматизації та SEO — кейс Clarion",
      "Сайт агентства AI-автоматизации и SEO — кейс Clarion",
      "AI Automation & Local SEO Agency Website — Clarion",
    ),
    description: L(
      "➤ Сайт для агенції AI-автоматизації та Local SEO ✔️ Інтерактивна AI-демонстрація ✔️ 4 пакети послуг ✔️ Структура генерації B2B-заявок ➡ Кейс Code-Site.Art.",
      "➤ Сайт для агентства AI-автоматизации и Local SEO ✔️ Интерактивная AI-демонстрация ✔️ 4 пакета услуг ✔️ Структура генерации B2B-заявок ➡ Кейс Code-Site.Art.",
      "➤ AI automation & local SEO agency website ✔️ Interactive AI demo block ✔️ 4 service packages ✔️ B2B lead-generation architecture ➡ Full case study.",
    ),
  },
  webbond: {
    title: L(
      "Сайт для digital-агенції — кейс WebBond",
      "Сайт digital-агентства — кейс WebBond",
      "Digital Agency Website — WebBond Case Study",
    ),
    description: L(
      "➤ Корпоративний сайт digital-агенції в Данії ✔️ 4 напрями: сайти, SEO, реклама, брендинг ✔️ Портфоліо і структура заявок ➡ Кейс Code-Site.Art.",
      "➤ Корпоративный сайт digital-агентства в Дании ✔️ 4 направления: сайты, SEO, реклама, брендинг ✔️ Портфолио и структура заявок ➡ Кейс Code-Site.Art.",
      "➤ Corporate website for a Danish digital agency ✔️ Web design, SEO, ads & branding services ✔️ Portfolio and lead-capture structure ➡ Full case study.",
    ),
  },
  "yangoly-hvostykiv": {
    title: L(
      "Сайт благодійного фонду з опікунством — кейс",
      "Сайт благотворительного фонда — кейс Янголи Хвостиків",
      "Charity Foundation Website — Angels of Tails Case",
    ),
    description: L(
      "➤ Сайт благодійного фонду допомоги тваринам ✔️ Онлайн-опікунство через WayForPay ✔️ 29 анкет хвостиків і звітність ✔️ Дві мови ➡ Кейс Code-Site.Art.",
      "➤ Сайт благотворительного фонда помощи животным ✔️ Онлайн-опекунство через WayForPay ✔️ 29 анкет хвостиков и отчётность ✔️ Два языка ➡ Кейс Code-Site.Art.",
      "➤ Charity foundation website for animal welfare ✔️ Online pet guardianship via WayForPay ✔️ 29 pet profiles with public reports ✔️ Bilingual ➡ Full case study.",
    ),
  },
};

async function run() {
  const rows = await client.fetch('*[_type=="caseStudy" && status=="published"]{_id,"slug":slug.current}');
  const bySlug = Object.fromEntries(rows.map((r) => [r.slug, r._id]));
  let patched = 0;
  for (const [slug, p] of Object.entries(PATCHES)) {
    const id = bySlug[slug];
    if (!id) {
      console.warn("SKIP (no such slug):", slug);
      continue;
    }
    for (const loc of ["uk", "ru", "en"]) {
      const t = p.title[loc];
      if (t && t.length > 62) console.warn(`WARN title>${62} [${slug}.${loc}] ${t.length}ch`);
      const d = p.description[loc];
      if (d && (d.length < 100 || d.length > 165)) console.warn(`WARN desc len [${slug}.${loc}] ${d.length}ch`);
    }
    if (DRY) {
      console.log("[dry-run] would patch", slug, "→", id);
    } else {
      await client.patch(id).set({ "seo.title": p.title, "seo.description": p.description }).commit();
      console.log("patched", slug);
    }
    patched++;
  }
  console.log(`${DRY ? "[dry-run] " : ""}total: ${patched}/${Object.keys(PATCHES).length}`);
}
run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
