import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {optionalHref} from '../lib/validators'

export const ctaAction = defineType({
  name: 'ctaAction',
  title: 'Дія CTA',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Текст кнопки', type: 'localizedString'}),
    defineField({name: 'description', title: 'Опис', type: 'localizedText'}),
    defineField({
      name: 'href',
      title: 'Посилання (URL, шлях, mailto:, tel:)',
      type: 'string',
      validation: (rule) => optionalHref(rule),
    }),
    defineField({
      name: 'type',
      title: 'Тип',
      type: 'string',
      options: {
        list: [
          {title: 'Calendly', value: 'calendly'},
          {title: 'Telegram', value: 'telegram'},
          {title: 'Форма', value: 'form'},
          {title: 'Email', value: 'email'},
          {title: 'Телефон', value: 'phone'},
          {title: 'Інше', value: 'custom'},
        ],
        layout: 'radio',
      },
      initialValue: 'custom',
    }),
  ],
  preview: {
    select: {label: 'label', type: 'type'},
    prepare({label, type: actionType}) {
      return {
        title: pickLocalizedFirst(label) || 'Дія',
        subtitle: actionType ? String(actionType) : 'CTA',
      }
    },
  },
})
