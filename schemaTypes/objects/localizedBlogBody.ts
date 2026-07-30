import {defineField, defineType} from 'sanity'

import {LocalizedPasteTranslationsInput} from '../../components/LocalizedPasteTranslationsInput'

/**
 * Localized wrapper around the full blog portable-text body. Replaces the
 * legacy `body` / `bodyEn` shadow-field pair on blogPost.
 */
export const localizedBlogBody = defineType({
  name: 'localizedBlogBody',
  title: 'Текст статті (UK / EN)',
  type: 'object',
  components: {input: LocalizedPasteTranslationsInput},
  fields: [
    defineField({name: 'uk', title: 'Українська', type: 'blogBody'}),
    defineField({name: 'en', title: 'English', type: 'blogBody'}),
    defineField({name: 'ru', title: 'Русский', type: 'blogBody'}),
  ],
})
