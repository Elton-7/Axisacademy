/**
 * Rebuilds the site when published content changes.
 *
 * A new article is live on the site the moment it is published — the Resources
 * page reads the API directly. What it does not have until the site is rebuilt
 * is its own prerendered HTML page and its line in the sitemap, which is what a
 * search engine reads. Axis asked for that to happen without a developer, so
 * publishing an article asks the host to rebuild the site.
 *
 * Since the move to cPanel there is nothing to ask. The site is built here and
 * uploaded by scripts/deploy-cpanel.mjs, and no hook exists to trigger that
 * from a server. This module therefore does nothing on the live site, and the
 * one thing it must not do is stay quiet about it: an editor publishing an
 * article would otherwise have every reason to believe its page and its sitemap
 * entry now exist, and no way to find out that they do not.
 *
 * Two things this deliberately does not do.
 *
 * It does not rebuild on every save. Build minutes are finite and a build takes
 * minutes, so an editor fixing three typos in a row would otherwise
 * queue three builds and the first two would be wasted. Requests are coalesced:
 * the first one starts a timer, and everything that arrives while that timer
 * runs joins the same build.
 *
 * And it never fails a request. A build hook that is unreachable, misconfigured
 * or rate-limited must not turn a successful "article published" into an error
 * for the person who published it. Failures are logged and the content is
 * already saved; the worst case is a sitemap that catches up on the next
 * deploy.
 */
const { reportError } = require('./reportError')
const { postJson } = require('./postJson')

/** Long enough to absorb a run of edits, short enough that nobody waits. */
const COALESCE_MS = Number(process.env.REBUILD_COALESCE_MS || 3 * 60 * 1000)

let timer = null
let pendingReasons = []
let lastTriggeredAt = 0

const trigger = async () => {
  const reasons = [...new Set(pendingReasons)]
  pendingReasons = []
  timer = null

  const hook = process.env.SITE_BUILD_HOOK || process.env.NETLIFY_BUILD_HOOK
  if (!hook) {
    // Said plainly, because the alternative is a feature that was asked for,
    // appears to work, and silently does not.
    console.warn(
      `Published (${reasons.join(', ')}), but no build hook is configured. ` +
        'The article is live on the site immediately; its prerendered page and ' +
        'its line in the sitemap are not, and will not be until the client is ' +
        'built and deployed again.'
    )
    return
  }

  try {
    // The title is shown against the deploy, so whoever looks at the build
    // list can see why it ran.
    const response = await postJson(
      hook,
      { trigger_title: `Content published: ${reasons.join(', ')}` },
      { timeoutMs: 20000 }
    )
    if (response.status >= 400) throw new Error(`the build hook returned ${response.status}`)
    lastTriggeredAt = Date.now()
    console.log(`Site rebuild requested (${reasons.join(', ')})`)
  } catch (error) {
    // Logged, never thrown: the content is saved either way.
    reportError('siteRebuild', error, { reasons })
    console.warn(`Site rebuild could not be requested: ${error.message}`)
  }
}

/**
 * Ask for a rebuild. Safe to call repeatedly — calls made while one is pending
 * join it rather than queueing another.
 */
const requestSiteRebuild = (reason = 'content change') => {
  if (!process.env.NETLIFY_BUILD_HOOK) return { scheduled: false, why: 'no build hook configured' }

  pendingReasons.push(reason)
  if (timer) return { scheduled: true, why: 'joined the pending build' }

  timer = setTimeout(trigger, COALESCE_MS)
  // A pending rebuild must not hold the process open at shutdown.
  if (typeof timer.unref === 'function') timer.unref()
  return { scheduled: true, why: `build queued in ${Math.round(COALESCE_MS / 1000)}s` }
}

/** For the admin dashboard and for tests. */
const rebuildStatus = () => ({
  configured: Boolean(process.env.NETLIFY_BUILD_HOOK),
  pending: Boolean(timer),
  pendingReasons: [...new Set(pendingReasons)],
  lastTriggeredAt: lastTriggeredAt || null,
})

module.exports = { requestSiteRebuild, rebuildStatus }
