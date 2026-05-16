import {SplitHorizontalIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

export const comparisonBlock = defineType({
  name: 'comparisonBlock',
  title: 'Порівняння',
  type: 'object',
  icon: SplitHorizontalIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
    defineField({name: 'heading', title: 'Заголовок таблиці', type: 'localizedText'}),
    defineField({
      name: 'columns',
      title: 'Заголовки колонок (опціонально)',
      type: 'object',
      options: {collapsible: true},
      fields: [
        defineField({name: 'param', title: 'Параметр', type: 'localizedString'}),
        defineField({name: 'wp', title: 'WordPress', type: 'localizedString'}),
        defineField({name: 'wix', title: 'Wix / конструктор', type: 'localizedString'}),
        defineField({name: 'custom', title: 'Custom code', type: 'localizedString'}),
      ],
    }),
    defineField({
      name: 'rows',
      title: 'Рядки таблиці',
      type: 'array',
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'comparisonRow',
          title: 'Рядок',
          fields: [
            defineField({name: 'param', title: 'Параметр', type: 'localizedString'}),
            defineField({name: 'wp', title: 'WordPress', type: 'localizedString'}),
            defineField({name: 'wix', title: 'Wix / конструктор', type: 'localizedString'}),
            defineField({name: 'custom', title: 'Custom code', type: 'localizedString'}),
          ],
          preview: {
            select: {param: 'param'},
            prepare({param}) {
              return {title: pickLocalizedFirst(param) || 'Рядок', subtitle: 'Comparison row'}
            },
          },
        }),
      ],
    }),

    defineField({name: 'tableCtaPrimary', title: 'CTA primary під таблицею', type: 'localizedString'}),
    defineField({name: 'tableCtaGhost', title: 'CTA secondary (ghost) під таблицею', type: 'localizedString'}),

    /* ─── Contact form ────────────────────────────────────────────── */
    defineField({
      name: 'contact',
      title: 'Контактна форма',
      type: 'object',
      options: {collapsible: true},
      fields: [
        defineField({name: 'heading', title: 'Заголовок форми', type: 'localizedString'}),
        defineField({name: 'sub', title: 'Підзаголовок', type: 'localizedText'}),
        defineField({name: 'namePlaceholder', title: 'Плейсхолдер імʼя', type: 'localizedString'}),
        defineField({name: 'channelPlaceholder', title: 'Плейсхолдер каналу', type: 'localizedString'}),
        defineField({name: 'briefPlaceholder', title: 'Плейсхолдер опису', type: 'localizedString'}),
        defineField({name: 'submitLabel', title: 'Текст кнопки', type: 'localizedString'}),
        defineField({name: 'foot', title: 'Footnote (під формою)', type: 'localizedText'}),
      ],
    }),

    /* ─── Pricing tiers ───────────────────────────────────────────── */
    defineField({name: 'pricingHeading', title: 'Заголовок прайсу', type: 'localizedText'}),
    defineField({
      name: 'tiers',
      title: 'Тарифи (під таблицею порівняння)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'comparisonTier',
          fields: [
            defineField({name: 'title', title: 'Назва', type: 'localizedString'}),
            defineField({name: 'price', title: 'Ціна (display, напр. «$3 500»)', type: 'localizedString'}),
            defineField({name: 'weeks', title: 'Терміни (display)', type: 'localizedString'}),
            defineField({name: 'isPopular', title: 'Популярний', type: 'boolean', initialValue: false}),
            defineField({name: 'popularLabel', title: 'Лейбл «Популярно»', type: 'localizedString'}),
            defineField({name: 'includesHeading', title: 'Заголовок «Що входить»', type: 'localizedString'}),
            defineField({
              name: 'includes',
              title: 'Що входить',
              type: 'array',
              of: [defineArrayMember({type: 'localizedString'})],
            }),
            defineField({name: 'excludesHeading', title: 'Заголовок «Не входить»', type: 'localizedString'}),
            defineField({
              name: 'excludes',
              title: 'Що НЕ входить',
              type: 'array',
              of: [defineArrayMember({type: 'localizedString'})],
            }),
            defineField({name: 'ctaLabel', title: 'Текст кнопки', type: 'localizedString'}),
            defineField({name: 'ctaGhost', title: 'Кнопка ghost (другорядна)', type: 'boolean', initialValue: false}),
          ],
          preview: {
            select: {title: 'title', price: 'price', isPopular: 'isPopular'},
            prepare({title, price, isPopular}) {
              return {
                title: pickLocalizedFirst(title) || 'Тариф',
                subtitle: [pickLocalizedFirst(price), isPopular ? '★ popular' : null].filter(Boolean).join(' · '),
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {rows: 'rows'},
    prepare({rows}) {
      const count = Array.isArray(rows) ? rows.length : 0
      return {
        title: 'Comparison',
        subtitle: `Comparison · ${count} row(s)`,
      }
    },
  },
})
