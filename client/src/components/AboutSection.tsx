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
            Axis Learning offers calm, personalized, and future-focused learning experiences for children, teenagers, and adults.
          </p>
        </div>

        {/* Mission and Vision are a sentence each. As two full-height columns
            beside a much longer card they were mostly empty space, so they now
            share one column as compact rows. */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
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

          <div className="flex flex-col gap-6">
            {[
              {
                icon: Target,
                title: 'Mission',
                body: 'To develop learners whom the world needs more than they need the world.',
              },
              {
                icon: Eye,
                title: 'Vision',
                body: 'To build a world where learners are creators of opportunity, not merely seekers of it.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                className="card-hover flex flex-1 items-start gap-5 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gold/10">
                  <item.icon className="h-7 w-7 text-gold" />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-navy">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-navy/70">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}