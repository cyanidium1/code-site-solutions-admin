import {defineArrayMember, defineField, defineType} from 'sanity'

import {optionalHref} from '../lib/validators'

/**
 * Full portable-text type for blogPost.body.
 *
 * Supports: h2/h3, bullet + numbered lists, blockquote, inline links
 * (with newTab flag), strong/em/underline/code marks, plus the custom
 * blocks tldrBox, ctaCallout, blogTable, blogImage.
 *
 * Distinct from `richTextSimple` — that one is intentionally restricted
 * (no headings, no lists, no images) and used for short captions inside
 * other blocks. Blog body needs the full set.
 */
export const blogBody = defineType({
  name: 'blogBody',
  title: 'Текст статті',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Звичайний', value: 'normal'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'Цитата', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Жирний', value: 'strong'},
          {title: 'Курсив', value: 'em'},
          {title: 'Підкреслений', value: 'underline'},
          {title: 'Код', value: 'code'},
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
    defineArrayMember({type: 'tldrBox'}),
    defineArrayMember({type: 'ctaCallout'}),
    defineArrayMember({type: 'blogTable'}),
    defineArrayMember({type: 'blogImage'}),
  ],
})
