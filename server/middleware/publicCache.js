/**
 * Lets a CDN and a browser hold public content for a short while.
 *
 * Every visitor to the team page runs the same query and gets the same twenty-
 * one rows. Without a cache header each one of those is a round trip to
 * Postgres, so a page that could be served from memory is instead limited by
 * the database — and on a free instance the database is the scarce thing.
 *
 * Sixty seconds is deliberately short. Axis edits this content from the CMS and
 * expects to see the change, so a minute is the longest a correction should sit
 * invisible. `stale-while-revalidate` then covers the next five minutes: a
 * reader gets the slightly stale copy instantly while the cache refreshes
 * behind them, which is what absorbs a burst of traffic.
 *
 * Three rules keep anything private out of a shared cache:
 *
 * Only GET and HEAD. A POST changes something and must never be replayed.
 *
 * Only when there is no Authorization header. A signed-in request can return a
 * learner's record, and a shared cache holding that would serve one family's
 * child to another. The `Vary` header states the same thing to any cache that
 * did not read this comment.
 *
 * Only on the routers this is attached to, which are the public content ones.
 * The portal, the admin endpoints and anything under data-protection never
 * reach it.
 */
const PUBLIC_MAX_AGE = Number(process.env.PUBLIC_CACHE_SECONDS || 60)
const STALE_WINDOW = Number(process.env.PUBLIC_CACHE_STALE_SECONDS || 300)

const publicCache = (req, res, next) => {
  // HEAD as well as GET: it is the same safe request without a body, and a
  // cache that holds one should hold the other.
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()

  // A request carrying credentials is never public, whatever it asked for.
  if (req.headers.authorization) {
    res.set('Cache-Control', 'private, no-store')
    return next()
  }

  res.set(
    'Cache-Control',
    `public, max-age=${PUBLIC_MAX_AGE}, stale-while-revalidate=${STALE_WINDOW}`
  )
  // append, not set: the CORS layer already puts Origin here, and replacing it
  // would let a cache serve one origin's response to another.
  res.append('Vary', 'Authorization')
  next()
}

module.exports = { publicCache }
