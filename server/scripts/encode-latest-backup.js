#!/usr/bin/env node
/**
 * Prepares the newest backup to be copied off the host.
 *
 * cPanel's file API returns text only, and a dump is binary, so the newest dump
 * is written base64-encoded to the home directory — outside public_html, so it
 * is never served — together with its size and SHA-256, which the machine
 * receiving it checks before keeping anything. scripts/fetch-backup.mjs runs
 * this, collects the result and removes it again.
 */
const path = require('node:path')
const fs = require('node:fs')
const os = require('node:os')
const crypto = require('node:crypto')

const DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups')
const OUT = path.join(os.homedir(), 'backup-transfer.b64')

const newest = fs.existsSync(DIR)
  ? fs.readdirSync(DIR).filter((f) => f.startsWith('axis-') && f.endsWith('.dump')).sort().pop()
  : null

if (!newest) {
  console.log(`failed: no backup in ${DIR}`)
  process.exit(1)
}

const data = fs.readFileSync(path.join(DIR, newest))
fs.writeFileSync(OUT, data.toString('base64'))
console.log(`file: ${newest}`)
console.log(`bytes: ${data.length}`)
console.log(`sha256: ${crypto.createHash('sha256').update(data).digest('hex')}`)
console.log('done')
