/**
 * Seed script — uploads the Efedra Clinic case-study content into Sanity
 * as a single `caseStudy` document. Mirrors the previously hardcoded page
 * at `src/app/portfolio/efedra-clinic/page.tsx` 1:1.
 *
 * Idempotent: uses `createOrReplace` with a fixed `_id`.
 *
 * Required env (loaded from .env.local automatically):
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - NEXT_PUBLIC_SANITY_DATASET (defaults to "production")
 *   - SANITY_API_TOKEN          (write-access token)
 *
 * Run:
 *   npm run seed:efedra-clinic
 *
 * NOTE: Efedra is UA-only (no EN translation). Hardcoded inconsistency
 * "WordPress (hero) vs Tilda 2021 (Challenge body)" preserved as-is —
 * marketer to fix in Studio after migration.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@sanity/client";

/* ──────────────────────────── env loader ──────────────────────────────── */

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

/* ──────────────────────────── helpers ─────────────────────────────────── */

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

function imageRef(assetId: string) {
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: assetId },
  };
}

function imageWithAlt(assetId: string, altUk: string) {
  return {
    image: imageRef(assetId),
    alt: { uk: altUk },
  };
}

/* ────────────────────────── runner ────────────────────────────────────── */

type SanityClient = ReturnType<typeof createClient>;

async function uploadLocalImage(
  client: SanityClient,
  relPath: string,
  label: string,
): Promise<string> {
  const path = join(process.cwd(), "public", relPath);
  if (!existsSync(path)) {
    throw new Error(`Local image not found: ${path}`);
  }
  const buf = readFileSync(path);
  const lower = relPath.toLowerCase();
  const ext = lower.endsWith(".png") ? "png" : "jpg";
  const contentType = ext === "png" ? "image/png" : "image/jpeg";
  const asset = await client.assets.upload("image", buf, {
    filename: `${label}.${ext}`,
    contentType,
  });
  return asset._id;
}

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
    `→ Seeding caseStudy.efedra-clinic into ${projectId}/${dataset} (${apiVersion})`,
  );

  console.log(`→ Uploading 6 case screenshots…`);
  const [
    beforeId,
    afterId,
    g1Id,
    g2Id,
    mobileId,
    adminId,
  ] = await Promise.all([
    uploadLocalImage(
      client,
      "EfedraCaseCreenshots/efedra-main-before.jpg",
      "efedra-main-before",
    ),
    uploadLocalImage(
      client,
      "EfedraCaseCreenshots/efedra-main-after.png",
      "efedra-main-after",
    ),
    uploadLocalImage(
      client,
      "EfedraCaseCreenshots/efedra-main-gallery-1.png",
      "efedra-main-gallery-1",
    ),
    uploadLocalImage(
      client,
      "EfedraCaseCreenshots/efedra-gallery-2.png",
      "efedra-gallery-2",
    ),
    uploadLocalImage(
      client,
      "EfedraCaseCreenshots/efedra-mobile.png",
      "efedra-mobile",
    ),
    uploadLocalImage(
      client,
      "EfedraCaseCreenshots/efedra-admin.png",
      "efedra-admin",
    ),
  ]);
  console.log(`  · before: ${beforeId}`);
  console.log(`  · after: ${afterId}`);
  console.log(`  · gallery-1: ${g1Id}`);
  console.log(`  · gallery-2: ${g2Id}`);
  console.log(`  · mobile: ${mobileId}`);
  console.log(`  · admin: ${adminId}`);

  /* hero */
  const HERO = {
    eyebrow: uk("/ CASE STUDY"),
    heading: uk(
      "Efedra Clinic — стоматологія і *студія краси* в Одесі",
    ),
    subheading: uk(
      "Двонапрямкова клініка в Одесі: стоматологія + естетична медицина. Перенесли з застарілого WordPress на Next.js + Sanity з мобільним онлайн-записом і локальним SEO.",
    ),
    metrics: [],
  };

  /* sections[0] — quick-stats bar (4 metrics) */
  const STATS_SECTION = {
    _type: "statsBlock" as const,
    _key: k("sec"),
    items: [
      { _key: k("m"), value: "×3.2", label: uk("більше заявок на місяць") },
      { _key: k("m"), value: "0.8s", label: uk("LCP (було 4.2s)") },
      { _key: k("m"), value: "98", label: uk("Lighthouse performance") },
      { _key: k("m"), value: "Top-3", label: uk("Google по local запитам") },
    ],
  };

  /* sections[1] — / 02 CHALLENGE */
  const CHALLENGE_SECTION = {
    _type: "imageTextBlock" as const,
    _key: k("sec"),
    variant: "side-with-list",
    imageVariant: "imageRight",
    bulletIcon: "cross",
    eyebrow: uk("/ 02 CHALLENGE"),
    heading: uk("З чим *прийшов клієнт*"),
    body: richPara(
      "Клієнт мав застарілий сайт на Tilda 2021 року. Він не підтримував онлайн-запис, мав слабкий маркетинг і втрачав 60%+ потенційних пацієнтів через поганий UX та відсутність інструментів конверсії.",
    ),
    bulletList: [
      uk("Сайт завантажувався понад 5 секунд на мобільному"),
      uk("Не ранжувався в Google за ключовими запитами"),
      uk("Не було зручної форми запису — лише базові контакти"),
      uk("Відсутня маркетингова система (CTA, воронка, логіка конверсії)"),
      uk("Мультимовність реалізована некоректно (змішані RU/UA тексти, без перемикання)"),
      uk("Адмінка на Tilda була обмежена та незручна з телефону"),
      uk("Висока абонплата через тарифну модель Tilda"),
      uk("Сайт працював нестабільно та періодично падав"),
      uk("Не було чіткого розділення послуг (стоматологія + краса)"),
    ],
    image: imageWithAlt(
      beforeId,
      "Старий сайт Efedra Clinic на Tilda до редизайну",
    ),
  };

  /* sections[2] — / 03 SOLUTION */
  const SOLUTION_SECTION = {
    _type: "imageTextBlock" as const,
    _key: k("sec"),
    variant: "side-with-list",
    imageVariant: "imageLeft",
    bulletIcon: "check",
    eyebrow: uk("/ 03 SOLUTION"),
    heading: uk("Що ми *зробили*"),
    body: richPara(
      "Ми розробили новий сайт з нуля на Next.js + Sanity CMS. Структурували послуги (стоматологія та краса), покращили UX і впровадили систему конверсії з коректною SEO- та мультимовною архітектурою.",
    ),
    bulletList: [
      uk("Повністю кастомний сайт на Next.js + Sanity CMS"),
      uk("Швидкий mobile-first досвід з оптимізованою продуктивністю"),
      uk("Онлайн-запис із продуманим користувацьким сценарієм"),
      uk("Чітке розділення напрямків (стоматологія + краса)"),
      uk("Зручні та зрозумілі прайси послуг"),
      uk("CMS для простого редагування, у тому числі з телефону"),
      uk("Відсутність абонплати — повний контроль над платформою"),
      uk("Коректна мультимовність з SEO-індексацією"),
      uk("Інтеграція з Telegram для обробки лідів"),
      uk("SEO ведеться 3 місяці → вже є заявки з органічного трафіку"),
    ],
    image: imageWithAlt(
      afterId,
      "Новий сайт Efedra Clinic на Next.js та Sanity після запуску",
    ),
  };

  /* sections[3] — gallery (4 tiles) */
  const GALLERY_SECTION = {
    _type: "mediaGalleryBlock" as const,
    _key: k("sec"),
    enableLightbox: true,
    images: [
      {
        _key: k("img"),
        image: imageRef(g1Id),
        caption: uk("Головна"),
        alt: uk("Efedra Clinic — головна сторінка сайту"),
        displayMode: "desktopScreenshot",
        objectPosition: "top",
      },
      {
        _key: k("img"),
        image: imageRef(g2Id),
        caption: uk("Приклади дизайну внутрішніх сторінок"),
        alt: uk("Efedra Clinic — приклади дизайну внутрішніх сторінок"),
        displayMode: "desktopScreenshot",
        objectPosition: "top",
      },
      {
        _key: k("img"),
        image: imageRef(mobileId),
        caption: uk("Мобільна версія"),
        alt: uk("Efedra Clinic — мобільна версія сайту"),
        displayMode: "mobileScreenshot",
        objectPosition: "top",
      },
      {
        _key: k("img"),
        image: imageRef(adminId),
        caption: uk("Адмінпанель (Sanity CMS)"),
        alt: uk("Efedra Clinic — адмінпанель Sanity CMS"),
        displayMode: "adminPanel",
        objectPosition: "top",
      },
    ],
  };

  /* sections[4] — / 04 OUTCOME (centered) — YouTube video lives at
     doc.youtubeId, frontend embeds it inside this block. */
  const OUTCOME_SECTION = {
    _type: "imageTextBlock" as const,
    _key: k("sec"),
    variant: "centered",
    eyebrow: uk("/ 04 OUTCOME"),
    heading: uk("Результат через 3 місяці після *запуску*"),
    body: richParas([
      "Через 3 місяці після запуску — нової версії сайту приніс ×3.2 більше заявок на місяць. Мобільний трафік виріс у 4 рази через локальне SEO. Адміністратор клініки витрачає на оновлення контенту в 5 разів менше часу — все самостійно через Sanity.",
      "Загальний ROI сайту окупився за 4 місяці тільки через додаткові заявки.",
    ]),
    bulletList: [
      uk("Заявок на місяць: 8 → 25"),
      uk("Мобільний трафік: ×4"),
      uk("Час оновлення контенту: −80%"),
      uk("Cost per acquisition: −62%"),
      uk("Bounce rate: 68% → 41%"),
    ],
  };

  /* sections[5] — testimonial */
  const QUOTE_SECTION = {
    _type: "quoteBlock" as const,
    _key: k("sec"),
    quote: uk(
      "Все працює і я задоволена. Дякую величезне!) Якщо комусь буде потрібна ваша допомога, обов'язково порекомендую.\n\nП.С. ще й нарешті заявки з органіки пішли!",
    ),
    authorName: "Марія К.",
    authorRole: uk("СЕО Проекту"),
  };

  const DOC = {
    _id: "caseStudy.efedra-clinic",
    _type: "caseStudy",
    status: "published",
    order: 1,
    featured: true,
    slug: { _type: "slug", current: "efedra-clinic" },

    title: uk("Efedra Clinic"),
    client: "Efedra Clinic",
    region: uk("Одеса, Україна"),
    year: 2025,
    duration: uk("6 тижнів"),
    budget: "$5,000",
    stack: ["Next.js", "Sanity", "Vercel"],
    metricsLine: uk("×3.2 заявок · LCP 0.8s · Top-3 Google"),
    youtubeId: "4asVKZhnY9c",

    coverImage: imageWithAlt(afterId, "Efedra Clinic — новий сайт після редизайну"),

    seo: {
      title: uk("Efedra Clinic — кейс редизайну сайту клініки в Одесі"),
      description: uk(
        "Як ми переробили сайт стоматологічної клініки + студії краси. Custom-coded на Next.js + Sanity. Результат: ×3.2 заявок, LCP 0.8s, Top-3 Google.",
      ),
    },

    hero: HERO,

    sections: [
      STATS_SECTION,
      CHALLENGE_SECTION,
      SOLUTION_SECTION,
      GALLERY_SECTION,
      OUTCOME_SECTION,
      QUOTE_SECTION,
    ],
  };

  const result = await client.createOrReplace(DOC);

  console.log(`✓ Document ${result._id} written (rev ${result._rev})`);
  console.log(`  Sections: ${DOC.sections.map((s) => s._type).join(", ")}`);
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
