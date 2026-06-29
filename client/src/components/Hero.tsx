import { motion } from 'framer-motion'
import { Phone, GraduationCap, MessageCircle, User, Clock, Heart } from 'lucide-react'
import { useScrollAnimation } from '../hooks'

const features = [
  { icon: User, label: 'Personalized\nLearning' },
  { icon: GraduationCap, label: 'Qualified\nInstructors' },
  { icon: Clock, label: 'Flexible\nOptions' },
  { icon: Heart, label: 'Holistic\nDevelopment' },
]

export default function Hero() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="relative bg-navy-900 min-h-[700px] flex items-center overflow-hidden pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-96 h-96 border border-gold-500 rounded-full" />
        <div className="absolute bottom-20 right-20 w-64 h-64 border border-gold-500 rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-[1.1] mb-6">
              Education<br />
              Tailored To<br />
              <span className="text-gold-500 font-serif italic">The Learner.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
              Personalized homeschooling, academic support, languages, and enrichment programmes 
              designed around each learner's goals, strengths, interests, and aspirations.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <a href="/contact" className="btn-primary">
                <MessageCircle className="w-4 h-4" />
                Enroll Now
              </a>
              <a href="/contact" className="btn-secondary">
                <GraduationCap className="w-4 h-4" />
                Book a Free Consultation
              </a>
              <a href="tel:0737003007" className="btn-navy bg-white/10 border border-white/20 hover:bg-white/20">
                <Phone className="w-4 h-4" />
                Call 0737 003 007
              </a>
            </div>

            <div className="flex flex-wrap gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full border border-gold-500/40 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-gold-500" />
                  </div>
                  <span className="text-white/80 text-sm whitespace-pre-line">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Images Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            <div className="relative grid grid-cols-2 gap-3 max-w-xl mx-auto">
              <div className="absolute -top-8 -left-8 w-48 h-48 border-2 border-gold-500/30 rounded-full" />

              <div className="row-span-2 rounded-2xl overflow-hidden h-[420px]">
                <img 
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=600&fit=crop&q=80" 
                  alt="Student learning" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-[200px]">
                <img 
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop&q=80" 
                  alt="Science student" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-[200px]">
                <img 
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&q=80" 
                  alt="Student writing" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="col-span-2 rounded-2xl overflow-hidden h-[180px]">
                <img 
                  src="https://images.unsplash.com/photo-1529390079861-591f1bfe7d1f?w=800&h=300&fit=crop&q=80" 
                  alt="Activities" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}