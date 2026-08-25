const rateLimit = require('express-rate-limit')

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // limit each IP to 8 requests per windowMs
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many contact form submissions from this IP, please try again later.',
  },
})

const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 newsletter/subscription requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many newsletter requests from this IP, please try again later.',
  },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // Six is the production figure. It is configurable only so the test suite,
  // which signs in a fixture account per role from a single address, is not
  // throttled — raising it in production would weaken the protection that
  // makes a password worth having.
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts from this IP, please try again later.',
  },
})

const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  /*
   * Sixty a minute per IP in production. Overridable only so the test suite is
   * not throttled by its own thoroughness: every request in a run comes from
   * one address, so adding a test used to push the whole suite past the limit
   * and fail unrelated cases with a 429 — a failure that looks like a bug in
   * whatever was tested last. AUTH_RATE_LIMIT_MAX already existed for the same
   * reason on sign-in. The production default must stay where it is.
   */
  max: Number(process.env.GENERAL_RATE_LIMIT_MAX) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please slow down.',
  },
})

module.exports = {
  contactLimiter,
  newsletterLimiter,
  authLimiter,
  generalApiLimiter,
}
