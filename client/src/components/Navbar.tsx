import { useState, useEffect, useRef } from 'react'
import axisMark from '../assets/axis-mark.svg'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { services } from '../content/services'
import ThemeToggle from './ThemeToggle'
import { contact, telHref } from '../content/contact'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/learning-paths', label: 'Learning Paths' },
  { href: '/educator-network', label: 'Educators' },
  { href: '/locations', label: 'Locations' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/resources', label: 'Resources' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const servicesRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
    setIsServicesOpen(false)
  }, [location])

  // Close the services dropdown on outside click or Escape.
  useEffect(() => {
    if (!isServicesOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsServicesOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isServicesOpen])

  const isServicesActive = location.pathname.startsWith('/services')

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-white/10 bg-navy-900/95 shadow-lg shadow-navy-900/20 backdrop-blur-xl'
          : 'border-b border-white/10 bg-navy-900/90 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Logo */}
          {/* shrink-0: the row is tight at xl, and without it flex compresses the
              brand and its wordmark overflows into the navigation links. */}
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3"
            aria-label="Axis Learning — home"
          >
            <img
              src={axisMark}
              alt=""
              width={48}
              height={32}
              className="h-8 w-auto transition-transform group-hover:scale-105"
            />
            {/* Shown on phones too: the mark is pictorial, so hiding this left
                the header with no company name anywhere on a small screen. */}
            <div>
              <span className="block text-base font-semibold uppercase leading-tight tracking-[0.15em] text-gold-500 sm:text-lg">Axis</span>
              <p className="text-[0.55rem] uppercase tracking-[0.1em] text-gold-500/80 sm:text-[0.6rem]">Learning</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-x-5 xl:flex">
            {navLinks.slice(0, 2).map((link) => (
              <NavItem key={link.href} link={link} pathname={location.pathname} />
            ))}

            {/* Services dropdown — the brief requires each service to be reachable in its own right */}
            <div ref={servicesRef} className="relative">
              <button
                onClick={() => setIsServicesOpen((open) => !open)}
                aria-expanded={isServicesOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1 whitespace-nowrap text-[0.8125rem] font-medium uppercase tracking-tight transition-colors ${
                  isServicesActive ? 'text-gold-500' : 'text-white/90 hover:text-gold-500'
                }`}
              >
                Services
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 top-full z-50 mt-4 w-[26rem] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-navy-900/98 p-2 shadow-2xl backdrop-blur-xl"
                  >
                    {services.map((service) => {
                      const Icon = service.icon
                      return (
                        <Link
                          key={service.slug}
                          to={`/services/${service.slug}`}
                          className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface/5"
                        >
                          <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-500" />
                          <span>
                            <span className="block text-sm font-medium text-white">{service.shortTitle}</span>
                            <span className="block text-xs leading-snug text-white/50">{service.tagline}</span>
                          </span>
                        </Link>
                      )
                    })}
                    <Link
                      to="/services"
                      className="mt-1 block rounded-xl border-t border-white/10 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gold-500 hover:bg-surface/5"
                    >
                      View all services
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navLinks.slice(2).map((link) => (
              <NavItem key={link.href} link={link} pathname={location.pathname} />
            ))}
          </div>

          {/* Phone CTA */}
          <div className="hidden items-center gap-3 xl:flex">
            <ThemeToggle />
            <a
              href={telHref}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-gold-500 px-4 py-2.5 text-sm font-medium text-gold-500 transition-all duration-300 hover:bg-gold-500 hover:text-navy-surface"
            >
              <Phone className="h-4 w-4" />
              {contact.phoneDisplay}
            </a>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-2 xl:hidden">
            <ThemeToggle />
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileOpen}
            className="p-2 text-gold-500 xl:hidden"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-gold-500/20 bg-navy-900/95 backdrop-blur-md xl:hidden"
          >
            <div className="space-y-4 px-4 py-6">
              {navLinks.slice(0, 2).map((link) => (
                <MobileNavItem key={link.href} link={link} pathname={location.pathname} />
              ))}

              <div>
                <Link
                  to="/services"
                  className={`block py-2 text-sm font-medium uppercase tracking-wide ${
                    isServicesActive ? 'text-gold-500' : 'text-white/90'
                  }`}
                >
                  Services
                </Link>
                <div className="mt-1 space-y-1 border-l border-white/10 pl-4">
                  {services.map((service) => (
                    <Link
                      key={service.slug}
                      to={`/services/${service.slug}`}
                      className="block py-1.5 text-sm text-white/60 hover:text-gold-500"
                    >
                      {service.shortTitle}
                    </Link>
                  ))}
                </div>
              </div>

              {navLinks.slice(2).map((link) => (
                <MobileNavItem key={link.href} link={link} pathname={location.pathname} />
              ))}

              <a href={telHref} className="flex items-center gap-2 py-2 text-gold-500">
                <Phone className="h-4 w-4" />
                {contact.phoneDisplay}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

function NavItem({ link, pathname }: { link: { href: string; label: string }; pathname: string }) {
  const isActive = pathname === link.href
  return (
    <Link
      to={link.href}
      className={`relative whitespace-nowrap text-[0.8125rem] font-medium uppercase tracking-tight transition-colors ${
        isActive ? 'text-gold-500' : 'text-white/90 hover:text-gold-500'
      }`}
    >
      {link.label}
      {isActive && (
        <motion.div
          layoutId="navbar-underline"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold-500"
        />
      )}
    </Link>
  )
}

function MobileNavItem({ link, pathname }: { link: { href: string; label: string }; pathname: string }) {
  return (
    <Link
      to={link.href}
      className={`block py-2 text-sm font-medium uppercase tracking-wide ${
        pathname === link.href ? 'text-gold-500' : 'text-white/90'
      }`}
    >
      {link.label}
    </Link>
  )
}
