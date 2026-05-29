import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Контент')
    .items([
      S.documentTypeListItem('blogPost').title('Blog'),
      S.documentTypeListItem('industryPage').title('Industry / Sites for'),
      S.documentTypeListItem('caseStudy').title('Case studies'),
      S.documentTypeListItem('testimonial').title('Testimonials'),
      S.documentTypeListItem('pricingPlan').title('Pricing plans'),
    ])
