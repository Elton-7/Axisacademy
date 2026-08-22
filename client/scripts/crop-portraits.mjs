/**
 * Crops team-card portraits from the coordinators' own photographs.
 *
 * These twelve replace crops taken out of the four Canva sheets, where each
 * face was a ~160px circle on a 1080px board and was softened again by the
 * card's own scaling. Here the limit is the photograph, not the sheet, so the
 * faces are sharp.
 *
 * The originals live in ../photos-source so a crop can be redone later without
 * going back to Drive; that folder is not under public/ and is never served.
 *
 * A window is placed from the face, not from the frame. fx/fy is where the
 * face sits in the source and faceAt is where it should sit in the finished
 * card — centring a landscape window on a portrait cuts foreheads off. Every
 * pair below was read off the photograph rather than assumed, and three of
 * them were wrong on the first attempt.
 *
 * Run: node scripts/crop-portraits.mjs
 */
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC = join(HERE, '..', 'photos-source')
const OUT = join(HERE, '..', 'public', 'team')

const RATIO = 380 / 256 // the shape the card shows
// A ceiling, not a target: a crop smaller than this is written at its own
// size. It is high enough that no photograph here is downscaled on the way
// out, so what the card gets is the detail the camera captured.
const TARGET_W = 1200

const PEOPLE = [
  { src: 'Ashley Ndanu.jpg', out: 'ashley-ndanu', fx: 0.4, fy: 0.27, cw: 0.95, faceAt: 0.4 },
  { src: 'Collins Issa Montessori teacher.jpg', out: 'collins-isa', fx: 0.5, fy: 0.18, cw: 1.0, faceAt: 0.38 },
  { src: 'Martha wesonga.jpg', out: 'martha-wesonga', fx: 0.5, fy: 0.33, cw: 0.98, faceAt: 0.4 },
  { src: 'victory.jpg', out: 'victory-adikinyi', fx: 0.55, fy: 0.25, cw: 0.95, faceAt: 0.38 },
  { src: 'felistus.jpg', out: 'felistus-chepkemoi', fx: 0.38, fy: 0.15, cw: 0.78, faceAt: 0.32 },
  { src: 'montessory teacher Tabitha Wachira.jpg', out: 'tabitha-wachira', fx: 0.38, fy: 0.22, cw: 0.85, faceAt: 0.36 },
  { src: 'wendy claudia teacher montessori.jpg', out: 'wendy-claudia', fx: 0.5, fy: 0.33, cw: 1.0, faceAt: 0.4 },
  { src: 'Ajok Deng.jpg', out: 'ajok-deng', fx: 0.62, fy: 0.22, cw: 0.8, faceAt: 0.38 },
  { src: 'Fikirini Juma.jpg', out: 'fikirini-juma', fx: 0.53, fy: 0.37, cw: 0.7, faceAt: 0.38 },
  { src: 'Humber Masese.jpg', out: 'humber-masese', fx: 0.43, fy: 0.15, cw: 0.6, faceAt: 0.38 },
  // Victor's file is a screen capture: the right of the frame is blurred and a
  // row of interface buttons sits along the bottom. This window keeps to the
  // sharp left portion and stops above them.
  { src: 'Victor Muyekwe.jpg', out: 'victor-muyekwe', fx: 0.3, fy: 0.33, cw: 0.5, faceAt: 0.38 },
  { src: 'laban.jpg', out: 'laban-kagiri', fx: 0.28, fy: 0.46, cw: 0.519, faceAt: 0.38 },
  { src: 'warren.jpg', out: 'warren-ndaro', fx: 0.474, fy: 0.36, cw: 0.233, faceAt: 0.36 },
]

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } })

for (const person of PEOPLE) {
  const url = 'data:image/jpeg;base64,' + readFileSync(join(SRC, person.src)).toString('base64')
  const result = await page.evaluate(
    async ({ url, p, RATIO, TARGET_W }) => {
      const img = new Image()
      img.src = url
      await img.decode()
      const W = img.naturalWidth
      const H = img.naturalHeight

      let cw = Math.min(W, W * p.cw)
      let ch = cw / RATIO
      if (ch > H) {
        ch = H
        cw = ch * RATIO
      }

      // Place the window so the face lands where the card wants it, then slide
      // it back inside the frame rather than letting it run off the edge.
      const x = Math.max(0, Math.min(p.fx * W - cw / 2, W - cw))
      const y = Math.max(0, Math.min(p.fy * H - ch * p.faceAt, H - ch))

      // Never invent detail: where the crop is smaller than the target, keep it
      // at native size and let the browser do the scaling.
      const outW = Math.min(TARGET_W, Math.round(cw))
      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = Math.round(outW / RATIO)
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, x, y, cw, ch, 0, 0, canvas.width, canvas.height)
      return { data: canvas.toDataURL('image/jpeg', 0.95), w: canvas.width, h: canvas.height }
    },
    { url, p: person, RATIO, TARGET_W }
  )

  const buf = Buffer.from(result.data.split(',')[1], 'base64')
  writeFileSync(join(OUT, `${person.out}.jpg`), buf)
  console.log(`  ${person.out.padEnd(20)} ${result.w}x${result.h}  ${(buf.length / 1024).toFixed(0)}KB`)
}

await browser.close()
