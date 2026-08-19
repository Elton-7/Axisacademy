// Segments the mark into shapes: hue family first, then connected components.
const fs = require('fs')
const zlib = require('zlib')

function readPng(p) {
  const b = fs.readFileSync(p)
  let o = 8, w = 0, h = 0, col = 6
  const idat = []
  while (o < b.length) {
    const len = b.readUInt32BE(o), t = b.toString('latin1', o + 4, o + 8)
    if (t === 'IHDR') { w = b.readUInt32BE(o + 8); h = b.readUInt32BE(o + 12); col = b[o + 17] }
    if (t === 'IDAT') idat.push(b.subarray(o + 8, o + 8 + len))
    o += 12 + len
  }
  const ch = col === 6 ? 4 : 3
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const px = Buffer.alloc(w * h * ch)

  // PNG rows carry a filter byte. Files written here always use 0, but any
  // real encoder picks adaptively per row, so all five have to be undone or
  // the pixels come out as noise.
  const stride = w * ch
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)]
    const rowIn = y * (stride + 1) + 1
    const rowOut = y * stride
    for (let i = 0; i < stride; i++) {
      const x = raw[rowIn + i]
      const a = i >= ch ? px[rowOut + i - ch] : 0
      const b = y > 0 ? px[rowOut - stride + i] : 0
      const c = y > 0 && i >= ch ? px[rowOut - stride + i - ch] : 0
      let v
      switch (ft) {
        case 0: v = x; break
        case 1: v = x + a; break
        case 2: v = x + b; break
        case 3: v = x + ((a + b) >> 1); break
        case 4: {
          const p = a + b - c
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
          v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)
          break
        }
        default: throw new Error('unknown PNG filter ' + ft)
      }
      px[rowOut + i] = v & 255
    }
  }
  return { px, w, h, ch }
}

const hueOf = (r, g, b) => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  if (d === 0) return -1
  let hh
  if (max === r) hh = ((g - b) / d) % 6
  else if (max === g) hh = (b - r) / d + 2
  else hh = (r - g) / d + 4
  return (hh * 60 + 360) % 360
}

/**
 * Three families, because that is how the artwork is drawn: navy/blue, green
 * and gold. Clustering on raw RGB instead would split each gradient into
 * arbitrary bands and produce visible steps.
 */
function familyOf(r, g, b) {
  const hue = hueOf(r, g, b)
  if (hue < 0) return null
  if (hue >= 20 && hue < 70) return 'gold'
  if (hue >= 70 && hue < 175) return 'green'
  if (hue >= 175 && hue < 265) return 'blue'
  // The tagline's "Thrive" is violet; without this it is dropped entirely.
  if (hue >= 265 && hue < 330) return 'violet'
  return null
}

function segment(path, { minArea = 30, whiteCut = 235 } = {}) {
  const { px, w, h, ch } = readPng(path)
  const lum = (i) => 0.299 * px[i * ch] + 0.587 * px[i * ch + 1] + 0.114 * px[i * ch + 2]

  /**
   * Hue thresholds alone classify only confidently coloured pixels. Inside a
   * letter stroke the anti-aliased pixels desaturate towards grey, where hue is
   * undefined, so they were dropped and the wordmark came out full of holes.
   *
   * So: seed the families from the confident pixels, then assign everything
   * else to the nearest of those centroids. Near-white is still excluded,
   * because that is either the background or the enclosed counter of a letter
   * like A or e — filling those would close the letters up.
   */
  const sums = {}
  for (let i = 0; i < w * h; i++) {
    if (px[i * ch + 3] < 128) continue
    const f = familyOf(px[i * ch], px[i * ch + 1], px[i * ch + 2])
    if (!f) continue
    const max = Math.max(px[i * ch], px[i * ch + 1], px[i * ch + 2])
    const min = Math.min(px[i * ch], px[i * ch + 1], px[i * ch + 2])
    if (max === 0 || (max - min) / max < 0.35) continue // only strongly coloured pixels seed
    if (!sums[f]) sums[f] = [0, 0, 0, 0]
    for (let c = 0; c < 3; c++) sums[f][c] += px[i * ch + c]
    sums[f][3]++
  }
  const centroids = Object.entries(sums)
    .filter(([, v]) => v[3] > 20)
    .map(([f, v]) => ({ f, c: [v[0] / v[3], v[1] / v[3], v[2] / v[3]] }))

  const fam = new Array(w * h).fill(null)
  for (let i = 0; i < w * h; i++) {
    if (px[i * ch + 3] < 128) continue
    if (lum(i) > whiteCut) continue
    let best = null, bestD = Infinity
    for (const { f, c } of centroids) {
      const d = (px[i * ch] - c[0]) ** 2 + (px[i * ch + 1] - c[1]) ** 2 + (px[i * ch + 2] - c[2]) ** 2
      if (d < bestD) { bestD = d; best = f }
    }
    fam[i] = best
  }

  /**
   * Absorb specks into whatever surrounds them, rather than dropping them.
   *
   * A gradient crossing the midpoint between two centroids leaves a thin line
   * of pixels assigned to the wrong family. Discarding those as too small
   * punched hairlines straight through the AXIS letters. Reassigning them to
   * the family that actually surrounds them closes the gap instead.
   */
  const despeckle = () => {
    for (let pass = 0; pass < 3; pass++) {
      const { comps } = components()
      let changed = 0
      for (const c of comps) {
        // Area alone misses the real offender: a gradient crossing a centroid
        // boundary leaves a sliver one or two pixels tall but wide enough to
        // clear any area threshold. Those rendered as hairlines through the
        // letters, so thinness has to count as well.
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
        for (const i of c.pixels) {
          const x = i % w, y = (i / w) | 0
          if (x < x0) x0 = x
          if (x > x1) x1 = x
          if (y < y0) y0 = y
          if (y > y1) y1 = y
        }
        const thin = Math.min(x1 - x0, y1 - y0) <= 2
        if (c.pixels.length >= minArea && !thin) continue
        const votes = {}
        for (const i of c.pixels) {
          const x = i % w, y = (i / w) | 0
          const near = []
          if (x > 0) near.push(i - 1)
          if (x < w - 1) near.push(i + 1)
          if (y > 0) near.push(i - w)
          if (y < h - 1) near.push(i + w)
          for (const n of near) {
            if (fam[n] && fam[n] !== c.family) votes[fam[n]] = (votes[fam[n]] || 0) + 1
          }
        }
        const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]
        if (!winner) continue
        for (const i of c.pixels) fam[i] = winner[0]
        changed++
      }
      if (!changed) break
    }
  }

  function components() {
    const label = new Int32Array(w * h).fill(-1)
    const comps = []
    for (let s = 0; s < w * h; s++) {
      if (fam[s] === null || label[s] !== -1) continue
      const id = comps.length
      const f = fam[s]
      const pixels = []
      const stack = [s]
      label[s] = id
      while (stack.length) {
        const i = stack.pop()
        pixels.push(i)
        const x = i % w, y = (i / w) | 0
        const near = []
        if (x > 0) near.push(i - 1)
        if (x < w - 1) near.push(i + 1)
        if (y > 0) near.push(i - w)
        if (y < h - 1) near.push(i + w)
        for (const n of near) {
          if (label[n] === -1 && fam[n] === f) { label[n] = id; stack.push(n) }
        }
      }
      comps.push({ id, family: f, pixels })
    }
    return { label, comps }
  }

  despeckle()

  const label = new Int32Array(w * h).fill(-1)
  const comps = []
  for (let s = 0; s < w * h; s++) {
    if (fam[s] === null || label[s] !== -1) continue
    const id = comps.length
    const f = fam[s]
    const pixels = []
    const stack = [s]
    label[s] = id
    while (stack.length) {
      const i = stack.pop()
      pixels.push(i)
      const x = i % w, y = (i / w) | 0
      const near = []
      if (x > 0) near.push(i - 1)
      if (x < w - 1) near.push(i + 1)
      if (y > 0) near.push(i - w)
      if (y < h - 1) near.push(i + w)
      for (const n of near) {
        if (label[n] === -1 && fam[n] === f) { label[n] = id; stack.push(n) }
      }
    }
    comps.push({ id, family: f, pixels })
  }

  const kept = comps.filter((c) => c.pixels.length >= minArea)
  return { px, w, h, ch, fam, label, comps, kept }
}

module.exports = { readPng, segment, familyOf, hueOf }

if (require.main === module) {
  const r = segment('C:/Users/Elton/Desktop/axis-academy/axis-academy/client/src/assets/axis-mark.png')
  console.log(`${r.w}x${r.h}: ${r.comps.length} components, ${r.kept.length} above the noise floor`)
  const byFamily = {}
  for (const c of r.kept) byFamily[c.family] = (byFamily[c.family] || 0) + 1
  console.log('by family:', JSON.stringify(byFamily))
  for (const c of r.kept.slice().sort((a, b) => b.pixels.length - a.pixels.length).slice(0, 12)) {
    console.log(`  #${c.id} ${c.family.padEnd(5)} ${c.pixels.length}px`)
  }
}
