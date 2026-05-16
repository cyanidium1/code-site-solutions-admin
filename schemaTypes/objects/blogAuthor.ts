import {defineField, defineType} from 'sanity'

/**
 * Flat author object embedded on a blogPost document.
 * Sprint 2A decision: not a reference to a separate `teamMember` doc —
 * one author per post, hardcoded fields. If we add more contributors
 * later we'll lift this into a teamMember doc with a reference field.
 */
export const blogAuthor = defineType({
  name: 'blogAuthor',
  title: 'Автор',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Імʼя',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Роль',
      type: 'string',
    }),
    defineField({
      name: 'photoUrl',
      title: 'URL фото (опц.)',
      type: 'string',
      description: 'Path під /public, напр. /team/fedir.jpg',
    }),
    defineField({
      name: 'bio',
      title: 'Біо (опц.)',
      type: 'text',
      rows: 3,
    }),
  ],
})
