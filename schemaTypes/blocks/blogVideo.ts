import {PlayIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * YouTube video embed inside blogPost.body. Stores only the video ID —
 * the frontend renders a click-to-load facade (poster + play button) and
 * injects the youtube-nocookie iframe on demand, so none of Google's
 * player JS loads before the reader interacts.
 *
 * `youtubeId` is a warning-level requirement: an empty block simply does
 * not render on the site, so the article can be published before the
 * video is ready.
 */
export const blogVideo = defineType({
  name: 'blogVideo',
  title: 'Відео (YouTube)',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'youtubeId',
      title: 'YouTube video ID',
      description:
        'Лише ID — частина URL після watch?v=, напр. dQw4w9WgXcQ. ' +
        'Поки поле порожнє, блок не показується на сайті (статтю можна публікувати до готовності відео).',
      type: 'string',
      validation: (rule) => [
        rule.required().warning('Без ID відео блок не рендериться на сайті'),
        rule
          .regex(/^[A-Za-z0-9_-]{6,20}$/)
          .error('Схоже на повний URL — вставте лише ID відео (літери, цифри, "-", "_")'),
      ],
    }),
    defineField({
      name: 'title',
      title: 'Назва відео (для доступності та iframe title)',
      type: 'string',
    }),
    defineField({
      name: 'caption',
      title: 'Підпис під відео (опц.)',
      type: 'string',
    }),
  ],
  preview: {
    select: {youtubeId: 'youtubeId', title: 'title'},
    prepare({youtubeId, title}) {
      return {
        title: title || 'Відео',
        subtitle: youtubeId ? `YouTube · ${youtubeId}` : 'YouTube · ID ще не задано',
      }
    },
  },
})
