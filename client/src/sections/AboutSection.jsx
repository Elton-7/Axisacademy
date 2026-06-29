import { motion } from 'framer-motion'
import { Target, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="section-label">About Axis</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl lg:text-4xl text-navy font-semibold mb-6">Who We Are</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Axis Homeschool & Enrichment Academy is a learner-centred educational institution dedicated to providing personalized learning solutions for children, teenagers, and adults.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            We believe that education should adapt to the learner—not the learner to the system.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            Our programmes combine academic excellence, practical skills, creativity, confidence-building, and personal development to help learners thrive in school, career, and life.
          </p>
          <Link to="/about" className="btn bg-navy text-white hover:bg-navy-light">
            Learn More About Us
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center p-10 border border-gray-200 rounded-xl bg-white"
        >
          <Target size={40} className="text-gold mx-auto mb-4" />
          <h4 className="text-navy text-sm uppercase tracking-wider font-semibold mb-4">Mission</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            To develop learners whom the world needs more than they need the world.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center p-10 border border-gray-200 rounded-xl bg-white"
        >
          <Eye size={40} className="text-gold mx-auto mb-4" />
          <h4 className="text-navy text-sm uppercase tracking-wider font-semibold mb-4">Vision</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            To build a world where learners are creators of opportunity, not merely seekers of it.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
