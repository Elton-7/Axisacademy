import { motion } from 'framer-motion'
import { Monitor, Users, Layers } from 'lucide-react'

export default function LearningOptionsSection() {
  const options = [
    { icon: Monitor, title: 'Online Learning', desc: 'Live virtual lessons from anywhere.' },
    { icon: Users, title: 'In-Person Learning', desc: "Lessons conducted at the learner's location or designated learning centre." },
    { icon: Layers, title: 'Blended Learning', desc: 'A flexible combination of online and face-to-face instruction.' },
  ]

  return (
    <section id="learning" className="bg-navy py-16 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="section-label mb-10">Learning Options</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {options.map((option, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`text-center px-6 py-4 relative ${i < 2 ? 'md:border-r md:border-white/10' : ''}`}
            >
              <option.icon size={36} className="text-gold mx-auto mb-4" />
              <h4 className="text-white text-sm uppercase tracking-wider font-semibold mb-3">{option.title}</h4>
              <p className="text-white/70 text-sm leading-relaxed">{option.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
