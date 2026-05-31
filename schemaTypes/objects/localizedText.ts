import {defineField, defineType} from 'sanity'

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Довгий текст (UK / RU / EN)',
  type: 'object',
  fields: [
    defineField({name: 'uk', title: 'Українська', type: 'text', rows: 4}),
    defineField({name: 'ru', title: 'Русский', type: 'text', rows: 4}),
    defineField({name: 'en', title: 'English', type: 'text', rows: 4}),
  ],
})
