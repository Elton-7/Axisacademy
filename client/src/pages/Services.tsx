import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Compass } from 'lucide-react'
import { services } from '../content/services'

export default function Services() {
  return (
    <div className="pt-20">
      <section className="bg-navy-900 py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label mb-4">Our Services</div>
            <h1 className="mb-6 text-4xl font-semibold text-white md:text-5xl">
              Learning that begins with the learner
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/70">
              Whether you know exactly what you need or only know that your learner needs support,
              Axis can help you find the right next step.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-surface-sunk py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {services.map((service, i) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
                  viewport={{ once: true }}
                  className="card-hover group overflow-hidden rounded-2xl border border-line bg-surface"
                >
                  <div className={`${service.accent} p-8`}>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface shadow-sm">
                      <Icon className="h-7 w-7 text-ink" />
                    </div>
                    <h2 className="mb-2 text-xl font-semibold text-ink">{service.title}</h2>
                    <p className="text-sm leading-relaxed text-ink-muted">{service.summary}</p>
                  </div>
                  <div className="p-8">
                    <ul className="mb-6 space-y-3">
                      {service.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-3 text-sm text-ink-muted">
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-500" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center gap-6">
                      <Link
                        to={`/services/${service.slug}`}
                        className="group/btn inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-600 transition-colors hover:text-gold-700"
                      >
                        Learn more
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                      <Link
                        to={`/enroll?programme=${encodeURIComponent(service.title)}`}
                        className="text-sm font-semibold uppercase tracking-wide text-ink-muted transition-colors hover:text-ink"
                      >
                        Enquire now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Brief §13 — the parent who cannot name what they need must still have a door in. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 rounded-3xl border border-gold-200 bg-gold-50 p-10 text-center"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface shadow-sm">
              <Compass className="h-7 w-7 text-gold-600" />
            </div>
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
              Not sure which of these your learner needs?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
              You do not have to choose from this list. Start with Learner Discovery — we will
              understand the learner, identify the challenge, and recommend the right pathway.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/services/learner-discovery" className="btn-primary">
                How Learner Discovery works
              </Link>
              <Link to="/consultation" className="btn-secondary">
                Book a consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
