/**
 * Publishes the built site to cPanel.
 *
 * The site is served by Apache from `public_html` on the Truehost account.
 * There is no build step on the server and no continuous deployment: this
 * script uploads `client/dist` through cPanel's file API and installs the
 * generated Apache rules.
 *
 * Credentials come from the environment and are never stored here:
 *
 *   CPANEL_HOST      the cPanel server address, from the hosting welcome email
 *   CPANEL_USER      the cPanel account name
 *   CPANEL_PASSWORD  the cPanel password, or CPANEL_API_TOKEN for a token
 *   CPANEL_PORT      optional, defaults to 2083
 *   CPANEL_DOCROOT   optional, defaults to /home/<user>/public_html
 *
 * Run `npm run build` in `client/` first, with VITE_API_URL and VITE_SITE_URL
 * set — they are compiled into the bundle and into the Content-Security-Policy,
 * so a build made with the wrong values cannot be corrected here.
 *
 * Usage:  node scripts/deploy-cpanel.mjs
 *         node scripts/deploy-cpanel.mjs --rules-only   Apache rules alone
 */
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(repoRoot, 'client', 'dist')

const HOST = process.env.CPANEL_HOST
const USER = process.env.CPANEL_USER
const PASSWORD = process.env.CPANEL_PASSWORD
const TOKEN = process.env.CPANEL_API_TOKEN
const PORT = Number(process.env.CPANEL_PORT || 2083)
const DOCROOT = process.env.CPANEL_DOCROOT || (USER ? `/home/${USER}/public_html` : null)

if (!HOST || !USER || (!PASSWORD && !TOKEN)) {
  console.error('deploy-cpanel: set CPANEL_HOST, CPANEL_USER and CPANEL_PASSWORD (or CPANEL_API_TOKEN).')
  process.exit(1)
}
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('deploy-cpanel: client/dist is missing or unbuilt. Run the client build first.')
  process.exit(1)
}

// A build with source maps in it is a build made with the wrong config. Refuse
// it rather than publish the full source; the Apache rules would hide the maps,
// but only if they are installed, and nothing should depend on that alone.
const maps = []
;(function findMaps(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) findMaps(full)
    else if (entry.name.endsWith('.map')) maps.push(path.relative(DIST, full))
  }
})(DIST)
if (maps.length) {
  console.error(`deploy-cpanel: client/dist contains ${maps.length} source map(s), e.g. ${maps[0]}. Turn sourcemap off and rebuild.`)
  process.exit(1)
}

// The CSP is compiled from VITE_API_URL. A build run without it allows only
// localhost, and the live site then loads but every API call is blocked.
const rules = path.join(DIST, 'axis.htaccess')
if (fs.existsSync(rules)) {
  const connectSrc = (fs.readFileSync(rules, 'utf8').match(/connect-src[^;"]*/) || [''])[0]
  if (/localhost/.test(connectSrc)) {
    console.error('deploy-cpanel: the build\'s CSP allows only localhost. Rebuild with VITE_API_URL and VITE_SITE_URL set.')
    process.exit(1)
  }
  // The API lives on the site's own origin. A build pointed anywhere else — the
  // retired api. subdomain is the one old instructions named — loads normally
  // and then fails every call.
  const siteOrigin = new URL(process.env.VITE_SITE_URL || 'https://www.axislearning.co.ke').origin
  if (!connectSrc.split(/\s+/).includes(siteOrigin)) {
    console.error(`deploy-cpanel: the build sends API calls to "${connectSrc.replace('connect-src', '').trim()}", not ${siteOrigin}. Rebuild with VITE_API_URL=${siteOrigin}/api.`)
    process.exit(1)
  }
}

const authHeader = TOKEN
  ? `cpanel ${USER}:${TOKEN}`
  : 'Basic ' + Buffer.from(`${USER}:${PASSWORD}`).toString('base64')

/**
 * `_headers` is Netlify's format and means nothing to Apache; `axis.htaccess`
 * is installed separately, merged into the live file rather than replacing it.
 */
const SKIP = new Set(['_headers', 'axis.htaccess'])
const MAX_BATCH = 6 * 1024 * 1024
const CRLF = '\r\n'

function request(pathname, { method = 'GET', body = null, contentType = null } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: HOST,
        port: PORT,
        path: pathname,
        method,
        // cPanel on a bare IP presents a certificate for its own hostname.
        rejectUnauthorized: false,
        headers: {
          Authorization: authHeader,
          ...(body ? { 'Content-Type': contentType, 'Content-Length': body.length } : {}),
        },
      },
      (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => {
          try {
            resolve(JSON.parse(d))
          } catch {
            reject(new Error(String(d).slice(0, 200)))
          }
        })
      }
    )
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

const uapi = (module, fn, params = {}, method = 'GET') => {
  const qs = new URLSearchParams(params).toString()
  return request(`/execute/${module}/${fn}` + (method === 'GET' && qs ? `?${qs}` : ''), {
    method,
    body: method === 'POST' ? qs : null,
    contentType: 'application/x-www-form-urlencoded',
  })
}

function field(boundary, name, value) {
  return Buffer.from(
    `--${boundary}${CRLF}Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}${value}${CRLF}`
  )
}

/**
 * `overwrite` is mandatory. Without it cPanel keeps whatever file is already at
 * the destination and still reports the request as successful, which once left
 * the host's placeholder homepage in place while the deploy claimed every file
 * had uploaded.
 */
function uploadFiles(dir, files) {
  const boundary = '----axis' + Date.now().toString(16) + Math.random().toString(16).slice(2, 8)
  const parts = [field(boundary, 'dir', dir), field(boundary, 'overwrite', '1')]
  for (const f of files) {
    const name = path.basename(f)
    parts.push(
      Buffer.from(
        `--${boundary}${CRLF}Content-Disposition: form-data; name="file-${name}"; filename="${name}"${CRLF}` +
          `Content-Type: application/octet-stream${CRLF}${CRLF}`
      )
    )
    parts.push(fs.readFileSync(f))
    parts.push(Buffer.from(CRLF))
  }
  parts.push(Buffer.from(`--${boundary}--${CRLF}`))
  const body = Buffer.concat(parts)
  return request('/execute/Fileman/upload_files', {
    method: 'POST',
    body,
    contentType: `multipart/form-data; boundary=${boundary}`,
  })
}

/** Every file, grouped by the directory it belongs in. */
function collect() {
  const groups = new Map()
  ;(function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full, rel ? `${rel}/${entry.name}` : entry.name)
      else if (!SKIP.has(entry.name)) {
        if (!groups.has(rel)) groups.set(rel, [])
        groups.get(rel).push(full)
      }
    }
  })(DIST, '')
  return groups
}

const BEGIN = '# BEGIN axis-learning'
const END = '# END axis-learning'

/**
 * Installs the generated Apache rules, replacing only the region between the
 * markers. cPanel writes its own PHP directives into this file and the account
 * carries an HTTPS redirect ahead of them; both have to survive a deploy.
 */
async function installHtaccess() {
  const fragmentPath = path.join(DIST, 'axis.htaccess')
  if (!fs.existsSync(fragmentPath)) {
    console.log('  no axis.htaccess in the build — skipping Apache rules')
    return
  }
  const fragment = fs.readFileSync(fragmentPath, 'utf8')
  const current = await uapi('Fileman', 'get_file_content', { dir: DOCROOT, file: '.htaccess' })
  let existing = current.status ? String(current.data.content) : ''

  const start = existing.indexOf(BEGIN)
  if (start !== -1) {
    const stop = existing.indexOf(END, start)
    existing = existing.slice(0, start) + existing.slice(stop === -1 ? existing.length : stop + END.length)
  }

  const merged = existing.trimEnd() + '\n\n' + fragment
  const w = await uapi('Fileman', 'save_file_content', { dir: DOCROOT, file: '.htaccess', content: merged }, 'POST')
  console.log(`  apache rules: ${w.status ? 'installed' : (w.errors || []).join('; ').slice(0, 120)}`)
}

/**
 * Compares what is on the server against what was built. The upload API
 * reports success for files it silently skipped, so its own count is not
 * evidence that the bytes on disk are the bytes that were sent.
 */
async function verify(groups) {
  let matched = 0
  const problems = []
  for (const [rel, files] of groups) {
    const dir = rel ? `${DOCROOT}/${rel}` : DOCROOT
    const listing = await uapi('Fileman', 'list_files', { dir, types: 'file' })
    const remote = new Map((listing.data || []).map((f) => [f.file, Number(f.size)]))
    for (const f of files) {
      const name = path.basename(f)
      const local = fs.statSync(f).size
      const got = remote.get(name)
      if (got === undefined) problems.push(`missing  ${rel}/${name}`)
      else if (got !== local) problems.push(`size     ${rel}/${name} local ${local} remote ${got}`)
      else matched++
    }
  }
  return { matched, problems }
}

// Installs only the Apache rules, for a change to them alone. A full upload on
// this host takes around ten minutes to send files that are already there.
if (process.argv.includes('--rules-only')) {
  await installHtaccess()
  console.log('deploy-cpanel: rules installed; no files uploaded.')
  process.exit(0)
}

const groups = collect()
const total = [...groups.values()].reduce((n, f) => n + f.length, 0)
console.log(`deploy-cpanel: ${total} files -> ${HOST}:${DOCROOT}`)

// Pages and the service worker name hashed assets, so they go last. Uploaded in
// directory order, the new HTML went up minutes before assets/, and for that
// whole window every visitor was sent pages whose CSS and JavaScript did not
// exist yet — the site appeared unstyled or blank until the deploy finished.
const isEntry = (f) => /\.html$/.test(f) || path.basename(f) === 'sw.js'
const passes = []
for (const [rel, files] of groups) passes.push([rel, files.filter((f) => !isEntry(f))])
for (const [rel, files] of groups) passes.push([rel, files.filter(isEntry)])

let uploaded = 0
for (const [rel, files] of passes) {
  const target = rel ? `${DOCROOT}/${rel}` : DOCROOT
  let batch = []
  let bytes = 0
  const flush = async () => {
    if (!batch.length) return
    const r = await uploadFiles(target, batch)
    if (r.status) uploaded += batch.length
    else console.log(`  FAILED ${rel || '/'}: ${(r.errors || []).join('; ').slice(0, 120)}`)
    batch = []
    bytes = 0
  }
  for (const f of files) {
    const size = fs.statSync(f).size
    if (bytes + size > MAX_BATCH && batch.length) await flush()
    batch.push(f)
    bytes += size
    if (bytes > MAX_BATCH) await flush()
  }
  await flush()
  process.stdout.write(`\r  uploaded ${uploaded}/${total}   `)
}
console.log()

await installHtaccess()

const { matched, problems } = await verify(groups)
console.log(`  verified against the build: ${matched}/${total} match`)
for (const p of problems.slice(0, 20)) console.log(`   ${p}`)
if (problems.length) {
  console.error(`deploy-cpanel: ${problems.length} file(s) did not match. The site may be part-deployed.`)
  process.exit(1)
}
// Checked against the live site, because a map left on disk by an older build
// is invisible to the comparison above: it is not in this build at all.
const SITE = (process.env.VITE_SITE_URL || 'https://www.axislearning.co.ke').replace(/\/$/, '')
const entry = (fs.readFileSync(path.join(DIST, 'index.html'), 'utf8').match(/assets\/index-[^"]+\.js/) || [])[0]
if (entry) {
  const status = await new Promise((resolve) => {
    // A timeout, because without one a request the host never answers holds the
    // deploy open indefinitely after everything has already been published.
    const req = https.get(`${SITE}/${entry}.map`, { timeout: 30000, agent: false }, (res) => {
      res.resume()
      resolve(res.statusCode)
    })
    req.on('timeout', () => req.destroy())
    req.on('error', () => resolve(0))
  })
  if (status === 200) {
    console.error(`deploy-cpanel: ${SITE}/${entry}.map answers 200. Source maps are public — check the Apache rules.`)
    process.exit(1)
  }
  console.log(`  source maps: not served (${status})`)
}

console.log('deploy-cpanel: done.')
