/**
 * Moves an image slower than the page scrolls past it.
 *
 * The classic mistake is to translate the image inside a box the same size,
 * which uncovers the background at one edge as it moves. So the child is
 * deliberately over-sized — 120% of the container, centred — and the container
 * clips. The picture can travel the full range without ever exposing an edge.
 *
 * `speed` is a fraction of the scroll distance, and the sensible range is small.
 * At 0.2 a photograph drifts; at 0.6 it slides around behind the text and draws
 * attention to itself rather than to the page.
 *
 * Off under reduced motion and off before mount, in both cases falling back to
 * a plain, correctly-cropped, perfectly good static image. Parallax is the
 * definition of a decorative effect, and nothing here depends on it.
 */
import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useCanAnimate } from './preferences'

type Props = {
  children: ReactNode
  /** Fraction of scroll distance to lag by. Keep it under about 0.35. */
  speed?: number
  className?: string
}

export default function Parallax({ children, speed = 0.2, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const canAnimate = useCanAnimate()

  // Measured from the element entering the viewport to it leaving, so the
  // travel is spread across exactly the time it is on screen.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const distance = Math.round(speed * 120)
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance])

  if (!canAnimate) {
    return (
      <div ref={ref} className={`overflow-hidden ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        style={{ y, height: `calc(100% + ${distance * 2}px)`, marginTop: -distance }}
        className="w-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  )
}
