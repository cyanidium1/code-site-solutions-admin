/**
 * Canonical prices and terms — mirrors site `src/constants/pricing.ts` (TZ v2,
 * owner 2026-09-20). Blog copy in Sanity still quotes the pre-productized
 * agency list ($800 landing, $2 500 corporate, $6 000 shop, paid audits,
 * $200/mo support, $40/h), which the acceptance checklist flagged as the last
 * open item (`docs/productized-v2-acceptance.md`, "Що лишилось", п. 1).
 *
 * UA market (uk, ru) is USD with NBSP grouping: "$1 000".
 * International market (en) is EUR with comma grouping: "€2,500" — owner
 * decision 2026-09-22: the EN blog quotes the EUR list, not pounds.
 */

export const UA = {
  landing: "$600",
  business: "$1 000",
  shop: "$1 500",
  industry: "$1 800",
  custom: "$4 000",
  seoFrom: "$400",
  seoShopFrom: "$600",
  hostingYear: "$60",
  extraPage: "$150",
  lang: "$200",
  blog: "$200",
  crm: "$300",
  booking: "$300",
  copyPro: "$300",
};

export const EU = {
  landing: "€1,200",
  business: "€2,500",
  shop: "€3,900",
  industry: "€4,500",
  custom: "€9,000",
  seoFrom: "€800",
  hostingYear: "€120",
};

/** Working-day terms per package, spelled the way the site spells them. */
export const TERM = {
  uk: { landing: "3 робочі дні", business: "7 робочих днів", shop: "14 робочих днів", industry: "14–21 робочий день", custom: "від 6 тижнів" },
  ru: { landing: "3 рабочих дня", business: "7 рабочих дней", shop: "14 рабочих дней", industry: "14–21 рабочий день", custom: "от 6 недель" },
  en: { landing: "3 working days", business: "7 working days", shop: "14 working days", industry: "14–21 working days", custom: "from 6 weeks" },
};

/** The only free thing, and it is now the main CTA (TZ v2 §2.3). */
export const AUDIT = {
  uk: "безкоштовний аудит",
  ru: "бесплатный аудит",
  en: "free website audit",
};

export const REPLY_HOURS = { uk: "24 години", ru: "24 часа", en: "24 hours" };
