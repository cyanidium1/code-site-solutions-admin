import {ColorWheelIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorDesignOptions = defineType({
  name: 'calculatorDesignOptions',
  title: 'Калькулятор — Дизайн',
  type: 'document',
  icon: ColorWheelIcon,
  fields: [
    defineField({
      name: 'options',
      title: 'Опції дизайну',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'designOption',
          fields: [
            defineField({
              name: 'optionKey',
              title: 'Ключ (simple / custom / advanced)',
              description: 'Заблокований після збереження.',
              type: 'string',
              options: {
                list: [
                  {title: 'Simple', value: 'simple'},
                  {title: 'Custom', value: 'custom'},
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
              name: 'percent',
              title: 'Множник (0–1)',
              type: 'number',
              validation: (r) => r.required().min(0).max(1),
            }),
            defineField({
              name: 'previews',
              title: 'Прев’ю',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'designPreview',
                  fields: [
                    defineField({
                      name: 'src',
                      title: 'Шлях до зображення',
                      description: 'Наприклад /calculator/design/preview-1.svg',
                      type: 'string',
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: 'caption',
                      title: 'Підпис',
                      type: 'localizedString',
                    }),
                  ],
                  preview: {
                    select: {src: 'src', caption: 'caption'},
                    prepare({src, caption}) {
                      return {title: pickLocalizedFirst(caption) || src, subtitle: src}
                    },
                  },
                }),
              ],
              validation: (r) => r.min(1),
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
      return {title: 'Дизайн', subtitle: `${count} рядків`}
    },
  },
})
