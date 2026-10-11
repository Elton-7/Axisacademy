/**
 * Cross-fades between pages on client-side navigation.
 *
 * Four constraints shaped this, and each one rules out the usual four-line
 * implementation.
 *
 * It renders the outlet itself, via `useOutlet`, rather than taking `<Outlet/>`
 * as a child. This is the difference between a cross-fade and a flicker.
 * `<Outlet/>` is a component that reads the router context when it renders — so
 * while the outgoing page is still fading out, it would already be rendering
 * the *incoming* page's content. The result is the new page fading out and then
 * back in, which looks like a fault rather than a transition. `useOutlet()`
 * returns an element bound to the match it was created from, and the element
 * held by AnimatePresence during the exit keeps rendering the page it belongs
 * to.
 *
 * It must not animate the first paint. The site is prerendered: the HTML for
 * the page you asked for is already there, painted, before React runs. Fading
 * it in from nothing would take a page that was ready and make it briefly
 * blank, which is slower in the only sense that matters. `initial={false}`
 * suppresses the enter animation for whatever is present when AnimatePresence
 * mounts, and animates only later arrivals.
 *
 * It steps aside for anchor navigation. `mode="wait"` holds the incoming page
 * back until the outgoing one has left, and ScrollManager looks for the `#hash`
 * target as soon as the route changes — before that element exists. Rather than
 * have the two fight, a URL carrying a hash skips the transition entirely and
 * mounts immediately, so the anchor is found and scrolled to.
 *
 * It must be short. 220ms in, 180ms out. Long page transitions are the single
 * most common way a fast site is made to feel slow, and this one sits in front
 * of parents trying to find a fee or a phone number. The movement is four
 * pixels: enough to read as a change of page, not enough to wait for.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'
import { useCanAnimate } from './preferences'

export default function PageTransition() {
  const { pathname, hash } = useLocation()
  const outlet = useOutlet()
  const canAnimate = useCanAnimate()

  if (!canAnimate || hash) return <>{outlet}</>

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
        // The timing lives on the variant rather than in a shared `transition`
        // prop: an exit needs to be quicker than an entrance, because
        // `mode="wait"` makes the visitor sit through it first.
        exit={{ opacity: 0, y: -4, transition: { duration: 0.18, ease: 'easeIn' } }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
