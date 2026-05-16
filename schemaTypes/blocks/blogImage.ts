import {ImageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Inline image inside a blog post body. Alt text is required —
 * the frontend renderer throws if missing.
 */
export const blogImage = defineType({
  name: 'blogImage',
  title: 'Зображення',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt-текст (обовʼязково)',
      type: 'string',
      validation: (rule) =>
        rule.required().error('Alt-текст обовʼязковий для accessibility та SEO'),
    }),
    defineField({
      name: 'caption',
      title: 'Підпис (опц.)',
      type: 'string',
    }),
  ],
})
