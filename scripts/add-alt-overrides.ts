/**
 * One-shot migration: add `overrides` to each case-study translation JSON
 * to replace placeholder / wrong alt-text with brand-aware copy. Also
 * removes the now-stale `strings` entries that would no longer match
 * (because the override fills the path before the translation walker
 * sees it).
 *
 * Idempotent — re-running just rewrites the same content.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Override = { uk: string; en: string };

type CaseSpec = {
  file: string;
  brand: string; // visible brand name used in alt copy
  /** Stale UK keys to drop from `strings` (because their paths get overridden). */
  staleStrings: string[];
  /** path → {uk, en} overrides */
  overrides: Record<string, Override>;
};

const STANDARD_STALE_OTHER = [
  "hero mockup",
  "mobile",
  "desktop",
  "Старий сайт Efedra Clinic на Tilda до редизайну",
  "Новий сайт Efedra Clinic на Next.js та Sanity після запуску",
];

/**
 * For every case except efedra-clinic, the same 5 paths get overridden
 * with brand-aware copy. Build that block from a small spec.
 */
function standardOverrides(brand: string): Record<string, Override> {
  return {
    "hero.heroImage.alt": {
      uk: `Сайт ${brand} на ноутбуці і телефоні`,
      en: `${brand} website shown on laptop and phone`,
    },
    'sections[_key=="sec6"].image.alt': {
      uk: `${brand} до запуску нового сайту`,
      en: `${brand} before the new site launched`,
    },
    'sections[_key=="sec9"].image.alt': {
      uk: `Нова головна сторінка сайту ${brand}`,
      en: `${brand}'s new homepage`,
    },
    'sections[_key=="sech"].image.alt': {
      uk: `Мобільна версія сайту ${brand}`,
      en: `${brand} website on mobile`,
    },
    'sections[_key=="sech"].image2.alt': {
      uk: `Десктопна версія сайту ${brand}`,
      en: `${brand} website on desktop`,
    },
  };
}

const CASES: CaseSpec[] = [
  {
    file: "c133cc2a-b795-4437-a4de-e6731d9e5e57.json",
    brand: "Bravo",
    staleStrings: STANDARD_STALE_OTHER,
    overrides: {
      ...standardOverrides("Bravo"),
      // Override the generic sec9 default with case-specific detail
      'sections[_key=="sec9"].image.alt': {
        uk: "Нова головна сторінка сайту Bravo з акційними блоками і CTA",
        en: "Bravo's new homepage with deal blocks and CTAs",
      },
    },
  },
  {
    file: "71bf3d68-ea3f-48ff-a79a-4cb01841580c.json",
    brand: "Glimmer",
    staleStrings: STANDARD_STALE_OTHER,
    overrides: {
      ...standardOverrides("Glimmer"),
      'sections[_key=="sec9"].image.alt': {
        uk: "Нова головна сторінка сайту Glimmer з банерами, бестселерами і каталогом",
        en: "Glimmer's new homepage with banners, bestsellers, and catalog",
      },
    },
  },
  {
    file: "a5311634-9a57-4de9-ab72-ec42fcfcc270.json",
    brand: "Kondor Device",
    staleStrings: STANDARD_STALE_OTHER,
    overrides: {
      ...standardOverrides("Kondor Device"),
      'sections[_key=="sec9"].image.alt': {
        uk: "Нова головна сторінка сайту Kondor Device з каталогом і кнопкою замовлення",
        en: "Kondor Device's new homepage with catalog and order button",
      },
    },
  },
  {
    file: "dbf63d07-e6b1-4e66-a74c-6a2b046410a7.json",
    brand: "Le'Muse Nature",
    staleStrings: STANDARD_STALE_OTHER,
    overrides: {
      ...standardOverrides("Le'Muse Nature"),
      'sections[_key=="sec9"].image.alt': {
        uk: "Нова головна сторінка сайту Le'Muse Nature з категоріями, бестселерами і блоком інгредієнтів",
        en: "Le'Muse Nature's new homepage with categories, bestsellers, and the ingredients block",
      },
    },
  },
  {
    file: "a2b52844-f284-4114-8a4d-61204b18b498.json",
    brand: "Mono Pools",
    staleStrings: STANDARD_STALE_OTHER,
    overrides: {
      ...standardOverrides("Mono Pools"),
      'sections[_key=="sec9"].image.alt': {
        uk: "Нова головна сторінка сайту Mono Pools із каталогом моделей і блоками довіри",
        en: "Mono Pools' new homepage with the model catalog and trust blocks",
      },
    },
  },
  {
    file: "be23bea1-7127-4e1c-bddc-27b29a8d7b44.json",
    brand: "Right Cars",
    staleStrings: STANDARD_STALE_OTHER,
    overrides: {
      ...standardOverrides("Right Cars"),
      'sections[_key=="sec9"].image.alt': {
        uk: "Нова головна сторінка сайту Right Cars із showroom і фільтрами пошуку авто",
        en: "Right Cars' new homepage with the showroom and vehicle-search filters",
      },
    },
  },
  {
    file: "caseStudy.rich-tour.json",
    brand: "Rich Tour",
    staleStrings: STANDARD_STALE_OTHER,
    overrides: {
      ...standardOverrides("Rich Tour"),
      'sections[_key=="sec9"].image.alt': {
        uk: "Нова головна сторінка сайту Rich Tour з пошуком турів за країною та місяцем",
        en: "Rich Tour's new homepage with tour search by country and month",
      },
      'sections[_key=="fd187ec9f59b"].image.alt': {
        uk: "Адмін-панель і CRM на сайті Rich Tour",
        en: "Admin panel and CRM on the Rich Tour site",
      },
    },
  },
  {
    file: "caseStudy.sytnykov.json",
    brand: "Oleksandr Sytnykov",
    staleStrings: [...STANDARD_STALE_OTHER, "Sanity CMS"],
    overrides: {
      ...standardOverrides("Oleksandr Sytnykov"),
      'sections[_key=="sec9"].image.alt': {
        uk: "Нова головна сторінка сайту Олександра Ситникова з послугами, курсами та публікаціями",
        en: "Oleksandr Sytnykov's new homepage with services, courses, and publications",
      },
      'sections[_key=="fd187ec9f59b"].image.alt': {
        uk: "Адмін-панель Sanity CMS на сайті Олександра Ситникова",
        en: "Sanity CMS admin panel on Oleksandr Sytnykov's site",
      },
    },
  },
  {
    file: "24ac5799-3754-49a3-ac77-4904124d6be6.json",
    brand: "Solide Renovation",
    staleStrings: [...STANDARD_STALE_OTHER, "Sanity CMS"],
    overrides: {
      ...standardOverrides("Solide Renovation"),
      'sections[_key=="sec9"].image.alt': {
        uk: "Нова головна сторінка сайту Solide Renovation з послугами, портфоліо і калькулятором",
        en: "Solide Renovation's new homepage with services, portfolio, and the estimate calculator",
      },
      // Doc has an extra image block (sections[fd187ec9f59b]) showing the
      // Sanity CMS admin — currently alt is just "Sanity CMS".
      'sections[_key=="fd187ec9f59b"].image.alt': {
        uk: "Адмін-панель Sanity CMS на сайті Solide Renovation",
        en: "Sanity CMS admin panel on the Solide Renovation site",
      },
    },
  },
  {
    // Efedra's sec6/sec9 alts ARE correctly about Efedra — keep their
    // existing translation entries. Only the generic-placeholder fields
    // (hero mockup / mobile / desktop) need overrides.
    file: "caseStudy.efedra-clinic.json",
    brand: "Efedra Clinic",
    staleStrings: ["hero mockup", "mobile", "desktop"],
    overrides: {
      "hero.heroImage.alt": {
        uk: "Сайт Efedra Clinic на ноутбуці і телефоні",
        en: "Efedra Clinic website shown on laptop and phone",
      },
      'sections[_key=="sech"].image.alt': {
        uk: "Мобільна версія сайту Efedra Clinic",
        en: "Efedra Clinic website on mobile",
      },
      'sections[_key=="sech"].image2.alt': {
        uk: "Десктопна версія сайту Efedra Clinic",
        en: "Efedra Clinic website on desktop",
      },
    },
  },
];

function main() {
  const root = join(process.cwd(), "translations");
  for (const spec of CASES) {
    const p = join(root, spec.file);
    const json = JSON.parse(readFileSync(p, "utf8")) as {
      _meta?: Record<string, unknown>;
      strings: Record<string, string>;
      overrides?: Record<string, Override>;
    };

    // Drop stale `strings` entries.
    let dropped = 0;
    for (const k of spec.staleStrings) {
      if (k in json.strings) {
        delete json.strings[k];
        dropped++;
      }
    }

    // Replace `overrides` entirely (idempotent).
    json.overrides = spec.overrides;

    writeFileSync(p, JSON.stringify(json, null, 2) + "\n", "utf8");
    console.log(
      `${spec.file}  ←  brand=${spec.brand}  dropped ${dropped} stale strings, set ${Object.keys(spec.overrides).length} overrides`,
    );
  }
}

main();
