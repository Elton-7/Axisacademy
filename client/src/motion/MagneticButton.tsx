/**
 * Wraps a control so it leans towards the cursor as the cursor approaches.
 *
 * The pull is small on purpose. A button that jumps to meet the mouse is a
 * button you can miss: the target moves while you are aiming at it, and on a
 * site where the important controls say "Enrol" and "Book a consultation",
 * making them harder to click to make them livelier is a poor bargain. The
 * default travel is eight pixels, which reads as responsiveness rather than as
 * the element dodging.
 *
 * Mouse only, and off entirely under reduced motion — under either condition
 * this renders its children in a plain wrapper and adds nothing.
 *
 * Deliberately does not render a button. It wraps whatever it is given, so the
 * existing .btn-primary links, submit buttons and anchors keep their own markup,
 * styling, focus behaviour and semantics.
 */
import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useCanAnimate, useHasFinePointer } from './preferences'

type Props = {
  children: ReactNode
  /** Maximum travel in pixels. Keep it small; see above. */
  strength?: number
  className?: string
}

export default function MagneticButton({ children, strength = 8, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const canAnimate = useCanAnimate()
  const finePointer = useHasFinePointer()
  const enabled = canAnimate && finePointer

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.5 })

  if (!enabled) {
    return <span className={className}>{children}</span>
  }

  const handleMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== 'mouse') return
    const node = ref.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    const offsetX = event.clientX - (rect.left + rect.width / 2)
    const offsetY = event.clientY - (rect.top + rect.height / 2)

    // Normalised against the element's own size, so a wide button and a small
    // icon lean by the same amount rather than in proportion to their width.
    x.set((offsetX / (rect.width / 2)) * strength)
    y.set((offsetY / (rect.height / 2)) * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      // A pointer that goes down and drags away would otherwise leave the
      // element stranded off-centre.
      onPointerCancel={reset}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  )
}
