import {HelpCircleIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'
import {requireLocalizedUk} from '../lib/validators'

export const faqBlock = defineType({
  name: 'faqBlock',
  title: 'FAQ — секція з питаннями',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'localizedString'}),
    defineField({name: 'heading', title: 'Заголовок', type: 'localizedText'}),
    defineField({
      name: 'items',
      title: 'Питання та відповіді',
      type: 'array',
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqEntry',
          title: 'Питання',
          fields: [
            defineField({
              name: 'question',
              title: 'Питання',
              type: 'localizedString',
              validation: (rule) => requireLocalizedUk('Питання UK обовʼязкове')(rule),
            }),
            defineField({
              name: 'answer',
              title: 'Відповідь (UK)',
              type: 'richTextSimple',
            }),
            defineField({
              name: 'answerEn',
              title: 'Answer (EN)',
              type: 'richTextSimple',
            }),
          ],
          preview: {
            select: {question: 'question'},
            prepare({question}) {
              return {
                title: pickLocalizedFirst(question) || 'Питання',
                subtitle: 'FAQ entry',
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {items: 'items'},
    prepare({items}) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: 'FAQ',
        subtitle: `FAQ · ${count} item(s)`,
      }
    },
  },
})
