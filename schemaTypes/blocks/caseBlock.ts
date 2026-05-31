import {SplitHorizontalIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

const beforeAfterFields = (kind: 'до' | 'після') => [
  defineField({name: 'num', title: `Номер версії (display, напр. «v1 · 2022»)`, type: 'string'}),
  defineField({name: 'image', title: `Скріншот «${kind}»`, type: 'imageWithLocalizedAlt'}),
  defineField({name: 'url', title: 'URL у адресному рядку (display)', type: 'string'}),
  defineField({name: 'alt', title: 'Alt-текст', type: 'localizedString'}),
  defineField({name: 'tagline', title: 'Тagline (під картинкою)', type: 'localizedString'}),
  defineField({
    name: 'items',
    title: 'Список пунктів',
    type: 'array',
    of: [defineArrayMember({type: 'localizedString'})],
  }),
  defineField({name: 'foot', title: 'Footnote (під списком)', type: 'localizedText'}),
]

export const caseBlock = defineType({
  name: 'caseBlock',
  title: 'Кейс / До-Після проєкту',
  type: 'object',
  icon: SplitHorizontalIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow (напр. «РЕАЛЬНИЙ КЕЙС»)', type: 'localizedString'}),
    defineField({name: 'eyebrowEm', title: 'Eyebrow Em (напр. «КЛІНІКА «ЕФЕДРА», ОДЕСА»)', type: 'localizedString'}),
    defineField({name: 'heading', title: 'Заголовок', type: 'localizedText'}),
    defineField({name: 'lede', title: 'Lede / опис', type: 'localizedText'}),

    defineField({
      name: 'meta',
      title: 'Meta-стрічка (3 пункти)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'caseMeta',
          fields: [
            defineField({name: 'strong', title: 'Виділене', type: 'localizedString'}),
            defineField({name: 'text', title: 'Підпис', type: 'localizedString'}),
          ],
          preview: {
            select: {strong: 'strong', text: 'text'},
            prepare({strong, text}) {
              return {
                title: pickLocalizedFirst(strong) || 'Meta',
                subtitle: pickLocalizedFirst(text),
              }
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'before',
      title: 'БУЛО',
      type: 'object',
      options: {collapsible: true},
      fields: beforeAfterFields('до'),
    }),
    defineField({
      name: 'after',
      title: 'СТАЛО',
      type: 'object',
      options: {collapsible: true},
      fields: beforeAfterFields('після'),
    }),

    defineField({
      name: 'results',
      title: 'Результати (метрики)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'caseResult',
          fields: [
            defineField({name: 'value', title: 'Значення (display)', type: 'string'}),
            defineField({name: 'label', title: 'Підпис', type: 'localizedString'}),
            defineField({name: 'tag', title: 'Тег / категорія', type: 'localizedString'}),
          ],
          preview: {
            select: {value: 'value', label: 'label', tag: 'tag'},
            prepare({value, label, tag}) {
              return {
                title: [value, pickLocalizedFirst(tag)].filter(Boolean).join(' · ') || 'Result',
                subtitle: pickLocalizedFirst(label),
              }
            },
          },
        }),
      ],
    }),

    defineField({name: 'ctaText', title: 'CTA-текст', type: 'localizedText'}),
    defineField({name: 'ctaLabel', title: 'CTA — кнопка', type: 'localizedString'}),
  ],
  preview: {
    select: {heading: 'heading'},
    prepare({heading}) {
      const line = pickLocalizedFirst(heading)
      return {
        title: line || 'Кейс',
        subtitle: `Кейс · ${line}` ,
      }
    },
  },
})
