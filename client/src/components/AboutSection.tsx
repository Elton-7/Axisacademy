import { motion } from 'framer-motion'
import { Target, Eye } from 'lucide-react'
import { useScrollAnimation } from '../hooks'

export default function AboutSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} id="about" className="relative overflow-hidden bg-white py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,168,76,0.14),_transparent_38%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-label mb-5">About Axis</div>
        <div className="mb-10 max-w-3xl">
          <h2 className="mb-4 text-3xl font-semibold text-navy sm:text-4xl">
            Thoughtful education that meets each learner where they are.
          </h2>
          <p className="text-lg leading-relaxed text-navy/70">
            Axis Homeschool & Enrichment Academy offers calm, personalized, and future-focused learning experiences for children, teenagers, and adults.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Why families choose us
            </p>
            <div className="space-y-4 text-base leading-relaxed text-navy/70">
              <p>
                We believe education should adapt to the learner—not the learner to the system.
              </p>
              <p>
                Our programmes blend academic excellence, practical skills, creativity, confidence-building, and personal development to help learners thrive in school, career, and life.
              </p>
            </div>
            <a href="/about" className="btn-navy mt-8 inline-flex">
              Learn More About Us
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm card-hover"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
              <Target className="h-8 w-8 text-gold" />
            </div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-navy">Mission</h3>
            <p className="leading-relaxed text-navy/70">
              To develop learners whom the world needs more than they need the world.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm card-hover"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
              <Eye className="h-8 w-8 text-gold" />
            </div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-navy">Vision</h3>
            <p className="leading-relaxed text-navy/70">
              To build a world where learners are creators of opportunity, not merely seekers of it.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}