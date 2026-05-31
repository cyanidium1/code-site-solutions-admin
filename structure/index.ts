import type {StructureResolver} from 'sanity/structure'

/**
 * Studio sidebar layout. Top-level items group by intent:
 *   - Content: documents editors create regularly (posts, cases, etc.)
 *   - Налаштування фільтрів: vocabulary lists that power the URL filters
 *     on /blog and /portfolio. Editors come here to add/remove pills,
 *     rename labels, or tweak colors.
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
      S.listItem()
        .title('Калькулятор')
        .child(
          S.list()
            .title('Калькулятор')
            .items([
              S.documentTypeListItem('calculatorProjectType').title('Типи проєктів'),
              S.documentTypeListItem('calculatorOption').title('Опції (всі групи)'),
              S.documentTypeListItem('calculatorPreset').title('Пресети'),
              S.listItem()
                .title('Налаштування')
                .id('calculatorSettings')
                .child(
                  S.document()
                    .schemaType('calculatorSettings')
                    .documentId('calculatorSettings'),
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
                      S.documentTypeListItem('blogCategoryOption').title(
                        'Категорії статей (пілюлі на /blog)',
                      ),
                    ]),
                ),
              S.listItem()
                .title('Фільтри портфоліо')
                .child(
                  S.list()
                    .title('Фільтри портфоліо')
                    .items([
                      S.documentTypeListItem('countryOption').title(
                        'Країни (фільтр на /portfolio)',
                      ),
                      S.documentTypeListItem('budgetBucketOption').title(
                        'Бюджети (фільтр на /portfolio)',
                      ),
                    ]),
                ),
            ]),
        ),
    ])
