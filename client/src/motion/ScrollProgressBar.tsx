/**
 * A thin gold line across the top of the window showing how far down the page
 * the visitor is.
 *
 * It exists for the long pages more than the short ones. The fee page runs to
 * twenty-two tables and the safeguarding policy to several thousand words, and
 * on a phone there is no scrollbar to tell you whether you are near the end or
 * nowhere near it.
 *
 * Fixed at the very top and one pixel tall on phones, so it reads as a progress
 * indicator rather than as another band of chrome competing with the navbar.
 * `scaleX` rather than `width` because a transform is composited and a width is
 * not — this repaints on every scroll frame, and the audience is on mid-range
 * Android.
 */
import { motion, useScroll, useSpring } from 'framer-motion'
import { useCanAnimate } from './preferences'

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()

  // A spring stops the bar jittering on trackpads and momentum scrolling. The
  // damping is high and the rest delta loose: this is decoration, and it should
  // settle rather than oscillate.
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 })

  const canAnimate = useCanAnimate()

  // Nothing at all in the prerendered HTML, and nothing for anyone who asked
  // for reduced motion — a bar that tracks the scroll is motion by definition.
  if (!canAnimate) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 sm:h-1"
    />
  )
}
