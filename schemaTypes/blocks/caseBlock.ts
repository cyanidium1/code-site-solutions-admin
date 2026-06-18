import {SplitHorizontalIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {sectionHeaderFields} from '../lib/sectionHeader'

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
    defineField({
      name: 'layout',
      title: 'Макет кейсу',
      description:
        'Auto: «до/після» лише коли є зображення «до», інакше — лише «після» (зображення + список). Comparison / After-only — примусово.',
      type: 'string',
      options: {
        list: [
          {title: 'Auto (за наявністю «до»)', value: 'auto'},
          {title: 'Порівняння «до/після»', value: 'comparison'},
          {title: 'Лише «після» (зображення + текст)', value: 'afterOnly'},
        ],
        layout: 'radio',
      },
      initialValue: 'auto',
    }),
    ...sectionHeaderFields({eyebrowTitle: 'Eyebrow (напр. «РЕАЛЬНИЙ КЕЙС»)'}),
    defineField({name: 'eyebrowEm', title: 'Eyebrow Em (напр. «КЛІНІКА «ЕФЕДРА», ОДЕСА»)', type: 'localizedString'}),
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
            defineField({name: 'value', title: 'Значення (display)', type: 'localizedString'}),
            defineField({name: 'label', title: 'Підпис', type: 'localizedString'}),
            defineField({name: 'tag', title: 'Тег / категорія', type: 'localizedString'}),
          ],
          preview: {
            select: {value: 'value', label: 'label', tag: 'tag'},
            prepare({value, label, tag}) {
              return {
                title:
                  [pickLocalizedFirst(value), pickLocalizedFirst(tag)].filter(Boolean).join(' · ') ||
                  'Result',
                subtitle: pickLocalizedFirst(label),
              }
            },
          },
        }),
      ],
    }),

    defineField({name: 'ctaText', title: 'CTA-текст', type: 'localizedText'}),
    defineField({
      name: 'cta',
      title: 'CTA — кнопка',
      description: 'Текст кнопки. Посилання необовʼязкове — без нього веде на портфоліо галузі.',
      type: 'ctaAction',
    }),
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
