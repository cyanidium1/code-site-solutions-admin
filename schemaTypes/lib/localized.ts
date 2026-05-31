export type LocalizedStringValue = {
  uk?: string
  ru?: string
  en?: string
}

/**
 * Безпечно дістає перший непорожній рядок з localizedString.
 *
 * Приймає `unknown` (а не лише `LocalizedStringValue | null | undefined`),
 * щоб callsites зі slug-source `(doc) => pickLocalizedFirst(doc?.title)` працювали без касту,
 * — Sanity типізує `doc?.title` як `unknown`, бо `SanityDocument` має indexer `[K: string]: unknown`.
 */
export function pickLocalizedFirst(
  value?: unknown,
  order: Array<keyof LocalizedStringValue> = ['uk', 'ru', 'en'],
): string {
  if (!value || typeof value !== 'object') return ''
  const v = value as Partial<LocalizedStringValue>
  for (const key of order) {
    const raw = v[key]
    const s = typeof raw === 'string' ? raw.trim() : ''
    if (s) return s
  }
  return ''
}
