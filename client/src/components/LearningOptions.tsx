import { motion } from 'framer-motion'
import { Monitor, Users, Layers } from 'lucide-react'
import { useScrollAnimation } from '../hooks'

const options = [
  {
    icon: Monitor,
    title: 'Online Learning',
    description: 'Live virtual lessons from anywhere.',
  },
  {
    icon: Users,
    title: 'In-Person Learning',
    description: "Lessons conducted at the learner's location or designated learning centre.",
  },
  {
    icon: Layers,
    title: 'Blended Learning',
    description: 'A flexible combination of online and face-to-face instruction.',
  },
]

export default function LearningOptions() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="relative overflow-hidden bg-[linear-gradient(135deg,_#07111f_0%,_#162742_100%)] py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gold blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-label mb-5">Learning Options</div>
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Flexible delivery that supports real life.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            Choose the format that best fits your learner’s pace, schedule, and goals.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {options.map((option, i) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative rounded-[1.75rem] border border-white/10 bg-white/10 p-8 text-center shadow-lg shadow-navy/20 backdrop-blur-sm"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                <option.icon className="h-7 w-7 text-gold" />
              </div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
                {option.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/70">
                {option.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}