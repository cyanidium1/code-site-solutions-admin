import {
  BLOG_POST_REF,
  CASE_STUDY_REF,
  IMAGE_WITH_ALT,
  INDUSTRY_PAGE_REF,
  LOCALIZED_STRING,
  LOCALIZED_TEXT,
  SEO_FIELDS,
} from './fragments'

/** Lightweight projection used by /blog listings + sitemap. */
export const BLOG_POSTS_QUERY = /* groq */ `
*[_type == "blogPost" && status == "published" && defined(slug.current)]
${BLOG_POST_REF}
| order(publishedAt desc, _createdAt desc)
`

/** Full blog post payload. Parameter: $slug. */
export const BLOG_POST_BY_SLUG_QUERY = /* groq */ `
*[_type == "blogPost" && status == "published" && slug.current == $slug][0]{
  _id,
  "slug": slug.current,
  title ${LOCALIZED_STRING},
  publishedAt,
  excerpt ${LOCALIZED_TEXT},
  "coverImage": coverImage ${IMAGE_WITH_ALT},
  body,
  seo ${SEO_FIELDS},
  "relatedCases": relatedCases[]->${CASE_STUDY_REF},
  "relatedIndustries": relatedIndustries[]->${INDUSTRY_PAGE_REF}
}
`
