import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { learningPaths } from '../content/learningPaths'

export default function LearningPaths() {
  return (
    <div className="pt-20">
      <Helmet>
        <title>How Learning Works | Online, Home-Based & Blended | Axis Learning</title>
        <meta
          name="description"
          content="Understand exactly how learning happens through Axis Learning — online lessons, an educator at your home, sessions at an Axis centre, or a blended combination."
        />
        <meta property="og:title" content="How Learning Works at Axis Learning" />
        <meta
          property="og:description"
          content="Online, home-based, centre-based and blended learning pathways explained for parents."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <section className="bg-navy-900 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="section-label !text-left mb-4">Learning Paths</div>
            <h1 className="mb-6 text-4xl font-semibold text-white md:text-5xl">
              How learning actually happens with Axis
            </h1>
            <p className="text-lg leading-relaxed text-white/70">
              Axis is not tied to one building or one format. Learning can reach your learner
              wherever they are, in whichever way works — and the arrangement can change as they do.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick index */}
      <section className="border-b border-line bg-surface py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-4 sm:px-6 lg:px-8">
          {learningPaths.map((path) => {
            const Icon = path.icon
            return (
              <a
                key={path.slug}
                href={`#${path.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-gold-500 hover:text-gold-700"
              >
                <Icon className="h-4 w-4 text-gold-600" />
                {path.title}
              </a>
            )
          })}
        </div>
      </section>

      <section className="bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {learningPaths.map((path, index) => {
            const Icon = path.icon
            return (
              <motion.article
                key={path.slug}
                id={path.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: '-80px' }}
                className="scroll-mt-28 border-b border-line py-14 last:border-b-0"
              >
                <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
                  <div>
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900">
                      <Icon className="h-7 w-7 text-gold-500" />
                    </div>
                    <p className="font-mono text-xs uppercase tracking-[0.15em] text-gold-600">
                      Option {String(index + 1).padStart(2, '0')}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-ink">{path.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">{path.short}</p>
                  </div>

                  <div>
                    <p className="max-w-3xl text-lg leading-relaxed text-ink-muted">{path.summary}</p>

                    {path.options && (
                      <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {path.options.map((option) => (
                          <div
                            key={option.title}
                            className="rounded-2xl border border-line bg-surface-sunk p-6"
                          >
                            <h3 className="text-base font-semibold text-ink">{option.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                              {option.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {path.items && (
                      <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                        {path.items.map((item) => (
                          <li key={item.label} className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-500" />
                            <span className="text-sm text-ink-muted">
                              {item.label}
                              {item.caption && (
                                <span className="block text-xs text-ink-faint">{item.caption}</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {path.note && (
                      <div className="mt-8 rounded-2xl border-l-4 border-gold-500 bg-gold-50 p-6">
                        <p className="text-sm leading-relaxed text-ink-muted">{path.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="bg-surface-sunk py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-ink">Not sure which path fits?</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            You do not have to decide this on your own. Learner Discovery exists precisely to work out
            which curriculum, programme and learning model suit your learner.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/services/learner-discovery" className="btn-primary">
              How Learner Discovery works
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/consultation" className="btn-secondary">
              Book a consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
