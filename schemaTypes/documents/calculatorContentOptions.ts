import {EditIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorContentOptions = defineType({
  name: 'calculatorContentOptions',
  title: 'Калькулятор — Контент',
  type: 'document',
  icon: EditIcon,
  fields: [
    defineField({
      name: 'options',
      title: 'Контентні опції',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'contentOption',
          fields: [
            defineField({
              name: 'optionKey',
              title: 'Ключ (clientProvided / lightPolishing / fullCopywriting / seoCopywriting)',
              description: 'Заблокований після збереження.',
              type: 'string',
              options: {
                list: [
                  {title: 'Client provided', value: 'clientProvided'},
                  {title: 'Light polishing', value: 'lightPolishing'},
                  {title: 'Full copywriting', value: 'fullCopywriting'},
                  {title: 'SEO copywriting', value: 'seoCopywriting'},
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
      return {title: 'Контент', subtitle: `${count} рядків`}
    },
  },
})
