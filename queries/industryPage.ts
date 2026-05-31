import {
  BLOG_POST_REF,
  CASE_STUDY_REF,
  INDUSTRY_PAGE_REF,
  LOCALIZED_STRING,
  LOCALIZED_TEXT,
  METRIC,
  SEO_FIELDS,
} from './fragments'

/** Lightweight projection used by sitemap, footer link lists, etc. */
export const INDUSTRY_PAGES_QUERY = /* groq */ `
*[_type == "industryPage" && status == "published" && defined(slug.current)]
${INDUSTRY_PAGE_REF}
| order(order asc, _createdAt asc)
`

/**
 * Full industry page payload. Parameter: $slug.
 * Returns null if the slug doesn't resolve to a published doc.
 *
 * `sections[]` is projected as `_type, _key, ...` — the frontend should
 * narrow each block by `_type` and project explicit shapes per block when
 * `sanity typegen` lands. For now the wide spread keeps things flexible.
 */
export const INDUSTRY_PAGE_BY_SLUG_QUERY = /* groq */ `
*[_type == "industryPage" && status == "published" && slug.current == $slug][0]{
  _id,
  "slug": slug.current,
  title ${LOCALIZED_STRING},

  seo ${SEO_FIELDS},

  hero{
    eyebrow ${LOCALIZED_STRING},
    heading ${LOCALIZED_TEXT},
    lede ${LOCALIZED_TEXT},
    features[] ${LOCALIZED_STRING},
    stats[] ${METRIC}
  },

  sections[]{
    _type,
    _key,
    ...
  },

  "relatedCases": relatedCases[]->${CASE_STUDY_REF},
  "relatedPosts": relatedPosts[]->${BLOG_POST_REF}
}
`
