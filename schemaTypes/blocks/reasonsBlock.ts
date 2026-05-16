import {DocumentsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

export const reasonsBlock = defineType({
  name: 'reasonsBlock',
  title: 'Причини / факти галузі',
  type: 'object',
  icon: DocumentsIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
    defineField({name: 'eyebrowNum', title: 'Eyebrow Num (напр. «/ 03 ПУНКТИ»)', type: 'localizedString'}),
    defineField({name: 'heading', title: 'Заголовок', type: 'localizedText'}),
    defineField({
      name: 'metaRows',
      title: 'Meta-рядки (під заголовком)',
      type: 'array',
      of: [defineArrayMember({type: 'localizedString'})],
    }),
    defineField({
      name: 'reasons',
      title: 'Пункти',
      type: 'array',
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'reason',
          title: 'Пункт',
          fields: [
            defineField({name: 'number', title: 'Номер (display, напр. «01»)', type: 'string'}),
            defineField({name: 'tag', title: 'Тег', type: 'localizedString'}),
            defineField({name: 'title', title: 'Заголовок', type: 'localizedText'}),
            defineField({name: 'text', title: 'Опис (UK)', type: 'richTextSimple'}),
            defineField({name: 'textEn', title: 'Description (EN)', type: 'richTextSimple'}),
            defineField({
              name: 'stat',
              title: 'Статистика (опціонально)',
              type: 'object',
              fields: [
                defineField({name: 'value', title: 'Значення', type: 'string'}),
                defineField({name: 'label', title: 'Підпис', type: 'localizedString'}),
                defineField({name: 'source', title: 'Джерело', type: 'localizedString'}),
              ],
            }),
          ],
          preview: {
            select: {number: 'number', tag: 'tag', title: 'title'},
            prepare({number, tag, title}) {
              const head = number || ''
              const t = pickLocalizedFirst(tag)
              const ti = pickLocalizedFirst(title)
              return {
                title: [head, t].filter(Boolean).join(' · ') || ti || 'Пункт',
                subtitle: ti || 'Reason',
              }
            },
          },
        }),
      ],
    }),
    defineField({name: 'footText', title: 'Footnote (під списком)', type: 'localizedText'}),
    defineField({name: 'footCtaLabel', title: 'Footnote CTA — кнопка', type: 'localizedString'}),
  ],
  preview: {
    select: {reasons: 'reasons'},
    prepare({reasons}) {
      const count = Array.isArray(reasons) ? reasons.length : 0
      return {
        title: 'Reasons',
        subtitle: `Reasons · ${count} item(s)`,
      }
    },
  },
})
