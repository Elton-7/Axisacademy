import { Link } from 'react-router-dom'
import { Phone, Mail, Globe, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/programmes', label: 'Programmes' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 border-2 border-gold-500 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-gold-500 font-serif">A</span>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-gold-500" />
              </div>
              <div>
                <h1 className="text-gold-500 text-sm font-semibold tracking-[0.15em] uppercase">Axis</h1>
                <p className="text-gold-500/70 text-[0.55rem] tracking-[0.1em] uppercase">Homeschool & Enrichment Academy</p>
              </div>
            </Link>
            <p className="text-gold-500/80 italic text-sm mb-1">Learn · Think · Create · Explore · Thrive</p>
            <p className="text-white/40 text-xs mb-6">A Division of Gurais Limited</p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-9 h-9 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-navy-900 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wide mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-white/50 text-sm hover:text-gold-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wide mb-6">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <Phone className="w-4 h-4 text-gold-500" />
                0737 003 007
              </li>
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <Phone className="w-4 h-4 text-gold-500" />
                0737 003 007
              </li>
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <Mail className="w-4 h-4 text-gold-500" />
                info@axishomeschooling.org
              </li>
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <Globe className="w-4 h-4 text-gold-500" />
                AxisHomeschooling.org
              </li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wide mb-6">Get In Touch</h4>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              We are here to answer your questions and help you find the right learning pathway.
            </p>
            <Link to="/contact" className="btn-primary text-xs py-2.5 px-5">
              Contact Us Today
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Axis Homeschool & Enrichment Academy. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}