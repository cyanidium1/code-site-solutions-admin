import type {Rule, StringRule} from 'sanity'

import type {LocalizedStringValue} from './localized'

const LOCALES: Array<keyof LocalizedStringValue> = ['uk', 'ru', 'en']

export function requireLocalizedString(message = 'Заповніть хоча б одну мову') {
  return (rule: Rule) =>
    rule.custom((val: LocalizedStringValue | undefined) => {
      const ok = LOCALES.some((key) => {
        const s = (val?.[key] ?? '').trim()
        return Boolean(s)
      })
      return ok || message
    })
}

/** Жорстка вимога: поле UK обовʼязкове. */
export function requireLocalizedUk(message = 'Поле UK обовʼязкове') {
  return (rule: Rule) =>
    rule.custom((val: LocalizedStringValue | undefined) => {
      const uk = (val?.uk ?? '').trim()
      return Boolean(uk) || message
    })
}

/** Рекомендація: бажано заповнити UK (warning, не error). */
export function recommendLocalizedUk(message = 'Рекомендуємо заповнити UK') {
  return (rule: Rule) =>
    rule
      .custom((val: LocalizedStringValue | undefined) => {
        const uk = (val?.uk ?? '').trim()
        return Boolean(uk) || message
      })
      .warning()
}

/** Дозволяє порожнє значення; інакше — абсолютний URL, відносний шлях, mailto:, tel:. */
export function optionalHref(rule: StringRule) {
  return rule.custom((value: string | undefined) => {
    if (value === undefined || value === null) return true
    const v = String(value).trim()
    if (!v) return true
    if (v.startsWith('/')) return true
    if (v.startsWith('mailto:') || v.startsWith('tel:')) return true
    try {
      // eslint-disable-next-line no-new
      new URL(v)
      return true
    } catch {
      return 'Некоректний URL або шлях'
    }
  })
}
