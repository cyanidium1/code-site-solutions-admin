import {defineField, defineType} from 'sanity'

/**
 * Згорнутий блок «читати більше» всередині будь-якої секції КП.
 *
 * Навіщо окремий обʼєкт, а не ще одне поле richTextSimple: КП читають двома
 * проходами — спочатку швидко (ціна, строки, що входить), потім вдумливо
 * (технічні характеристики, методика заміру, застереження). Другий прохід
 * потрібен не всім, тому цей текст на фронті рендериться у <details> і за
 * замовчуванням закритий. Основне тіло секції має лишатися читабельним, якщо
 * details ніхто не відкриє.
 */
export const proposalDetails = defineType({
  name: 'proposalDetails',
  title: 'Згорнутий блок («Технічні характеристики»)',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'label',
      title: 'Підпис кнопки (порожньо → «Технічні характеристики»)',
      type: 'string',
    }),
    defineField({name: 'body', title: 'Текст під катом', type: 'richTextSimple'}),
  ],
})
