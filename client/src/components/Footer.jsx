import { Link } from 'react-router-dom'
import { Phone, Mail, Globe, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border-2 border-gold rounded-lg flex items-center justify-center text-gold font-bold">A</div>
              <div>
                <h1 className="text-gold text-sm font-semibold tracking-[3px] uppercase">Axis</h1>
                <p className="text-gold text-[7px] tracking-[1px] uppercase">Homeschool & Enrichment Academy</p>
              </div>
            </div>
            <p className="text-gold italic text-sm mb-1">Learn · Think · Create · Explore · Thrive</p>
            <p className="text-white/50 text-xs">A Division of Gurais Limited</p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 border border-gold/40 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-navy transition-all">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm uppercase tracking-wider mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'About', 'Services', 'Programmes', 'Contact'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-white/60 hover:text-gold text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-sm uppercase tracking-wider mb-5">Contact Info</h4>
            <div className="space-y-3">
              <p className="flex items-center gap-3 text-white/60 text-sm"><Phone size={14} className="text-gold" /> 0737 003 007</p>
              <p className="flex items-center gap-3 text-white/60 text-sm"><Phone size={14} className="text-gold" /> 0737 003 007</p>
              <p className="flex items-center gap-3 text-white/60 text-sm"><Mail size={14} className="text-gold" /> info@axishomeschooling.org</p>
              <p className="flex items-center gap-3 text-white/60 text-sm"><Globe size={14} className="text-gold" /> AxisHomeschooling.org</p>
            </div>
          </div>

          {/* Get In Touch */}
          <div>
            <h4 className="text-white text-sm uppercase tracking-wider mb-5">Get In Touch</h4>
            <p className="text-white/60 text-sm leading-relaxed mb-5">We are here to answer your questions and help you find the right learning pathway.</p>
            <Link to="/contact" className="inline-block bg-gold text-navy px-5 py-2.5 rounded-lg text-xs font-semibold uppercase hover:bg-gold-light transition-colors">
              Contact Us Today
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 py-5 text-center text-white/40 text-xs">
          © 2026 Axis Homeschool & Enrichment Academy. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
