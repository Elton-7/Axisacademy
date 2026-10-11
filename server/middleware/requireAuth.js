const jwt = require('jsonwebtoken')

/**
 * Loaded lazily rather than at the top of the file.
 *
 * models/index.js pulls in every model and the Sequelize instance, and this
 * middleware is required by routes that are themselves required while the model
 * layer is still being built. Requiring it at load time makes that a cycle.
 */
const getUser = () => require('../models/User')

/**
 * Verifies the token, and then verifies the account behind it still exists and
 * is still enabled.
 *
 * The signature check alone was not enough. A token lasts eight hours, so
 * disabling an account — which is what this project does instead of deleting
 * one, precisely because people leave — did nothing until it expired. Someone
 * whose access had been withdrawn could keep reading learner records and
 * safeguarding notes for the rest of the working day.
 *
 * The cost is one indexed primary-key lookup per authenticated request. That is
 * a real cost on a slow host, but it is paid only on routes that are already
 * behind a login, and the alternative is an access revocation that does not
 * revoke access.
 */
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  const secret = process.env.JWT_SECRET

  if (!secret) {
    return res.status(500).json({ success: false, error: 'Authentication is not configured' })
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' })
  }

  let claims
  try {
    claims = jwt.verify(token, secret)
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }

  try {
    const account = await getUser().findByPk(claims.userId, { attributes: ['id', 'role', 'isActive'] })

    if (!account || !account.isActive) {
      return res.status(401).json({ success: false, error: 'This account is no longer active' })
    }

    // The role is taken from the account rather than the token, so a change of
    // role also takes effect at once instead of at the next sign-in.
    req.user = { ...claims, role: account.role }
    next()
  } catch (error) {
    // A database that cannot be reached must not silently grant access.
    return res.status(503).json({ success: false, error: 'Could not verify your session just now' })
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
