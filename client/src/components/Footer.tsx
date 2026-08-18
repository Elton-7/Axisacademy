import { Link } from 'react-router-dom'
import { Phone, Mail, Globe, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'
import NewsletterSignup from './NewsletterSignup'
import { contact, SITE_URL } from '../content/contact'

const quickLinks = [
  { href: '/about', label: 'About' },
  { href: '/philosophy', label: 'Our Philosophy' },
  { href: '/services', label: 'Services' },
  { href: '/learning-paths', label: 'Learning Paths' },
  { href: '/programmes', label: 'Programmes' },
  { href: '/educator-network', label: 'Educator Network' },
  { href: '/team', label: 'Our Team' },
  { href: '/locations', label: 'Locations' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/resources', label: 'Resources' },
  { href: '/partners', label: 'Partners' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy & Child Safety' },
]

const portalLinks = [
  { href: '/portal/student', label: 'Student Portal' },
  { href: '/portal/tutor', label: 'Tutor Portal' },
]

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/', label: 'Instagram' },
  { icon: Youtube, href: 'https://www.youtube.com/', label: 'YouTube' },
  { icon: Linkedin, href: 'https://www.linkedin.com/', label: 'LinkedIn' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-900 pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gold-500">
                <span className="font-serif text-xl font-bold text-gold-500">A</span>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-gold-500" />
              </div>
              <div>
                <span className="block text-sm font-semibold uppercase tracking-[0.15em] text-gold-500">Axis</span>
                <p className="text-[0.55rem] uppercase tracking-[0.1em] text-gold-500/70">Learning</p>
              </div>
            </Link>
            <p className="mb-1 text-sm italic text-gold-500/80">Learn · Think · Create · Explore · Thrive</p>
            <p className="mb-6 text-xs text-white/40">A Division of Guraxis Limited</p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/30 text-gold-500 transition-all duration-300 hover:bg-gold-500 hover:text-navy-surface"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-white">Quick Links</h2>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/50 transition-colors hover:text-gold-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-white">Contact Info</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/50">
                <Phone className="h-4 w-4 text-gold-500" />
                {contact.phoneDisplay}
              </li>
              <li className="flex items-center gap-3 text-sm text-white/50">
                <Mail className="h-4 w-4 text-gold-500" />
                {contact.email}
              </li>
              <li className="flex items-center gap-3 text-sm text-white/50">
                <Globe className="h-4 w-4 text-gold-500" />
                {SITE_URL.replace(/^https?:\/\//, '')}
              </li>
            </ul>
            <div className="mt-7">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gold-500">Portal Access</h3>
              <ul className="space-y-2">
                {portalLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-white/50 transition-colors hover:text-gold-500">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <NewsletterSignup />
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Axis Learning. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
