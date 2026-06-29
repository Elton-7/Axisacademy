import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/#about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/#programmes', label: 'Programmes' },
    { path: '/#learning', label: 'Learning Options' },
    { path: '/contact', label: 'Contact' },
  ]

  const isActive = (path) => location.pathname === path.split('#')[0]

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-navy shadow-2xl shadow-black/30' : 'bg-navy'
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-gold rounded-lg flex items-center justify-center text-gold text-xl font-bold relative">
              A
              <span className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-gold"></span>
            </div>
            <div>
              <h1 className="text-gold text-lg font-semibold tracking-[3px] uppercase">Axis</h1>
              <p className="text-gold text-[8px] tracking-[1.5px] uppercase -mt-0.5">Homeschool & Enrichment Academy</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`text-xs font-medium uppercase tracking-wider transition-colors ${
                    isActive(link.path) ? 'text-gold' : 'text-white hover:text-gold'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Phone Button */}
          <a
            href="tel:0737003007"
            className="hidden lg:flex items-center gap-2 border border-gold text-gold px-5 py-2 rounded-full text-sm font-medium hover:bg-gold hover:text-navy transition-all"
          >
            <Phone size={16} /> 0737 003 007
          </a>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-navy-light border-t border-gold/20">
          <ul className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="block text-white hover:text-gold text-sm uppercase tracking-wider py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="tel:0737003007" className="flex items-center gap-2 text-gold text-sm">
                <Phone size={16} /> 0737 003 007
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
