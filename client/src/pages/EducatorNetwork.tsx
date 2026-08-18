import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Brush,
  ClipboardList,
  Drama,
  GraduationCap,
  HeartHandshake,
  Languages,
  Music,
  Trophy,
  Users,
} from 'lucide-react'

/**
 * Brief §17 — Axis does not depend on educators sitting in one building. This page
 * explains the network model; /team is the directory of the people in it.
 */

const networkRoles = [
  { icon: GraduationCap, label: 'Teachers', caption: 'Curriculum-qualified across CBC, Cambridge, IB and more' },
  { icon: ClipboardList, label: 'Tutors', caption: 'Subject specialists for targeted academic support' },
  { icon: Languages, label: 'Language educators', caption: 'Foreign and African languages' },
  { icon: Trophy, label: 'Coaches', caption: 'Sports, games and physical activity' },
  { icon: Brush, label: 'Artists', caption: 'Art, craft and creative practice' },
  { icon: Music, label: 'Musicians', caption: 'Instrumental, vocal and performance' },
  { icon: Drama, label: 'Theatre practitioners', caption: 'Drama, acting and public performance' },
  { icon: HeartHandshake, label: 'Special needs educators', caption: 'Individualised and adapted learning support' },
  { icon: Users, label: 'Academic specialists', caption: 'Assessment, examinations and pathway planning' },
]

const matchingSteps = [
  {
    title: 'Understand the learner',
    body: 'Learner Discovery tells us what the learner needs — subject, level, learning style, environment and any additional support required.',
  },
  {
    title: 'Identify the right educator',
    body: 'We search the network on the things that actually matter: subject and curriculum expertise, experience with this kind of learner, languages spoken, and location or availability.',
  },
  {
    title: 'Match and introduce',
    body: 'We propose an educator to the family and explain why. Where the fit is not right, we say so and match again rather than persisting with a poor pairing.',
  },
  {
    title: 'Support and review',
    body: 'The educator is not left alone with it. Axis stays involved through progress reporting, family feedback and review as the learner develops.',
  },
]

export default function EducatorNetwork() {
  return (
    <div className="pt-20">
      <Helmet>
        <title>Our Educator Network | Axis Learning Kenya</title>
        <meta
          name="description"
          content="Axis Learning maintains a growing national network of teachers, tutors, language educators, coaches, artists and special needs educators — connecting the right learner to the right educator."
        />
        <meta property="og:title" content="Our Educator Network | Axis Learning" />
        <meta
          property="og:description"
          content="A national network of educators, not a single staff room — so we can connect the right learner to the right educator."
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
            <div className="section-label !text-left mb-4">Our Educators Network</div>
            <h1 className="mb-6 text-4xl font-semibold text-white md:text-5xl">
              The right learner, connected to the right educator
            </h1>
            <p className="text-lg leading-relaxed text-white/70">
              Axis Learning does not depend on educators who happen to be sitting in one building.
              We maintain an expanding national network — which is what makes it possible to match a
              learner to someone genuinely suited to them, rather than to whoever is free.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why a network */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold text-ink">Why we work as a network</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-muted">
                A single-site organisation can only offer what its own staff room happens to contain.
                If nobody there teaches Japanese, or has worked with a learner with dyspraxia, or
                coaches chess, then that learner is simply told no.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-ink-muted">
                A network removes that limit. It is also what allows Axis to serve families well
                beyond Nairobi — through home-based educators, partner facilities and online
                educators working across the country.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { stat: 'Subject match', body: 'Educators chosen for the subject and curriculum, not proximity alone.' },
                { stat: 'Learner match', body: 'Experience with this kind of learner weighs as heavily as qualifications.' },
                { stat: 'National reach', body: 'Home-based, centre-based and online educators across Kenya.' },
                { stat: 'Growing breadth', body: 'The network expands as new languages, sports and specialisms are requested.' },
              ].map((item) => (
                <div key={item.stat} className="rounded-2xl border border-line bg-surface-sunk p-6">
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-gold-600">{item.stat}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who is in the network */}
      <section className="bg-surface-sunk py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-ink">Who is in the network</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">
              Educators, not only classroom teachers. Axis works with the range of professionals a
              full education actually requires.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {networkRoles.map((role, index) => {
              const Icon = role.icon
              return (
                <motion.div
                  key={role.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (index % 3) * 0.07 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-6"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-navy-900">
                    <Icon className="h-5 w-5 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-ink">{role.label}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{role.caption}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <p className="mt-8 text-sm text-ink-faint">
            And other professionals, as the network continues to expand.
          </p>
        </div>
      </section>

      {/* How matching works */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-ink">How we match an educator</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">
              Matching is a deliberate process, and the steps run in this order for a reason —
              we do not look for an educator before we understand the learner.
            </p>
          </div>

          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {matchingSteps.map((step, index) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="relative rounded-2xl border border-line bg-surface-sunk p-6"
              >
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-gold-600">
                  Step {index + 1}
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-white">Meet the people behind the network</h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            Browse the Axis team and educators by category, subject, language and area of expertise.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/team" className="btn-primary">
              View our team &amp; educators
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="btn-navy border border-white/20 bg-surface/10 hover:bg-surface/20">
              Talk to Axis
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
