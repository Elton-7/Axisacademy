// Traces the segmented mark into SVG paths with fitted gradients.
const fs = require('fs')
const { segment } = require('./segment.js')

// ---------------------------------------------------------------- boundaries
/**
 * Walks the boundary between inside and outside pixels.
 *
 * Works on the lattice between pixels rather than on pixel centres, so the
 * result is an exact closed polygon, and holes fall out as separate loops
 * instead of needing a special case.
 */
function boundaryLoops(inside, w, h) {
  const key = (x, y) => y * (w + 1) + x
  const edges = new Map() // start point -> [end points]
  const addEdge = (x1, y1, x2, y2) => {
    const k = key(x1, y1)
    if (!edges.has(k)) edges.set(k, [])
    edges.get(k).push([x2, y2])
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!inside(x, y)) continue
      // Wind each cell so the filled side stays on a consistent hand.
      if (y === 0 || !inside(x, y - 1)) addEdge(x, y, x + 1, y)
      if (x === w - 1 || !inside(x + 1, y)) addEdge(x + 1, y, x + 1, y + 1)
      if (y === h - 1 || !inside(x, y + 1)) addEdge(x + 1, y + 1, x, y + 1)
      if (x === 0 || !inside(x - 1, y)) addEdge(x, y + 1, x, y)
    }
  }

  const loops = []
  while (edges.size) {
    const startKey = edges.keys().next().value
    let cx = startKey % (w + 1)
    let cy = (startKey / (w + 1)) | 0
    const loop = [[cx, cy]]
    for (;;) {
      const list = edges.get(key(cx, cy))
      if (!list || list.length === 0) { edges.delete(key(cx, cy)); break }
      const [nx, ny] = list.pop()
      if (list.length === 0) edges.delete(key(cx, cy))
      cx = nx; cy = ny
      if (cx === (startKey % (w + 1)) && cy === ((startKey / (w + 1)) | 0)) break
      loop.push([cx, cy])
    }
    if (loop.length > 8) loops.push(loop)
  }
  return loops
}

/**
 * Averages the boundary before simplifying.
 *
 * Tracing pixel edges yields a staircase. Feeding that straight to RDP keeps
 * the steps as real vertices and the curves come out visibly ragged, which
 * showed on the star's rays. Two light passes remove the stepping without
 * moving the outline meaningfully.
 */
function presmooth(points, passes = 2) {
  let out = points
  for (let p = 0; p < passes; p++) {
    const n = out.length
    const next = new Array(n)
    for (let i = 0; i < n; i++) {
      const a = out[(i - 1 + n) % n], b = out[i], c = out[(i + 1) % n]
      next[i] = [(a[0] + 2 * b[0] + c[0]) / 4, (a[1] + 2 * b[1] + c[1]) / 4]
    }
    out = next
  }
  return out
}

/**
 * Pushes an outline outward along its normals.
 *
 * Smoothing shrinks every component slightly. Where two shapes share an edge —
 * the green swoosh crossing the AXIS letters, the bands of the book — both
 * sides pull back and a white hairline opens along the seam. Expanding each
 * outline by a fraction of a pixel closes it, and the shapes are drawn largest
 * first so the small overlap this creates is hidden.
 *
 * Winding decides which way is out, so holes contract while outlines expand.
 */
function dilate(points, delta) {
  const n = points.length
  if (n < 3 || delta === 0) return points
  let area = 0
  for (let i = 0; i < n; i++) {
    const a = points[i], b = points[(i + 1) % n]
    area += a[0] * b[1] - b[0] * a[1]
  }
  const sign = area > 0 ? 1 : -1
  return points.map((p, i) => {
    const prev = points[(i - 1 + n) % n], next = points[(i + 1) % n]
    const dx = next[0] - prev[0], dy = next[1] - prev[1]
    const len = Math.hypot(dx, dy)
    if (len === 0) return p
    return [p[0] + (dy / len) * delta * sign, p[1] - (dx / len) * delta * sign]
  })
}

// ------------------------------------------------------------ simplification
/** Ramer–Douglas–Peucker on a closed loop. */
function simplify(points, epsilon) {
  if (points.length < 4) return points
  const sqDist = (p, a, b) => {
    let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy)
      if (t > 1) { x = b[0]; y = b[1] } else if (t > 0) { x += dx * t; y += dy * t }
    }
    return (p[0] - x) ** 2 + (p[1] - y) ** 2
  }
  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    let worst = 0, index = -1
    for (let i = a + 1; i < b; i++) {
      const d = sqDist(points[i], points[a], points[b])
      if (d > worst) { worst = d; index = i }
    }
    if (worst > epsilon * epsilon && index > 0) {
      keep[index] = 1
      stack.push([a, index], [index, b])
    }
  }
  return points.filter((_, i) => keep[i])
}

// ------------------------------------------------------------------ curve fit
const angleAt = (prev, cur, next) => {
  const ax = cur[0] - prev[0], ay = cur[1] - prev[1]
  const bx = next[0] - cur[0], by = next[1] - cur[1]
  const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by)
  if (la === 0 || lb === 0) return 0
  const cos = Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb)))
  return Math.acos(cos) * 180 / Math.PI
}

/**
 * Catmull-Rom through the simplified points, converted to cubic Béziers, with
 * sharp vertices left sharp.
 *
 * Smoothing everything would round the star's points, which is the one part of
 * this mark where a corner is obviously a corner.
 */
function toPath(points, { cornerAngle = 48, tension = 6 } = {}) {
  const n = points.length
  if (n < 3) return ''
  const corner = points.map((p, i) =>
    angleAt(points[(i - 1 + n) % n], p, points[(i + 1) % n]) > cornerAngle
  )

  const fmt = (v) => (Math.round(v * 10) / 10).toString()
  let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]

    if (corner[i] && corner[(i + 1) % n]) {
      d += `L${fmt(p2[0])} ${fmt(p2[1])}`
      continue
    }
    // Zero the handle on the corner side so the tangent breaks there.
    const c1x = corner[i] ? p1[0] : p1[0] + (p2[0] - p0[0]) / tension
    const c1y = corner[i] ? p1[1] : p1[1] + (p2[1] - p0[1]) / tension
    const c2x = corner[(i + 1) % n] ? p2[0] : p2[0] - (p3[0] - p1[0]) / tension
    const c2y = corner[(i + 1) % n] ? p2[1] : p2[1] - (p3[1] - p1[1]) / tension
    d += `C${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p2[0])} ${fmt(p2[1])}`
  }
  return d + 'Z'
}

// ------------------------------------------------------------- gradient fit
/**
 * Fits one linear gradient per shape by least squares.
 *
 * Each shape in this artwork carries a smooth gradient. Flattening to an
 * average colour loses the depth; quantising into bands makes visible steps.
 * A fitted linear ramp reproduces it in a few bytes.
 */
function fitGradient(comp, px, w, ch) {
  const pts = comp.pixels
  let sx = 0, sy = 0
  for (const i of pts) { sx += i % w; sy += (i / w) | 0 }
  const mx = sx / pts.length, my = sy / pts.length

  // Regress each channel on position: c ≈ c0 + cx*(x-mx) + cy*(y-my)
  let Sxx = 0, Syy = 0, Sxy = 0
  const Sxc = [0, 0, 0], Syc = [0, 0, 0], mean = [0, 0, 0]
  for (const i of pts) {
    const dx = (i % w) - mx, dy = ((i / w) | 0) - my
    Sxx += dx * dx; Syy += dy * dy; Sxy += dx * dy
    for (let c = 0; c < 3; c++) {
      const v = px[i * ch + c]
      mean[c] += v
      Sxc[c] += dx * v
      Syc[c] += dy * v
    }
  }
  for (let c = 0; c < 3; c++) mean[c] /= pts.length

  const det = Sxx * Syy - Sxy * Sxy
  if (Math.abs(det) < 1e-6) return { solid: mean.map(Math.round) }

  const grad = [0, 0]
  const coef = []
  for (let c = 0; c < 3; c++) {
    const bx = (Syy * Sxc[c] - Sxy * Syc[c]) / det
    const by = (Sxx * Syc[c] - Sxy * Sxc[c]) / det
    coef.push([bx, by])
    grad[0] += bx; grad[1] += by
  }
  const len = Math.hypot(grad[0], grad[1])
  if (len < 1e-4) return { solid: mean.map(Math.round) }
  const dir = [grad[0] / len, grad[1] / len]

  // Project onto the ramp direction and read the colour at each end.
  let tMin = Infinity, tMax = -Infinity
  for (const i of pts) {
    const t = ((i % w) - mx) * dir[0] + (((i / w) | 0) - my) * dir[1]
    if (t < tMin) tMin = t
    if (t > tMax) tMax = t
  }
  const at = (t) => coef.map((b, c) => {
    const v = mean[c] + (b[0] * dir[0] + b[1] * dir[1]) * t
    return Math.max(0, Math.min(255, Math.round(v)))
  })
  const c0 = at(tMin), c1 = at(tMax)
  const spread = Math.max(...c0.map((v, i) => Math.abs(v - c1[i])))
  if (spread < 12) return { solid: mean.map(Math.round) }

  return {
    from: c0, to: c1,
    x1: mx + dir[0] * tMin, y1: my + dir[1] * tMin,
    x2: mx + dir[0] * tMax, y2: my + dir[1] * tMax,
  }
}

// ------------------------------------------------------------------- emit
const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')

function trace(src, { epsilon = 0.9, minArea = 40, dilation = 0.4 } = {}) {
  const seg = segment(src, { minArea })
  const { px, w, h, ch, label } = seg

  // Larger shapes first so small details (the star over the swoosh) stay on top.
  const ordered = seg.kept.slice().sort((a, b) => b.pixels.length - a.pixels.length)

  const defs = []
  const body = []
  ordered.forEach((comp, n) => {
    const member = new Uint8Array(w * h)
    for (const i of comp.pixels) member[i] = 1
    const loops = boundaryLoops((x, y) => member[y * w + x] === 1, w, h)
    if (!loops.length) return

    // Small shapes (the star's rays) need a tighter tolerance: the same
    // absolute error that is invisible on a book panel deforms them.
    const scale = Math.min(1, Math.sqrt(comp.pixels.length) / 60)
    const eps = Math.max(0.35, epsilon * scale)

    const d = loops
      .map((loop) => toPath(simplify(dilate(presmooth(loop), dilation), eps)))
      .filter(Boolean)
      .join('')
    if (!d) return

    const g = fitGradient(comp, px, w, ch)
    let fill
    if (g.solid) {
      fill = hex(g.solid)
    } else {
      const id = `g${n}`
      defs.push(
        `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" ` +
        `x1="${g.x1.toFixed(1)}" y1="${g.y1.toFixed(1)}" x2="${g.x2.toFixed(1)}" y2="${g.y2.toFixed(1)}">` +
        `<stop offset="0" stop-color="${hex(g.from)}"/><stop offset="1" stop-color="${hex(g.to)}"/></linearGradient>`
      )
      fill = `url(#${id})`
    }
    body.push(`<path fill="${fill}" fill-rule="evenodd" d="${d}"/>`)
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Axis Learning">` +
    (defs.length ? `<defs>${defs.join('')}</defs>` : '') +
    body.join('') + '</svg>'
}

module.exports = { trace }

if (require.main === module) {
  const svg = trace('mark-full.png')
  fs.writeFileSync('axis-mark.svg', svg)
  console.log('wrote axis-mark.svg', (svg.length / 1024).toFixed(1) + 'KB')
}
