import {RocketIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {optionalHref} from '../lib/validators'

/**
 * Фінальний крок. Якщо вище в КП є блок варіантів, фронт додає обраний
 * варіант у тему листа / текст повідомлення — див. proposalOptionsBlock.
 */
export const proposalCtaBlock = defineType({
  name: 'proposalCtaBlock',
  title: 'КП · Наступний крок',
  type: 'object',
  icon: RocketIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Надзаголовок', type: 'string'}),
    defineField({
      name: 'heading',
      title: 'Заголовок',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'body', title: 'Текст', type: 'richTextSimple'}),
    defineField({name: 'primaryLabel', title: 'Кнопка — підпис', type: 'string'}),
    defineField({
      name: 'primaryHref',
      title: 'Кнопка — посилання (mailto:, https://t.me/…)',
      type: 'string',
      validation: (rule) => optionalHref(rule),
    }),
    defineField({name: 'secondaryLabel', title: 'Друга кнопка — підпис', type: 'string'}),
    defineField({
      name: 'secondaryHref',
      title: 'Друга кнопка — посилання',
      type: 'string',
      validation: (rule) => optionalHref(rule),
    }),
    defineField({name: 'note', title: 'Примітка під кнопками', type: 'text', rows: 3}),
  ],
  preview: {
    select: {heading: 'heading'},
    prepare({heading}) {
      return {title: heading || 'Наступний крок', subtitle: 'Наступний крок'}
    },
  },
})
