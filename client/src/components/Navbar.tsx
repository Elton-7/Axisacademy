import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, GraduationCap } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/programmes', label: 'Programmes' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location])

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-navy-900/95 backdrop-blur-md shadow-lg shadow-navy-900/20' 
          : 'bg-navy-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 border-2 border-gold-500 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-2xl font-bold text-gold-500 font-serif">A</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-gold-500" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-gold-500 text-lg font-semibold tracking-[0.15em] uppercase leading-tight">Axis</h1>
              <p className="text-gold-500/80 text-[0.6rem] tracking-[0.1em] uppercase">Homeschool & Enrichment Academy</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium uppercase tracking-wide transition-colors relative ${
                  location.pathname === link.href 
                    ? 'text-gold-500' 
                    : 'text-white/90 hover:text-gold-500'
                }`}
              >
                {link.label}
                {location.pathname === link.href && (
                  <motion.div 
                    layoutId="navbar-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold-500"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Phone CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href="tel:0737003007" 
              className="flex items-center gap-2 px-5 py-2.5 border border-gold-500 rounded-full text-gold-500 text-sm font-medium hover:bg-gold-500 hover:text-navy-900 transition-all duration-300"
            >
              <Phone className="w-4 h-4" />
              0737 003 007
            </a>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden text-gold-500 p-2"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-navy-900 border-t border-gold-500/20 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block text-sm font-medium uppercase tracking-wide py-2 ${
                    location.pathname === link.href 
                      ? 'text-gold-500' 
                      : 'text-white/90'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a 
                href="tel:0737003007" 
                className="flex items-center gap-2 text-gold-500 py-2"
              >
                <Phone className="w-4 h-4" />
                0737 003 007
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}