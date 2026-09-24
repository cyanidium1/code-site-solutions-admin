import {defineField, defineType} from 'sanity'

/**
 * Зображення в КП: скриншот, мокап, «було / стало».
 *
 * Свій тип, а не спільний `imageWithLocalizedAlt`: там alt мультимовний, а
 * КП одномовне — три поля замість одного на кожну картинку редактор
 * заповнювати не буде. Тут же є `caption` — підпис, який клієнт бачить під
 * зображенням; alt лишається для читачів з екранними дикторами.
 */
export const proposalImage = defineType({
  name: 'proposalImage',
  title: 'Зображення',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Файл',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Підпис під зображенням (видно клієнту)',
      type: 'string',
    }),
    defineField({
      name: 'alt',
      title: 'Alt — опис для тих, хто не бачить зображення',
      type: 'string',
    }),
  ],
  preview: {
    select: {media: 'image', caption: 'caption', alt: 'alt'},
    prepare({media, caption, alt}) {
      return {title: caption || alt || 'Зображення', media}
    },
  },
})
