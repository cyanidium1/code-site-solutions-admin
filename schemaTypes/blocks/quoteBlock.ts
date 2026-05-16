import {BlockquoteIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

export const quoteBlock = defineType({
  name: 'quoteBlock',
  title: 'Цитата (pull-quote)',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    defineField({name: 'quote', title: 'Цитата', type: 'localizedText'}),
    defineField({name: 'authorName', title: "Ім'я автора", type: 'string'}),
    defineField({name: 'authorRole', title: 'Роль', type: 'localizedString'}),
    defineField({
      name: 'authorAvatar',
      title: 'Аватар',
      type: 'image',
      options: {hotspot: true},
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
