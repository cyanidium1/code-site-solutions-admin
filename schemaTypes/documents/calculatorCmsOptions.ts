import {ListIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorCmsOptions = defineType({
  name: 'calculatorCmsOptions',
  title: 'Калькулятор — CMS опції',
  type: 'document',
  icon: ListIcon,
  fields: [
    defineField({
      name: 'options',
      title: 'CMS опції',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'cmsOption',
          fields: [
            defineField({
              name: 'optionKey',
              title: 'Ключ опції (стабільний id)',
              description:
                'Має співпадати з ключем, який знає движок (напр. "advancedBuilder"). Заблокований після збереження.',
              type: 'string',
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
              validation: (r) => r.min(0),
              initialValue: 0,
            }),
            defineField({
              name: 'included',
              title: 'Включено за замовчуванням',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {label: 'label', optionKey: 'optionKey', price: 'price', included: 'included'},
            prepare({label, optionKey, price, included}) {
              const lbl = pickLocalizedFirst(label) || optionKey || '—'
              const detail = included ? 'included' : typeof price === 'number' ? `+$${price}` : '—'
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
      return {title: 'CMS опції', subtitle: `${count} рядків`}
    },
  },
})
