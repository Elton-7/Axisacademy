import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { allRoutes } from './routes.mjs'

/**
 * Writes a real HTML file for every public route, so crawlers and social link
 * scrapers receive rendered markup instead of an empty <div id="root">.
 *
 * Runs after both the client build and the SSR build. The client bundle is
 * untouched — each generated file reuses the same script and stylesheet tags as
 * the original index.html, and the app hydrates over the markup on load.
 */

const clientRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(clientRoot, 'dist')
const ssrDir = resolve(clientRoot, 'dist-ssr')

const template = readFileSync(resolve(distDir, 'index.html'), 'utf8')
const { render } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href)

if (!template.includes('<div id="root"></div>')) {
  throw new Error('prerender: could not find the root container in dist/index.html')
}

let written = 0
const failures = []

for (const { path } of allRoutes()) {
  try {
    const { html, head } = render(path)

    // The route is stamped on the container so the client can tell whether the
    // markup it finds actually belongs to the page being loaded. A request for a
    // non-prerendered route (admin, portal) falls back to this file too, and
    // hydrating the wrong page's markup would be a mismatch.
    let page = template.replace(
      '<div id="root"></div>',
      `<div id="root" data-prerendered-path="${path}">${html}</div>`
    )

    // The template's own title and description are generic fallbacks for the
    // un-prerendered shell. Helmet supplies per-route versions, so the static
    // tags are removed rather than left to conflict with them.
    if (head) {
      page = page.replace(/<title>[\s\S]*?<\/title>\s*/, '')
      page = page.replace(/<meta name="description"[^>]*>\s*/, '')
      page = page.replace('</head>', `  ${head}\n</head>`)
    }

    const outDir = path === '/' ? distDir : resolve(distDir, `.${path}`)
    mkdirSync(outDir, { recursive: true })
    writeFileSync(resolve(outDir, 'index.html'), page, 'utf8')
    written += 1
  } catch (error) {
    failures.push(`${path}: ${error.message}`)
  }
}

/**
 * A pristine shell for every route that is not prerendered — the admin and
 * portal areas, and genuinely unknown URLs.
 *
 * dist/index.html is the prerendered homepage, so using it as the SPA fallback
 * would answer /admin and every mistyped URL with a 200 carrying homepage
 * markup and a canonical pointing at the site root. This shell has an empty
 * root container, so the client mounts fresh, and is marked noindex so that a
 * crawler following a bad link does not index it as duplicate homepage content.
 */
const shell = template
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Axis Learning</title>')
  .replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n</head>')

writeFileSync(resolve(distDir, 'app.html'), shell, 'utf8')

// The SSR bundle is a build artefact, not something to deploy.
rmSync(ssrDir, { recursive: true, force: true })

if (failures.length > 0) {
  console.error(`prerender: ${failures.length} route(s) failed:`)
  failures.forEach((failure) => console.error(`  - ${failure}`))
  process.exit(1)
}

console.log(`prerender: wrote ${written} HTML pages`)
