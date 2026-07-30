/**
 * Canonical locale ids for field-level i18n. Must match the field names in
 * localizedString / localizedText / localizedRichText / localizedBlogBody.
 * Adding a locale: extend PROJECT_LOCALE_IDS + normalizeLocaleToken + the
 * schema objects, in one commit (see workspace docs/adding-a-locale.md).
 *
 */
export type ProjectLocaleId = 'uk' | 'en' | 'ru'

export const PROJECT_LOCALE_IDS: readonly ProjectLocaleId[] = ['uk', 'en', 'ru']

/** Primary authoring locale — drives the "Copy UK to all" convenience button. */
export const PRIMARY_LOCALE_ID: ProjectLocaleId = 'uk'

export function isProjectLocaleId(s: string): s is ProjectLocaleId {
  return (PROJECT_LOCALE_IDS as readonly string[]).includes(s)
}

/** Normalize paste labels / JSON keys to a project locale (UA→uk, ENG→en). */
export function normalizeLocaleToken(raw: string): ProjectLocaleId | undefined {
  const t = raw.trim().toLowerCase()
  if (!t) return undefined
  if (t === 'en' || t === 'eng') return 'en'
  if (t === 'uk' || t === 'ua' || t === 'ukr') return 'uk'
  if (t === 'ru' || t === 'rus') return 'ru'
  return undefined
}
