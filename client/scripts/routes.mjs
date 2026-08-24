import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * The canonical list of public routes, shared by the sitemap generator and the
 * prerenderer so the two can never disagree about what the site contains.
 */

const clientRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Static public routes, with the priority Google should infer for each. */
export const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/philosophy', priority: '0.8', changefreq: 'monthly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  { path: '/learning-paths', priority: '0.9', changefreq: 'monthly' },
  { path: '/programmes', priority: '0.8', changefreq: 'weekly' },
  { path: '/educator-network', priority: '0.8', changefreq: 'monthly' },
  { path: '/team', priority: '0.7', changefreq: 'weekly' },
  { path: '/locations', priority: '0.9', changefreq: 'weekly' },
  { path: '/events', priority: '0.7', changefreq: 'weekly' },
  { path: '/gallery', priority: '0.6', changefreq: 'weekly' },
  { path: '/resources', priority: '0.8', changefreq: 'weekly' },
  { path: '/partners', priority: '0.6', changefreq: 'monthly' },
  { path: '/faq', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  { path: '/consultation', priority: '0.9', changefreq: 'monthly' },
  { path: '/enroll', priority: '0.9', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  // Deliberately high: for a service sending educators into homes, this is the
  // page a parent most needs to find.
  { path: '/safeguarding', priority: '0.8', changefreq: 'yearly' },
]

/**
 * Service slugs are read out of src/content/services.ts so that adding a service
 * automatically adds its route. Fails loudly if the content file changes shape.
 */
export function readServiceSlugs() {
  const source = readFileSync(resolve(clientRoot, 'src/content/services.ts'), 'utf8')
  const slugs = [...source.matchAll(/^\s{4}slug: '([a-z0-9-]+)',$/gm)].map((match) => match[1])

  if (slugs.length === 0) {
    throw new Error(
      'routes: found no service slugs in src/content/services.ts. ' +
        'If the content file changed shape, update the extraction here.'
    )
  }
  return slugs
}

/**
 * Article slugs come from the API, not from a source file.
 *
 * Services are fixed and live in the repository; articles are written by Axis
 * in the CMS and go on being added after handover. Reading them at build time
 * is what puts each new article into the sitemap without a developer touching
 * anything — which is the whole of what the Resources review asks for in
 * sections 3 and 4.
 *
 * A failure here is not fatal. If the API is asleep or unreachable the build
 * continues with the static routes: a sitemap missing today's articles is a
 * far smaller problem than a deploy that cannot run.
 */
export async function readArticleSlugs() {
  const base = (process.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
  await warmApi()
  try {
    const response = await fetch(`${base}/resources?limit=500`, {
      signal: AbortSignal.timeout(45000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const body = await response.json()
    const list = Array.isArray(body) ? body : body.data || []
    return list.map((article) => article.slug).filter(Boolean)
  } catch (error) {
    console.warn(`routes: could not read articles for the sitemap (${error.message}). Continuing without them.`)
    return []
  }
}

/**
 * Wakes the API before the build reads from it.
 *
 * The API sleeps after fifteen minutes idle on its current plan, and a cold
 * start takes the better part of a minute. A build that ran straight into that
 * would time out, quietly get back an empty article list, and publish a sitemap
 * with every article missing — worst of all right after someone published one,
 * which is exactly when this build runs.
 *
 * So the first request is allowed to be slow, and only that one. Resolves
 * either way: an unreachable API is reported by the callers, not here.
 */
let warmed = null
export function warmApi() {
  if (warmed) return warmed
  const base = (process.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
  warmed = (async () => {
    const deadline = Date.now() + 120000
    let attempt = 0
    while (Date.now() < deadline) {
      attempt += 1
      try {
        const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(30000) })
        if (response.ok) {
          if (attempt > 1) console.log(`routes: API awake after ${attempt} attempts.`)
          return true
        }
      } catch {
        // Cold start in progress; wait and try again.
      }
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
    console.warn('routes: API did not respond in time. Articles may be missing from this build.')
    return false
  })()
  return warmed
}

/** One article, for the prerenderer. Missing is not fatal — see readArticleSlugs. */
export async function fetchArticle(slug) {
  const base = (process.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
  try {
    await warmApi()
    const response = await fetch(`${base}/resources/slug/${slug}`, { signal: AbortSignal.timeout(45000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const body = await response.json()
    return body.data || body
  } catch (error) {
    console.warn(`prerender: could not load article "${slug}" (${error.message}).`)
    return undefined
  }
}

export async function allRoutes() {
  const serviceRoutes = readServiceSlugs().map((slug) => ({
    path: `/services/${slug}`,
    priority: '0.9',
    changefreq: 'monthly',
  }))
  const articleRoutes = (await readArticleSlugs()).map((slug) => ({
    path: `/resources/${slug}`,
    priority: '0.7',
    changefreq: 'monthly',
  }))
  return [...staticRoutes, ...serviceRoutes, ...articleRoutes]
}

export const SITE_URL = (process.env.VITE_SITE_URL || 'https://www.axislearning.co.ke').replace(
  /\/$/,
  ''
)
