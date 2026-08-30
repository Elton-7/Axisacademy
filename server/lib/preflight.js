/**
 * Refuses to start a production server that is misconfigured.
 *
 * Most of these have development defaults, which is what makes them dangerous:
 * the server starts, looks healthy, and fails somewhere the cause is not
 * visible. CORS_ORIGIN falling back to localhost is the worst of them — the
 * site loads, every API call is blocked by the browser, and the console error
 * points at CORS rather than at the missing variable.
 *
 * Everything wrong is reported at once. Reporting the first problem only turns
 * a deploy into one failed attempt per variable.
 */

const isProduction = () => process.env.NODE_ENV === 'production'

const checks = [
  {
    name: 'JWT_SECRET',
    fail: () => !process.env.JWT_SECRET,
    message: 'JWT_SECRET is not set. Every token would be signed with nothing.',
  },
  {
    name: 'JWT_SECRET',
    fail: () => process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32,
    message: 'JWT_SECRET is shorter than 32 characters — too short to resist being guessed.',
  },
  {
    name: 'CORS_ORIGIN',
    fail: () => !process.env.CORS_ORIGIN,
    message:
      'CORS_ORIGIN is not set, so it falls back to localhost. The site will load ' +
      'and every API call will be blocked by the browser.',
  },
  {
    name: 'CORS_ORIGIN',
    fail: () => process.env.CORS_ORIGIN?.includes('localhost'),
    message: 'CORS_ORIGIN still names localhost. It must be the deployed site origin.',
  },
  {
    name: 'ADMIN_EMAIL',
    fail: () => !process.env.ADMIN_EMAIL,
    message: 'ADMIN_EMAIL is not set; the seeder would create the predictable admin@axis.com.',
  },
  {
    name: 'ADMIN_PASSWORD_HASH',
    fail: () => !process.env.ADMIN_PASSWORD_HASH,
    message:
      'ADMIN_PASSWORD_HASH is not set. Seeding fails on a NOT NULL violation that ' +
      'says nothing about the cause. Generate it with:\n' +
      '       node -e "require(\'bcrypt\').hash(\'your-password\',12).then(console.log)"',
  },
  {
    name: 'ADMIN_PASSWORD_HASH',
    fail: () =>
      process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD_HASH.startsWith('$2'),
    message: 'ADMIN_PASSWORD_HASH is not a bcrypt hash — a plaintext password will never match.',
  },
  {
    name: 'SITE_URL',
    fail: () => !process.env.SITE_URL,
    message:
      'SITE_URL is not set. Password reset emails would carry a link with no ' +
      'domain in front of it, which cannot be opened from a mail client.',
  },
  {
    name: 'SITE_URL',
    /**
     * Checked against CORS_ORIGIN because that variable cannot be wrong for
     * long: if it does not name the real site, every page fails visibly on the
     * first request. SITE_URL has no such alarm — it is read only when an email
     * is composed, so a stale value survives a move between hosts and is found
     * by the one person least able to report it, holding a dead reset link.
     *
     * This is not hypothetical. After the move off Netlify this still pointed at
     * the retired address, and reset emails were delivered, correct in every
     * other respect, and useless.
     */
    fail: () => {
      const site = process.env.SITE_URL
      const origins = (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean)
      if (!site || origins.length === 0) return false
      const host = (value) => { try { return new URL(value).host } catch { return null } }
      const siteHost = host(site)
      return Boolean(siteHost) && !origins.some((o) => host(o) === siteHost)
    },
    message:
      'SITE_URL names a different site from CORS_ORIGIN. Emailed links would ' +
      'point somewhere the site is not served from.',
  },
]

/** Worth saying out loud, but not worth refusing to start over. */
const warnings = [
  {
    fail: () => !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD,
    message:
      'SMTP is not configured. Enquiry notifications will be written to the log ' +
      'instead of emailed — no enquiry is lost, but nobody is told about one either.',
  },
  {
    fail: () => !process.env.SITE_BUILD_HOOK && !process.env.NETLIFY_BUILD_HOOK,
    message:
      'No build hook is configured. Publishing an article puts it on the site ' +
      'immediately, but its prerendered page and its sitemap entry wait for the ' +
      'next client deploy — which is the current arrangement on cPanel, and fine ' +
      'as long as somebody knows it.',
  },
  {
    fail: () => !process.env.ERROR_WEBHOOK_URL,
    message:
      'ERROR_WEBHOOK_URL is not set. Failures are still logged as structured JSON, ' +
      'but nothing will notify you when the API starts returning errors.',
  },
]

const preflight = () => {
  if (!isProduction()) return

  for (const { fail, message } of warnings) {
    if (fail()) console.warn(`  warning: ${message}`)
  }

  const failures = checks.filter((c) => c.fail())
  if (failures.length === 0) return

  console.error(`\nRefusing to start: ${failures.length} configuration problem(s).\n`)
  for (const { name, message } of failures) {
    console.error(`  ${name}: ${message}`)
  }
  console.error('\nSet these in the host dashboard, not in the repository. See docs/DEPLOYMENT.md.\n')
  process.exit(1)
}

module.exports = { preflight }
