import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * Brief §5 — the philosophy is the argument the rest of the site rests on, so it
 * gets its own page rather than living inside a service description.
 */

const discoveryQuestions = [
  'Who the learner is',
  'What the learner enjoys',
  'What the learner finds difficult',
  'How the learner learns best',
  'What the learner wants to become',
  'What support the learner requires',
  'What environment allows the learner to thrive',
]

const consequences = [
  {
    title: 'One learner, one pathway',
    body: 'If education is designed around the learner, then two learners in the same grade with the same curriculum can still need different pathways. We build the pathway per learner rather than sorting learners into a programme.',
  },
  {
    title: 'The curriculum serves the learner',
    body: 'A curriculum is a tool, not a verdict. We help families choose the curriculum that suits the learner — and we say so plainly when the one they are currently in is not working.',
  },
  {
    title: 'Support is not a separate category',
    body: 'Individualised support is not a side programme for a subset of learners. Every Axis pathway is individualised; some simply require more adaptation than others.',
  },
  {
    title: 'Learning is wider than examinations',
    body: 'Confidence, creativity, communication, leadership and independence are outcomes we plan for deliberately, not accidents that happen alongside academic work.',
  },
]

export default function Philosophy() {
  return (
    <div className="pt-20">
      <Helmet>
        <title>Our Educational Philosophy | Axis Learning</title>
        <meta
          name="description"
          content="Every learner is different, and education should be designed around the learner. The belief behind how Axis Learning builds individual educational pathways in Kenya."
        />
        <meta property="og:title" content="Our Educational Philosophy | Axis Learning" />
        <meta
          property="og:description"
          content="Every learner is different, and education should be designed around the learner."
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
            <div className="section-label !text-left mb-4">Our Educational Philosophy</div>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Every learner is different, and education should be designed around the learner.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              This is not a slogan we arrived at afterwards. It is the reason Axis Learning is
              organised the way it is — and it is why we begin with the learner rather than with a
              programme.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The reframing at the heart of the brief */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-stretch gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-gray-200 bg-gray-50 p-10"
            >
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-navy-500">
                Education usually asks
              </p>
              <p className="mt-4 font-serif text-3xl italic leading-snug text-navy-500">
                “Which class is the learner in?”
              </p>
              <p className="mt-6 text-sm leading-relaxed text-navy-600">
                A reasonable administrative question. It tells you where to put a learner — and
                almost nothing about how to teach them.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="rounded-3xl border-2 border-gold-500 bg-navy-900 p-10"
            >
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-gold-500">
                We also ask
              </p>
              <p className="mt-4 font-serif text-3xl italic leading-snug text-white">
                “Who is this learner?”
              </p>
              <p className="mt-6 text-sm leading-relaxed text-white/70">
                Harder to answer, and far more useful. It is the question every Axis pathway starts
                from, and the one we keep returning to as a learner grows.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The seven questions */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-navy-900">What we seek to understand</h2>
            <p className="mt-4 text-lg leading-relaxed text-navy-600">
              Before recommending a curriculum, a programme or an educator, we work to understand
              seven things about the learner in front of us.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {discoveryQuestions.map((question, index) => (
              <motion.li
                key={question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6"
              >
                <span className="font-mono text-sm font-semibold text-gold-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-base font-medium leading-snug text-navy-900">{question}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* What follows from it */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-navy-900">What this means in practice</h2>
            <p className="mt-4 text-lg leading-relaxed text-navy-600">
              A philosophy is only worth stating if it changes what an organisation actually does.
              Here is what follows from ours.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {consequences.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: (index % 2) * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-8"
              >
                <h3 className="text-lg font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-white">
            Tell us who your learner is
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            You do not need to arrive with a diagnosis, a plan, or the right vocabulary. Describe the
            situation in your own words and we will take it from there.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/services/learner-discovery" className="btn-primary">
              Start with Learner Discovery
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/consultation" className="btn-navy border border-white/20 bg-white/10 hover:bg-white/20">
              Book a consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
