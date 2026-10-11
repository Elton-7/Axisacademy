/**
 * A soft gold ring that follows the mouse, with a small dot at the true pointer
 * position.
 *
 * Two rules govern this, and both are about not taking anything away:
 *
 * The real cursor stays. Hiding the system cursor to replace it with a div is
 * the usual approach and it is a bad trade — the replacement lags by a frame,
 * disappears if a script throws, and takes with it every shape the browser uses
 * to tell you what a thing is: the I-beam over text, the resize arrows, the
 * grab hand. Here the ring is added alongside, never instead.
 *
 * It only exists for a mouse. `(hover: hover) and (pointer: fine)` keeps it off
 * every phone and tablet, where there is no cursor to decorate and the element
 * would sit frozen in a corner.
 *
 * The ring grows over anything interactive, which is the one genuinely useful
 * thing it does: it makes the hit target visible slightly before you reach it.
 */
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useCanAnimate, useHasFinePointer } from './preferences'

/** What counts as worth growing over. */
const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, summary, label[for]'

export default function CustomCursor() {
  const canAnimate = useCanAnimate()
  const finePointer = useHasFinePointer()
  const enabled = canAnimate && finePointer

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)

  // The ring trails; the dot does not. The lag is the effect.
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.4 })
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.4 })

  const [hovering, setHovering] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const move = (event: PointerEvent) => {
      // Ignore anything that is not an actual mouse. A stylus or a touch that
      // reports through the pointer API would otherwise park the ring wherever
      // the finger last landed.
      if (event.pointerType !== 'mouse') return
      x.set(event.clientX)
      y.set(event.clientY)
      setVisible(true)

      const target = event.target as Element | null
      setHovering(Boolean(target && typeof target.closest === 'function' && target.closest(INTERACTIVE)))
    }

    // Hidden when the pointer leaves the window, so it does not sit stranded at
    // the edge while the visitor is in another tab.
    const leave = () => setVisible(false)
    const down = () => setPressed(true)
    const up = () => setPressed(false)

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)

    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: visible ? (hovering ? 0.9 : 0.55) : 0,
          scale: pressed ? 0.8 : hovering ? 1.9 : 1,
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="pointer-events-none fixed -left-4 -top-4 z-[70] h-8 w-8 rounded-full border border-gold-500 mix-blend-difference"
      />
      <motion.div
        aria-hidden="true"
        style={{ x, y }}
        animate={{ opacity: visible ? 0.9 : 0 }}
        transition={{ duration: 0.12 }}
        className="pointer-events-none fixed -left-0.5 -top-0.5 z-[70] h-1 w-1 rounded-full bg-gold-500"
      />
    </>
  )
}
