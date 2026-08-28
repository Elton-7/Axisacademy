/**
 * Tells Bing, Yandex and the other IndexNow participants that pages changed.
 *
 * Google does not take part — it dropped its sitemap ping endpoint in 2023 and
 * offers no unauthenticated submission at all, so a new page still reaches
 * Google only through Search Console or by being crawled. This covers the rest,
 * and costs nothing to run after a deploy.
 *
 * Ownership is proved by a key file served from the site itself: the key is
 * public by design, which is why it is committed rather than kept secret. The
 * key is read from that file rather than stored anywhere else, so there is one
 * copy and it cannot drift from what the site serves.
 *
 * The URL list comes from the sitemap, so this submits exactly what the site
 * says it publishes — no separate list to fall out of date.
 *
 * Usage:  node scripts/submit-indexnow.mjs [--dry-run]
 */
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_DIR = path.join(repoRoot, 'client', 'public')
const SITE = process.env.VITE_SITE_URL || 'https://www.axislearning.co.ke'
const DRY_RUN = process.argv.includes('--dry-run')

/** The key file is any 8–128 hex-named .txt in public/, which is the protocol's own rule. */
const keyFile = fs
  .readdirSync(PUBLIC_DIR)
  .find((name) => /^[0-9a-f]{8,128}\.txt$/.test(name))

if (!keyFile) {
  console.error('submit-indexnow: no key file in client/public. Create one named <key>.txt containing that key.')
  process.exit(1)
}

const key = keyFile.replace(/\.txt$/, '')
const onDisk = fs.readFileSync(path.join(PUBLIC_DIR, keyFile), 'utf8').trim()
if (onDisk !== key) {
  console.error(`submit-indexnow: ${keyFile} must contain exactly "${key}", and contains something else.`)
  process.exit(1)
}

const get = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = ''
        res.on('data', (c) => (data += c))
        res.on('end', () => resolve({ status: res.statusCode, body: data }))
      })
      .on('error', reject)
  })

const postJson = (url, payload) =>
  new Promise((resolve, reject) => {
    const target = new URL(url)
    const body = JSON.stringify(payload)
    const req = https.request(
      {
        hostname: target.hostname,
        path: target.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let data = ''
        res.on('data', (c) => (data += c))
        res.on('end', () => resolve({ status: res.statusCode, body: data }))
      }
    )
    req.on('error', reject)
    req.setTimeout(20000, () => req.destroy(new Error('timed out')))
    req.write(body)
    req.end()
  })

const host = new URL(SITE).hostname
const keyLocation = `${SITE.replace(/\/$/, '')}/${keyFile}`

// The search engines fetch this to confirm the submission is really from the
// site's owner, so a submission made before it is deployed is simply rejected.
const served = await get(keyLocation)
if (served.status !== 200 || served.body.trim() !== key) {
  console.error(
    `submit-indexnow: ${keyLocation} answered ${served.status} and did not return the key. ` +
      'Deploy the site before submitting.'
  )
  process.exit(1)
}
console.log(`  key file verified at ${keyLocation}`)

const sitemap = await get(`${SITE.replace(/\/$/, '')}/sitemap.xml`)
if (sitemap.status !== 200) {
  console.error(`submit-indexnow: the sitemap answered ${sitemap.status}`)
  process.exit(1)
}
const urlList = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
console.log(`  ${urlList.length} URLs from the sitemap`)

if (DRY_RUN) {
  console.log('  --dry-run: nothing submitted')
  process.exit(0)
}

const response = await postJson('https://api.indexnow.org/indexnow', { host, key, keyLocation, urlList })
// 200 accepted; 202 accepted while the key is still being validated.
const ok = response.status === 200 || response.status === 202
console.log(`  submitted: HTTP ${response.status}${ok ? '' : '  ' + response.body.slice(0, 160)}`)
if (!ok) process.exit(1)
console.log('  Bing, Yandex and the other participants have the list. Google does not take part.')
