import {BarChartIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {sectionHeaderFields} from '../lib/sectionHeader'

export const statsBlock = defineType({
  name: 'statsBlock',
  title: 'Статистика',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    ...sectionHeaderFields(),
    defineField({
      name: 'items',
      title: 'Показники',
      type: 'array',
      of: [defineArrayMember({type: 'metric'})],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: {heading: 'heading', items: 'items'},
    prepare({heading, items}) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: pickLocalizedFirst(heading) || 'Stats',
        subtitle: `Stats · ${count} item(s)`,
      }
    },
  },
})
