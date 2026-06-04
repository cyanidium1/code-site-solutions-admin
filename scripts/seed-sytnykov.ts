/**
 * Seed script — uploads the Oleksandr Sytnykov case-study into Sanity.
 * Section layout mirrors `solide-renovation` (24ac5799…): hero metrics,
 * CHALLENGE (sec6), SOLUTION (sec9), CMS (fd187ec9f59b), OUTCOME (sech),
 * testimonial quote.
 *
 * Idempotent: `createOrReplace` with fixed `_id`.
 *
 * Run:
 *   npm run seed:sytnykov
 *
 * Images are left empty — add screenshots in Studio, then refresh alts via
 * `translations/caseStudy.sytnykov.json`.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@sanity/client";

function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename);
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

type LocaleString = { uk?: string; en?: string };

function uk(text: string): LocaleString {
  return { uk: text };
}

let keyCounter = 0;
function k(prefix = "k"): string {
  keyCounter += 1;
  return `${prefix}${keyCounter.toString(36)}`;
}

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type PortableBlock = {
  _type: "block";
  _key: string;
  style: "normal";
  markDefs: never[];
  children: Span[];
};

function richPara(text: string): PortableBlock[] {
  return [
    {
      _type: "block",
      _key: k("b"),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: k("s"), text, marks: [] }],
    },
  ];
}

function richParas(texts: string[]): PortableBlock[] {
  return texts.map((text) => ({
    _type: "block",
    _key: k("b"),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: k("s"), text, marks: [] }],
  }));
}

const DOC_ID = "caseStudy.sytnykov";

const HERO = {
  eyebrow: uk("/ CASE STUDY"),
  heading: uk(
    "Олександр Ситников — сайт для юридичного експерта та *адвокатських курсів*",
  ),
  subheading: uk(
    "Олександр Ситников — колишній суддя високої інстанції, адвокат і викладач, який проводить навчальні програми для юристів та адвокатів. Ми розробили сайт персонального бренду, який підкреслює його професійний статус, презентує адвокатські курси та допомагає користувачам швидко перейти до заявки.",
  ),
  link: {
    _type: "ctaAction" as const,
    label: uk("Переглянути сайт"),
    href: "https://sitnikov.com.ua",
    openInNewTab: true,
  },
  metrics: [
    {
      _key: "hm1",
      value: "2",
      label: uk("мовні версії сайту"),
    },
    {
      _key: "hm2",
      value: "1",
      label: uk("зручна адмін-панель"),
    },
    {
      _key: "hm3",
      value: "5+",
      label: uk("основних розділів"),
    },
    {
      _key: "hm4",
      value: "3",
      label: uk("напрями: курси, послуги, публікації"),
    },
  ],
};

const CHALLENGE_SECTION = {
  _type: "imageTextBlock" as const,
  _key: "sec6",
  variant: "side-with-list",
  imageVariant: "imageRight",
  bulletIcon: "cross",
  eyebrow: uk("/ CHALLENGE"),
  heading: uk("Що *було*"),
  body: richPara(
    "У цьому проєкті потрібно було продати не просто юридичні послуги, а довіру до експерта з сильним професійним бекграундом. Клієнт і студент оцінюють досвід, статус і структуру матеріалів до першого звернення — без правильної архітектури навіть сильний фахівець залишається невидимим у пошуку.",
  ),
  bulletList: [
    uk("Презентувати адвокатські курси як експертний продукт, а не додаток до біографії"),
    uk("Структурувати послуги, публікації та навчальні матеріали в одній логіці"),
    uk("Реалізувати 2 мовні версії сайту з коректною SEO-архітектурою"),
    uk("Додати адмінку для самостійного оновлення контенту без розробника"),
    uk("Закласти SEO-структуру під юридичні та освітні запити"),
    uk("Дати короткий шлях від інтересу до заявки на консультацію або навчання"),
  ],
};

const SOLUTION_SECTION = {
  _type: "imageTextBlock" as const,
  _key: "sec9",
  variant: "side-with-list",
  imageVariant: "imageLeft",
  bulletIcon: "check",
  eyebrow: uk("/ SOLUTION"),
  heading: uk("Що ми *зробили*"),
  body: richPara(
    "Ми побудували сайт навколо персонального бренду Олександра Ситникова: його досвіду, статусу, юридичної експертизи та навчальних програм. Кожен блок виконує свою задачу: показати експертність, пояснити послуги та курси, провести користувача до заявки.",
  ),
  bulletList: [
    uk("Структуру сайту під юридичну нішу та персональний бренд"),
    uk("Сторінки для досвіду, послуг, курсів, публікацій і контактів"),
    uk("2 мовні версії сайту"),
    uk("SEO-пропрацювання сторінок під юридичні та освітні запити"),
    uk("Зручну адмін-панель Sanity CMS"),
    uk("Можливість додавати нові статті та курси"),
    uk("Анімації для сучаснішої подачі"),
    uk("Адаптивну версію для мобільних пристроїв"),
    uk("CTA для заявок на консультацію або навчання"),
  ],
};

const CMS_SECTION = {
  _type: "imageTextBlock" as const,
  _key: "fd187ec9f59b",
  variant: "side-with-list",
  imageVariant: "imageRight",
  bulletIcon: "check",
  eyebrow: uk("/ CMS"),
  heading: uk("*Зручна адмін-панель* для контенту на сайті"),
  body: richParas([
    "Ми налаштували адмін-панель Sanity CMS, яку клієнт може вести самостійно без постійних звернень до розробника. Інтерфейс зручний з телефона — зміни робляться швидко: оновити текст, додати статтю, курс або змінити порядок блоків.",
    "В адмінці можна:",
  ]),
  bulletList: [
    uk("Редагувати тексти, заголовки та кнопки"),
    uk("Змінювати зображення та додавати нові фото"),
    uk("Змінювати порядок елементів через drag & drop"),
    uk("Редагувати SEO-поля для сторінок"),
    uk("Керувати послугами, курсами, статтями, публікаціями та відгуками"),
    uk("Керувати тільки потрібними розділами без ризику зламати дизайн сайту"),
    uk("Працювати з адмінкою навіть з телефону"),
  ],
};

const OUTCOME_SECTION = {
  _type: "imageTextBlock" as const,
  _key: "sech",
  variant: "centered",
  centeredLayout: "horizontal",
  eyebrow: uk("/ OUTCOME"),
  heading: uk("Результат"),
  body: richParas([
    "Олександр Ситников отримав сайт, який працює як платформа персонального бренду, юридичних послуг і адвокатських курсів.",
    "Сайт підкреслює його статус колишнього судді, показує експертність, презентує навчальні програми та веде користувача до заявки. Двомовна структура й SEO заклали основу для зростання органічного трафіку по юридичних і освітніх запитах.",
  ]),
};

const QUOTE_SECTION = {
  _type: "quoteBlock" as const,
  _key: k("sec"),
  quote: uk(
    "За 6 місяців після запуску сайту я отримав більше клієнтів, ніж за попередні 2 роки. Окрема воронка під курси стала окремим бізнесом.",
  ),
  authorName: "Олександр Ситников",
  authorRole: uk("Колишній суддя високої інстанції, адвокат і викладач"),
};

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const apiVersion =
    process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId) {
    console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
    process.exit(1);
  }
  if (!token) {
    console.error("✗ Missing SANITY_API_TOKEN");
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  console.log(
    `→ Seeding ${DOC_ID} into ${projectId}/${dataset} (${apiVersion})`,
  );

  const DOC = {
    _id: DOC_ID,
    _type: "caseStudy",
    status: "published",
    order: 2,
    featured: true,
    slug: { _type: "slug", current: "sytnykov" },

    title: uk("Олександр Ситников"),
    client: "Oleksandr Sytnykov",
    region: uk("Київ, Україна"),
    year: 2024,
    duration: uk("8 тижнів"),
    stack: ["Next.js", "Sanity", "Vercel"],
    metricsLine: uk(
      "2 мовні версії · 1 адмін-панель · 5+ розділів · 3 напрями: курси, послуги, публікації",
    ),

    seo: {
      title: uk(
        "Олександр Ситников — сайт юридичного експерта та адвокатських курсів | Code-Site.Art",
      ),
      description: uk(
        "Персональний бренд колишнього судді: курси, послуги, публікації, 2 мови, Sanity CMS і SEO під юридичні та освітні запити.",
      ),
    },

    hero: HERO,

    sections: [
      CHALLENGE_SECTION,
      SOLUTION_SECTION,
      CMS_SECTION,
      OUTCOME_SECTION,
      QUOTE_SECTION,
    ],
  };

  const result = await client.createOrReplace(DOC);

  console.log(`✓ Document ${result._id} written (rev ${result._rev})`);
  console.log(`  Sections: ${DOC.sections.map((s) => `${s._type} (${s._key})`).join(", ")}`);
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
