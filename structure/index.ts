import type {StructureResolver} from 'sanity/structure'

/**
 * Studio sidebar layout. Top-level items group by intent:
 *   - Контент: documents editors create regularly (posts, cases, etc.)
 *   - Калькулятор: singleton-per-group config for the website calculator.
 *     Each entry is a single editable doc holding an array of options.
 *   - Налаштування фільтрів: vocabulary lists that power the URL filters
 *     on /blog and /portfolio.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Контент')
    .items([
      S.documentTypeListItem('blogPost').title('Статті блогу'),
      S.documentTypeListItem('industryPage').title('Галузеві сторінки (/sites-for)'),
      S.documentTypeListItem('caseStudy').title('Кейси (/portfolio)'),
      S.documentTypeListItem('testimonial').title('Відгуки'),
      S.documentTypeListItem('pricingPlan').title('Тарифи (/pricing)'),
      S.divider(),
      S.listItem()
        .title('Калькулятор — конфігурація')
        .id('calculatorConfig')
        .child(S.document().schemaType('calculatorConfig').documentId('calculatorConfig')),
      S.listItem()
        .title('Калькулятор (застаріле)')
        .child(
          S.list()
            .title('Калькулятор')
            .items([
              S.listItem()
                .title('Типи проєктів')
                .id('calculatorProjectTypes')
                .child(
                  S.document().schemaType('calculatorProjectTypes').documentId('calculatorProjectTypes'),
                ),
              S.listItem()
                .title('Пресети')
                .id('calculatorPresets')
                .child(S.document().schemaType('calculatorPresets').documentId('calculatorPresets')),
              S.divider(),
              S.listItem()
                .title('Опції')
                .child(
                  S.list()
                    .title('Опції')
                    .items([
                      S.listItem()
                        .title('CMS')
                        .id('calculatorCmsOptions')
                        .child(
                          S.document().schemaType('calculatorCmsOptions').documentId('calculatorCmsOptions'),
                        ),
                      S.listItem()
                        .title('SEO')
                        .id('calculatorSeoOptions')
                        .child(
                          S.document().schemaType('calculatorSeoOptions').documentId('calculatorSeoOptions'),
                        ),
                      S.listItem()
                        .title('Features')
                        .id('calculatorFeatureOptions')
                        .child(
                          S.document()
                            .schemaType('calculatorFeatureOptions')
                            .documentId('calculatorFeatureOptions'),
                        ),
                      S.listItem()
                        .title('Languages')
                        .id('calculatorLanguageOptions')
                        .child(
                          S.document()
                            .schemaType('calculatorLanguageOptions')
                            .documentId('calculatorLanguageOptions'),
                        ),
                      S.listItem()
                        .title('Design')
                        .id('calculatorDesignOptions')
                        .child(
                          S.document()
                            .schemaType('calculatorDesignOptions')
                            .documentId('calculatorDesignOptions'),
                        ),
                      S.listItem()
                        .title('Timeline')
                        .id('calculatorTimelineOptions')
                        .child(
                          S.document()
                            .schemaType('calculatorTimelineOptions')
                            .documentId('calculatorTimelineOptions'),
                        ),
                      S.listItem()
                        .title('Maintenance')
                        .id('calculatorMaintenanceOptions')
                        .child(
                          S.document()
                            .schemaType('calculatorMaintenanceOptions')
                            .documentId('calculatorMaintenanceOptions'),
                        ),
                      S.listItem()
                        .title('SEO & Growth')
                        .id('calculatorSeoGrowthOptions')
                        .child(
                          S.document()
                            .schemaType('calculatorSeoGrowthOptions')
                            .documentId('calculatorSeoGrowthOptions'),
                        ),
                      S.listItem()
                        .title('Content')
                        .id('calculatorContentOptions')
                        .child(
                          S.document()
                            .schemaType('calculatorContentOptions')
                            .documentId('calculatorContentOptions'),
                        ),
                      S.listItem()
                        .title('Product complexity')
                        .id('calculatorProductComplexityOptions')
                        .child(
                          S.document()
                            .schemaType('calculatorProductComplexityOptions')
                            .documentId('calculatorProductComplexityOptions'),
                        ),
                    ]),
                ),
              S.divider(),
              S.listItem()
                .title('Налаштування')
                .id('calculatorSettings')
                .child(S.document().schemaType('calculatorSettings').documentId('calculatorSettings')),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Налаштування головної')
        .child(
          S.list()
            .title('Налаштування головної')
            .items([
              S.listItem()
                .title('Кейси на головній')
                .id('homepageCases')
                .child(
                  S.document().schemaType('homepageCases').documentId('homepageCases'),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Налаштування фільтрів')
        .child(
          S.list()
            .title('Налаштування фільтрів')
            .items([
              S.listItem()
                .title('Фільтри блогу')
                .child(
                  S.list()
                    .title('Фільтри блогу')
                    .items([
                      S.documentTypeListItem('blogCategoryOption').title('Категорії статей (пілюлі на /blog)'),
                    ]),
                ),
              S.listItem()
                .title('Фільтри портфоліо')
                .child(
                  S.list()
                    .title('Фільтри портфоліо')
                    .items([
                      S.documentTypeListItem('countryOption').title('Країни (фільтр на /portfolio)'),
                      S.documentTypeListItem('budgetBucketOption').title('Бюджети (фільтр на /portfolio)'),
                    ]),
                ),
            ]),
        ),
    ])
