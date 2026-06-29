import { motion } from 'framer-motion'
import { Target, Eye } from 'lucide-react'
import { useScrollAnimation } from '../hooks'

export default function AboutSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-label mb-12">About Axis</div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Who We Are */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-semibold text-navy-900 mb-6">Who We Are</h2>
            <div className="space-y-4 text-navy-600/80 leading-relaxed">
              <p>
                Axis Homeschool & Enrichment Academy is a learner-centred educational institution 
                dedicated to providing personalized learning solutions for children, teenagers, and adults.
              </p>
              <p>
                We believe that education should adapt to the learner—not the learner to the system.
              </p>
              <p>
                Our programmes combine academic excellence, practical skills, creativity, confidence-building, 
                and personal development to help learners thrive in school, career, and life.
              </p>
            </div>
            <a href="/about" className="btn-navy mt-8 inline-flex">
              Learn More About Us
            </a>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-2xl p-8 text-center card-hover"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold-50 flex items-center justify-center">
              <Target className="w-8 h-8 text-gold-500" />
            </div>
            <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-[0.15em] mb-4">Mission</h3>
            <p className="text-navy-600/80 leading-relaxed">
              To develop learners whom the world needs more than they need the world.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-2xl p-8 text-center card-hover"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold-50 flex items-center justify-center">
              <Eye className="w-8 h-8 text-gold-500" />
            </div>
            <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-[0.15em] mb-4">Vision</h3>
            <p className="text-navy-600/80 leading-relaxed">
              To build a world where learners are creators of opportunity, not merely seekers of it.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}