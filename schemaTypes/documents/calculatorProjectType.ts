import {ComponentIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const calculatorProjectType = defineType({
  name: 'calculatorProjectType',
  title: 'Калькулятор — тип проєкту',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'projectKey',
      title: 'Ключ (landing / multiPage / ecommerce)',
      description: 'Незмінний ідентифікатор, який використовує движок калькулятора.',
      type: 'string',
      options: {
        list: [
          {title: 'Landing', value: 'landing'},
          {title: 'Multi-page', value: 'multiPage'},
          {title: 'E-commerce', value: 'ecommerce'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Назва',
      type: 'localizedString',
      validation: (rule) => requireLocalizedUk('UK обовʼязкова')(rule),
    }),
    defineField({
      name: 'hint',
      title: 'Підказка під назвою',
      type: 'localizedText',
    }),
    defineField({
      name: 'basePrice',
      title: 'Базова ціна (USD)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'pages',
      title: 'Діапазон сторінок',
      type: 'object',
      fields: [
        defineField({name: 'min', title: 'Мінімум', type: 'number', validation: (r) => r.required().min(1)}),
        defineField({name: 'max', title: 'Максимум', type: 'number', validation: (r) => r.required().min(1)}),
        defineField({name: 'defaultValue', title: 'За замовчуванням', type: 'number', validation: (r) => r.required()}),
        defineField({name: 'included', title: 'Вже у базі', type: 'number', validation: (r) => r.required().min(0)}),
        defineField({name: 'extraPrice', title: 'Ціна за додаткову сторінку', type: 'number', validation: (r) => r.required().min(0)}),
      ],
    }),
    defineField({name: 'order', title: 'Порядок', type: 'number', initialValue: 0}),
  ],
  orderings: [
    {title: 'Порядок', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {label: 'label', basePrice: 'basePrice', projectKey: 'projectKey'},
    prepare({label, basePrice, projectKey}) {
      return {
        title: pickLocalizedFirst(label) || projectKey,
        subtitle: `${projectKey} · від $${basePrice ?? '—'}`,
      }
    },
  },
})
