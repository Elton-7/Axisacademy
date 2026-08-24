import { motion } from 'framer-motion'
import { Target, Eye } from 'lucide-react'
import { useScrollAnimation } from '../hooks'
import { Link } from 'react-router-dom'

export default function AboutSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} id="about" className="relative overflow-hidden bg-surface py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,168,76,0.14),_transparent_38%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-label mb-5">About Axis</div>
        <div className="mb-10 max-w-3xl">
          <h2 className="mb-4 text-3xl font-semibold text-ink sm:text-4xl">
            Thoughtful education that meets each learner where they are.
          </h2>
          {/* Named in full rather than described in the abstract. "Calm,
              personalized and future-focused learning experiences" reads as
              homeschooling and tuition and leaves a parent guessing at the
              rest; Axis Learning is wider than the concept it grew out of, and
              this is the sentence that says so without becoming a list. */}
          <p className="text-lg leading-relaxed text-ink-muted">
            Axis Learning brings homeschooling and academic support together with Cambridge,
            Montessori and CBC pathways, Special Needs Education, foreign languages, games and
            sports, performing and creative arts, communication and leadership, and technology
            and innovation — for children, teenagers and adults.
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
            className="rounded-[2rem] border border-line bg-surface-sunk p-8 shadow-sm"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gold-700">
              Why families choose us
            </p>
            <div className="space-y-4 text-base leading-relaxed text-ink-muted">
              <p>
                We believe education should adapt to the learner—not the learner to the system.
              </p>
              <p>
                Our programmes blend academic excellence, practical skills, creativity, confidence-building, and personal development to help learners thrive in school, career, and life.
              </p>
            </div>
            <Link to="/about" className="btn-navy mt-8 inline-flex">
              Learn More About Us
            </Link>
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
                className="card-hover flex flex-1 items-start gap-5 rounded-[2rem] border border-line bg-surface p-8 shadow-sm"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gold/10">
                  <item.icon className="h-7 w-7 text-gold" />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-ink">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}