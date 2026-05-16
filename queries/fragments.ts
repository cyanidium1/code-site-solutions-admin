/**
 * Reusable GROQ projection fragments.
 *
 * Conventions:
 * - Locale resolution happens in the frontend after the query — projections include all locales.
 * - Image projections always include `asset->{...}` to keep CDN URL + LQIP available.
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
    metadata { lqip, dimensions }
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
  value,
  label ${LOCALIZED_STRING}
}`

export const CTA_ACTION = /* groq */ `{
  label ${LOCALIZED_STRING},
  description ${LOCALIZED_TEXT},
  href,
  type
}`

export const BLOG_POST_REF = /* groq */ `{
  _id,
  "slug": slug.current,
  title ${LOCALIZED_STRING},
  publishedAt,
  excerpt ${LOCALIZED_TEXT},
  "coverImage": coverImage ${IMAGE_WITH_ALT},
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
