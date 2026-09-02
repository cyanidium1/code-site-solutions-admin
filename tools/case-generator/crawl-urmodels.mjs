#!/usr/bin/env node
/**
 * Special-case capture for urmodels.com — a scroll-jacked Webflow site whose
 * sections only reveal in response to real wheel events (window.scrollTo does
 * nothing, so the generic --bands tiler captures only the intro animation).
 *
 * Strategy: load, clear the video preloader, let entrance animations finish,
 * then drive the page with real mouse-wheel deltas (page.mouse.wheel) — which
 * the scroll-jack library listens to — pausing between steps so each revealed
 * section settles before we screenshot the viewport.
 *
 * Output: tools/case-generator/output/urmodels/sections/<name>-<viewport>.png
 * (overwrites the bad band captures so the uploader picks these up instead).
 *
 *   node crawl-urmodels.mjs
 */
import {chromium} from 'playwright'
import {mkdirSync, existsSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'output', 'urmodels', 'sections')
const URL = 'https://www.urmodels.com/'

const VIEWPORTS = {
  desktop: {width: 1440, height: 900, deviceScaleFactor: 2, isMobile: false},
  mobile: {width: 390, height: 844, deviceScaleFactor: 3, isMobile: true},
}
// How many frames to capture per viewport and how far to wheel between each.
const FRAMES = {desktop: 6, mobile: 5}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, {recursive: true})
}

async function dismissCookies(page) {
  for (const sel of [
    'button:has-text("Accept")',
    'button:has-text("Прийняти")',
    'button:has-text("Погоджуюсь")',
    '[class*="cookie"] button',
  ]) {
    try {
      const el = page.locator(sel).first()
      if (await el.isVisible({timeout: 400})) {
        await el.click({timeout: 800})
        await page.waitForTimeout(250)
        return
      }
    } catch {
      /* next */
    }
  }
}

async function waitForPreloader(page) {
  await page
    .waitForFunction(
      () => {
        const sels = ['.preloader1', '.loader-background', '[class*="preloader"]', '#video-wrapper']
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
      {timeout: 12000},
    )
    .catch(() => {})
  await page.waitForTimeout(1500)
}

async function captureViewport(browser, vpName, vp) {
  const ctx = await browser.newContext({
    viewport: {width: vp.width, height: vp.height},
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
  })
  const page = await ctx.newPage()
  try {
    await page.goto(URL, {waitUntil: 'networkidle', timeout: 45000})
  } catch {
    await page.goto(URL, {waitUntil: 'domcontentloaded', timeout: 45000})
  }
  await dismissCookies(page)
  await waitForPreloader(page)

  // Move the mouse into the viewport so wheel events land on the page.
  await page.mouse.move(vp.width / 2, vp.height / 2)

  const frames = FRAMES[vpName]
  const delta = Math.round(vp.height * 0.9)
  for (let i = 0; i < frames; i++) {
    if (i > 0) {
      // a couple of smaller wheel nudges read more reliably than one big jump
      await page.mouse.wheel(0, delta / 2)
      await page.waitForTimeout(250)
      await page.mouse.wheel(0, delta / 2)
    }
    await page.waitForTimeout(1100) // let the scripted reveal/transition settle
    const name = i === 0 ? `hero-${vpName}` : `section-${i + 1}-${vpName}`
    await page.screenshot({path: join(OUT, `${name}.png`)})
    console.log(`  ✓ ${name}.png`)
  }
  await ctx.close()
}

async function main() {
  ensureDir(OUT)
  const browser = await chromium.launch()
  try {
    for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
      console.log(`▶ urmodels (${vpName})`)
      await captureViewport(browser, vpName, vp)
    }
  } finally {
    await browser.close()
  }
  console.log('\nDone. Review tools/case-generator/output/urmodels/sections/ before uploading.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
