import {CommentIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'authorName',
      title: 'Author name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorRole',
      title: 'Author role / company',
      type: 'localizedString',
    }),
    defineField({
      name: 'authorInitials',
      title: 'Author initials (avatar fallback)',
      type: 'string',
      validation: (rule) => rule.max(3),
      description:
        'Up to 3 letters. If left blank, the frontend derives initials from authorName.',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'localizedText',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mockupLeft',
      title: 'Phone mockup (left on desktop, above quote on mobile)',
      type: 'imageWithLocalizedAlt',
    }),
    defineField({
      name: 'mockupRight',
      title: 'Laptop mockup (right on desktop, hidden on mobile)',
      type: 'imageWithLocalizedAlt',
    }),
    defineField({
      name: 'caseRef',
      title: 'Linked case study',
      type: 'reference',
      to: [{type: 'caseStudy'}],
      description:
        "Optional. Adds a 'See the full case study' button below the quote.",
    }),
    defineField({
      name: 'caseLabel',
      title: 'Case-study link label',
      type: 'localizedString',
      description:
        "Optional. Falls back to a localized default ('See the full case study' / 'Подивитись повний кейс') if empty.",
    }),
    defineField({
      name: 'featured',
      title: 'Featured (show on homepage)',
      type: 'boolean',
      initialValue: true,
      description:
        'Uncheck to keep the doc in the collection but exclude from the homepage slider.',
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      initialValue: 0,
      description: 'Lower numbers appear first. Ties broken by most-recently-created.',
    }),
  ],
  preview: {
    select: {
      title: 'authorName',
      subtitle: 'authorRole.en',
      media: 'mockupLeft.image',
    },
  },
  orderings: [
    {
      title: 'Order, ascending',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Most recent',
      name: 'createdDesc',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
  ],
})
