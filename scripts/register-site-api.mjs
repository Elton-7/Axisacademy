/**
 * Registers the API a second time, on the main site's vhost, under /api.
 *
 * Why this exists: the API process on the api vhost cannot be restarted by
 * anything this account can reach — see docs/DEPLOYMENT.md for the full list of
 * what was tried — so deployed code and .env changes sit on disk unused. The
 * main site's vhost has never run a Node application. There is no process there
 * to reuse, so the first request has to start one, and that one reads the code
 * and the .env as they are now.
 *
 * It also removes CORS from the picture: the client can call /api on its own
 * origin instead of a second hostname.
 *
 * This writes Passenger directives into the document root of the live site, so:
 *
 *   - the current .htaccess is saved locally before anything is touched
 *   - the site is fetched immediately afterwards and must return 200 with HTML
 *   - anything less and the application is unregistered and the .htaccess is
 *     put back exactly as it was, before the script exits non-zero
 *
 * The existing api.axislearning.co.ke application is not touched and keeps
 * serving throughout, so nothing goes down while this is tried.
 *
 *   CPANEL_HOST / CPANEL_USER / CPANEL_API_TOKEN
 *   SITE_DOMAIN   defaults to axislearning.co.ke
 *   APP_ROOT      defaults to the Axis API checkout
 *
 * Usage:  node scripts/register-site-api.mjs
 *         node scripts/register-site-api.mjs --undo
 */
import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HOST = process.env.CPANEL_HOST
const USER = process.env.CPANEL_USER
const TOKEN = process.env.CPANEL_API_TOKEN
const PORT = Number(process.env.CPANEL_PORT || 2083)
const DOMAIN = process.env.SITE_DOMAIN || 'axislearning.co.ke'
const APP_ROOT = process.env.APP_ROOT || `/home/${USER}/repos/axis/server`
const APP = 'axis-api-site'
const UNDO = process.argv.includes('--undo')

const BACKUP = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '.htaccess.site.backup'
)

if (!HOST || !USER || !TOKEN) {
  console.error('register-site-api: set CPANEL_HOST, CPANEL_USER and CPANEL_API_TOKEN.')
  process.exit(1)
}

const uapi = (module, fn, params = {}, method = 'GET') =>
  new Promise((resolve, reject) => {
    const body = method === 'POST' ? new URLSearchParams(params).toString() : ''
    const qs = method === 'GET' ? `?${new URLSearchParams(params).toString()}` : ''
    const req = https.request(
      {
        host: HOST, port: PORT, method,
        path: `/execute/${module}/${fn}${qs}`,
        rejectUnauthorized: false,
        headers: {
          Authorization: `cpanel ${USER}:${TOKEN}`,
          ...(method === 'POST'
            ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
            : {}),
        },
      },
      (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => { try { resolve(JSON.parse(d)) } catch { reject(new Error(String(d).slice(0, 250))) } })
      }
    )
    req.on('error', reject)
    if (method === 'POST') req.write(body)
    req.end()
  })

const get = (url) =>
  new Promise((resolve) => {
    https
      .get(url, (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => resolve({ status: res.statusCode, body: d.slice(0, 600) }))
      })
      .on('error', () => resolve({ status: 0, body: '' }))
      .setTimeout(25000, function () { this.destroy(); resolve({ status: 0, body: '' }) })
  })

const docroot = (await uapi('DomainInfo', 'single_domain_data', { domain: DOMAIN })).data.documentroot
/**
 * The site is healthy only if it still serves its own pages AND still answers
 * an unknown path with 404.
 *
 * The second half is not pedantry. When Passenger was accidentally given the
 * site's whole document root, every real page kept returning 200 — prerendered
 * HTML wins before Passenger sees it — while unknown paths quietly became 503s.
 * A homepage check would have called that healthy and rolled back nothing.
 */
const siteOk = async () => {
  const home = await get(`https://www.${DOMAIN}/`)
  if (home.status !== 200 || !/<(!doctype|html)/i.test(home.body)) return false
  const missing = await get(`https://www.${DOMAIN}/there-is-no-such-page-here`)
  return missing.status === 404
}

if (UNDO) {
  await uapi('PassengerApps', 'unregister_application', { name: APP }, 'POST')
  if (fs.existsSync(BACKUP)) {
    await uapi('Fileman', 'save_file_content', { dir: docroot, file: '.htaccess', content: fs.readFileSync(BACKUP, 'utf8') }, 'POST')
    console.log('  .htaccess restored from the backup')
  }
  console.log(`  site: ${(await siteOk()) ? 'serving normally' : 'NOT SERVING — restore .htaccess by hand'}`)
  process.exit(0)
}

if (!(await siteOk())) {
  console.error('  the site is not healthy to begin with; refusing to change anything')
  process.exit(1)
}

const current = String((await uapi('Fileman', 'get_file_content', { dir: docroot, file: '.htaccess' })).data.content || '')
fs.writeFileSync(BACKUP, current)
console.log(`  ${docroot}/.htaccess backed up to ${path.basename(BACKUP)} (${current.length} bytes)`)

const registered = await uapi('PassengerApps', 'register_application', {
  name: APP, path: APP_ROOT, domain: DOMAIN, base_uri: '/api',
  deployment_mode: 'production', enabled: 1,
}, 'POST')
console.log(`  registered ${APP} on ${DOMAIN}/api: ${registered.status ? 'accepted' : 'rejected — ' + JSON.stringify(registered.errors).slice(0, 200)}`)
if (!registered.status) process.exit(1)

const rollback = async (why) => {
  console.error(`\n  rolling back: ${why}`)
  await uapi('PassengerApps', 'unregister_application', { name: APP }, 'POST')
  await uapi('Fileman', 'save_file_content', { dir: docroot, file: '.htaccess', content: current }, 'POST')
  console.error(`  site after rollback: ${(await siteOk()) ? 'serving normally' : 'STILL BROKEN — restore .htaccess by hand'}`)
}

await new Promise((r) => setTimeout(r, 8000))
if (!(await siteOk())) {
  await rollback('the site stopped serving its pages')
  process.exit(1)
}
console.log('  the site itself is unaffected')

let answer = null
for (let i = 0; i < 12 && !answer; i += 1) {
  const r = await get(`https://www.${DOMAIN}/api/health`)
  if (r.status !== 404 && r.status !== 0) answer = r
  else await new Promise((r2) => setTimeout(r2, 5000))
}

if (!answer) {
  // Passenger can strip the base URI before the app sees it, in which case the
  // app's own /api prefix lands at /api/api.
  const doubled = await get(`https://www.${DOMAIN}/api/api/health`)
  if (doubled.status === 200) {
    console.log(`\n  the base URI is stripped before the app sees it: /api/api/health answers`)
    // Leaving a half-working registration behind would be worse than not
    // trying: /api would answer on one path and not on the other.
    await rollback('the application is mounted one path deeper than it expects')
    console.log('  a mount shim is needed in server.js before this can work')
    process.exit(3)
  }
  await rollback('nothing answered under /api')
  process.exit(1)
}

let parsed = {}
try { parsed = JSON.parse(answer.body) } catch {}
console.log(`\n  https://www.${DOMAIN}/api/health -> HTTP ${answer.status}`)
console.log(`  ${answer.body.slice(0, 200)}`)

if (parsed.startedAt) {
  console.log(`\n  A NEW PROCESS IS RUNNING — startedAt ${parsed.startedAt}`)
  console.log('  it is running the current code and the current .env.')
  console.log('\n  next: point the client at /api (same origin) and redeploy.')
} else {
  console.log('\n  it answered but reports no startedAt, which should be impossible')
  console.log('  for a process started from the deployed code. Investigate before relying on it.')
}
