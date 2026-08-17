import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, MessageCircle, Phone } from 'lucide-react'
import { getService, services } from '../content/services'
import type { ServiceSection } from '../content/services'

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.axislearning.co.ke').replace(/\/$/, '')

function SectionBlock({ section }: { section: ServiceSection }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: '-80px' }}
      className="border-t border-gray-100 py-12 first:border-t-0 first:pt-0"
    >
      <h2 className="text-2xl font-semibold text-navy-900 sm:text-3xl">{section.heading}</h2>

      {section.body && (
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-navy-600">{section.body}</p>
      )}

      {section.glossary && (
        <dl className="mt-8 grid gap-4 md:grid-cols-2">
          {section.glossary.map((entry) => (
            <div key={entry.term} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <dt className="text-sm font-semibold uppercase tracking-[0.15em] text-gold-600">{entry.term}</dt>
              <dd className="mt-3 text-sm leading-relaxed text-navy-600">{entry.definition}</dd>
            </div>
          ))}
        </dl>
      )}

      {section.options && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {section.options.map((option) => (
            <div key={option.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-navy-900">{option.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{option.description}</p>
            </div>
          ))}
        </div>
      )}

      {section.items && (
        <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-navy-700">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-500" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {section.note && (
        <div className="mt-8 rounded-2xl border-l-4 border-gold-500 bg-gold-50 p-6">
          <p className="text-sm leading-relaxed text-navy-700">{section.note}</p>
        </div>
      )}
    </motion.section>
  )
}

export default function ServiceDetail() {
  const { slug } = useParams()
  const service = getService(slug)

  if (!service) return <Navigate to="/services" replace />

  const otherServices = services.filter((entry) => entry.slug !== service.slug).slice(0, 3)
  const Icon = service.icon
  const canonical = `${SITE_URL}/services/${service.slug}`

  return (
    <div className="pt-20">
      <Helmet>
        <title>{service.seo.title}</title>
        <meta name="description" content={service.seo.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={service.seo.title} />
        <meta property="og:description" content={service.seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:title" content={service.seo.title} />
        <meta name="twitter:description" content={service.seo.description} />
        <meta name="robots" content="index, follow" />
        {/* Each service is a distinct offering — described as such for search engines. */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.title,
            description: service.summary,
            serviceType: service.shortTitle,
            url: canonical,
            areaServed: { '@type': 'Country', name: 'Kenya' },
            provider: {
              '@type': 'EducationalOrganization',
              name: 'Axis Learning',
              url: SITE_URL,
            },
          })}
        </script>
      </Helmet>

      {/* Hero */}
      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-gold-500"
          >
            <ArrowLeft className="h-4 w-4" />
            All services
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8 max-w-3xl"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/40 bg-white/5">
              <Icon className="h-7 w-7 text-gold-500" />
            </div>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">{service.title}</h1>
            <p className="mt-4 text-lg text-gold-500">{service.tagline}</p>
            <p className="mt-6 text-lg leading-relaxed text-white/70">{service.summary}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/enroll?programme=${encodeURIComponent(service.title)}`} className="btn-primary">
                <MessageCircle className="h-4 w-4" />
                Enquire now
              </Link>
              <Link to="/contact" className="btn-navy border border-white/20 bg-white/10 hover:bg-white/20">
                <Phone className="h-4 w-4" />
                Book a consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Detail sections */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {service.sections.map((section) => (
            <SectionBlock key={section.heading} section={section} />
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-white">{service.cta.heading}</h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">{service.cta.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={`/enroll?programme=${encodeURIComponent(service.title)}`} className="btn-primary">
              Enquire now
            </Link>
            <Link to="/contact" className="btn-navy border border-white/20 bg-white/10 hover:bg-white/20">
              Talk to Axis
            </Link>
          </div>
        </div>
      </section>

      {/* Other services */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="section-label mb-3">Explore more</div>
          <h2 className="mb-10 text-center text-3xl font-semibold text-navy-900">Other Axis services</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {otherServices.map((entry) => {
              const EntryIcon = entry.icon
              return (
                <Link
                  key={entry.slug}
                  to={`/services/${entry.slug}`}
                  className="card-hover group rounded-2xl border border-gray-100 bg-white p-6"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${entry.accent}`}>
                    <EntryIcon className="h-6 w-6 text-navy-900" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900">{entry.shortTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{entry.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-600">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
