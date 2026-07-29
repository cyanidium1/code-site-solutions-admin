import {defineField, defineType} from 'sanity'

import {LocalizedPasteTranslationsInput} from '../../components/LocalizedPasteTranslationsInput'

/**
 * Localized wrapper around richTextSimple. Replaces the legacy paired
 * `x` / `xEn` richTextSimple fields (richTextBlock.content, imageTextBlock.body,
 * reasonsBlock.reasons[].text, faqBlock.items[].answer).
 */
export const localizedRichText = defineType({
  name: 'localizedRichText',
  title: 'Текст із форматуванням (UK / EN)',
  type: 'object',
  components: {input: LocalizedPasteTranslationsInput},
  fields: [
    defineField({name: 'uk', title: 'Українська', type: 'richTextSimple'}),
    defineField({name: 'en', title: 'English', type: 'richTextSimple'}),
  ],
})
