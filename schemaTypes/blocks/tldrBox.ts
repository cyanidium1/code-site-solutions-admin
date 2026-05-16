import {ListIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * TL;DR block — used inside blogPost.body. Renders as a light-bg
 * accent-bordered callout. Items support inline `**bold**` markers
 * (the frontend renderer parses them via formatLine).
 */
export const tldrBox = defineType({
  name: 'tldrBox',
  title: 'TL;DR блок',
  type: 'object',
  icon: ListIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      initialValue: 'За 60 секунд',
    }),
    defineField({
      name: 'items',
      title: 'Пункти (Markdown: **жирний** підтримується)',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.min(1).max(12),
    }),
  ],
  preview: {
    select: {title: 'title', items: 'items'},
    prepare({title, items}) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: title || 'TL;DR',
        subtitle: `TL;DR · ${count} item(s)`,
      }
    },
  },
})
