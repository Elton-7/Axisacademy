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
    <section ref={ref} className="py-20 bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="section-label mb-12">Learning Options</div>

        <div className="grid md:grid-cols-3 gap-8">
          {options.map((option, i) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center px-6 py-4 relative"
            >
              {i < options.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/4 h-1/2 w-px bg-white/10" />
              )}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <option.icon className="w-7 h-7 text-gold-500" />
              </div>
              <h3 className="text-white font-semibold uppercase tracking-wide text-sm mb-3">
                {option.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {option.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}