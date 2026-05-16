import {CommentIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {optionalHref} from '../lib/validators'

export const testimonialBlock = defineType({
  name: 'testimonialBlock',
  title: 'Відгук клієнта',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({name: 'quote', title: 'Цитата', type: 'localizedText'}),
    defineField({name: 'authorName', title: "Ім'я автора", type: 'string'}),
    defineField({name: 'authorRole', title: 'Роль', type: 'localizedString'}),
    defineField({name: 'authorCompany', title: 'Компанія', type: 'string'}),
    defineField({
      name: 'authorAvatar',
      title: 'Аватар',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'testimonialType',
      title: 'Тип відгуку',
      type: 'string',
      options: {
        list: [
          {title: 'Текст', value: 'text'},
          {title: 'Відео', value: 'video'},
        ],
        layout: 'radio',
      },
      initialValue: 'text',
    }),
    defineField({
      name: 'videoUrl',
      title: 'URL відео',
      type: 'url',
      validation: (rule) => rule.uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({name: 'videoFile', title: 'Файл відео', type: 'file'}),
    defineField({name: 'linkLabel', title: 'Текст посилання', type: 'localizedString'}),
    defineField({
      name: 'linkUrl',
      title: 'Посилання',
      type: 'string',
      validation: (rule) => optionalHref(rule),
    }),
    defineField({name: 'showLink', title: 'Показувати посилання', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {
      authorName: 'authorName',
      quote: 'quote',
      media: 'authorAvatar',
    },
    prepare({authorName, quote, media}) {
      const q = pickLocalizedFirst(quote)
      return {
        title: authorName || 'Відгук',
        subtitle: q ? `Відгук · ${q.slice(0, 80)}${q.length > 80 ? '…' : ''}` : 'Відгук клієнта',
        media,
      }
    },
  },
})
