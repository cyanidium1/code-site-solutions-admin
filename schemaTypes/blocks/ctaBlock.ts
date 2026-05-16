import {LaunchIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

export const ctaBlock = defineType({
  name: 'ctaBlock',
  title: 'CTA / контактний блок',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
    defineField({name: 'title', title: 'Заголовок', type: 'localizedString'}),
    defineField({name: 'description', title: 'Опис', type: 'localizedText'}),
    defineField({
      name: 'actions',
      title: 'Дії',
      type: 'array',
      of: [defineArrayMember({type: 'ctaAction'})],
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      const line = pickLocalizedFirst(title)
      return {
        title: line || 'CTA',
        subtitle: `CTA · ${line}` ,
      }
    },
  },
})
