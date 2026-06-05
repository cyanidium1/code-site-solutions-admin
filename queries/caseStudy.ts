import {
  BLOG_POST_REF,
  CASE_STUDY_LISTING_PROJECTION,
  CTA_ACTION,
  IMAGE_WITH_ALT,
  LOCALIZED_STRING,
  LOCALIZED_TEXT,
  METRIC,
  SEO_FIELDS,
} from './fragments'

/** Lightweight projection used by /portfolio listings + sitemap. */
export const CASE_STUDIES_QUERY = /* groq */ `
*[_type == "caseStudy" && status == "published" && defined(slug.current)]
  ${CASE_STUDY_LISTING_PROJECTION}
  | order(featured desc, year desc, _createdAt desc)
`

/** Full case-study payload. Parameter: $slug. */
export const CASE_STUDY_BY_SLUG_QUERY = /* groq */ `
*[_type == "caseStudy" && status == "published" && slug.current == $slug][0]{
  _id,
  "slug": slug.current,
  title ${LOCALIZED_STRING},
  client,
  "industry": industry->{ _id, "slug": slug.current, title ${LOCALIZED_STRING} },
  region ${LOCALIZED_STRING},
  year,
  date,
  duration ${LOCALIZED_STRING},
  budget,
  "budgetBucket": budgetBucket->{ "slug": slug.current, name ${LOCALIZED_STRING} },
  "country": country->{ "slug": slug.current, name ${LOCALIZED_STRING} },
  stack,
  metricsLine ${LOCALIZED_STRING},
  youtubeId,
  "coverImage": coverImage ${IMAGE_WITH_ALT},
  seo ${SEO_FIELDS},
  hero{
    eyebrow ${LOCALIZED_STRING},
    heading ${LOCALIZED_TEXT},
    subheading ${LOCALIZED_TEXT},
    "heroImage": heroImage ${IMAGE_WITH_ALT},
    link ${CTA_ACTION},
    metrics[] ${METRIC}
  },
  sections[]{
    _type,
    _key,
    ...,
    image ${IMAGE_WITH_ALT},
    "image2": image2 ${IMAGE_WITH_ALT}
  },
  "relatedPosts": relatedPosts[]->${BLOG_POST_REF},
  featured
}
`
