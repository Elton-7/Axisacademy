/**
 * Copies the newest database backup off the host, onto this machine.
 *
 * The nightly dumps live on the same server as the database, which protects
 * against a table emptied by mistake but not against losing the server. This
 * is the other half: run it now and then, and keep what it saves somewhere
 * that is not the host.
 *
 * The dump is encoded on the host (server/scripts/encode-latest-backup.js, run
 * through run-on-host.mjs), read back as text, decoded, and kept only if its
 * size and SHA-256 match what the host reported. The encoded copy on the host
 * is deleted afterwards either way.
 *
 * The saved file holds real learner and parent records. It goes to
 * server/backups, which git ignores at every level; keep it out of anything
 * shared.
 *
 *   CPANEL_HOST / CPANEL_USER / CPANEL_API_TOKEN
 *
 * Usage:  node scripts/fetch-backup.mjs
 */
import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const HOST = process.env.CPANEL_HOST
const USER = process.env.CPANEL_USER
const TOKEN = process.env.CPANEL_API_TOKEN
const PORT = Number(process.env.CPANEL_PORT || 2083)
const here = path.dirname(fileURLToPath(import.meta.url))
const SAVE_DIR = path.join(here, '..', 'server', 'backups')
const TRANSFER = 'backup-transfer.b64'

if (!HOST || !USER || !TOKEN) {
  console.error('fetch-backup: set CPANEL_HOST, CPANEL_USER and CPANEL_API_TOKEN.')
  process.exit(1)
}

const request = (p, body) =>
  new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: HOST, port: PORT, path: p, method: body ? 'POST' : 'GET', rejectUnauthorized: false,
        headers: {
          Authorization: `cpanel ${USER}:${TOKEN}`,
          ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } : {}),
        },
      },
      (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => { try { resolve(JSON.parse(d)) } catch { reject(new Error(String(d).slice(0, 200))) } })
      }
    )
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })

const removeTransfer = async () => {
  const params = new URLSearchParams({
    cpanel_jsonapi_user: USER, cpanel_jsonapi_apiversion: '2',
    cpanel_jsonapi_module: 'Fileman', cpanel_jsonapi_func: 'fileop',
    op: 'unlink', sourcefiles: `/home/${USER}/${TRANSFER}`, doubledecode: '0',
  })
  await request(`/json-api/cpanel?${params}`).catch(() => {})
}

// Encode on the host. run-on-host prints the script's own output.
let report
try {
  report = execFileSync(process.execPath, [path.join(here, 'run-on-host.mjs'), 'scripts/encode-latest-backup.js'], {
    encoding: 'utf8',
    env: process.env,
  })
} catch (err) {
  console.error(String(err.stdout || err.message))
  process.exit(1)
}
const field = (name) => (report.match(new RegExp(`^${name}: (.+)$`, 'm')) || [])[1]
const name = field('file')
const bytes = Number(field('bytes'))
const sha256 = field('sha256')
if (!name || !/^axis-[\w-]+\.dump$/.test(name) || !bytes || !sha256) {
  console.error(`fetch-backup: the host did not report a backup:\n${report}`)
  process.exit(1)
}

try {
  const r = await request(`/execute/Fileman/get_file_content?${new URLSearchParams({ dir: `/home/${USER}`, file: TRANSFER })}`)
  if (!r.status) throw new Error((r.errors || []).join('; '))
  const data = Buffer.from(String(r.data.content).trim(), 'base64')
  const got = crypto.createHash('sha256').update(data).digest('hex')
  if (data.length !== bytes || got !== sha256) {
    throw new Error(`the copy does not match the host's (${data.length}/${bytes} bytes) — nothing was saved`)
  }
  fs.mkdirSync(SAVE_DIR, { recursive: true })
  const target = path.join(SAVE_DIR, name)
  fs.writeFileSync(target, data)
  console.log(`fetch-backup: saved ${target} (${(bytes / 1024).toFixed(0)} KB, checksum verified)`)
} catch (err) {
  console.error(`fetch-backup: ${err.message}`)
  process.exitCode = 1
} finally {
  await removeTransfer()
}
