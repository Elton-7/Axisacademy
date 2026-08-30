/**
 * The configuration checks that decide whether production may start at all.
 *
 * These matter more than their size suggests, because everything they guard
 * has a development default. A missing value does not stop the server; it
 * starts, reports itself healthy, and fails somewhere the cause is invisible.
 *
 * SITE_URL is the clearest case and the reason this file exists. It is read
 * only when an email is composed, so when it kept naming the retired Netlify
 * address after the site moved hosts, password reset emails went on arriving —
 * correctly worded, properly delivered, with a valid token — and every link in
 * them was dead. Nothing failed. No log said anything. It was found by opening
 * a mailbox and clicking the link, which is not a thing that happens often
 * enough to rely on.
 *
 * The check pairs SITE_URL with CORS_ORIGIN deliberately: CORS_ORIGIN cannot be
 * wrong for long, because the site visibly stops working if it is, so it is a
 * trustworthy statement of where the site actually lives.
 *
 * preflight() calls process.exit, so each case runs in its own process.
 */
const assert = require('node:assert/strict')
const { describe, test } = require('node:test')
const { execFileSync } = require('node:child_process')
const path = require('node:path')

const SERVER_DIR = path.join(__dirname, '..')
const SITE = 'https://www.axislearning.co.ke'

/** A production environment that passes, so each case varies one thing. */
const sound = {
  NODE_ENV: 'production',
  JWT_SECRET: 'x'.repeat(40),
  CORS_ORIGIN: SITE,
  SITE_URL: SITE,
  ADMIN_EMAIL: 'admin@axislearning.co.ke',
  // Shaped like bcrypt without being a usable hash of anything.
  ADMIN_PASSWORD_HASH: ['$2b', '12', 'abcdefghijklmnopqrstuvwxyz012345'].join('$'),
}

/** Returns null if the server would start, or the refusal text if it would not. */
const startUp = (overrides = {}) => {
  const env = { ...sound, ...overrides, PATH: process.env.PATH }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete env[key]
  }

  try {
    execFileSync(process.execPath, ['-e', "require('./lib/preflight').preflight()"], {
      cwd: SERVER_DIR,
      env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return null
  } catch (error) {
    return String(error.stderr || '')
  }
}

describe('preflight', () => {
  test('a sound production environment starts', () => {
    assert.equal(startUp(), null)
  })

  test('development is never blocked, however wrong it looks', () => {
    assert.equal(startUp({ NODE_ENV: 'development', JWT_SECRET: undefined, SITE_URL: undefined }), null)
  })

  test('SITE_URL naming a host the site is not served from is refused', () => {
    const refusal = startUp({ SITE_URL: 'https://axis-academy-site.netlify.app' })
    assert.ok(refusal, 'a stale SITE_URL must not start')
    assert.match(refusal, /SITE_URL/)
    assert.match(refusal, /emailed links/i)
  })

  test('a missing SITE_URL is refused, since links would have no domain', () => {
    assert.match(startUp({ SITE_URL: undefined }) || '', /SITE_URL/)
  })

  test('SITE_URL may be any one of several allowed origins', () => {
    assert.equal(startUp({ CORS_ORIGIN: `https://axislearning.co.ke,${SITE}` }), null)
  })

  test('a trailing slash is not a different site', () => {
    assert.equal(startUp({ SITE_URL: `${SITE}/` }), null)
  })

  test('the check stays quiet when CORS_ORIGIN cannot be trusted either', () => {
    // With no CORS_ORIGIN there is nothing to compare against, and its own
    // check already refuses. Reporting a mismatch too would just be noise.
    const refusal = startUp({ CORS_ORIGIN: undefined }) || ''
    assert.match(refusal, /CORS_ORIGIN/)
    assert.doesNotMatch(refusal, /different site/i)
  })

  test('every problem is reported at once, not one deploy at a time', () => {
    const refusal = startUp({ JWT_SECRET: undefined, ADMIN_EMAIL: undefined }) || ''
    assert.match(refusal, /JWT_SECRET/)
    assert.match(refusal, /ADMIN_EMAIL/)
  })

  test('a password left in plaintext is caught before it can never match', () => {
    assert.match(startUp({ ADMIN_PASSWORD_HASH: 'hunter2' }) || '', /not a bcrypt hash/)
  })
})
