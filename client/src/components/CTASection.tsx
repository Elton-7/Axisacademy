import { motion } from 'framer-motion'
import { GraduationCap, Phone, MessageCircle } from 'lucide-react'
import { useScrollAnimation } from '../hooks'
import { contact, telHref, whatsappHref } from '../content/contact'
import { Link } from 'react-router-dom'

export default function CTASection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="bg-gold py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="rounded-[2rem] border border-white/40 bg-[linear-gradient(135deg,_rgba(255,255,255,0.24),_rgba(10,22,40,0.08))] p-8 shadow-2xl shadow-navy/20 md:p-10"
        >
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="flex items-start gap-6">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-navy text-gold">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h2 className="mb-2 text-2xl font-semibold text-ink">
                  Begin your learning journey today
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-ink-muted/80">
                  Whether you are seeking homeschooling support, academic tutoring, language learning, enrichment programmes, or personalized educational guidance, Axis is ready to help.
                </p>
                <a href={telHref} className="mt-3 inline-flex items-center gap-2 font-semibold text-ink hover:underline">
                  <Phone className="h-4 w-4" />
                  {`Call ${contact.phoneDisplay}`}
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/enroll" className="btn-navy">Make an Enquiry</Link>
              <Link
                to="/consultation"
                className="btn-secondary border-navy text-ink hover:bg-navy hover:text-white"
              >
                Book a Consultation
              </Link>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-surface px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-surface-muted"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}