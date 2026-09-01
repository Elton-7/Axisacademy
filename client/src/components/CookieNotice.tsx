import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'

const KEY = 'axis_notice'

/**
 * A notice, not a consent dialog.
 *
 * Axis sets no cookies and runs no analytics, so there is nothing to ask
 * permission for. The honest thing is to say what is stored and let people read
 * more if they want to — not to build a two-button dialog implying a choice
 * that does not exist, and certainly not the pattern where "reject" is greyed
 * out because refusing was never possible.
 *
 * It therefore blocks nothing. No overlay, no trapped focus, no dimmed page: a
 * parent on a phone trying to reach the safeguarding page should not have to
 * dismiss anything first.
 *
 * Rendered only after mount. The site is prerendered to static HTML at build
 * time, so anything reading localStorage during render would either crash the
 * build or bake one visitor's state into the page everyone receives.
 */
export default function CookieNotice() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Wrapped because a browser set to block site data throws on access rather
    // than returning null, and a notice about storage must not itself break the
    // page when storage is unavailable.
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      // Storage is unavailable, so nothing was stored and nothing needs saying.
    }
  }, [])

  const dismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(KEY, 'read')
    } catch {
      // If it cannot be remembered the notice reappears next visit, which is a
      // far better failure than a crash.
    }
  }

  if (!show) return null

  return (
    <div
      role="region"
      aria-label="How this site uses your device"
      // The right padding keeps the dismiss button clear of the floating WhatsApp
      // bubble, which shares this corner and otherwise sits on top of it and hides
      // the label. It is needed until lg, where the centred container is narrower
      // inset far enough that the two stop meeting.
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 py-3 pl-4 pr-20 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] backdrop-blur-sm sm:pl-6 xl:pr-6"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2">
        <Cookie className="hidden h-5 w-5 shrink-0 text-gold sm:block" aria-hidden="true" />
        {/*
          The second sentence waits for a wider screen. At full length this ran
          to four lines on a phone, making the bar 168px tall — a fifth of the
          viewport, sitting on top of the hero's call button. The short form says
          the part that matters and the page behind the link says the rest.
        */}
        <p className="min-w-[14rem] flex-1 text-sm leading-relaxed text-ink-muted">
          This site sets no cookies and does not track you.{' '}
          <span className="hidden sm:inline">
            It stores three small items on your device so signing in works and the site looks the way
            you left it.{' '}
          </span>
          <Link to="/cookies" className="font-medium text-gold-700 underline underline-offset-2 hover:text-gold-600">
            What is stored
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-gold-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-gold-700"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Got it
        </button>
      </div>
    </div>
  )
}
