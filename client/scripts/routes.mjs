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

export function allRoutes() {
  const serviceRoutes = readServiceSlugs().map((slug) => ({
    path: `/services/${slug}`,
    priority: '0.9',
    changefreq: 'monthly',
  }))
  return [...staticRoutes, ...serviceRoutes]
}

export const SITE_URL = (process.env.VITE_SITE_URL || 'https://www.axislearning.co.ke').replace(
  /\/$/,
  ''
)
