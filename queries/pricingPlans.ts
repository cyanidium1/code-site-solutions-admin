/**
 * Pricing plans query — homepage + /pricing tier cards.
 *
 * Mirrors `PRICING_PLANS_QUERY` in the frontend repo
 * (`src/lib/server/sanity-queries.ts`). Keep the two copies in sync.
 *
 * Locale handling: projects all locales; the frontend selects the active one.
 */

import {LOCALIZED_STRING} from './fragments'

export const PRICING_PLANS_QUERY = /* groq */ `
*[_type == "pricingPlan"]{
  _id,
  planKey,
  name ${LOCALIZED_STRING},
  priceFrom,
  currency,
  weeks ${LOCALIZED_STRING},
  includesHeading ${LOCALIZED_STRING},
  includes[] ${LOCALIZED_STRING},
  excludesHeading ${LOCALIZED_STRING},
  excludes[] ${LOCALIZED_STRING},
  ctaLabel ${LOCALIZED_STRING},
  ctaHref,
  ctaGhost,
  discountLine ${LOCALIZED_STRING},
  isPopular,
  popularLabel ${LOCALIZED_STRING},
  order
} | order(order asc, _createdAt asc)
`
