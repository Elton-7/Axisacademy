/**
 * Two ways of saying "this is coming", for two genuinely different waits.
 *
 * `LoadingScreen` is a full-panel state for a page that has nothing to show yet
 * — a portal dashboard before its data arrives. It fills the space rather than
 * covering the site, so the header and footer stay put and the page does not
 * jump when the content lands.
 *
 * `Skeleton` is for a wait short enough that a spinner would flash. A shape
 * where the content will be reads as faster than a spinner does, because the
 * layout is already settled and only the text is missing.
 *
 * What is deliberately absent: a splash screen over the whole site on first
 * load. This site is prerendered — the HTML arrives complete and painted. An
 * overlay would be a curtain drawn over a page that was already finished, and
 * every millisecond of it would be time the visitor did not have to wait.
 *
 * Both announce themselves. `role="status"` with `aria-live="polite"` means a
 * screen reader says something is loading instead of narrating silence, and
 * the visible label is real text rather than a spinning icon alone.
 */
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from './preferences'

type Props = {
  /** What is being waited for. Written for a person: "Loading your learners". */
  label?: string
  /** Fills the viewport height rather than sitting inside the flow. */
  fullHeight?: boolean
  className?: string
}

export function LoadingScreen({ label = 'Loading', fullHeight = false, className = '' }: Props) {
  const reduced = usePrefersReducedMotion()

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex w-full flex-col items-center justify-center gap-4 ${
        fullHeight ? 'min-h-[60vh]' : 'py-16'
      } ${className}`}
    >
      {reduced ? (
        // A static mark rather than a still spinner, which reads as broken.
        <div className="h-10 w-10 rounded-full border-2 border-gold-500/30 border-t-gold-500" />
      ) : (
        <motion.div
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-2 border-gold-500/30 border-t-gold-500"
        />
      )}
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  )
}

/**
 * A grey block standing in for a line of text or a card.
 *
 * The shimmer is a CSS animation on a background gradient, so it costs one
 * composited layer regardless of how many are on screen — which matters,
 * because they are never used one at a time.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`axis-skeleton rounded-lg ${className}`} />
}

/** A conventional stack of skeleton lines, for a paragraph or a list. */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading content" className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          // The last line is short, the way a real paragraph ends.
          className={`h-4 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export default LoadingScreen
