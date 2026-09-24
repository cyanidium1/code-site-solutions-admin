import {TextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/** Текстова секція КП: заголовок, абзаци, необовʼязкове зображення і кат. */
export const proposalRichBlock = defineType({
  name: 'proposalRichBlock',
  title: 'КП · Текст',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({name: 'eyebrow', title: 'Надзаголовок', type: 'string'}),
    defineField({name: 'heading', title: 'Заголовок', type: 'string'}),
    defineField({name: 'body', title: 'Текст', type: 'richTextSimple'}),
    defineField({
      name: 'images',
      title: 'Зображення (до трьох в ряд)',
      type: 'array',
      of: [defineArrayMember({type: 'proposalImage'})],
      validation: (rule) => rule.max(3),
    }),
    defineField({name: 'details', title: 'Під катом', type: 'proposalDetails'}),
  ],
  preview: {
    select: {heading: 'heading', eyebrow: 'eyebrow'},
    prepare({heading, eyebrow}) {
      return {title: heading || eyebrow || 'Текст', subtitle: 'Текст'}
    },
  },
})
