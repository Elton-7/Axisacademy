/**
 * Lets the header slide out of the way while you read down a page, and brings
 * it straight back the moment you scroll up.
 *
 * It deliberately does not wrap the navbar. The navbar is `position: fixed`,
 * and a transform on an ancestor makes that ancestor the containing block for
 * its fixed descendants — so wrapping it in a moving div would quietly stop the
 * header being fixed at all, and it would scroll away with the page. That is a
 * subtle, total regression, and the reason this is driven from the outside.
 *
 * Instead it sets an attribute on the document element, which React does not
 * manage, and a rule in index.css moves the header. Toggling a class on the nav
 * itself would not survive: the navbar re-renders its own className whenever it
 * crosses the 50px scroll threshold, and would wipe the class off again.
 *
 * The header always comes back for:
 *
 *   scrolling up, by any amount past the threshold
 *   being near the top of the page
 *   keyboard focus landing anywhere inside it — otherwise a visitor tabbing
 *   backwards into the navigation moves focus into something they cannot see,
 *   which is the usual accessibility failure of this pattern
 */
import { useEffect } from 'react'
import { useScrollDirection } from './useScrollDirection'
import { usePrefersReducedMotion } from './preferences'

const ATTRIBUTE = 'data-axis-nav'

export default function NavbarAutoHide() {
  const { direction, atTop } = useScrollDirection()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    // Under reduced motion the header simply stays where it is.
    const hidden = !reduced && direction === 'down' && !atTop
    root.setAttribute(ATTRIBUTE, hidden ? 'hidden' : 'shown')

    return () => root.removeAttribute(ATTRIBUTE)
  }, [direction, atTop, reduced])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Element | null
      if (!target || typeof target.closest !== 'function') return
      if (target.closest('nav')) document.documentElement.setAttribute(ATTRIBUTE, 'shown')
    }

    document.addEventListener('focusin', onFocusIn)
    return () => document.removeEventListener('focusin', onFocusIn)
  }, [])

  return null
}
