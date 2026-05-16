// ─── Reusable objects ─────────────────────────────────────────────────
import {ctaAction} from './objects/ctaAction'
import {imageWithLocalizedAlt} from './objects/imageWithLocalizedAlt'
import {localizedString} from './objects/localizedString'
import {localizedText} from './objects/localizedText'
import {mediaGalleryImageItem} from './objects/mediaGalleryImageItem'
import {metric} from './objects/metric'
import {outcomeResultItem} from './objects/outcomeResultItem'
import {richTextSimple} from './objects/richTextSimple'
import {seoFields} from './objects/seoFields'

// ─── Embedded blocks (used inside document.sections[]) ────────────────
import {auditBlock} from './blocks/auditBlock'
import {beforeAfterBlock} from './blocks/beforeAfterBlock'
import {caseBlock} from './blocks/caseBlock'
import {comparisonBlock} from './blocks/comparisonBlock'
import {ctaBlock} from './blocks/ctaBlock'
import {faqBlock} from './blocks/faqBlock'
import {imageTextBlock} from './blocks/imageTextBlock'
import {mediaGalleryBlock} from './blocks/mediaGalleryBlock'
import {outcomeBlock} from './blocks/outcomeBlock'
import {pricingBlock} from './blocks/pricingBlock'
import {quoteBlock} from './blocks/quoteBlock'
import {reasonsBlock} from './blocks/reasonsBlock'
import {richTextBlock} from './blocks/richTextBlock'
import {servicesBlock} from './blocks/servicesBlock'
import {statsBlock} from './blocks/statsBlock'
import {testimonialBlock} from './blocks/testimonialBlock'

// ─── Top-level documents ──────────────────────────────────────────────
import {blogPost} from './documents/blogPost'
import {caseStudy} from './documents/caseStudy'
import {industryPage} from './documents/industryPage'

export const schemaTypes = [
  // Reusable objects (registered first — referenced by blocks/documents)
  localizedString,
  localizedText,
  imageWithLocalizedAlt,
  ctaAction,
  metric,
  seoFields,
  richTextSimple,
  mediaGalleryImageItem,
  outcomeResultItem,

  // Embedded blocks
  imageTextBlock,
  statsBlock,
  faqBlock,
  pricingBlock,
  comparisonBlock,
  reasonsBlock,
  servicesBlock,
  outcomeBlock,
  quoteBlock,
  richTextBlock,
  mediaGalleryBlock,
  beforeAfterBlock,
  testimonialBlock,
  caseBlock,
  auditBlock,
  ctaBlock,

  // Top-level documents
  blogPost,
  industryPage,
  caseStudy,
]
