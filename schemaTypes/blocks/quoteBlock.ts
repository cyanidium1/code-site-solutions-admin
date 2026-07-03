import {BlockquoteIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

export const quoteBlock = defineType({
  name: 'quoteBlock',
  title: 'Цитата (pull-quote)',
  type: 'object',
  icon: BlockquoteIcon,
  fieldsets: [
    {
      name: 'review',
      title: 'Schema.org Review поля',
      options: {collapsible: true, collapsed: true},
    },
  ],
  fields: [
    defineField({name: 'quote', title: 'Цитата', type: 'localizedText'}),
    defineField({name: 'authorName', title: "Ім'я автора", type: 'string'}),
    defineField({name: 'authorRole', title: 'Роль', type: 'localizedString'}),
    defineField({
      name: 'authorAvatar',
      title: 'Аватар',
      type: 'image',
      options: {hotspot: true},
      description: 'Alt-текст не потрібен: фронтенд підставляє імʼя автора як alt.',
    }),
    defineField({
      name: 'isReview',
      title: 'Це відгук клієнта?',
      type: 'boolean',
      description:
        'Увімкнено для клієнтських відгуків (за замовчуванням). Вимкніть для пресових цитат / stat-боксів — тоді блок не публікується як schema.org Review.',
      initialValue: true,
    }),
    defineField({
      name: 'rating',
      title: 'Оцінка (1–5)',
      type: 'number',
      description: 'schema.org Review.reviewRating. Без значення — Review не публікується.',
      validation: (rule) => rule.integer().min(1).max(5),
      hidden: ({parent}) => !parent?.isReview,
      fieldset: 'review',
    }),
    defineField({
      name: 'reviewDate',
      title: 'Дата відгуку',
      type: 'date',
      description: 'schema.org Review.datePublished.',
      hidden: ({parent}) => !parent?.isReview,
      fieldset: 'review',
    }),
    defineField({
      name: 'reviewHeadline',
      title: 'Заголовок відгуку',
      type: 'localizedString',
      description: 'Опціональний короткий підсумок — Review.name у JSON-LD.',
      hidden: ({parent}) => !parent?.isReview,
      fieldset: 'review',
    }),
  ],
  preview: {
    select: {quote: 'quote', media: 'authorAvatar'},
    prepare({quote, media}) {
      const q = pickLocalizedFirst(quote)
      return {
        title: q || 'Quote',
        subtitle: q ? `Quote · ${q.slice(0, 80)}${q.length > 80 ? '…' : ''}` : 'Quote',
        media,
      }
    },
  },
})
