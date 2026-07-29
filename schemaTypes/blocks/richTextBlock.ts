import {TextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {sectionHeaderFields} from '../lib/sectionHeader'

export const richTextBlock = defineType({
  name: 'richTextBlock',
  title: 'Простий текстовий блок',
  type: 'object',
  icon: TextIcon,
  fields: [
    ...sectionHeaderFields(),
    defineField({
      name: 'content',
      title: 'Контент',
      type: 'localizedRichText',
    }),
  ],
  preview: {
    select: {},
    prepare({}) {
      return {
        title: 'Rich text',
        subtitle: 'Текстовий блок',
      }
    },
  },
})
