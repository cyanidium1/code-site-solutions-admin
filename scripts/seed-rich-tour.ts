/**
 * Seed script — Rich Tour travel-agency case study (agent portal + CRM).
 * Section layout mirrors solide-renovation / sytnykov: sec6, sec9,
 * fd187ec9f59b (custom admin + CRM copy), sech.
 *
 * Created as **draft** — flip `status` to `published` in Studio when ready.
 *
 * Run: npm run seed:rich-tour
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

const DOC_ID = "caseStudy.rich-tour";

const HERO = {
  eyebrow: uk("/ CASE STUDY"),
  heading: uk(
    "Rich Tour — сайт туристичної агенції з *особистим кабінетом агентів*",
  ),
  subheading: uk(
    "Rich Tour — туристична агенція, яка організовує автобусні, морські, екскурсійні, SMART-тури та корпоративні поїздки. Ми розробили сайт, який працює не просто як презентація турів, а як повноцінна digital-платформа для клієнтів, агентів і менеджерів. Сайт допомагає користувачам швидко знайти потрібний тур, залишити заявку, а партнерам — працювати через особистий кабінет.",
  ),
  metrics: [
    { _key: "hm1", value: "1", label: uk("особистий кабінет для агентів") },
    { _key: "hm2", value: "1", label: uk("інтеграція з CRM") },
    { _key: "hm3", value: "2", label: uk("типи аудиторії: клієнти та агенти") },
    { _key: "hm4", value: "3", label: uk("напрями продажів на сайті") },
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
    "Для туристичної агенції важливо не просто показати напрямки, а зробити зручну систему для продажу турів. Без каталогу, пошуку та окремого доступу для агентів навіть сильна пропозиція губиться — клієнт порівнює варіанти швидко і очікує оперативної відповіді.",
  ),
  bulletList: [
    uk("Структурувати велику кількість турів і напрямків"),
    uk("Зробити пошук турів зручним для клієнтів"),
    uk("Додати особистий кабінет для агентів"),
    uk("Підключити CRM для обробки заявок"),
    uk("Презентувати окремі напрями: SMART-тури, корпоративне обслуговування, STEP"),
    uk("Спростити шлях користувача від вибору туру до заявки"),
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
  body: richParas([
    "Ми розробили сайт для Rich Tour як туристичну платформу з каталогом, фільтрами, особистим кабінетом агентів і підключенням до CRM.",
    "На головній сторінці користувач одразу може перейти до пошуку туру за країною та місяцем. Далі сайт веде його через категорії, напрямки, переваги, відгуки, FAQ і форму звернення. Окремо реалізували особистий кабінет для агентів — сайт працює не тільки для кінцевих клієнтів, а й для партнерів, які продають тури.",
  ]),
  bulletList: [
    uk("Каталог турів з категоріями"),
    uk("Пошук за країною та місяцем"),
    uk("Особистий кабінет для агентів"),
    uk("Підключення CRM для заявок"),
    uk("Сторінку SMART-турів"),
    uk("Сторінку корпоративного обслуговування"),
    uk("FAQ з відповідями на часті питання туристів"),
    uk("Форми звернення для клієнтів"),
    uk("Адаптивну версію для мобільних пристроїв"),
    uk("Адмінку для керування контентом і турами"),
  ],
};

const CMS_SECTION = {
  _type: "imageTextBlock" as const,
  _key: "fd187ec9f59b",
  variant: "side-with-list",
  imageVariant: "imageRight",
  bulletIcon: "check",
  eyebrow: uk("/ CMS"),
  heading: uk("Адмін-панель і CRM для керування *заявками*"),
  body: richPara(
    "Для проєкту реалізували адмін-панель, щоб команда Rich Tour могла самостійно оновлювати тури, категорії, тексти, відгуки, FAQ та інші розділи сайту. Підключення CRM допомагає не губити заявки та швидше передавати їх менеджерам. Це особливо важливо для туристичного бізнесу, де клієнт часто обирає тур швидко, порівнює кілька варіантів і очікує оперативної відповіді. Особистий кабінет агентів робить сайт зручним не тільки для клієнтів, а й для партнерів, які працюють з турами через систему.",
  ),
  bulletList: [
    uk("Оновлювати тури, категорії, тексти, відгуки та FAQ"),
    uk("Отримувати заявки в CRM без втрат для менеджерів"),
    uk("Давати агентам окремий доступ до потрібної інформації"),
    uk("Швидко реагувати на запити клієнтів"),
  ],
};

const OUTCOME_SECTION = {
  _type: "imageTextBlock" as const,
  _key: "sech",
  variant: "centered",
  centeredLayout: "horizontal",
  eyebrow: uk("/ OUTCOME"),
  heading: uk("Результат"),
  body: richPara(
    "Rich Tour отримали не просто сайт, а повноцінну платформу для продажу турів і роботи з агентами. Користувач може швидко знайти тур, переглянути категорії, ознайомитися з умовами, прочитати FAQ і залишити заявку. Менеджери отримують звернення через CRM, а агенти мають окремий доступ до системи. У результаті сайт допомагає структурувати продажі, спрощує роботу команди та робить процес вибору туру зрозумілішим для клієнтів.",
  ),
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
    `→ Seeding ${DOC_ID} (draft) into ${projectId}/${dataset} (${apiVersion})`,
  );

  const DOC = {
    _id: DOC_ID,
    _type: "caseStudy",
    status: "draft",
    order: 10,
    featured: false,
    slug: { _type: "slug", current: "rich-tour" },

    title: uk("Rich Tour"),
    client: "Rich Tour",
    region: uk("Україна"),
    year: 2025,
    duration: uk("6 тижнів"),
    stack: ["Next.js", "Sanity", "CRM"],
    metricsLine: uk(
      "1 кабінет агентів · 1 CRM · 2 аудиторії · 3 напрями продажів",
    ),

    seo: {
      title: uk(
        "Rich Tour — сайт туристичної агенції з кабінетом агентів і CRM | Code-Site.Art",
      ),
      description: uk(
        "Туристична платформа: каталог турів, пошук за країною та місяцем, кабінет агентів, CRM для заявок, SMART-тури та корпоративні напрями.",
      ),
    },

    hero: HERO,

    sections: [
      CHALLENGE_SECTION,
      SOLUTION_SECTION,
      CMS_SECTION,
      OUTCOME_SECTION,
    ],
  };

  const result = await client.createOrReplace(DOC);

  console.log(`✓ Document ${result._id} written (rev ${result._rev})`);
  console.log(`  Status: draft`);
  console.log(
    `  Sections: ${DOC.sections.map((s) => `${s._type} (${s._key})`).join(", ")}`,
  );
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
