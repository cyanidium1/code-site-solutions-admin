import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

export const outcomeResultItem = defineType({
  name: 'outcomeResultItem',
  title: 'Результат',
  type: 'object',
  fields: [
    defineField({name: 'value', title: 'Значення', type: 'localizedString'}),
    defineField({name: 'label', title: 'Підпис', type: 'localizedString'}),
    defineField({name: 'description', title: 'Опис', type: 'localizedText'}),
  ],
  preview: {
    select: {value: 'value', label: 'label'},
    prepare({value, label}) {
      return {
        title: [pickLocalizedFirst(value), pickLocalizedFirst(label)].filter(Boolean).join(' · ') || 'Результат',
        subtitle: 'Результати · пункт',
      }
    },
  },
})
