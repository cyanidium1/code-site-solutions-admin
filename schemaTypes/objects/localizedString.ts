import {defineField, defineType} from 'sanity'

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Текст (UK / RU / EN)',
  type: 'object',
  fields: [
    defineField({name: 'uk', title: 'Українська', type: 'string'}),
    defineField({name: 'ru', title: 'Русский', type: 'string'}),
    defineField({name: 'en', title: 'English', type: 'string'}),
  ],
})
