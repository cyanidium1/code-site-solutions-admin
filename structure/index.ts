import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Контент')
    .items([
      S.documentTypeListItem('blogPost').title('Blog'),
      S.documentTypeListItem('industryPage').title('Industry / Sites for'),
      S.documentTypeListItem('caseStudy').title('Case studies'),
      S.divider(),
      // Технічні сторінки: у навігації сайту їх немає, вони noindex і живуть
      // лише за прямим посиланням. Окремий розділ, щоб КП не шукали серед
      // маркетингових сторінок.
      S.documentTypeListItem('proposal').title('Комерційні пропозиції'),
    ])
