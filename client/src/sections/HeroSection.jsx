import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { User, GraduationCap, Clock, Heart, Phone } from 'lucide-react'

export default function HeroSection() {
  const features = [
    { icon: User, label: 'Personalized Learning' },
    { icon: GraduationCap, label: 'Qualified Instructors' },
    { icon: Clock, label: 'Flexible Options' },
    { icon: Heart, label: 'Holistic Development' },
  ]

  return (
    <section className="bg-navy min-h-[600px] flex flex-col lg:flex-row relative overflow-hidden">
      <div className="flex-1 px-6 sm:px-10 lg:px-16 py-16 lg:py-20 max-w-2xl z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-[52px] text-white font-light leading-[1.15] mb-6"
        >
          Education<br />Tailored To<br /><span className="text-gold font-normal">The Learner.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/80 text-base leading-relaxed mb-8"
        >
          Personalized homeschooling, academic support, languages, and enrichment programmes designed around each learner's goals, strengths, interests, and aspirations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          <Link to="/contact" className="btn btn-gold">
            <Phone size={16} /> Enroll Now
          </Link>
          <Link to="/contact" className="btn btn-outline">
            <GraduationCap size={16} /> Book a Free Consultation
          </Link>
          <a href="tel:0737003007" className="btn btn-dark bg-white/10 border-white/30 text-white hover:bg-white/20">
            <Phone size={16} /> Call 0737 003 007
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap gap-6"
        >
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-white/90">
              <div className="w-9 h-9 border border-gold/40 rounded-full flex items-center justify-center text-gold">
                <feature.icon size={16} />
              </div>
              <span className="text-xs leading-tight">{feature.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Hero Images Grid */}
      <div className="flex-1 relative p-6 lg:p-10">
        <div className="relative max-w-xl mx-auto lg:mx-0 lg:ml-auto">
          <div className="absolute -top-8 -left-8 w-48 h-48 border-2 border-gold/30 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-1 row-span-2 rounded-xl overflow-hidden h-[400px]"
            >
              <img src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop" alt="Student" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl overflow-hidden h-[194px]"
            >
              <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop" alt="Science" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl overflow-hidden h-[194px]"
            >
              <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop" alt="Writing" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-xl overflow-hidden h-[180px]"
            >
              <img src="https://images.unsplash.com/photo-1529390079861-591f1bfe7d1f?w=400&h=250&fit=crop" alt="Sports" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-xl overflow-hidden h-[180px]"
            >
              <img src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=250&fit=crop" alt="Music" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
