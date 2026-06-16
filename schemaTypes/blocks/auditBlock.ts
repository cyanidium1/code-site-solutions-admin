import {ClipboardImageIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {sectionHeaderFields} from '../lib/sectionHeader'

export const auditBlock = defineType({
  name: 'auditBlock',
  title: 'Безкоштовний аудит / лід-форма',
  type: 'object',
  icon: ClipboardImageIcon,
  fields: [
    ...sectionHeaderFields({sub: true}),
    defineField({
      name: 'list',
      title: 'Що отримає клієнт',
      type: 'array',
      of: [defineArrayMember({type: 'localizedString'})],
    }),
    defineField({name: 'foot', title: 'Footnote (під списком)', type: 'localizedString'}),

    defineField({
      name: 'inputs',
      title: 'Плейсхолдери форми',
      type: 'object',
      options: {collapsible: true},
      fields: [
        defineField({name: 'namePlaceholder', title: "Імʼя", type: 'localizedString'}),
        defineField({name: 'contactPlaceholder', title: 'Контакт (email / Telegram)', type: 'localizedString'}),
        defineField({name: 'phonePlaceholder', title: 'Телефон', type: 'localizedString'}),
        defineField({name: 'urlPlaceholder', title: 'URL сайту', type: 'localizedString'}),
      ],
    }),

    defineField({name: 'submitLabel', title: 'Текст кнопки', type: 'localizedString'}),
    defineField({name: 'disclaim', title: 'Disclaimer (під формою)', type: 'localizedString'}),
  ],
  preview: {
    select: {heading: 'heading'},
    prepare({heading}) {
      const line = pickLocalizedFirst(heading)
      return {
        title: line || 'Audit',
        subtitle: 'Audit / lead form',
      }
    },
  },
})
