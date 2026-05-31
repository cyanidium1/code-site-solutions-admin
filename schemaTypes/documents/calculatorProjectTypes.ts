import {ComponentIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorProjectTypes = defineType({
  name: 'calculatorProjectTypes',
  title: 'Калькулятор — Типи проєктів',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'types',
      title: 'Типи проєктів',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'projectTypeRow',
          fields: [
            defineField({
              name: 'projectKey',
              title: 'Ключ (camelCase id, напр. landing / multiPage / ecommerce / webApp)',
              description:
                'Стабільний ідентифікатор у camelCase, без пробілів. Заблокований після збереження. ' +
                'Будь-який унікальний рядок — додавайте нові типи проєктів за потребою.',
              type: 'string',
              validation: (r) =>
                r
                  .required()
                  .regex(/^[a-z][a-zA-Z0-9]*$/, {name: 'camelCase'})
                  .max(40),
              readOnly: ({parent}) => Boolean((parent as {projectKey?: string} | undefined)?.projectKey),
            }),
            defineField({
              name: 'label',
              title: 'Назва',
              type: 'localizedString',
              validation: (r) => requireLocalizedUk('UK обовʼязкова')(r),
            }),
            defineField({name: 'hint', title: 'Підказка', type: 'localizedText'}),
            defineField({
              name: 'basePrice',
              title: 'Базова ціна (USD)',
              type: 'number',
              validation: (r) => r.required().min(0),
            }),
            defineField({
              name: 'hasProductComplexity',
              title: 'Показувати тариф складності товарів',
              description:
                'Якщо увімкнено — у калькуляторі зʼявляється секція "Складність товарів" ' +
                '(простий/середній/просунутий каталог) і додає вартість до підсумку. ' +
                'Для класичних e-commerce проєктів — увімкнено.',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'pages',
              title: 'Діапазон сторінок',
              type: 'object',
              fields: [
                defineField({name: 'min', title: 'Мінімум', type: 'number', validation: (r) => r.required().min(1)}),
                defineField({name: 'max', title: 'Максимум', type: 'number', validation: (r) => r.required().min(1)}),
                defineField({
                  name: 'defaultValue',
                  title: 'За замовчуванням',
                  type: 'number',
                  validation: (r) => r.required(),
                }),
                defineField({name: 'included', title: 'Вже у базі', type: 'number', validation: (r) => r.required().min(0)}),
                defineField({
                  name: 'extraPrice',
                  title: 'Ціна за додаткову сторінку',
                  type: 'number',
                  validation: (r) => r.required().min(0),
                }),
              ],
            }),
          ],
          preview: {
            select: {label: 'label', projectKey: 'projectKey', basePrice: 'basePrice'},
            prepare({label, projectKey, basePrice}) {
              const lbl = pickLocalizedFirst(label) || projectKey || '—'
              const detail = typeof basePrice === 'number' ? `від $${basePrice}` : '—'
              return {title: lbl, subtitle: `${projectKey} · ${detail}`}
            },
          },
        }),
      ],
      validation: (r) => r.min(1).max(10),
    }),
  ],
  preview: {
    select: {types: 'types'},
    prepare({types}) {
      const count = Array.isArray(types) ? types.length : 0
      return {title: 'Типи проєктів', subtitle: `${count} рядків`}
    },
  },
})
