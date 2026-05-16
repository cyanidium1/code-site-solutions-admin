import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

/**
 * Простий показник: дисплей-значення (зазвичай число чи символьний рядок,
 * наприклад «98», «30+», «$4M raised») плюс локалізована підпис-мітка.
 */
export const metric = defineType({
  name: 'metric',
  title: 'Показник',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Значення (display string)',
      type: 'string',
    }),
    defineField({
      name: 'label',
      title: 'Підпис',
      type: 'localizedString',
    }),
  ],
  preview: {
    select: {value: 'value', label: 'label'},
    prepare({value, label}) {
      const v = (value ?? '').trim()
      const l = pickLocalizedFirst(label)
      return {
        title: [v, l].filter(Boolean).join(' · ') || 'Показник',
        subtitle: 'metric',
      }
    },
  },
})
