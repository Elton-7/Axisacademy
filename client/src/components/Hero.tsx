import { motion } from 'framer-motion'
import { Phone, GraduationCap, MessageCircle, User, Clock, Heart, Sparkles, Languages, ArrowRight } from 'lucide-react'
import { useScrollAnimation } from '../hooks'
import { contact, telHref } from '../content/contact'
import { Link } from 'react-router-dom'

/**
 * What Axis offers, rather than claims about how well it does it.
 *
 * The previous set advertised "100% Learner-centred support" and "24/7 Flexible
 * scheduling". The first is a percentage of nothing; the second is contradicted
 * by this site's own contact page, which states Mon–Sat, 8am–6pm. "Qualified
 * Instructors" and "Trusted by families" were unverifiable claims of exactly
 * the kind §21 rules out in the name of credibility.
 *
 * These are drawn from the brief's own description of the service instead, and
 * every one of them is checkable against the rest of the site.
 */
const features = [
  { icon: User, label: 'Learner-centred\npathways' },
  { icon: Languages, label: 'African & foreign\nlanguages' },
  { icon: Clock, label: 'Online, home\nor centre-based' },
  { icon: Heart, label: 'Individualised\nsupport' },
]

const highlights = [
  { value: 'Nine', label: 'services, kept clearly separate' },
  { value: '47', label: 'counties reachable through our educators' },
  { value: '1:1', label: 'or small group, whichever suits' },
]

/** A sample of the nine, in the brief's own terms. */
const heroServices = [
  {
    title: 'Academic learning & homeschooling',
    detail: 'CBC, Montessori, Cambridge, IGCSE, A Levels and IB.',
  },
  {
    title: 'Special needs & individualised support',
    detail: 'Learning adapted to the learner, never one-size-fits-all.',
  },
  {
    title: 'African & foreign languages',
    detail: 'Kiswahili and Dholuo alongside French, Mandarin and Arabic.',
  },
  {
    title: 'Talent, sports & enrichment',
    detail: 'Chess, music, drama, debate, football and swimming.',
  },
]

export default function Hero() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="relative flex min-h-[760px] items-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.16),_transparent_32%),linear-gradient(135deg,_#06101f_0%,_#13223f_100%)] pt-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-10 top-20 h-96 w-96 rounded-full border border-gold-500" />
        <div className="absolute bottom-18 right-20 h-64 w-64 rounded-full border border-gold-500" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/10 px-4 py-2 text-sm text-gold-light backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Learn · Think · Create · Explore · Thrive
            </div>

            <h1 className="mb-6 text-5xl font-light leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Education<br />
              Tailored To<br />
              <span className="font-serif text-gold-500 italic">The Learner.</span>
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/75">
              Personalized homeschooling, academic support, languages, and enrichment programmes
              designed around each learner’s goals, strengths, interests, and aspirations.
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              {/*
                The form starts an enquiry, not an enrolment — enrolment happens
                after a consultation. "Enroll Now" promised something the site
                does not do.
              */}
              <Link to="/enroll" className="btn-primary">
                <MessageCircle className="h-4 w-4" />
                Make an Enquiry
              </Link>
              <Link to="/consultation" className="btn-secondary">
                <GraduationCap className="h-4 w-4" />
                Book a Consultation
              </Link>
              <a href={telHref} className="btn-navy bg-white/10 border border-white/20 hover:bg-white/20">
                <Phone className="h-4 w-4" />
                {`Call ${contact.phoneDisplay}`}
              </a>
            </div>

            <div className="mb-8 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-lg font-semibold text-gold-500">{item.value}</p>
                  <p className="text-sm text-white/70">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/40">
                    <feature.icon className="h-4 w-4 text-gold-500" />
                  </div>
                  <span className="text-sm whitespace-pre-line text-white/80">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            {/*
              Brief §19: "I do not want a website that only contains stock
              photographs." This was a collage of four Unsplash images — a
              toddler covered in paint, laboratory glassware, an anonymous hand
              — none of them Axis, none of them Kenyan, and one of them
              returning 404.

              Rather than substitute better stock, the space is given to what
              Axis actually offers, which is true and needs no permission. When
              real photography arrives it belongs here, and the grid below is
              sized to take it.
            */}
            <div className="relative mx-auto max-w-xl">
              <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full border-2 border-gold-500/30" />

              <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500">
                  What we do
                </p>
                <div className="mt-6 space-y-4">
                  {heroServices.map((item) => (
                    <div key={item.title} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                      <p className="text-base font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <Link
                  to="/services"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-500 transition-colors hover:text-gold-400"
                >
                  All nine services
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}