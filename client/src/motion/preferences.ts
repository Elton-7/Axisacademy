/**
 * The three questions every animation on this site has to ask first.
 *
 * All of them are about the machine and the person in front of it, and none of
 * them can be answered while the page is being prerendered: the build runs in
 * Node, where there is no matchMedia, no pointer and no viewport. Answering
 * them during render would either crash the build or — worse — bake the build
 * machine's answer into the HTML every visitor receives.
 *
 * So each hook starts from the safe answer and corrects itself after mount:
 *
 *   reduced motion -> assume yes, animate only once we know otherwise
 *   fine pointer   -> assume no, so a phone never gets a cursor effect
 *   mounted        -> assume no, so client-only chrome is absent from the HTML
 *
 * That ordering is deliberate. Every default is the conservative one, which
 * means a visitor whose JavaScript fails, or who never gets past the static
 * HTML, sees a plain, readable, fully working page rather than a half-animated
 * one.
 */
import { useEffect, useState } from 'react'

/** Matches a media query, SSR-safe, defaulting to `initial` until mounted. */
function useMediaQuery(query: string, initial: boolean): boolean {
  const [matches, setMatches] = useState(initial)

  useEffect(() => {
    // Guarded: jsdom and some embedded browsers ship without matchMedia, and a
    // missing animation is a far better outcome than a white screen.
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const list = window.matchMedia(query)
    const update = () => setMatches(list.matches)
    update()

    // addEventListener is the modern spelling; addListener is kept for Safari
    // below 14, which is still on plenty of older iPads in Kenyan classrooms.
    if (typeof list.addEventListener === 'function') {
      list.addEventListener('change', update)
      return () => list.removeEventListener('change', update)
    }
    list.addListener(update)
    return () => list.removeListener(update)
  }, [query])

  return matches
}

/**
 * True when the visitor has asked their system to reduce motion.
 *
 * Starts true. Someone who set that preference should never catch a frame of
 * movement while we work out whether they meant it.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', true)
}

/**
 * True for a mouse or trackpad — something with a precise, hovering pointer.
 *
 * Starts false, so a phone never renders a custom cursor or a magnetic button
 * even for a frame. Note this asks about the pointer, not the screen width: a
 * touchscreen laptop is common, and a narrow desktop window is not a phone.
 */
export function useHasFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)', false)
}

/** True once the component has mounted in a browser. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

/**
 * The single question most of these components actually want: may I animate?
 *
 * Reduced motion off, and we are running in a browser rather than in the
 * prerenderer.
 */
export function useCanAnimate(): boolean {
  const mounted = useMounted()
  const reduced = usePrefersReducedMotion()
  return mounted && !reduced
}
