import {defineField, defineType} from 'sanity'

import {LocalizedPasteTranslationsInput} from '../../components/LocalizedPasteTranslationsInput'

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Текст (UK / RU / EN)',
  type: 'object',
  components: {input: LocalizedPasteTranslationsInput},
  fields: [
    defineField({name: 'uk', title: 'Українська', type: 'string'}),
    defineField({name: 'ru', title: 'Русский', type: 'string'}),
    defineField({name: 'en', title: 'English', type: 'string'}),
  ],
})
