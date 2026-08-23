// Renders each traced SVG at native size and measures how far it is from the source.
const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright-core')
const { readPng } = require('./segment.js')

const SRC = process.env.TRACE_SRC || 'mark-full.png'
const { px: srcPx, w, h, ch } = readPng(SRC)

const NAVY = [0x0a, 0x16, 0x28]
const flatten = (px, ch, n) => {
  const out = Buffer.alloc(n * 3)
  for (let i = 0; i < n; i++) {
    const a = ch === 4 ? px[i * ch + 3] / 255 : 1
    for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(px[i * ch + c] * a + NAVY[c] * (1 - a))
  }
  return out
}
const src = flatten(srcPx, ch, w * h)

;(async () => {
  const b = await chromium.launch({ channel: 'chrome' })
  for (const file of process.argv.slice(2)) {
    const svg = fs.readFileSync(file, 'utf8')
    const page = await b.newPage({ viewport: { width: w, height: h } })
    await page.setContent(
      `<body style="margin:0;background:#0a1628">${svg.replace('<svg', `<svg width="${w}" height="${h}"`)}</body>`
    )
    await page.waitForTimeout(150)
    const shot = `${file}.render.png`
    await page.screenshot({ path: shot })
    await page.close()

    const r = readPng(shot)
    const got = flatten(r.px, r.ch, r.w * r.h)

    let sum = 0, worst = 0, bad = 0
    for (let i = 0; i < w * h; i++) {
      let d = 0
      for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(src[i * 3 + c] - got[i * 3 + c]))
      sum += d
      if (d > worst) worst = d
      if (d > 60) bad++
    }
    console.log(
      `${path.basename(file).padEnd(14)} ${(fs.statSync(file).size / 1024).toFixed(1).padStart(5)}KB` +
      `  mean ${(sum / (w * h)).toFixed(2).padStart(5)}` +
      `  pixels off by >60: ${(bad * 100 / (w * h)).toFixed(2)}%`
    )
    fs.rmSync(shot, { force: true })
  }
  await b.close()
})().catch((e) => console.log('failed:', e.message))
