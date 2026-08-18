import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppFloat from './WhatsAppFloat'
import ScrollToTop from './ScrollToTop'
import SEO from './SEO'
import { initAnalytics, trackPageView } from '../services/analytics'

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
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <ScrollToTop />
    </div>
  )
}
