/**
 * Renders the first page of each resource PDF as its cover image.
 *
 * Axis asked for pictures of the articles. There is no public-domain imagery
 * of these particular works, and stock photography is ruled out by the brief —
 * but the first page of a paper is a genuine picture of that paper, and it is
 * the image a reader recognises when they meet it again.
 *
 * pdf.js does the rendering inside Chrome, which is the only thing on this
 * machine that can rasterise a PDF. It is pure JavaScript, so it needs no
 * native build step, and the work happens in a real browser canvas rather than
 * through a shell tool that is not installed.
 *
 * Only the covers of works Axis serves itself, or holds under a licence that
 * permits it, belong on our pages. Where a title links to a publisher, the
 * thumbnail is still that paper's own first page, shown at a size that
 * identifies the work rather than substituting for reading it.
 *
 * Run: node scripts/resource-covers.mjs
 */
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { createRequire } from 'node:module'
import { createServer } from 'node:http'

const require = createRequire(import.meta.url)
const HERE = dirname(fileURLToPath(import.meta.url))
const CLIENT = join(HERE, '..')
const OUT = join(CLIENT, 'public', 'resources')
mkdirSync(OUT, { recursive: true })

const { RESOURCE_LIBRARY, slugify } = require(join(CLIENT, '..', 'server', 'content', 'resourceLibrary.js'))

/*
 * pdf.js ships as ES modules only, and Chrome refuses to import a module over
 * file:// — so the client folder is served over loopback for the duration of
 * the run and the page imports it from there. Nothing is exposed: the server
 * binds to 127.0.0.1, serves one directory, and is closed at the end.
 */
const server = createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '')
  const file = join(CLIENT, rel)
  if (!file.startsWith(CLIENT) || !existsSync(file)) {
    res.writeHead(404).end('not found')
    return
  }
  const types = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.html': 'text/html' }
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

const pdfjs = `${origin}/node_modules/pdfjs-dist/build/pdf.min.mjs`
const worker = `${origin}/node_modules/pdfjs-dist/build/pdf.worker.min.mjs`

// Where the source PDF for a given entry can be found: either the copy already
// served from the site, or the download folder for the ones linked out.
const SOURCE_DIR = process.env.RESOURCE_PDF_DIR || OUT

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } })
// Any page from the same origin will do; it just needs one that is allowed
// to import the module.
await page.goto(`${origin}/index.html`).catch(() => page.goto('about:blank'))

let written = 0
const skipped = []

for (const item of RESOURCE_LIBRARY) {
  const slug = slugify(item.title)
  const pdfPath = join(SOURCE_DIR, `${slug}.pdf`)
  if (!existsSync(pdfPath)) {
    skipped.push(item.title)
    continue
  }

  const base64 = readFileSync(pdfPath).toString('base64')
  const result = await page.evaluate(
    async ({ base64, pdfjs, worker }) => {
      const lib = await import(pdfjs)
      lib.GlobalWorkerOptions.workerSrc = worker
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      const doc = await lib.getDocument({ data: bytes }).promise
      const first = await doc.getPage(1)

      // Rendered at roughly twice the display size so it stays sharp on a
      // retina screen, then written as JPEG because a page of text and figures
      // compresses far better that way than as PNG.
      const base = first.getViewport({ scale: 1 })
      const viewport = first.getViewport({ scale: Math.min(2, 620 / base.width) })
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(viewport.width)
      canvas.height = Math.round(viewport.height)
      const ctx = canvas.getContext('2d')
      // Some pages have no background of their own; without this they render
      // as transparent and come out black once flattened into a JPEG.
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await first.render({ canvasContext: ctx, viewport, background: '#ffffff' }).promise
      return { data: canvas.toDataURL('image/jpeg', 0.82), w: canvas.width, h: canvas.height, pages: doc.numPages }
    },
    { base64, pdfjs, worker }
  )

  const buffer = Buffer.from(result.data.split(',')[1], 'base64')
  writeFileSync(join(OUT, `${slug}-cover.jpg`), buffer)
  written += 1
  console.log(`  ${slug.slice(0, 52).padEnd(54)} ${result.w}x${result.h}  ${(buffer.length / 1024).toFixed(0)}KB  (${result.pages}pp)`)
}

if (skipped.length > 0) {
  console.log('\n  no local PDF for:')
  for (const title of skipped) console.log(`    ${title.slice(0, 62)}`)
}
console.log(`\n  covers written: ${written}`)
await browser.close()
