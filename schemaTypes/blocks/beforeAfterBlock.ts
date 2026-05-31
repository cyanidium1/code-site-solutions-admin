import {SplitHorizontalIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

export const beforeAfterBlock = defineType({
  name: 'beforeAfterBlock',
  title: 'До / після',
  type: 'object',
  icon: SplitHorizontalIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
    defineField({name: 'title', title: 'Заголовок', type: 'localizedString'}),
    defineField({name: 'description', title: 'Опис', type: 'localizedText'}),
    defineField({name: 'beforeImage', title: 'До', type: 'imageWithLocalizedAlt'}),
    defineField({name: 'afterImage', title: 'Після', type: 'imageWithLocalizedAlt'}),
    defineField({name: 'beforeLabel', title: 'Підпис «до»', type: 'localizedString'}),
    defineField({name: 'afterLabel', title: 'Підпис «після»', type: 'localizedString'}),
    defineField({
      name: 'layout',
      title: 'Макет',
      type: 'string',
      options: {
        list: [
          {title: 'Поруч', value: 'sideBySide'},
          {title: 'Один під одним', value: 'stacked'},
        ],
        layout: 'radio',
      },
      initialValue: 'sideBySide',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      before: 'beforeImage.image',
      after: 'afterImage.image',
    },
    prepare({title, before, after}) {
      const line = pickLocalizedFirst(title)
      return {
        title: line || 'До / після',
        subtitle: `До/після · ${line}` ,
        media: before || after,
      }
    },
  },
})
