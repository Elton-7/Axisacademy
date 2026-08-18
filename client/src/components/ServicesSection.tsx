import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useScrollAnimation } from '../hooks'
import { services } from '../content/services'

export default function ServicesSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} id="services" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-label mb-4">Our Services</div>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-navy-900 sm:text-4xl">
            Nine services. One learner at the centre.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-navy-600">
            Axis Learning keeps its services clearly separated so you can see exactly what we do —
            and we will help you work out which of them your learner actually needs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="card-hover group flex flex-col rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 transition-colors duration-300 group-hover:bg-gold-500">
                  <Icon className="h-7 w-7 text-gold-500 transition-colors duration-300 group-hover:text-navy-900" />
                </div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-900">
                  {service.shortTitle}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-navy-600">{service.tagline}</p>
                <ul className="mb-6 space-y-2">
                  {service.highlights.slice(0, 3).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/services/${service.slug}`}
                  className="mt-auto inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-600 transition-colors hover:text-gold-700"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link to="/services" className="btn-secondary">
            View all services in detail
          </Link>
        </div>
      </div>
    </section>
  )
}
