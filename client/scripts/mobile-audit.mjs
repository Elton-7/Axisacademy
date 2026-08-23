// Walks every public page at narrow widths and reports anything that overflows.
import { chromium } from 'playwright-core'

import { staticRoutes } from './routes.mjs'
const ROUTES = staticRoutes.map((r) => r.path)
const WIDTHS = [320, 390]
const BASE = process.env.BASE || 'http://localhost:5173'

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome' })
  const problems = []

  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 780 }, deviceScaleFactor: 1 })
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(900)

      const report = await page.evaluate((vw) => {
        const doc = document.documentElement
        const overflow = doc.scrollWidth - vw

        // Name the widest offenders rather than just saying the page is wide.
        const culprits = []
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          if (r.right > vw + 1 || r.left < -1) {
            const style = getComputedStyle(el)
            if (style.position === 'fixed') continue // toggles and chat bubbles sit deliberately
            culprits.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.className || '').toString().slice(0, 60),
              right: Math.round(r.right),
              text: (el.textContent || '').trim().slice(0, 40),
            })
          }
        }
        // Only the outermost few matter; children inherit the problem.
        return { overflow, culprits: culprits.slice(0, 3) }
      }, width)

      if (report.overflow > 1) {
        problems.push({ width, route, ...report })
        console.log(`OVERFLOW ${width}px ${route}  +${report.overflow}px`)
        for (const c of report.culprits) {
          console.log(`    <${c.tag} class="${c.cls}"> right=${c.right} "${c.text}"`)
        }
      }
    }
    await page.close()
  }

  console.log(problems.length ? `\n${problems.length} page/width combinations overflow` : '\nNo horizontal overflow at any width')
  await browser.close()
})().catch((e) => console.log('failed:', e.message))
