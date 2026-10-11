/**
 * Registers the service worker, and only in the circumstances where it helps.
 *
 * Deliberately not registered during development: a worker caching a dev
 * server's output is a well-known way to spend an afternoon debugging a file
 * you already fixed. `import.meta.env.PROD` keeps it to real builds.
 *
 * The timing below is the part that had to be measured rather than assumed.
 *
 * The conventional advice is to wait for the load event, so that installing the
 * worker does not compete with the page for bandwidth. On this site that advice
 * quietly fails: the host is slow enough that individual assets have been
 * observed taking twenty to fifty seconds, and `document.readyState` was still
 * "interactive" a full minute after navigation — the load event had not fired
 * at all. A registration waiting for it simply never happened, which meant the
 * one mechanism that would have made the next visit fast was the one thing
 * never installed.
 *
 * So: register at load if it arrives, and otherwise after a short delay,
 * whichever comes first. The delay is long enough to let the page paint and
 * hydrate, and short enough that a visitor on a bad connection still leaves
 * with the site stored on their device.
 *
 * There is no update prompt. A banner asking a parent whether they would like
 * version 47 is noise; the worker takes over at the next navigation on its own,
 * which for a site read a page at a time is soon enough and asks nothing.
 */

/** Long enough for the page to paint; short enough to survive a slow host. */
const FALLBACK_DELAY_MS = 4000

/** Clears every cache and removes the worker. Kept for the day it is needed. */
export async function resetServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return false

  registration.active?.postMessage({ type: 'AXIS_SW_RESET' })
  await registration.unregister()
  return true
}

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  let started = false

  const start = () => {
    if (started) return
    started = true

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // A failed registration costs nothing: the site keeps working exactly as
      // it did before, straight from the network. Nothing here is worth an
      // error in a visitor's console.
    })
  }

  // Already finished loading — this happens on a client-side navigation into a
  // freshly hydrated page — so there is no event left to wait for.
  if (document.readyState === 'complete') {
    start()
    return
  }

  window.addEventListener('load', start, { once: true })

  // The safety net, and on this host usually the one that fires.
  window.setTimeout(start, FALLBACK_DELAY_MS)
}
