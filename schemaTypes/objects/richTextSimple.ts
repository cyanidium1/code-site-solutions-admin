import {defineArrayMember, defineField, defineType} from 'sanity'

import {optionalHref} from '../lib/validators'

/**
 * Спрощений portable text: лише bold, italic та посилання.
 * Без зображень, без списків, без заголовків — щоб поля не перетворювалися на повноцінний редактор статей.
 */
export const richTextSimple = defineType({
  name: 'richTextSimple',
  title: 'Текст з форматуванням',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Звичайний', value: 'normal'}],
      lists: [],
      marks: {
        decorators: [
          {title: 'Жирний', value: 'strong'},
          {title: 'Курсив', value: 'em'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Посилання',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL / шлях / mailto: / tel:',
                type: 'string',
                validation: (rule) => optionalHref(rule),
              }),
              defineField({
                name: 'newTab',
                title: 'Відкривати у новій вкладці',
                type: 'boolean',
                initialValue: false,
              }),
            ],
          }),
        ],
      },
    }),
  ],
})
