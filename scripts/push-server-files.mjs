/**
 * Copies changed API source files to the cPanel application root.
 *
 * There is no git on the host and no shell, so the file manager API is the only
 * way in. Each file is written and then read back and compared, because this
 * host's upload endpoints have already been caught once reporting a success
 * they did not perform — a count of files "uploaded" that silently skipped
 * every one that already existed.
 *
 * Copying files does not restart anything. Passenger keeps serving the process
 * it already has, so the new code sits on disk until the application is
 * genuinely restarted; check /api/health's startedAt to know whether it was.
 *
 *   CPANEL_HOST / CPANEL_USER / CPANEL_API_TOKEN
 *   APP_ROOT   application root on the host, defaults to the Axis API
 *
 * Usage:  node scripts/push-server-files.mjs server.js lib/preflight.js
 */
import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HOST = process.env.CPANEL_HOST
const USER = process.env.CPANEL_USER
const TOKEN = process.env.CPANEL_API_TOKEN
const PORT = Number(process.env.CPANEL_PORT || 2083)
const APP_ROOT = process.env.APP_ROOT || `/home/${USER}/repos/axis/server`
const LOCAL_ROOT = path.resolve(fileURLToPath(new URL('../server', import.meta.url)))

const files = process.argv.slice(2)
if (!HOST || !USER || !TOKEN) {
  console.error('push-server-files: set CPANEL_HOST, CPANEL_USER and CPANEL_API_TOKEN.')
  process.exit(1)
}
if (files.length === 0) {
  console.error('push-server-files: name at least one file, relative to server/.')
  process.exit(1)
}

const uapi = (module, fn, params = {}, method = 'GET') =>
  new Promise((resolve, reject) => {
    const body = method === 'POST' ? new URLSearchParams(params).toString() : ''
    const qs = method === 'GET' ? `?${new URLSearchParams(params).toString()}` : ''
    const req = https.request(
      {
        host: HOST,
        port: PORT,
        method,
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
        res.on('end', () => {
          try { resolve(JSON.parse(d)) } catch { reject(new Error(String(d).slice(0, 200))) }
        })
      }
    )
    req.on('error', reject)
    if (method === 'POST') req.write(body)
    req.end()
  })

let failed = 0
for (const relative of files) {
  const local = path.join(LOCAL_ROOT, relative)
  if (!fs.existsSync(local)) {
    console.error(`  ${relative}: not found at ${local}`)
    failed += 1
    continue
  }

  const content = fs.readFileSync(local, 'utf8')
  const dir = path.posix.join(APP_ROOT, path.posix.dirname(relative.split(path.sep).join('/')))
  const name = path.posix.basename(relative.split(path.sep).join('/'))

  const written = await uapi('Fileman', 'save_file_content', { dir, file: name, content }, 'POST')
  const back = await uapi('Fileman', 'get_file_content', { dir, file: name })
  // Compared by content, not by the API's own word for it.
  const identical = String((back.data && back.data.content) || '') === content

  if (!written.status || !identical) failed += 1
  console.log(`  ${relative.padEnd(28)} ${identical ? 'matches on the host' : 'MISMATCH after write'}`)
}

console.log(`\n  ${files.length - failed}/${files.length} in place; restart is still required for any of it to run.`)
process.exit(failed ? 1 : 0)
