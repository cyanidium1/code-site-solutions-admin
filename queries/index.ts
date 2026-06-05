/**
 * GROQ query templates for the Code-Site.Art frontend.
 *
 * STATUS: schemas & queries are in place; the Next.js frontend is NOT wired up yet.
 *
 * Frontend integration plan (when ready):
 *   1. Install `@sanity/client` (or `next-sanity`) in the frontend repo.
 *   2. Create a typed client with projectId="4lk0x7o9", dataset="production",
 *      apiVersion="2024-10-01" (lock the date), useCdn=true for read paths.
 *   3. Either:
 *      a) Import these query strings directly via a path alias / monorepo link, OR
 *      b) Copy them into `frontend/src/lib/queries/` (snapshot copy is fine).
 *   4. Generate types with `sanity typegen` (separate task).
 *
 * Conventions:
 * - Each named export is a GROQ string template. Do NOT execute them in this repo.
 * - All queries that take parameters document the parameter names in their JSDoc.
 * - Locale handling: queries currently project all three locales (uk/ru/en).
 *   The frontend selects the active language client-side.
 */

export * from './fragments'
export * from './blogPost'
export * from './industryPage'
export * from './caseStudy'
export * from './homepageCases'
export * from './pricingPlans'
export * from './calculator'
