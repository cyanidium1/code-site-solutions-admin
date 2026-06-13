import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

/**
 * Простий показник: локалізоване дисплей-значення (зазвичай число чи символьний
 * рядок, наприклад «98», «30+», «$4M raised») плюс локалізована підпис-мітка.
 * Обидва поля локалізовані — значення можна перекладати, коли воно містить слова
 * (напр. «Top-1» → «1-е місце», «$4M raised» → «$4M залучено»).
 */
export const metric = defineType({
  name: 'metric',
  title: 'Показник',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Значення (display string)',
      type: 'localizedString',
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
      const v = pickLocalizedFirst(value)
      const l = pickLocalizedFirst(label)
      return {
        title: [v, l].filter(Boolean).join(' · ') || 'Показник',
        subtitle: 'metric',
      }
    },
  },
})
