/**
 * Writes dist/sw.js, and the offline page it falls back to.
 *
 * Generated rather than hand-written and dropped in public/, because the
 * service worker has to name the exact hashed asset filenames this build
 * produced. A static file in public/ is copied verbatim and could only guess
 * at them.
 *
 * A service worker is the one piece of a site that can break it permanently:
 * it sits in front of every request on the device and keeps doing so after the
 * page is closed. So the rules below are deliberately narrow, and each is
 * chosen for what it refuses to do as much as for what it does.
 *
 *   /api is never touched. Not cached, not inspected, not retried. It carries
 *   session tokens, learner records, safeguarding messages and parents'
 *   contact details; none of that should be written to a cache on the device
 *   where it outlives the session and the next person to pick up the phone can
 *   reach it.
 *
 *   Hashed assets are cached indefinitely, because the hash is the version. A
 *   changed file gets a new name, so a stale hit is impossible by construction.
 *
 *   Pages are cached, but the cache is versioned to the build and every older
 *   version is deleted the moment a new worker activates. That is what stops
 *   the classic failure of this feature, where a visitor is handed yesterday's
 *   HTML pointing at asset filenames that no longer exist.
 *
 *   Nothing under /admin or /portal is stored. Those pages are worthless
 *   offline — they cannot reach the API — and an authenticated-looking shell
 *   with no data behind it is worse than an honest failure to load.
 *
 * The strategy for pages is cache-first with a background refresh. That choice
 * is measured rather than fashionable: this host answers a request for a file
 * of a few dozen bytes in one to four seconds, so network-first would make
 * every repeat visit pay that latency again. Serving the stored copy and
 * refreshing behind it makes a return visit immediate. The cost is that a
 * visitor may see the previous version once after a deploy, which is exactly
 * why the cache is wiped on activation rather than allowed to accumulate.
 */
import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const clientDir = resolve(fileURLToPath(import.meta.url), '../..')
const distDir = resolve(clientDir, 'dist')

if (!existsSync(distDir)) {
  console.error('generate-sw: dist/ does not exist. Run the build first.')
  process.exit(1)
}

/** Every file under a directory, as paths relative to dist. */
function filesUnder(dir) {
  const out = []
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...filesUnder(full))
    else out.push('/' + relative(distDir, full).split('\\').join('/'))
  }
  return out
}

// The build's own JavaScript and CSS: what a repeat visitor would otherwise
// re-download, and content-hashed, so caching them is safe.
const assets = filesUnder(join(distDir, 'assets')).filter((f) => /\.(js|css)$/.test(f))

// The dashboards are split out of the main bundle and sit behind a login.
// There is no reason to push them to every visitor's device.
const precacheAssets = assets.filter((f) => !/\/(AdminDashboard|PortalDashboard)-/.test(f))

// A small set of pages worth having before they are asked for. Everything else
// is stored as it is visited.
const KEY_ROUTES = ['/', '/fees', '/contact', '/services', '/about']
const keyPages = KEY_ROUTES.filter((route) => {
  const file = route === '/' ? join(distDir, 'index.html') : join(distDir, route.slice(1), 'index.html')
  return existsSync(file)
})

const icons = ['/favicon.svg', '/favicon-192.png', '/apple-touch-icon.png', '/manifest.webmanifest'].filter(
  (f) => existsSync(join(distDir, f.slice(1)))
)

const OFFLINE_URL = '/offline.html'
const precache = [...new Set([...precacheAssets, ...keyPages, ...icons, OFFLINE_URL])]

/**
 * The build's identity, derived from the precached filenames. Those change
 * whenever any asset's content changes, so a deploy that alters nothing
 * produces the same id and does not needlessly evict a visitor's cache.
 */
const buildId = createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 12)

// ---------------------------------------------------------------------------
// The offline page. Plain HTML, no script and no external reference, so it
// renders under the site's Content-Security-Policy and without the bundle.
// ---------------------------------------------------------------------------
const offlineHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Tries again on its own. Without this the page stayed up after the
     connection came back, and the site looked gone until someone navigated by
     hand. A meta refresh rather than a script, because the CSP allows no inline
     script this page could carry. -->
<meta http-equiv="refresh" content="15">
<title>Offline — Axis Learning</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #f6f7f9; color: #0a1628;
    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    padding: 24px; text-align: center;
  }
  main { max-width: 30rem; }
  h1 { font-size: 1.5rem; margin: 0 0 .75rem; }
  p { line-height: 1.6; color: #45536b; margin: 0 0 1rem; }
  a { color: #8a6d1f; font-weight: 600; }
  @media (prefers-color-scheme: dark) {
    body { background: #0b1322; color: #e8edf6; }
    p { color: #9fb0c9; }
  }
</style>
</head>
<body>
  <main>
    <h1>You are offline</h1>
    <p>This page has not been saved to your device yet. Pages you have already
       visited will still open without a connection.</p>
    <p>This page tries again every few seconds, or you can
       <a href="">try again now</a>.</p>
    <p>To reach Axis now, telephone <a href="tel:0737003007">0737 003 007</a>.</p>
  </main>
</body>
</html>
`

writeFileSync(join(distDir, 'offline.html'), offlineHtml)

// ---------------------------------------------------------------------------
// The worker itself.
// ---------------------------------------------------------------------------
const assetPathPattern = '/\\/assets\\//'

const sw = `/*
 * Axis Learning service worker — generated by scripts/generate-sw.mjs.
 * Build ${buildId}. Do not edit by hand; edit the generator.
 */
const BUILD = ${JSON.stringify(buildId)}
const PRECACHE = 'axis-precache-' + BUILD
const PAGES = 'axis-pages-' + BUILD
const OFFLINE_URL = ${JSON.stringify(OFFLINE_URL)}
const PRECACHE_URLS = ${JSON.stringify(precache, null, 2)}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then(async (cache) => {
      // Added one at a time rather than with addAll, which rejects the whole
      // batch if a single request fails. One missing file should not stop the
      // worker installing.
      await Promise.all(
        PRECACHE_URLS.map((url) => {
          // Assets under /assets/ are content-hashed, so the copy already in the
          // browser's own cache is by definition the right one — reuse it. The
          // usual advice to force a reload exists to avoid storing something
          // stale, which cannot happen when the filename is the version, and on
          // this host forcing it would mean downloading the whole bundle a
          // second time immediately after the page finished downloading it.
          const hashed = url.startsWith('/assets/')
          const request = hashed ? new Request(url) : new Request(url, { cache: 'reload' })
          return cache.add(request).catch(() => {})
        })
      )
      // Takes over at the next navigation rather than waiting for every tab to
      // close, so a deploy reaches people on their next page view.
      await self.skipWaiting()
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Everything from an earlier build goes. This is what guarantees a
      // visitor is never served old HTML naming assets that no longer exist.
      const names = await caches.keys()
      await Promise.all(
        names.filter((n) => n.startsWith('axis-') && !n.endsWith(BUILD)).map((n) => caches.delete(n))
      )
      await self.clients.claim()
    })()
  )
})

/** Anything the worker must keep its hands off entirely. */
function isExcluded(url) {
  return (
    url.pathname === '/api' ||
    url.pathname.startsWith('/api/') ||
    url.pathname === '/admin' ||
    url.pathname.startsWith('/admin/') ||
    url.pathname === '/portal' ||
    url.pathname.startsWith('/portal/')
  )
}

self.addEventListener('fetch', (event) => {
  const request = event.request

  // Only ever GET. A POST is an enquiry, an enrolment or a login; replaying or
  // caching one is never right.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Another origin — fonts, WhatsApp, analytics — is their business, not ours.
  if (url.origin !== self.location.origin) return
  if (isExcluded(url)) return

  // Pages.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGES)
        const cached = (await cache.match(request)) || (await caches.match(request))

        const network = fetch(request)
          .then((response) => {
            if (response && response.ok && response.type === 'basic') {
              cache.put(request, response.clone()).catch(() => {})
            }
            return response
          })
          .catch(() => null)

        // Stored copy first — this host takes seconds to answer even a tiny
        // file — with the refresh continuing behind it for next time.
        if (cached) {
          event.waitUntil(network)
          return cached
        }

        const response = await network
        if (response) return response

        // One failed request is not proof of being offline. A phone waking from
        // sleep or switching between Wi-Fi and mobile data fails the first
        // request and succeeds a moment later; answering that blip with the
        // offline page made the site look as if it had disappeared.
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const retry = await fetch(request).catch(() => null)
        if (retry) return retry

        // Any stored copy of the page, even one reached with a different query
        // string, is better than no page at all.
        const anyCopy = await caches.match(request, { ignoreSearch: true })
        if (anyCopy) return anyCopy

        return (
          (await caches.match(OFFLINE_URL)) ||
          new Response('You are offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } })
        )
      })()
    )
    return
  }

  // Hashed assets and static files. The filename carries the version, so a hit
  // can never be stale.
  event.respondWith(
    (async () => {
      const cached = await caches.match(request)
      if (cached) return cached

      try {
        const response = await fetch(request)
        if (response && response.ok && response.type === 'basic' && ${assetPathPattern}.test(url.pathname)) {
          const cache = await caches.open(PRECACHE)
          cache.put(request, response.clone()).catch(() => {})
        }
        return response
      } catch {
        return new Response('', { status: 504 })
      }
    })()
  )
})

// An escape hatch. Posting { type: 'AXIS_SW_RESET' } from the page clears every
// cache and stands the worker down — the fix of last resort if a bad build is
// ever cached, without asking people to clear site data by hand.
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'AXIS_SW_RESET') return
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.filter((n) => n.startsWith('axis-')).map((n) => caches.delete(n)))
      await self.registration.unregister()
    })()
  )
})
`

writeFileSync(join(distDir, 'sw.js'), sw)

const total = precache.reduce((sum, p) => {
  try {
    return sum + statSync(join(distDir, p.slice(1))).size
  } catch {
    return sum
  }
}, 0)

console.log(`sw: build ${buildId}, precaching ${precache.length} files (${(total / 1024).toFixed(0)} KB raw)`)
console.log(`sw: ${precacheAssets.length} assets, ${keyPages.length} pages, offline fallback written`)
