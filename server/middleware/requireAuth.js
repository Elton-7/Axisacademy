const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  const secret = process.env.JWT_SECRET

  if (!secret) {
    return res.status(500).json({ success: false, error: 'Authentication is not configured' })
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' })
  }

  try {
    req.user = jwt.verify(token, secret)
    next()
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }
}

/**
 * Accepts either requireRole('admin', 'staff') or requireRole(['admin', 'staff']).
 *
 * Every one of the 21 call sites in routes/ uses the array form, which the
 * previous variadic-only signature turned into [['admin','staff']] — so
 * `includes` never matched and every content-management write returned 403.
 */
function requireRole(...allowedRoles) {
  const roles = allowedRoles.flat()

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'You do not have permission to perform this action' })
    }
    next()
  }
}

/**
 * Identifies the caller when they present a token, and lets them through when
 * they do not.
 *
 * Written for endpoints that are public but show more to staff — a draft
 * article is the case in hand. Without it, the article route had one rule for
 * everybody: anything not published returned 404, so an editor could save a
 * draft and then not open it again, because the CMS reads a record back
 * through the same endpoint the public uses.
 *
 * A bad token is ignored rather than rejected, because on a public endpoint an
 * expired token should mean "you are the public", not "go away".
 */
const attachUserIfPresent = (req, _res, next) => {
  const secret = process.env.JWT_SECRET
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (secret && token) {
    try {
      req.user = jwt.verify(token, secret)
    } catch {
      // Deliberately ignored — see above.
    }
  }
  next()
}

module.exports = { requireAuth, requireRole, attachUserIfPresent }
