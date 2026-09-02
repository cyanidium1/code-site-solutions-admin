#!/usr/bin/env node
/**
 * Dev-only section-screenshot crawler for portfolio case studies.
 *
 * Captures CROPPED screenshots of individual page blocks (hero, services,
 * catalog, advantages, cta, contact, gallery) — NOT giant full-page strips.
 * Each section is screenshotted by its CSS selector, on both desktop and
 * mobile viewports. Cookie banners are dismissed first; lazy content is
 * given a scroll-pass so images load before capture.
 *
 * Output (gitignored):
 *   tools/case-generator/output/<slug>/sections/<section>-<viewport>.png
 *   tools/case-generator/output/<slug>/full/<viewport>.png   (source only, optional)
 *
 * Usage:
 *   npm run case:crawl                 # all sites
 *   npm run case:crawl -- --site urmodels
 *   npm run case:crawl -- --site urmodels --full   # also keep full-page source
 *   npm run case:inspect -- --site urmodels        # print candidate landmarks
 *
 * Requires: `npm install` in this folder (installs playwright), then
 *   `npx playwright install chromium`.
 */

import {chromium} from 'playwright'
import {readFileSync, mkdirSync, existsSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONFIG = JSON.parse(readFileSync(join(__dirname, 'config', 'sites.json'), 'utf8'))
const OUT_ROOT = join(__dirname, 'output')

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1) return undefined
  const next = process.argv[i + 1]
  return next && !next.startsWith('--') ? next : true
}

const onlySlug = arg('site')
const keepFull = Boolean(arg('full'))
const bandsMode = process.argv.includes('--bands')
const inspectMode = process.argv.includes('--inspect') || process.argv[1]?.includes('inspect')

// How many viewport-height bands to keep per viewport in --bands mode.
const MAX_BANDS = {desktop: 5, mobile: 3}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, {recursive: true})
}

async function dismissCookies(page) {
  for (const sel of CONFIG.cookieDismissSelectors ?? []) {
    try {
      const el = page.locator(sel).first()
      if (await el.isVisible({timeout: 500})) {
        await el.click({timeout: 1000})
        await page.waitForTimeout(300)
        return
      }
    } catch {
      /* selector not present — try next */
    }
  }
}

/** Scroll the whole page once so lazy images/animations settle, then return to top. */
async function settleLazyContent(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0
      const step = () => {
        window.scrollTo(0, y)
        y += window.innerHeight
        if (y < document.body.scrollHeight) setTimeout(step, 120)
        else {
          window.scrollTo(0, 0)
          setTimeout(resolve, 400)
        }
      }
      step()
    })
  })
  await page.waitForTimeout(400)
}

/** Wait until common preloader / loading overlays are gone (best-effort). */
async function waitForPreloader(page) {
  await page
    .waitForFunction(
      () => {
        const sels = [
          '.preloader1',
          '.loader-background',
          '[class*="preloader"]',
          '[class*="page-loader"]',
          '[id*="preloader"]',
          '.loading-screen',
        ]
        return sels.every((s) => {
          const el = document.querySelector(s)
          if (!el) return true
          const st = getComputedStyle(el)
          return (
            st.display === 'none' ||
            st.visibility === 'hidden' ||
            Number(st.opacity) === 0 ||
            el.getBoundingClientRect().height === 0
          )
        })
      },
      {timeout: 9000},
    )
    .catch(() => {})
  // Extra settle for entrance animations that play once the loader clears.
  await page.waitForTimeout(1200)
}

/** Hide position:fixed/sticky elements so a navbar/cookie bar doesn't repeat
 *  in every band. Restored by showSticky(). Uses !important so widget CSS
 *  can't override it. */
async function hideSticky(page) {
  await page.evaluate(() => {
    document.querySelectorAll('body *').forEach((el) => {
      const p = getComputedStyle(el).position
      if (p === 'fixed' || p === 'sticky') {
        el.setAttribute('data-was-sticky', '1')
        el.style.setProperty('visibility', 'hidden', 'important')
      }
    })
  })
}
async function showSticky(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-was-sticky="1"]').forEach((el) => {
      el.style.removeProperty('visibility')
      el.removeAttribute('data-was-sticky')
    })
  })
}

/** After hideSticky(), re-show ONLY the top navigation/header so the hero band
 *  keeps its navbar but floating chat widgets / cookie bars / back-to-top
 *  buttons stay hidden. */
async function showHeaderOnly(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-was-sticky="1"]').forEach((el) => {
      const cls = typeof el.className === 'string' ? el.className : ''
      const r = el.getBoundingClientRect()
      const isHeader =
        el.tagName === 'HEADER' ||
        el.tagName === 'NAV' ||
        Boolean(el.closest('header,nav')) ||
        /\b(nav|navbar|header|menu|topbar)\b/i.test(cls)
      const pinnedTop = r.top <= 120 // a top-anchored bar
      if (isHeader || pinnedTop) {
        el.style.removeProperty('visibility')
        el.removeAttribute('data-was-sticky')
      }
    })
  })
}

/** Belt-and-suspenders: hide common third-party chat / live-support widgets by
 *  known container selectors (covers cases where the launcher isn't itself
 *  position:fixed, e.g. shadow-host wrappers). */
async function hideChatWidgets(page) {
  await page.evaluate(() => {
    const sels = [
      '.crisp-client',
      '#intercom-container',
      '.intercom-lightweight-app',
      '.intercom-launcher',
      '#tawkchat-container',
      '#tawkchat-minified-wrapper',
      '.widget-visible',
      '[id*="livechat" i]',
      '[class*="livechat" i]',
      '[class*="live-chat" i]',
      '[class*="chat-widget" i]',
      '[id*="chat-widget" i]',
      '[aria-label*="chat" i]',
      'iframe[title*="chat" i]',
      'iframe[src*="tawk" i]',
      'iframe[src*="crisp" i]',
      'iframe[src*="intercom" i]',
      'iframe[id*="chat" i]',
    ]
    document.querySelectorAll(sels.join(',')).forEach((el) => {
      el.style.setProperty('visibility', 'hidden', 'important')
      el.style.setProperty('opacity', '0', 'important')
      el.style.setProperty('pointer-events', 'none', 'important')
    })
  })
}

/**
 * Tile the page into non-overlapping viewport-height bands and screenshot each.
 * Band 0 = hero (cover); later bands have sticky chrome hidden so the navbar
 * doesn't repeat. The last band is snapped to the page bottom so there's no
 * blank tail. Produces clean rectangles, never giant vertical strips.
 */
async function captureBands(page, vpName, dir) {
  const {sh, vh} = await page.evaluate(() => ({
    sh: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
    vh: window.innerHeight,
  }))
  const total = Math.max(1, Math.ceil(sh / vh))
  const n = Math.min(total, MAX_BANDS[vpName] ?? 5)

  for (let i = 0; i < n; i++) {
    let y = i * vh
    if (i === n - 1) y = Math.max(0, sh - vh) // snap last band to bottom
    // Always hide floating chrome; on the hero re-show only the top navbar.
    await hideSticky(page)
    if (i === 0) await showHeaderOnly(page)
    await hideChatWidgets(page) // chat launchers stay hidden on every band
    await page.evaluate((yy) => window.scrollTo(0, yy), y)
    await page.waitForTimeout(350)
    const name = i === 0 ? `hero-${vpName}` : `section-${i + 1}-${vpName}`
    await page.screenshot({path: join(dir, `${name}.png`)}) // viewport only
    console.log(`  ✓ ${name}.png`)
  }
  await showSticky(page)
}

/** Pick the first visible, non-trivial element matching any comma-separated selector. */
async function findSection(page, selector) {
  for (const part of selector.split(',').map((s) => s.trim())) {
    const loc = page.locator(part).first()
    try {
      if (await loc.isVisible({timeout: 800})) {
        const box = await loc.boundingBox()
        if (box && box.height > 80 && box.width > 200) return loc
      }
    } catch {
      /* try next */
    }
  }
  return null
}

async function captureSite(browser, site) {
  const slug = site.slug
  console.log(`\n▶ ${site.name}  (${slug})  ${site.url}`)
  const sectionDir = join(OUT_ROOT, slug, 'sections')
  const fullDir = join(OUT_ROOT, slug, 'full')
  ensureDir(sectionDir)
  if (keepFull) ensureDir(fullDir)

  for (const [vpName, vp] of Object.entries(CONFIG.viewports)) {
    const ctx = await browser.newContext({
      viewport: {width: vp.width, height: vp.height},
      deviceScaleFactor: vp.deviceScaleFactor ?? 1,
      isMobile: Boolean(vp.isMobile),
    })
    const page = await ctx.newPage()
    try {
      await page.goto(site.url, {waitUntil: 'networkidle', timeout: 45000})
    } catch {
      await page.goto(site.url, {waitUntil: 'domcontentloaded', timeout: 45000})
    }
    await dismissCookies(page)
    await waitForPreloader(page)
    await settleLazyContent(page)

    if (inspectMode) {
      const landmarks = await page.evaluate(() => {
        const out = []
        document.querySelectorAll('header,section,footer,[class],main>div').forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.height < 120) return
          const cls = typeof el.className === 'string' ? el.className.slice(0, 60) : ''
          out.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls.trim().split(/\s+/).join('.') : ''}  (h=${Math.round(r.height)})`)
        })
        return out.slice(0, 40)
      })
      console.log(`  ── landmarks (${vpName}) ──`)
      landmarks.forEach((l) => console.log('    ' + l))
      await ctx.close()
      continue
    }

    if (keepFull) {
      await page.screenshot({path: join(fullDir, `${vpName}.png`), fullPage: true})
    }

    if (bandsMode || site.mode === 'bands') {
      await captureBands(page, vpName, sectionDir)
      await ctx.close()
      continue
    }

    for (const section of site.sections ?? []) {
      const loc = await findSection(page, section.selector)
      const file = join(sectionDir, `${section.name}-${vpName}.png`)
      if (!loc) {
        console.log(`  ⚠ ${section.name}-${vpName}: no element matched (${section.selector})`)
        continue
      }
      try {
        await loc.scrollIntoViewIfNeeded()
        await page.waitForTimeout(250)
        await loc.screenshot({path: file})
        console.log(`  ✓ ${section.name}-${vpName}.png`)
      } catch (e) {
        console.log(`  ⚠ ${section.name}-${vpName}: capture failed (${e.message})`)
      }
    }
    await ctx.close()
  }
}

async function main() {
  const sites = CONFIG.sites.filter((s) => !onlySlug || s.slug === onlySlug)
  if (sites.length === 0) {
    console.error(`No site matched --site ${onlySlug}. Known: ${CONFIG.sites.map((s) => s.slug).join(', ')}`)
    process.exit(1)
  }
  ensureDir(OUT_ROOT)
  const browser = await chromium.launch()
  try {
    for (const site of sites) await captureSite(browser, site)
  } finally {
    await browser.close()
  }
  console.log(`\nDone. Review images in tools/case-generator/output/<slug>/sections/ before uploading.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
