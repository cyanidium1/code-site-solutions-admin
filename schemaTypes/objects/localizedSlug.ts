import {defineField, defineType} from 'sanity'

import {pickLocalizedFirst} from '../lib/localized'

/**
 * Per-locale slugs. The blog needs distinct slugs per locale for SEO
 * (e.g. /blog/vartist-rozrobky-saytu-2026 ↔ /en/blog/custom-website-cost-uk-2026).
 * Replaces the legacy `slug` / `slugEn` pair on blogPost.
 */
export const localizedSlug = defineType({
  name: 'localizedSlug',
  title: 'Slug (UK / EN)',
  type: 'object',
  fields: [
    defineField({
      name: 'uk',
      title: 'Українська',
      type: 'slug',
      options: {
        maxLength: 96,
        source: (doc) => pickLocalizedFirst((doc as {title?: unknown}).title, ['uk']),
      },
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'slug',
      options: {
        maxLength: 96,
        source: (doc) => pickLocalizedFirst((doc as {title?: unknown}).title, ['en']),
      },
    }),
  ],
})
