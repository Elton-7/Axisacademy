/**
 * Fades and lifts its children into place the first time they are scrolled to.
 *
 * The ordering here is the whole point, and it is different from the usual
 * implementation on purpose.
 *
 * The usual one renders the element at `opacity: 0` and waits for JavaScript to
 * reveal it. On a prerendered site that puts invisible text in the HTML: fine
 * while everything works, and a blank page when a script fails, a bundle is
 * blocked, or a crawler reads the markup without executing it.
 *
 * This one renders its children plainly — visible, styled, in the HTML — and
 * only arms the animation after mount, and only for elements that are below the
 * fold at that moment. Anything already on screen is left exactly as the visitor
 * first saw it, which also removes the flicker you get from hiding something
 * that was already painted.
 *
 * The result: no JavaScript, no problem. Reduced motion, no problem. And the
 * animation still happens for everything you actually scroll down to, which is
 * the only place it was ever doing any work.
 *
 * Transitions are CSS rather than JavaScript. Dozens of these can be on one
 * page, and a compositor-only opacity/transform costs a fraction of a spring
 * evaluated per frame on the mid-range Android this site is mostly read on.
 */
import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { usePrefersReducedMotion } from './preferences'

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale'

type Props = {
  children: ReactNode
  /** Which way it travels in from. `fade` moves not at all. */
  direction?: Direction
  /** Seconds to wait once it comes into view — for staggering a group by hand. */
  delay?: number
  /** How much of it must be showing before it starts. */
  amount?: number
  /** Rendered element. Keeps headings as headings and lists as lists. */
  as?: ElementType
  className?: string
}

export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  amount = 0.15,
  as: Tag = 'div',
  className = '',
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  // 'plain' is what the server renders and what a reduced-motion visitor keeps:
  // no transform, no opacity, nothing to go wrong.
  const [state, setState] = useState<'plain' | 'armed' | 'shown'>('plain')

  useEffect(() => {
    if (reduced) return
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    // Already on screen when we mounted: leave it alone. Hiding it now would be
    // a visible flicker, and it has nothing to be revealed from.
    const rect = node.getBoundingClientRect()
    if (rect.top < window.innerHeight) return

    setState('armed')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setState('shown')
        observer.disconnect()
      },
      { threshold: amount, rootMargin: '0px 0px -5% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced, amount])

  const classes = [
    className,
    state !== 'plain' && 'axis-reveal',
    state === 'armed' && `axis-reveal-armed axis-reveal-${direction}`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag
      ref={ref}
      className={classes}
      // Applied only while armed, so nothing carries a stray delay afterwards.
      style={state === 'armed' && delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  )
}
