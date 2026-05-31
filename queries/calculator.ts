/**
 * Calculator queries — feeds the website calculator on /calculator
 * (and /en/calculator). Locale resolution happens in the frontend.
 *
 * Mirrors `CALCULATOR_*_QUERY` in the frontend repo
 * (`src/lib/server/sanity-queries.ts`). Keep the two copies in sync.
 */
import {LOCALIZED_STRING, LOCALIZED_TEXT} from './fragments'

export const CALCULATOR_PROJECT_TYPES_QUERY = /* groq */ `
*[_type == "calculatorProjectType"]{
  _id,
  projectKey,
  label ${LOCALIZED_STRING},
  hint ${LOCALIZED_TEXT},
  basePrice,
  pages,
  order
} | order(order asc, _createdAt asc)
`

export const CALCULATOR_OPTIONS_QUERY = /* groq */ `
*[_type == "calculatorOption"]{
  _id,
  groupKey,
  optionKey,
  label ${LOCALIZED_STRING},
  hint ${LOCALIZED_TEXT},
  price,
  monthlyPrice,
  priceLabel,
  percent,
  included,
  featureGroup,
  bestFor ${LOCALIZED_TEXT},
  includes[] ${LOCALIZED_STRING},
  badge ${LOCALIZED_STRING},
  previews[] {
    src,
    caption ${LOCALIZED_STRING}
  },
  order
} | order(groupKey asc, order asc)
`

export const CALCULATOR_PRESETS_QUERY = /* groq */ `
*[_type == "calculatorPreset"]{
  _id,
  presetKey,
  title ${LOCALIZED_STRING},
  badge ${LOCALIZED_STRING},
  bestFor ${LOCALIZED_TEXT},
  includes[] ${LOCALIZED_STRING},
  estimatedRange ${LOCALIZED_STRING},
  compareAnchor ${LOCALIZED_TEXT},
  appliedInput,
  order
} | order(order asc)
`

export const CALCULATOR_SETTINGS_QUERY = /* groq */ `
*[_type == "calculatorSettings"][0]{
  defaultProjectType,
  roundStep,
  highEstimateFactor
}
`
