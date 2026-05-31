import {ThListIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Custom 2D-array table block. Keeping it as a simple headers + rows
 * shape avoids pulling in the Sanity table plugin. Cells support
 * inline `**bold**` (parsed by the frontend renderer).
 */
export const blogTable = defineType({
  name: 'blogTable',
  title: 'Таблиця',
  type: 'object',
  icon: ThListIcon,
  fields: [
    defineField({
      name: 'headers',
      title: 'Заголовки стовпців',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.min(2).max(6),
    }),
    defineField({
      name: 'rows',
      title: 'Рядки',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'blogTableRow',
          fields: [
            defineField({
              name: 'cells',
              title: 'Клітинки (по одному рядку на колонку)',
              type: 'array',
              of: [defineArrayMember({type: 'string'})],
            }),
          ],
          preview: {
            select: {cells: 'cells'},
            prepare({cells}) {
              return {
                title: Array.isArray(cells) ? cells.join(' · ') : 'Row',
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {rows: 'rows', headers: 'headers'},
    prepare({rows, headers}) {
      const cols = Array.isArray(headers) ? headers.length : 0
      const r = Array.isArray(rows) ? rows.length : 0
      return {
        title: 'Table',
        subtitle: `${cols} cols × ${r} rows`,
      }
    },
  },
})
