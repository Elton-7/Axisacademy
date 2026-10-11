/**
 * A dial that opens into the two ways of reaching Axis that WhatsApp is not:
 * the telephone, and email.
 *
 * Placement is the whole design problem here. The bottom-right corner is
 * already spoken for — the WhatsApp button sits at bottom-6 right-6, and the
 * back-to-top button above it — and the cookie notice owns the full width of
 * the bottom edge until it is dismissed. Adding a fourth thing to that corner
 * would produce a stack of floating circles obscuring the page.
 *
 * So: the opposite corner, and only once the cookie notice is gone. It reads
 * the same storage key the notice writes, which means a first-time visitor gets
 * the notice with nothing overlapping it, and everyone else gets the dial. The
 * two are never on screen together.
 *
 * Collapsed it is one button. Expanded it is two labelled actions, staggered in
 * upwards. It closes on Escape, on a click elsewhere, and after either action
 * is taken, because a floating panel that will not go away is worse than no
 * floating panel.
 */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mail, Phone, Plus } from 'lucide-react'
import { contact, mailtoHref, telHref } from '../content/contact'
import { trackConversion, type ConversionEvent } from '../services/analytics'
import { usePrefersReducedMotion } from './preferences'

/** Written by CookieNotice. Read here so the two never overlap. */
const COOKIE_KEY = 'axis_notice'

const ACTIONS: {
  href: string
  icon: typeof Phone
  label: string
  event?: ConversionEvent
}[] = [
  { href: telHref, icon: Phone, label: `Call ${contact.phoneDisplay}`, event: 'phone_clicked' },
  { href: mailtoHref, icon: Mail, label: 'Email Axis' },
]

export default function FloatingContact() {
  const [available, setAvailable] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    // Same guard the cookie notice uses: a browser set to block site data
    // throws on access rather than returning null.
    try {
      setAvailable(Boolean(localStorage.getItem(COOKIE_KEY)))
    } catch {
      // Storage unavailable, so the notice will be showing. Stay out of its way.
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      const node = containerRef.current
      if (node && !node.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  if (!available) return null

  return (
    <div ref={containerRef} className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      <AnimatePresence>
        {open && (
          <motion.ul
            className="flex flex-col gap-3"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {ACTIONS.map(({ href, icon: Icon, label, event }, index) => (
              <motion.li
                key={label}
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduced ? 0 : index * 0.05, duration: 0.18 }}
              >
                <a
                  href={href}
                  onClick={() => {
                    if (event) trackConversion(event)
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 rounded-full border border-line bg-surface/95 py-2 pl-3 pr-4 text-sm font-medium text-ink shadow-lg backdrop-blur transition-colors hover:border-gold-500 hover:text-gold-700"
                >
                  <Icon className="h-4 w-4 text-gold-700" aria-hidden="true" />
                  {label}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Close contact options' : 'Show contact options'}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/50 bg-surface/95 text-gold-700 shadow-lg backdrop-blur transition-colors hover:bg-gold-light/20"
      >
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          className="flex"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </motion.span>
      </button>
    </div>
  )
}
