#!/usr/bin/env node
/**
 * Checks that the API can actually send email, using the settings in .env.
 *
 * Notifications fail quietly by design — an enquiry is saved whether or not
 * the email about it goes — so a broken mail login shows up only as a line in
 * stderr.log, and nobody at Axis hears about new families. This answers the
 * question directly: it logs in to the mail server exactly as the API does and
 * reports what happened. The password is never printed.
 *
 *   node scripts/check-mail.js          check the login
 *   node scripts/check-mail.js --send   and send a test to NOTIFICATION_TO
 */
const path = require('node:path')
// By path, so it works when cron starts it from the home directory.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const nodemailer = require('nodemailer')

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE, NOTIFICATION_FROM, NOTIFICATION_TO,
} = process.env

const port = Number(SMTP_PORT) || 587
console.log(`  SMTP_HOST:         ${SMTP_HOST || '(not set)'}`)
console.log(`  SMTP_PORT:         ${port}${SMTP_PORT ? '' : ' (default)'}`)
console.log(`  SMTP_SECURE:       ${SMTP_SECURE === 'true'}`)
console.log(`  SMTP_USER:         ${SMTP_USER || '(not set)'}`)
console.log(`  SMTP_PASSWORD:     ${SMTP_PASSWORD ? `set, ${SMTP_PASSWORD.length} characters` : '(not set)'}`)
console.log(`  NOTIFICATION_FROM: ${NOTIFICATION_FROM || `(not set — falls back to ${SMTP_USER})`}`)
console.log(`  NOTIFICATION_TO:   ${NOTIFICATION_TO || '(not set)'}`)

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
  console.log('failed: mail is not configured')
  process.exit(1)
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: SMTP_SECURE === 'true',
  auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
})

transporter
  .verify()
  .then(async () => {
    console.log('  login: accepted')
    if (process.argv.includes('--send')) {
      const info = await transporter.sendMail({
        from: NOTIFICATION_FROM || SMTP_USER,
        to: NOTIFICATION_TO,
        subject: 'Axis Learning: test of website notifications',
        text: 'This is a test sent by server/scripts/check-mail.js. If it arrived, enquiry notifications work.',
      })
      console.log(`  test message: ${info.accepted.length ? 'accepted for delivery' : 'rejected'} (${info.response})`)
    }
    console.log('done')
  })
  .catch((err) => {
    console.log(`failed: ${err.message}`)
    process.exitCode = 1
  })
