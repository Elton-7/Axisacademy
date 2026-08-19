import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Target, Eye, ArrowRight, BookOpen, Brain, Palette, Compass, Sprout } from 'lucide-react'
import { useScrollAnimation } from '../hooks'

/**
 * The tagline pillars (brief §2) replace the previous statistics band, which
 * carried invented figures — enrolment counts, instructor numbers and a
 * satisfaction rate that no source in the brief supports. Real metrics can be
 * reinstated here once Axis supplies them.
 */
const pillars = [
  { icon: BookOpen, title: 'Learn', desc: 'Academic learning built around the learner, not the timetable.' },
  { icon: Brain, title: 'Think', desc: 'Understanding and independent thought ahead of memorisation.' },
  { icon: Palette, title: 'Create', desc: 'Room for creativity, expression and talent alongside academics.' },
  { icon: Compass, title: 'Explore', desc: 'Languages, cultures, sports and interests worth discovering.' },
  { icon: Sprout, title: 'Thrive', desc: 'Confidence and independence that outlast any single programme.' },
]

const values = [
  { title: 'Learner-centred', desc: 'Every pathway begins with who the learner is, not which class they are in.' },
  { title: 'Inclusive', desc: 'We welcome learners of all backgrounds, abilities, and aspirations.' },
  { title: 'Flexible', desc: 'Online, at home, at a centre, or blended — the model follows the learner.' },
  { title: 'Trustworthy', desc: 'We are honest about what we offer, who delivers it, and what it will take.' },
]

export default function About() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-navy-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label mb-4">About Us</div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">
              Who We Are
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              A learner-centred educational institution dedicated to providing personalized 
              learning solutions for children, teenagers, and adults.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tagline pillars */}
      <section className="bg-gold-500 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center font-mono text-xs uppercase tracking-[0.3em] text-ink/70">
            Learn • Think • Create • Explore • Thrive
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <pillar.icon className="mx-auto mb-3 h-8 w-8 text-ink" />
                <div className="mb-1 text-xl font-bold text-ink">{pillar.title}</div>
                <div className="text-sm leading-snug text-ink/75">{pillar.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      {/* overflow-hidden: the cards slide in from the sides, and at mobile
          widths that offset would push the page sideways. */}
      <section ref={ref} className="overflow-hidden py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="bg-surface-sunk rounded-2xl p-10"
            >
              <Target className="w-12 h-12 text-gold-500 mb-6" />
              <h2 className="text-2xl font-semibold text-ink mb-4">Our Mission</h2>
              <p className="text-ink-muted/80 leading-relaxed">
                To develop learners whom the world needs more than they need the world. We achieve this 
                by providing personalized, high-quality education that nurtures critical thinking, creativity, 
                and character development.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-surface-sunk rounded-2xl p-10"
            >
              <Eye className="w-12 h-12 text-gold-500 mb-6" />
              <h2 className="text-2xl font-semibold text-ink mb-4">Our Vision</h2>
              <p className="text-ink-muted/80 leading-relaxed">
                To build a world where learners are creators of opportunity, not merely seekers of it. 
                We envision an educational ecosystem that empowers every individual to discover their 
                unique potential and contribute meaningfully to society.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-surface-sunk">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-label mb-4">Our Values</div>
          <h2 className="text-3xl font-semibold text-ink text-center mb-16">
            What Drives Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-surface rounded-2xl p-8 border border-line card-hover"
              >
                <h3 className="text-lg font-semibold text-ink mb-3">{value.title}</h3>
                <p className="text-ink-muted/70 text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 rounded-3xl border border-line bg-surface p-10 text-center">
            <h3 className="font-serif text-2xl italic text-ink sm:text-3xl">
              “Every learner is different, and education should be designed around the learner.”
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-ink-muted">
              That belief shapes every pathway we build. It is worth reading in full before you
              decide whether Axis is right for your learner.
            </p>
            <Link to="/philosophy" className="btn-primary mt-8">
              Read our educational philosophy
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}