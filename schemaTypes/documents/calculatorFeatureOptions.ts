import {RocketIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

const FEATURE_GROUP_OPTIONS = [
  {title: 'Lead capture', value: 'leadCapture'},
  {title: 'Conversion & tracking', value: 'conversion'},
  {title: 'Advanced UX', value: 'advancedUx'},
] as const

export const calculatorFeatureOptions = defineType({
  name: 'calculatorFeatureOptions',
  title: 'Калькулятор — Features',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'options',
      title: 'Features',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'featureOption',
          fields: [
            defineField({
              name: 'optionKey',
              title: 'Ключ опції (стабільний id)',
              description:
                'Має співпадати з ключем, який знає движок (напр. "leadForm"). Заблокований після збереження.',
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
            defineField({
              name: 'featureGroup',
              title: 'Підгрупа',
              type: 'string',
              options: {list: FEATURE_GROUP_OPTIONS.slice()},
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: {
              label: 'label',
              optionKey: 'optionKey',
              price: 'price',
              featureGroup: 'featureGroup',
              included: 'included',
            },
            prepare({label, optionKey, price, featureGroup, included}) {
              const lbl = pickLocalizedFirst(label) || optionKey || '—'
              const money = included ? 'included' : typeof price === 'number' ? `+$${price}` : '—'
              return {title: lbl, subtitle: `${featureGroup} · ${optionKey} · ${money}`}
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
      return {title: 'Features', subtitle: `${count} рядків`}
    },
  },
})
