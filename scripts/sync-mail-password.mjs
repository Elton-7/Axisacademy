/**
 * Sets the sending mailbox's password back to the one the API already uses.
 *
 * When the mailbox password is changed in cPanel and server/.env is not, every
 * notification and password-reset email fails with "535 Incorrect
 * authentication data" — quietly, because sending is fire-and-forget, so the
 * only trace is a line in stderr.log. Fixing .env instead would need the API
 * restarted, and nothing this account can reach restarts it (see
 * docs/DEPLOYMENT.md). Changing the mailbox to match the running process fixes
 * it at once.
 *
 * Run from here rather than on the host: cPanel's `uapi` command answers
 * "License corrupted" inside the sandbox cron jobs run in, so only the web API
 * can make the change. The password is read from the host's .env and handed
 * straight to that API in this one process; it is never printed or written.
 * Anyone who signs in to the mailbox by hand then needs SMTP_PASSWORD from .env.
 *
 * Afterwards, confirm with: node scripts/run-on-host.mjs scripts/check-mail.js --send
 *
 *   CPANEL_HOST / CPANEL_USER / CPANEL_API_TOKEN
 *   APP_ROOT   application root on the host, defaults to the Axis API
 *
 * Usage:  node scripts/sync-mail-password.mjs
 */
import https from 'node:https'
import { createRequire } from 'node:module'

const dotenv = createRequire(new URL('../server/package.json', import.meta.url))('dotenv')

const HOST = process.env.CPANEL_HOST
const USER = process.env.CPANEL_USER
const TOKEN = process.env.CPANEL_API_TOKEN
const PORT = Number(process.env.CPANEL_PORT || 2083)
const APP_ROOT = process.env.APP_ROOT || `/home/${USER}/repos/axis/server`

if (!HOST || !USER || !TOKEN) {
  console.error('sync-mail-password: set CPANEL_HOST, CPANEL_USER and CPANEL_API_TOKEN.')
  process.exit(1)
}

const call = (path, body) =>
  new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: HOST, port: PORT, path, method: body ? 'POST' : 'GET', rejectUnauthorized: false,
        headers: {
          Authorization: `cpanel ${USER}:${TOKEN}`,
          ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } : {}),
        },
      },
      (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => { try { resolve(JSON.parse(d)) } catch { reject(new Error('cPanel gave an unreadable answer')) } })
      }
    )
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })

try {
  const file = await call(`/execute/Fileman/get_file_content?${new URLSearchParams({ dir: APP_ROOT, file: '.env' })}`)
  if (!file.status) throw new Error(`could not read ${APP_ROOT}/.env`)
  const env = dotenv.parse(String(file.data.content))
  const match = /^([^@\s]+)@([^@\s]+)$/.exec(env.SMTP_USER || '')
  if (!match || !env.SMTP_PASSWORD) throw new Error('SMTP_USER and SMTP_PASSWORD must both be set in .env')

  // POST, so the password is in the body rather than a URL a log might keep.
  const r = await call(
    '/execute/Email/passwd_pop',
    new URLSearchParams({ email: match[1], domain: match[2], password: env.SMTP_PASSWORD }).toString()
  )
  if (!r.status) {
    const why = (r.errors || []).join('; ').split(env.SMTP_PASSWORD).join('<password>')
    throw new Error(`cPanel refused the change — ${why.slice(0, 240)}`)
  }
  console.log(`  ${env.SMTP_USER}: password now matches .env`)
} catch (err) {
  console.error(`sync-mail-password: ${err.message}`)
  process.exit(1)
}
