/**
 * Reusable GROQ projection fragments.
 *
 * Conventions:
 * - Locale resolution happens in the frontend after the query — projections include all locales.
 * - Image projections always include `asset->{...}` to keep CDN URL + LQIP available.
 * - `metadata.isOpaque` gates the frontend's LQIP blur-up placeholder (a CSS
 *   background that would show through transparent pixels), so it ships in the
 *   image projection — auto-computed asset metadata, not an editable field.
 * - References are followed once with `->`; deeper graph walks belong in page-level queries.
 */

export const LOCALIZED_STRING = /* groq */ `{
  uk,
  ru,
  en
}`

export const LOCALIZED_TEXT = LOCALIZED_STRING

export const IMAGE_WITH_ALT = /* groq */ `{
  "asset": image.asset->{
    _id,
    url,
    metadata { lqip, dimensions, isOpaque }
  },
  "hotspot": image.hotspot,
  "crop": image.crop,
  alt ${LOCALIZED_STRING}
}`

export const SEO_FIELDS = /* groq */ `{
  title ${LOCALIZED_STRING},
  description ${LOCALIZED_TEXT},
  "ogImage": ogImage.asset->{ _id, url, metadata { dimensions } }
}`

export const METRIC = /* groq */ `{
  value ${LOCALIZED_STRING},
  label ${LOCALIZED_STRING}
}`

export const CTA_ACTION = /* groq */ `{
  label ${LOCALIZED_STRING},
  description ${LOCALIZED_TEXT},
  href,
  type
}`

// blogPost reference projection — used by relatedPosts on industryPage
// and caseStudy. Coalesce-tolerant: reads both the legacy En-suffix flat
// fields and the localized objects (slugs.*/title.*/lede.*) introduced by
// the 2026-07 locale generalization.
export const BLOG_POST_REF = /* groq */ `{
  _id,
  "slug": coalesce(slugs.uk.current, slug.current),
  "slugEn": coalesce(slugs.en.current, slugEn.current),
  "title": coalesce(title.uk, title),
  "titleEn": coalesce(title.en, titleEn),
  publishedAt,
  "lede": coalesce(lede.uk, lede),
  "ledeEn": coalesce(lede.en, ledeEn),
  "cover": cover{
    "asset": image.asset->{ _id, url, metadata { lqip, dimensions, isOpaque } },
    "crop": image.crop,
    "hotspot": image.hotspot,
    alt ${LOCALIZED_STRING}
  },
  coverImage{ src, alt, altEn },
  "category": category->{ "slug": slug.current, name ${LOCALIZED_STRING}, color },
  status
}`

export const CASE_STUDY_REF = /* groq */ `{
  _id,
  "slug": slug.current,
  title ${LOCALIZED_STRING},
  client,
  region ${LOCALIZED_STRING},
  year,
  "coverImage": coverImage ${IMAGE_WITH_ALT},
  status,
  featured
}`

export const INDUSTRY_PAGE_REF = /* groq */ `{
  _id,
  "slug": slug.current,
  title ${LOCALIZED_STRING},
  status,
  order
}`

/**
 * Card-level projection used wherever a list of caseStudy refs is rendered
 * (/portfolio listing, homepage Cases section, future homepage curation).
 * Mirrors `CaseStudyRef` in Frontend `types/sanity.ts`.
 */
export const CASE_STUDY_LISTING_PROJECTION = /* groq */ `{
  _id,
  "slug": slug.current,
  title ${LOCALIZED_STRING},
  client,
  region ${LOCALIZED_STRING},
  "country": country->{ "slug": slug.current, name ${LOCALIZED_STRING} },
  year,
  "budgetBucket": budgetBucket->{ "slug": slug.current, name ${LOCALIZED_STRING} },
  "industrySlug": industry->slug.current,
  "coverImage": coverImage ${IMAGE_WITH_ALT},
  status,
  featured,
  metricsLine ${LOCALIZED_STRING}
}`
