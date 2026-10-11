import CookieNotice from './CookieNotice'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppFloat from './WhatsAppFloat'
import ScrollToTop from './ScrollToTop'
import ScrollManager from './ScrollManager'
import SEO from './SEO'
import { initAnalytics, trackPageView } from '../services/analytics'
import {
  CustomCursor,
  FloatingContact,
  NavbarAutoHide,
  PageTransition,
  ScrollProgressBar,
} from '../motion'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    initAnalytics()
  }, [])

  // Client-side navigation does not trigger a page load, so views are sent here.
  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <SEO />
      {/* Resets scroll on navigation — a single-page app keeps it otherwise. */}
      <ScrollManager />
      {/* Global motion. Each is independent and removable on its own line;
          all of them return null under prefers-reduced-motion or on touch,
          so nothing here is load-bearing. */}
      <ScrollProgressBar />
      <CustomCursor />
      <NavbarAutoHide />
      <Navbar />
      <main className="flex-1">
        {/* Cross-fades between pages. Renders the outlet itself, so the
            outgoing page keeps rendering its own content while it leaves. Does
            not animate the first paint, which is already prerendered. */}
        <PageTransition />
      </main>
      <Footer />
      <CookieNotice />
      <WhatsAppFloat />
      {/* Telephone and email, opposite corner, and only once the cookie notice
          has been dismissed — the two are never on screen together. */}
      <FloatingContact />
      <ScrollToTop />
    </div>
  )
}
