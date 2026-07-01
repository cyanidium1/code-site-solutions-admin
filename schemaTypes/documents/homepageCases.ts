import {DocumentsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Singleton — curates the case-study slots shown on the homepage Cases
 * section. Bound to the fixed document ID `homepageCases` in
 * structure/index.ts (see also calculatorConfig for the same pattern).
 *
 * Each *Cases array holds up to 3 references to a published caseStudy.
 * - defaultCases drives the initial render; if empty, the frontend
 *   falls back to the top 3 from CASE_STUDIES_QUERY (current behavior).
 * - legalCases / medicineCases / realEstateCases drive the three filter
 *   pills on the homepage. An empty list hides its pill.
 */
export const homepageCases = defineType({
  name: 'homepageCases',
  title: 'Головна — кейси',
  type: 'document',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'defaultCases',
      title: 'За замовчуванням (3 кейси)',
      description:
        'Кейси, що показуються на головній за замовчуванням. До 3-х. Якщо порожньо — фронт автоматично бере перші 3 кейси за featured + year.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'caseStudy'}],
          options: {disableNew: true},
        }),
      ],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: 'legalCases',
      title: 'Юридичні (фільтр «Юр.»)',
      description: 'До 3-х кейсів. Якщо порожньо — кнопка-фільтр не показується на головній.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'caseStudy'}],
          options: {disableNew: true},
        }),
      ],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: 'medicineCases',
      title: 'Медицина (фільтр «Мед.»)',
      description: 'До 3-х кейсів. Якщо порожньо — кнопка-фільтр не показується на головній.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'caseStudy'}],
          options: {disableNew: true},
        }),
      ],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: 'realEstateCases',
      title: 'Нерухомість (фільтр «Нерух.»)',
      description: 'До 3-х кейсів. Якщо порожньо — кнопка-фільтр не показується на головній.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'caseStudy'}],
          options: {disableNew: true},
        }),
      ],
      validation: (r) => r.max(3),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Головна — кейси'}
    },
  },
})
