import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { allRoutes, SITE_URL } from './routes.mjs'

/** Writes public/sitemap.xml and public/robots.txt before the Vite build. */

const clientRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function buildSitemap(routes) {
  const today = new Date().toISOString().split('T')[0]
  const entries = routes
    .map(
      ({ path, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`
}

const robots = `User-agent: *
Allow: /

# Private areas — no value in the index, and they require authentication anyway.
Disallow: /admin
Disallow: /admin/login
Disallow: /portal/

Sitemap: ${SITE_URL}/sitemap.xml
`

const routes = await allRoutes()
const publicDir = resolve(clientRoot, 'public')

mkdirSync(publicDir, { recursive: true })
writeFileSync(resolve(publicDir, 'sitemap.xml'), buildSitemap(routes), 'utf8')
writeFileSync(resolve(publicDir, 'robots.txt'), robots, 'utf8')

console.log(`generate-sitemap: wrote ${routes.length} URLs for ${SITE_URL}`)
