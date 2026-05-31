import {StackIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorProductComplexityOptions = defineType({
  name: 'calculatorProductComplexityOptions',
  title: 'Калькулятор — Складність товарів (e-comm)',
  type: 'document',
  icon: StackIcon,
  fields: [
    defineField({
      name: 'options',
      title: 'Опції складності',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'productComplexityOption',
          fields: [
            defineField({
              name: 'optionKey',
              title: 'Ключ (simple / medium / advanced)',
              description: 'Заблокований після збереження.',
              type: 'string',
              options: {
                list: [
                  {title: 'Simple', value: 'simple'},
                  {title: 'Medium', value: 'medium'},
                  {title: 'Advanced', value: 'advanced'},
                ],
              },
              validation: (r) => r.required(),
              readOnly: ({parent}) => Boolean((parent as {optionKey?: string} | undefined)?.optionKey),
            }),
            defineField({
              name: 'label',
              title: 'Назва',
              type: 'localizedString',
              validation: (r) => requireLocalizedUk('UK обовʼязкова')(r),
            }),
            defineField({name: 'hint', title: 'Підказка', type: 'localizedText'}),
            defineField({
              name: 'price',
              title: 'Ціна (USD, разово)',
              type: 'number',
              validation: (r) => r.required().min(0),
            }),
          ],
          preview: {
            select: {label: 'label', optionKey: 'optionKey', price: 'price'},
            prepare({label, optionKey, price}) {
              const lbl = pickLocalizedFirst(label) || optionKey || '—'
              const detail = typeof price === 'number' ? `+$${price}` : '—'
              return {title: lbl, subtitle: `${optionKey} · ${detail}`}
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {options: 'options'},
    prepare({options}) {
      const count = Array.isArray(options) ? options.length : 0
      return {title: 'Складність товарів', subtitle: `${count} рядків`}
    },
  },
})
