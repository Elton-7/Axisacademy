const { randomUUID } = require('node:crypto')

/**
 * Where a production failure gets noticed.
 *
 * Until this existed, a 500 printed a stack to stdout and nothing else
 * happened. On Render that scrolls past in a log nobody is watching, so the
 * first report of a broken API would have come from a parent who could not
 * submit an enquiry.
 *
 * Deliberately not tied to a monitoring vendor. Every failure is written as one
 * structured JSON line, which any log collector can pick up, and if
 * ERROR_WEBHOOK_URL is set a short summary is posted there as well — that URL
 * can be Slack, Discord, or anything that accepts a JSON POST. Choosing a
 * vendor later means setting one variable, not editing route code.
 */

const WEBHOOK_URL = process.env.ERROR_WEBHOOK_URL
const WEBHOOK_TIMEOUT_MS = 3000

/**
 * A failing endpoint fails repeatedly, and a webhook that repeats it every time
 * is a webhook people mute. Each distinct signature is sent at most once per
 * window; the structured log line is always written, so nothing is lost.
 */
const ALERT_WINDOW_MS = 5 * 60 * 1000
const recentAlerts = new Map()

const shouldAlert = (signature) => {
  const now = Date.now()
  for (const [key, at] of recentAlerts) {
    if (now - at > ALERT_WINDOW_MS) recentAlerts.delete(key)
  }
  if (recentAlerts.has(signature)) return false
  recentAlerts.set(signature, now)
  return true
}

/** Never let a monitoring failure become a second outage. */
const postToWebhook = async (payload) => {
  if (!WEBHOOK_URL) return
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Axis API ${payload.kind}: ${payload.message}`,
        ...payload,
      }),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    })
  } catch (e) {
    console.error(JSON.stringify({ level: 'warn', event: 'alert_delivery_failed', reason: e.message }))
  }
}

/**
 * @param {string} kind      what failed: request, unhandledRejection, uncaughtException
 * @param {Error|null} error the error itself, when one was captured
 * @param {object} context   request id, method, path, status, user — never a body or a token
 */
const reportError = (kind, error, context = {}) => {
  const entry = {
    level: 'error',
    kind,
    at: new Date().toISOString(),
    message: error?.message || context.message || 'Unknown failure',
    stack: error?.stack,
    ...context,
  }

  // One line, so a collector can parse it without reassembling a stack trace.
  console.error(JSON.stringify(entry))

  const signature = `${kind}:${context.method || ''}${context.route || context.path || ''}:${entry.message}`
  if (shouldAlert(signature)) {
    void postToWebhook({ kind, message: entry.message, ...context })
  }
}

/**
 * Gives every request an id, echoed back as X-Request-Id.
 *
 * When someone reports that a page failed, that id is the only thing that ties
 * their report to the log line for it.
 */
const requestId = (req, res, next) => {
  req.id = req.get('X-Request-Id') || randomUUID()
  res.set('X-Request-Id', req.id)
  next()
}

/**
 * Reports any 5xx, including the ones routes produce themselves.
 *
 * Sixty-nine handlers catch their own errors and return a 500 directly, so they
 * never reach Express's error handler. Watching the finished response catches
 * those too. The stack is gone by then — the route swallowed it — but knowing
 * which endpoint is failing, and how often, is the part that prompts a fix.
 */
const reportFailedResponses = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode < 500) return
    // The error handler already reported this one, with its stack attached.
    // Reporting again here would double every alert and lose the stack.
    if (res.locals.errorReported) return
    reportError('request', null, {
      message: `${req.method} ${req.originalUrl} failed with ${res.statusCode}`,
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      userId: req.user?.userId,
    })
  })
  next()
}

/**
 * A rejected promise nobody handled would otherwise terminate the process in
 * silence. Reported first, then allowed to exit so the host restarts a server
 * whose state is no longer trustworthy.
 */
const installProcessHandlers = () => {
  process.on('unhandledRejection', (reason) => {
    reportError('unhandledRejection', reason instanceof Error ? reason : new Error(String(reason)))
  })

  process.on('uncaughtException', (error) => {
    reportError('uncaughtException', error)
    // Give the log line and webhook a moment to leave before exiting.
    setTimeout(() => process.exit(1), 500).unref()
  })
}

/** Marks a response whose error was already reported with full context. */
const markErrorReported = (res) => {
  res.locals.errorReported = true
}

module.exports = {
  reportError, requestId, reportFailedResponses, installProcessHandlers, markErrorReported,
}
