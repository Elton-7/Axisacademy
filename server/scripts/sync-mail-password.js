#!/usr/bin/env node
/**
 * Sets the sending mailbox's password to the one the API already uses.
 *
 * When the mailbox password is changed in cPanel and .env is not, every
 * notification and password-reset email fails with "535 Incorrect
 * authentication data" — quietly, because sending is fire-and-forget. Fixing
 * .env instead would need the API restarted to take effect, and nothing this
 * account can reach restarts it (see docs/DEPLOYMENT.md). Changing the mailbox
 * to match the running process fixes it at once.
 *
 * It runs on the host and calls cPanel's own `uapi` command, so the password
 * goes from .env to the mail server without leaving the machine or being
 * printed. Anyone who signs in to the mailbox by hand needs the new password,
 * which is SMTP_PASSWORD in .env.
 *
 *   node scripts/sync-mail-password.js
 */
const path = require('node:path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const { spawnSync } = require('node:child_process')
const nodemailer = require('nodemailer')

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE } = process.env

const match = /^([^@\s]+)@([^@\s]+)$/.exec(SMTP_USER || '')
if (!match || !SMTP_PASSWORD) {
  console.log('failed: SMTP_USER and SMTP_PASSWORD must both be set in .env')
  process.exit(1)
}
const [, local, domain] = match

const result = spawnSync('/usr/bin/uapi', [
  '--output=json', 'Email', 'passwd_pop', `email=${local}`, `domain=${domain}`, `password=${SMTP_PASSWORD}`,
], { encoding: 'utf8' })

let reply
try {
  reply = JSON.parse(result.stdout).result
} catch {
  console.log(`failed: uapi gave no usable answer (${String(result.stderr || result.error || '').trim().slice(0, 160)})`)
  process.exit(1)
}
if (!reply.status) {
  console.log(`failed: cPanel refused the change — ${(reply.errors || []).join('; ').slice(0, 200)}`)
  process.exit(1)
}
console.log(`  ${SMTP_USER}: password now matches .env`)

nodemailer
  .createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  })
  .verify()
  .then(() => {
    console.log('  login: accepted')
    console.log('done')
  })
  .catch((err) => {
    console.log(`failed: the password was changed but the login still fails — ${err.message}`)
    process.exitCode = 1
  })
