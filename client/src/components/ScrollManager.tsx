import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Puts the viewport where the visitor expects it after a navigation.
 *
 * A single-page app does not reload, so the scroll position simply stays where
 * it was: clicking a footer link two thousand pixels down the homepage lands
 * you two thousand pixels down the next page, which reads as the link having
 * done nothing at all.
 *
 * Three cases, deliberately different:
 *
 *   PUSH to a new page  -> top, immediately. Smooth scrolling from deep in a
 *                          long page is a slow ride through content nobody
 *                          asked to see.
 *   PUSH to a #hash     -> that element, offset for the fixed header, which
 *                          would otherwise cover the heading.
 *   POP (back/forward)  -> left alone, so the browser restores where the
 *                          visitor was. Forcing the top on a back button is
 *                          the other half of this bug.
 *
 * Not to be confused with ScrollToTop, which is the floating ⌃ button.
 */

/** Height of the fixed navbar, plus a little breathing room. */
const HEADER_OFFSET = 96

export default function ScrollManager() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return

    if (hash) {
      // The target may not be mounted for a frame after the route renders.
      const raf = requestAnimationFrame(() => {
        const target = document.querySelector(hash)
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
          window.scrollTo({ top, behavior: 'smooth' })
        } else {
          window.scrollTo({ top: 0, behavior: 'auto' })
        }
      })
      return () => cancelAnimationFrame(raf)
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash, navigationType])

  return null
}
