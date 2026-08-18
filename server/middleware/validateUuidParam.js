/**
 * Rejects a path parameter that is not a UUID before it reaches the database.
 *
 * Seven models are keyed by UUID. Passing anything else to findByPk sends the
 * value to Postgres, which refuses to compare a uuid column with an integer or
 * a string and throws. The route's catch block then reports it as a 500 —
 * `GET /api/events/1` claimed the server had failed when the id was simply not
 * a UUID. That is misleading to the caller and, once error monitoring exists,
 * would page someone for a malformed request.
 *
 * Mounted with router.param so it covers every handler in a router at once
 * rather than each findByPk call site individually.
 */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const validateUuidParam = (req, res, next, value) => {
  if (!UUID_PATTERN.test(String(value))) {
    return res.status(400).json({ success: false, error: 'Invalid identifier' })
  }
  next()
}

module.exports = { validateUuidParam, UUID_PATTERN }
