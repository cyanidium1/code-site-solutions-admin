import {EarthGlobeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorLanguageOptions = defineType({
  name: 'calculatorLanguageOptions',
  title: 'Калькулятор — Мови',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'options',
      title: 'Мовні опції',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'languageOption',
          fields: [
            defineField({
              name: 'optionKey',
              title: 'Ключ опції (one / two / three / fourPlus)',
              description: 'Заблокований після збереження.',
              type: 'string',
              options: {
                list: [
                  {title: 'One language', value: 'one'},
                  {title: 'Two languages', value: 'two'},
                  {title: 'Three languages', value: 'three'},
                  {title: 'Four+ languages', value: 'fourPlus'},
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
              name: 'percent',
              title: 'Множник (0–1)',
              type: 'number',
              validation: (r) => r.required().min(0).max(1),
            }),
          ],
          preview: {
            select: {label: 'label', optionKey: 'optionKey', pct: 'percent'},
            prepare({label, optionKey, pct}) {
              const lbl = pickLocalizedFirst(label) || optionKey || '—'
              const detail = typeof pct === 'number' ? `+${Math.round(pct * 100)}%` : '—'
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
      return {title: 'Мови', subtitle: `${count} рядків`}
    },
  },
})
