/**
 * The CBC sheet needs more than a crop.
 *
 * Its circles are small (radius 82) and two are full-length shots whose head
 * sits where the circle is only about 25 pixels wide — so no landscape window
 * can include a head and still stay inside the ring. Cropping tighter loses
 * the head; cropping wider drags a blue arc across the frame.
 *
 * So the window is taken freely, and anything outside the circle is filled
 * with the photograph's own backdrop, sampled from just inside the edge. These
 * are studio shots on plain grey or white, so the fill continues the picture
 * instead of announcing itself.
 */
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync } from 'node:fs'

const OUT = 'C:/Users/Elton/Desktop/axis-academy/axis-academy/client/public/team'
const url = 'data:image/jpeg;base64,' + readFileSync('C:/Users/Elton/Documents/cbc cordinators.jpeg').toString('base64')

const PEOPLE = [
  { file: 'gloria-lakeiisha',   cx: 205, cy: 317, r: 82, dy: -26 },
  { file: 'mulati-mike',        cx: 541, cy: 318, r: 82, dy: -18 },
  { file: 'adura-moses',        cx: 877, cy: 316, r: 82, dy: -30 },
  { file: 'martha-wesonga',     cx: 372, cy: 711, r: 82, dy: -4 },
  { file: 'felistus-chepkemoi', cx: 707, cy: 712, r: 82, dy: -14 },
]
const W = 158, H = 107 // 1.48:1, the shape the card shows

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } })

for (const person of PEOPLE) {
  const data = await page.evaluate(async ({ u, p, W, H }) => {
    const img = new Image()
    img.src = u
    await img.decode()

    const src = document.createElement('canvas')
    src.width = img.width
    src.height = img.height
    src.getContext('2d').drawImage(img, 0, 0)
    const sd = src.getContext('2d').getImageData(0, 0, img.width, img.height).data

    const px = (x, y) => {
      const i = ((y * img.width) + x) * 4
      return [sd[i], sd[i + 1], sd[i + 2]]
    }

    // A flat colour only works where the photograph has a plain studio
    // backdrop. Two of these were taken in an office and against a busy
    // background, and a sampled colour sat against them as an obvious block.
    // A blurred, enlarged copy of the same circle always matches, because it
    // is the same picture.

    const out = document.createElement('canvas')
    out.width = W * 3
    out.height = H * 3
    const ctx = out.getContext('2d')
    ctx.imageSmoothingQuality = 'high'

    const x0 = p.cx - W / 2
    const y0 = p.cy + p.dy - H / 2
    const scale = out.width / W

    // Backdrop: the same circle, enlarged past the frame and blurred.
    ctx.save()
    ctx.filter = 'blur(18px)'
    const over = 1.9
    ctx.drawImage(
      img, p.cx - p.r, p.cy - p.r, p.r * 2, p.r * 2,
      (out.width - out.width * over) / 2, (out.height - out.height * over) / 2,
      out.width * over, out.height * over
    )
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.arc((p.cx - x0) * scale, (p.cy - y0) * scale, (p.r - 2) * scale, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, x0, y0, W, H, 0, 0, out.width, out.height)
    ctx.restore()

    return { data: out.toDataURL('image/jpeg', 0.92) }
  }, { u: url, p: person, W, H })

  writeFileSync(`${OUT}/${person.file}.jpg`, Buffer.from(data.data.split(',')[1], 'base64'))
  console.log(`  ${person.file}`)
}

await browser.close()
