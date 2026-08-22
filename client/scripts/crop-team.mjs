/**
 * Cuts the coordinator headshots out of the composite graphics Axis supplied.
 *
 * Every photograph arrived inside a circle on a poster, so each one is a crop
 * of a crop. Two rules follow from that:
 *
 *   Export at native size. The first pass enlarged each window about three
 *   times on the way out, which produced larger files, no extra detail, and a
 *   softer picture — resampling up and letting the browser scale down again
 *   blurs twice. Writing the source pixels straight out leaves the browser one
 *   scale to do, which is as sharp as these sources can be.
 *
 *   Stay inside the ring, or hide it. Where a window fits within the circle it
 *   is solved to the largest that does. Where it cannot — a full-length shot
 *   whose head sits where the circle is twenty pixels wide — the space outside
 *   is filled with a blurred, enlarged copy of the same circle, which matches
 *   because it is the same picture.
 *
 * The quality ceiling here is the poster, not this script. Original photographs
 * from each coordinator would be sharper than anything recoverable from these.
 *
 *   npm run crop:team        (from client/)
 */
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'

const DOCS = 'C:/Users/Elton/Documents'

/**
 * Original photographs, one per person, take priority over the posters.
 *
 * Drop a file named for the slug — amelie-mussard.jpg — into brand/photos and
 * it is used instead of cutting that face out of a composite. Nothing else
 * changes: same output filename, so the database rows already point at it.
 *
 * An original is worth having. The posters hold each photograph at between 164
 * and 472 pixels across, where a card wants around 760 on a dense screen, and
 * no amount of processing recovers detail that was thrown away when the poster
 * was made.
 */
const ORIGINALS = new URL('../../brand/photos/', import.meta.url).pathname.replace(/^\//, '')

const originalFor = (slug) => {
  if (!existsSync(ORIGINALS)) return null
  const match = readdirSync(ORIGINALS).find(
    (f) => f.replace(/\.[^.]+$/, '').toLowerCase() === slug && /\.(jpe?g|png|webp)$/i.test(f)
  )
  return match ? ORIGINALS + match : null
}

const mimeFor = (path) => (/\.png$/i.test(path) ? 'image/png' : /\.webp$/i.test(path) ? 'image/webp' : 'image/jpeg')
const OUT = new URL('../public/team/', import.meta.url).pathname.replace(/^\//, '')
mkdirSync(OUT, { recursive: true })

const RATIO = 1.48 // the shape the educator card shows

/** Largest RATIO-shaped window that fits inside a circle of radius r at offset dy. */
function fit(r, dy, margin = 0.97) {
  const a = 0.7976
  const b = Math.abs(dy)
  const c = dy * dy - r * r
  const h = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
  return { w: Math.round(h * margin * RATIO), h: Math.round(h * margin) }
}

const SHEETS = [
  {
    src: `${DOCS}/team axis.jpeg`, r: 126,
    people: [
      { file: 'amelie-mussard', cx: 196, cy: 384, dy: -14 },
      { file: 'humber-masese', cx: 540, cy: 384, dy: -22 },
      { file: 'victor-muyekwe', cx: 884, cy: 384, dy: -18 },
      { file: 'ajok-deng', cx: 196, cy: 788, dy: -26 },
      { file: 'sunkuli-lerionka', cx: 540, cy: 788, dy: -26 },
      { file: 'ashley-ndanu', cx: 884, cy: 788, dy: -10 },
    ],
  },
  {
    src: `${DOCS}/special need.jpeg`, r: 236,
    people: [
      { file: 'yoshira-audrey', cx: 259, cy: 458, dy: -95 },
      { file: 'naomie-kalachi', cx: 808, cy: 776, dy: -100 },
    ],
  },
  {
    src: `${DOCS}/montesori.jpeg`, r: 168,
    people: [
      { file: 'wendy-claudia', cx: 211, cy: 253, dy: -58 },
      { file: 'tabitha-wachira', cx: 597, cy: 254, dy: -50 },
      { file: 'fikirini-juma', cx: 216, cy: 747, dy: -55 },
      // A close selfie whose head already fills the ring; the shift that suits
      // the others takes his forehead off.
      { file: 'collins-isa', cx: 597, cy: 747, dy: -20 },
    ],
  },
  {
    // Radius 82, and two full-length shots — no window can hold a head and stay
    // inside the ring, so these are filled rather than fitted.
    src: `${DOCS}/cbc cordinators.jpeg`, r: 82, W: 158, H: 107, fill: true,
    people: [
      { file: 'gloria-lakeiisha', cx: 205, cy: 317, dy: -26 },
      { file: 'mulati-mike', cx: 541, cy: 318, dy: -18 },
      { file: 'adura-moses', cx: 877, cy: 316, dy: -30 },
      { file: 'martha-wesonga', cx: 372, cy: 711, dy: -4 },
      { file: 'felistus-chepkemoi', cx: 707, cy: 712, dy: -14 },
    ],
  },
  {
    // A red thumbtack is drawn over the top of each circle. It sits inside the
    // ring, so filling cannot hide it — the window has to avoid it instead.
    src: `${DOCS}/cambridge.jpeg`, r: 128, fill: true,
    people: [
      { file: 'laban-kagiri', cx: 157, cy: 397, dx: -52, dy: -40, W: 140, H: 95 },
      { file: 'daisy-luvanda', cx: 797, cy: 397, dy: -20, W: 175, H: 118 },
      { file: 'warren-ndaro', cx: 157, cy: 712, dy: -42, W: 200, H: 135 },
      { file: 'victory-adikinyi', cx: 797, cy: 712, dy: -30, W: 200, H: 135 },
    ],
  },
]

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })

for (const sheet of SHEETS) {
  const url = 'data:image/jpeg;base64,' + readFileSync(sheet.src).toString('base64')

  for (const person of sheet.people) {
    const box = person.W
      ? { w: person.W, h: person.H }
      : sheet.W
        ? { w: sheet.W, h: sheet.H }
        : fit(sheet.r, person.dy)

    const outside = Math.hypot(box.w / 2, Math.abs(person.dy) + box.h / 2) > sheet.r
    if (outside && !sheet.fill) {
      console.log(`  ${person.file}: window leaves the ring and no fill is set`)
      continue
    }

    // An original replaces the poster crop entirely: cover the card's shape,
    // centred, at whatever resolution the file actually has.
    const original = originalFor(person.file)
    if (original) {
      const asUrl = `data:${mimeFor(original)};base64,` + readFileSync(original).toString('base64')
      const shot = await page.evaluate(async ({ u, RATIO }) => {
        const img = new Image()
        img.src = u
        await img.decode()
        const scale = Math.min(img.width / RATIO, img.height)
        const sw = scale * RATIO
        const sh = scale
        const out = document.createElement('canvas')
        out.width = Math.round(sw)
        out.height = Math.round(sh)
        const ctx = out.getContext('2d')
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, out.width, out.height)
        return { data: out.toDataURL('image/jpeg', 0.9), w: out.width, h: out.height }
      }, { u: asUrl, RATIO })

      const buf = Buffer.from(shot.data.split(',')[1], 'base64')
      writeFileSync(`${OUT}/${person.file}.jpg`, buf)
      console.log(`  ${person.file.padEnd(20)} ${shot.w}x${shot.h}  ${(buf.length / 1024).toFixed(0)}KB  (original)`)
      continue
    }

    const data = await page.evaluate(async ({ u, p, box, r, fill }) => {
      const img = new Image()
      img.src = u
      await img.decode()

      const out = document.createElement('canvas')
      out.width = box.w
      out.height = box.h
      const ctx = out.getContext('2d')
      ctx.imageSmoothingQuality = 'high'

      const dx = p.dx || 0
      const x0 = p.cx + dx - box.w / 2
      const y0 = p.cy + p.dy - box.h / 2

      if (fill) {
        ctx.save()
        ctx.filter = 'blur(6px)'
        const over = 1.9
        ctx.drawImage(
          img, p.cx - r, p.cy - r, r * 2, r * 2,
          (out.width - out.width * over) / 2, (out.height - out.height * over) / 2,
          out.width * over, out.height * over
        )
        ctx.restore()
        ctx.save()
        ctx.beginPath()
        ctx.arc(p.cx - x0, p.cy - y0, r - 4, 0, Math.PI * 2)
        ctx.clip()
      }

      // 1:1 — the source pixels, unresampled.
      ctx.drawImage(img, x0, y0, box.w, box.h, 0, 0, box.w, box.h)
      if (fill) ctx.restore()

      return out.toDataURL('image/jpeg', 0.95)
    }, { u: url, p: person, box, r: sheet.r, fill: !!sheet.fill })

    const buf = Buffer.from(data.split(',')[1], 'base64')
    writeFileSync(`${OUT}/${person.file}.jpg`, buf)
    console.log(`  ${person.file.padEnd(20)} ${box.w}x${box.h}  ${(buf.length / 1024).toFixed(0)}KB`)
  }
}

await browser.close()
