/**
 * Brings a line of text in a word at a time.
 *
 * Reserved for headings. Staggering a paragraph makes it unreadable while it
 * arrives, and the effect stops being a flourish and starts being an obstacle
 * between the reader and the sentence.
 *
 * Accessibility, which is where most word-splitting implementations come apart:
 *
 *   The text is given as a plain string and rendered as a plain string on the
 *   server and on the first client render. Splitting happens only after mount,
 *   so the HTML a crawler or a screen reader first meets is an ordinary
 *   heading, not a pile of spans.
 *
 *   The split version keeps real spaces between words, so selecting and copying
 *   it produces the sentence rather than a concatenated mess.
 *
 *   Under reduced motion it never splits at all.
 *
 * Words rather than characters: per-character staggering on a heading of any
 * length produces a wall of spans and a noticeably janky first paint.
 */
import { Fragment, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './preferences'

type Props = {
  /** Plain text. Not nodes — this has to be splittable and readable as a string. */
  text: string
  /** Seconds between each word. */
  stagger?: number
  /** Seconds before the first word. */
  delay?: number
  className?: string
}

export default function TextReveal({ text, stagger = 0.045, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<'plain' | 'armed' | 'shown'>('plain')

  useEffect(() => {
    if (reduced) return
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    setState('armed')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setState('shown')
        observer.disconnect()
      },
      { threshold: 0.2 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced])

  // Server, first client render, and reduced motion all take this path.
  if (state === 'plain') {
    return <span ref={ref} className={className}>{text}</span>
  }

  const words = text.split(' ')

  return (
    <span ref={ref} className={className}>
      {words.map((word, index) => (
        // Index is part of the key deliberately: the same word appears twice in
        // plenty of headings and each occurrence is its own element.
        <Fragment key={`${word}-${index}`}>
          <span
            className={`axis-word ${state === 'armed' ? 'axis-word-armed' : ''}`}
            style={state === 'armed' ? undefined : { transitionDelay: `${delay + index * stagger}s` }}
          >
            {word}
          </span>
          {index < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </span>
  )
}
