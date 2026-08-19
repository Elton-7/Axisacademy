/**
 * Walks every public page in both themes and reports text that fails WCAG AA.
 *
 * The theme is built from CSS variables that are redefined under .dark, so a
 * colour pairing that passes in one theme can fail in the other while looking
 * fine in the editor. Checking the rendered page in both is the only way to
 * know.
 *
 *   npm run audit:contrast
 *   BASE=http://localhost:4173 npm run audit:contrast
 */
import { chromium } from 'playwright-core'
import { staticRoutes } from './routes.mjs'

const BASE = process.env.BASE || 'http://localhost:5173'
const THEMES = ['light', 'dark']

/** WCAG relative luminance. */
const luminance = ([r, g, b]) => {
  const f = (v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

const ratio = (fg, bg) => {
  const a = luminance(fg)
  const b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

const parse = (colour) => {
  const m = colour.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/)
  if (!m) return null
  return { rgb: [+m[1], +m[2], +m[3]], alpha: m[4] === undefined ? 1 : +m[4] }
}

/** Flatten a translucent colour over what sits behind it. */
const over = (fg, bg) => fg.rgb.map((c, i) => Math.round(c * fg.alpha + bg[i] * (1 - fg.alpha)))

async function collect(page) {
  return page.evaluate(() => {
    const out = []
    const seen = new Set()

    for (const el of document.querySelectorAll('body *')) {
      // Only elements holding their own visible text.
      const own = [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .join(' ')
        .trim()
      if (!own) continue

      const rect = el.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) continue

      const style = getComputedStyle(el)
      if (style.visibility === 'hidden' || style.opacity === '0') continue

      /**
       * Resolve what is actually behind the text.
       *
       * Walking ancestors alone is wrong for anything positioned: the header is
       * transparent at the top of the page and floats over a dark hero, so the
       * walk fell through to the light page background and reported white-on-
       * white. Hit-testing the point the text occupies finds what a reader
       * actually sees behind it.
       */
      const stack = []
      const cx = Math.min(window.innerWidth - 1, Math.max(1, rect.left + rect.width / 2))
      const cy = Math.min(window.innerHeight - 1, Math.max(1, rect.top + rect.height / 2))
      const behind = rect.top < window.innerHeight && rect.bottom > 0
        ? document.elementsFromPoint(cx, cy)
        : []

      const chain = behind.length ? behind : (() => {
        const up = []
        let n = el
        while (n && n !== document.documentElement) { up.push(n); n = n.parentElement }
        return up
      })()

      // A gradient anywhere in the ancestry means the backdrop varies across the
      // element, and a single ratio cannot describe it. The Hero paints its
      // gradient on a decorative layer in front of the text, so checking only
      // the hit-test chain missed it and reported white-on-white.
      let gradientBehind = false
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        if (getComputedStyle(n).backgroundImage !== 'none') { gradientBehind = true; break }
      }
      if (gradientBehind) continue

      let reached = false
      for (const node of chain) {
        if (!reached) {
          // Skip anything painted in front of, or by, the text itself.
          if (node === el) reached = true
          else if (!node.contains(el)) continue
          else reached = true
        }
        const s = getComputedStyle(node)
        stack.push(s.backgroundColor)
        if (s.backgroundImage && s.backgroundImage !== 'none') stack.push('IMAGE')
      }
      stack.push(getComputedStyle(document.body).backgroundColor)

      const key = `${style.color}|${stack.join(',')}|${own.slice(0, 20)}`
      if (seen.has(key)) continue
      seen.add(key)

      out.push({
        color: style.color,
        backgrounds: stack,
        fontSize: parseFloat(style.fontSize),
        fontWeight: style.fontWeight,
        text: own.slice(0, 48),
        tag: el.tagName.toLowerCase(),
      })
    }
    return out
  })
}

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome' })
  const failures = []

  for (const theme of THEMES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    await page.addInitScript((t) => localStorage.setItem('axis_theme', t), theme)

    for (const route of staticRoutes.map((r) => r.path)) {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(700)

      for (const item of await collect(page)) {
        const fg = parse(item.color)
        if (!fg) continue

        // The stack runs front-to-back, so compositing has to run the other
        // way: start at the furthest layer and paint each nearer one over it.
        // Doing it front-to-back paints the page body over the header, which
        // reported the gold wordmark as white-on-white.
        if (item.backgrounds.includes('IMAGE')) continue // cannot judge a gradient

        let bg = [255, 255, 255]
        for (const layer of [...item.backgrounds].reverse()) {
          const c = parse(layer)
          if (!c || c.alpha === 0) continue
          bg = over(c, bg)
        }

        const large = item.fontSize >= 24 || (item.fontSize >= 18.66 && Number(item.fontWeight) >= 700)
        const required = large ? 3 : 4.5
        const value = ratio(over(fg, bg), bg)

        if (value < required) {
          failures.push({ theme, route, ...item, ratio: value.toFixed(2), required })
        }
      }
    }
    await page.close()
  }

  if (!failures.length) {
    console.log('No WCAG AA contrast failures in either theme')
  } else {
    // Same token pairing repeats across pages; report each once.
    const grouped = new Map()
    for (const f of failures) {
      const key = `${f.theme}|${f.color}|${f.ratio}|${f.tag}`
      if (!grouped.has(key)) grouped.set(key, { ...f, routes: new Set() })
      grouped.get(key).routes.add(f.route)
    }
    for (const f of grouped.values()) {
      console.log(
        `FAIL ${f.theme.padEnd(5)} ${f.ratio} (needs ${f.required})  <${f.tag}> ${f.color}\n` +
        `     "${f.text}"\n     ${[...f.routes].slice(0, 5).join(', ')}`
      )
    }
    console.log(`\n${grouped.size} distinct failures across ${failures.length} elements`)
  }

  await browser.close()
})().catch((e) => console.log('failed:', e.message))
