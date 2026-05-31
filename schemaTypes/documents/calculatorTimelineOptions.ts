import {ClockIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorTimelineOptions = defineType({
  name: 'calculatorTimelineOptions',
  title: 'Калькулятор — Таймлайн',
  type: 'document',
  icon: ClockIcon,
  fields: [
    defineField({
      name: 'options',
      title: 'Опції таймлайну',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'timelineOption',
          fields: [
            defineField({
              name: 'optionKey',
              title: 'Ключ (standard / faster / urgent)',
              description: 'Заблокований після збереження.',
              type: 'string',
              options: {
                list: [
                  {title: 'Standard', value: 'standard'},
                  {title: 'Faster', value: 'faster'},
                  {title: 'Urgent', value: 'urgent'},
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
      return {title: 'Таймлайн', subtitle: `${count} рядків`}
    },
  },
})
