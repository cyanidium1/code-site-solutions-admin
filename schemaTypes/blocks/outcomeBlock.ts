import {TrendUpwardIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

export const outcomeBlock = defineType({
  name: 'outcomeBlock',
  title: 'Результати',
  type: 'object',
  icon: TrendUpwardIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
    defineField({name: 'heading', title: 'Заголовок (опціонально)', type: 'localizedText'}),

    /* ─── Recap pull-quote ───────────────────────────────────────── */
    defineField({
      name: 'recap',
      title: 'Recap (резюмівна цитата)',
      type: 'object',
      options: {collapsible: true},
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
        defineField({name: 'text', title: 'Текст', type: 'localizedText'}),
      ],
    }),

    /* ─── Directions card ─────────────────────────────────────────── */
    defineField({
      name: 'directions',
      title: 'Картка «Як ми вирішили задачу»',
      type: 'object',
      options: {collapsible: true},
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
        defineField({name: 'title', title: 'Заголовок', type: 'localizedText'}),
        defineField({name: 'lede', title: 'Lede', type: 'localizedText'}),
        defineField({name: 'replaceLabel', title: 'Лейбл «Замість цього»', type: 'localizedString'}),
        defineField({
          name: 'replaceItems',
          title: 'Пункти «Замість цього»',
          type: 'array',
          of: [defineArrayMember({type: 'localizedString'})],
        }),
        defineField({name: 'allowedLabel', title: 'Лейбл «Це дозволило»', type: 'localizedString'}),
        defineField({
          name: 'allowedItems',
          title: 'Пункти «Це дозволило»',
          type: 'array',
          of: [defineArrayMember({type: 'localizedString'})],
        }),
      ],
    }),

    /* ─── Benefits header ─────────────────────────────────────────── */
    defineField({name: 'benefitsHeading', title: 'Заголовок переваг', type: 'localizedText'}),
    defineField({name: 'benefitsSub', title: 'Підзаголовок переваг', type: 'localizedText'}),

    /* ─── Benefit hero (×3.4 metric) ──────────────────────────────── */
    defineField({
      name: 'benefitHero',
      title: 'Hero-метрика переваг',
      type: 'object',
      options: {collapsible: true},
      fields: [
        defineField({name: 'value', title: 'Значення (display, напр. «×3,4»)', type: 'string'}),
        defineField({name: 'lede', title: 'Підпис', type: 'localizedText'}),
        defineField({name: 'source', title: 'Джерело', type: 'localizedString'}),
        defineField({
          name: 'bullets',
          title: 'Bullet-пункти',
          type: 'array',
          of: [defineArrayMember({type: 'localizedString'})],
        }),
      ],
    }),

    /* ─── Benefit rows (3 рядки з мокапами) ────────────────────────── */
    defineField({
      name: 'benefitRows',
      title: 'Рядки переваг (з мокапами)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'benefitRow',
          fields: [
            defineField({
              name: 'feature',
              title: 'Feature label (display, напр. «FEATURE · 01 / 03»)',
              type: 'string',
            }),
            defineField({name: 'heading', title: 'Заголовок рядка', type: 'localizedText'}),
            defineField({
              name: 'items',
              title: 'Пункти',
              type: 'array',
              of: [defineArrayMember({type: 'localizedString'})],
            }),
            defineField({
              name: 'mockType',
              title: 'Тип мокапу',
              type: 'string',
              options: {
                list: [
                  {title: 'Сітка сторінок (pages)', value: 'pages'},
                  {title: 'Форма запису (booking)', value: 'booking'},
                  {title: 'Адмінка (admin)', value: 'admin'},
                ],
                layout: 'radio',
              },
              initialValue: 'pages',
            }),
            defineField({name: 'mockUrl', title: 'URL у мокапі (display)', type: 'string'}),
            defineField({
              name: 'mockTags',
              title: 'Теги у мокапі (для типу «pages»)',
              type: 'array',
              of: [defineArrayMember({type: 'localizedString'})],
              hidden: ({parent}) => parent?.mockType !== 'pages',
            }),
          ],
          preview: {
            select: {feature: 'feature', heading: 'heading', mockType: 'mockType'},
            prepare({feature, heading, mockType}) {
              return {
                title: feature || pickLocalizedFirst(heading) || 'Benefit row',
                subtitle: [pickLocalizedFirst(heading), mockType].filter(Boolean).join(' · '),
              }
            },
          },
        }),
      ],
    }),

    /* ─── Legacy fields (hidden, kept for backward compat) ─────────── */
    defineField({
      name: 'title',
      title: 'Title (legacy)',
      type: 'localizedString',
      hidden: true,
    }),
    defineField({name: 'intro', title: 'Intro (legacy)', type: 'localizedText', hidden: true}),
    defineField({
      name: 'resultItems',
      title: 'Результати (legacy)',
      type: 'array',
      of: [defineArrayMember({type: 'outcomeResultItem'})],
      hidden: true,
    }),
    defineField({name: 'summary', title: 'Підсумок (legacy)', type: 'localizedText', hidden: true}),
  ],
  preview: {
    select: {recapEyebrow: 'recap.eyebrow'},
    prepare({recapEyebrow}) {
      const line = pickLocalizedFirst(recapEyebrow)
      return {
        title: 'Outcome',
        subtitle: line ? `Outcome · ${line}` : 'Outcome',
      }
    },
  },
})
