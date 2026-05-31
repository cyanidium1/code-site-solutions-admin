import {WrenchIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorMaintenanceOptions = defineType({
  name: 'calculatorMaintenanceOptions',
  title: 'Калькулятор — Підтримка',
  type: 'document',
  icon: WrenchIcon,
  fields: [
    defineField({
      name: 'options',
      title: 'Плани підтримки',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'maintenanceOption',
          fields: [
            defineField({
              name: 'optionKey',
              title: 'Ключ (none / basic / growth / dedicated)',
              description: 'Заблокований після збереження.',
              type: 'string',
              options: {
                list: [
                  {title: 'None', value: 'none'},
                  {title: 'Basic care', value: 'basic'},
                  {title: 'Growth support', value: 'growth'},
                  {title: 'Dedicated', value: 'dedicated'},
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
              name: 'monthlyPrice',
              title: 'Місячна ціна (USD)',
              type: 'number',
              validation: (r) => r.required().min(0),
            }),
          ],
          preview: {
            select: {label: 'label', optionKey: 'optionKey', monthly: 'monthlyPrice'},
            prepare({label, optionKey, monthly}) {
              const lbl = pickLocalizedFirst(label) || optionKey || '—'
              const detail = typeof monthly === 'number' ? `$${monthly}/mo` : '—'
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
      return {title: 'Підтримка', subtitle: `${count} рядків`}
    },
  },
})
