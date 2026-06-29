import { motion } from 'framer-motion'
import { User, Clock, GraduationCap, Globe, Lightbulb, TrendingUp, Users, Heart, Leaf } from 'lucide-react'
import { useScrollAnimation } from '../hooks'

const reasons = [
  { icon: User, label: 'Personalized Learning' },
  { icon: Clock, label: 'Flexible Scheduling' },
  { icon: GraduationCap, label: 'Qualified Instructors' },
  { icon: Globe, label: 'Local & International Curricula' },
  { icon: Lightbulb, label: 'Languages & Life Skills' },
  { icon: TrendingUp, label: 'Academic & Personal Development' },
  { icon: Users, label: 'Supportive Learning Community' },
  { icon: Heart, label: 'Special Learner Support' },
  { icon: Leaf, label: 'Holistic Education Approach' },
]

const testimonials = [
  {
    quote: "Axis has been a blessing for our family. The personalized attention and flexibility have helped our child excel academically and build confidence.",
    author: "Parent",
  },
  {
    quote: "The support I received from Axis tutors helped me improve my grades and discover new interests. Highly recommended!",
    author: "Learner",
  },
]

export default function WhyTestimonials() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-16">
          {/* Why Choose */}
          <div className="lg:col-span-3">
            <div className="section-label text-left mb-8">Why Choose Axis</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
              {reasons.map((reason, i) => (
                <motion.div
                  key={reason.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="text-center group"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full border border-gold-500/40 flex items-center justify-center group-hover:bg-gold-500 group-hover:border-gold-500 transition-all duration-300">
                    <reason.icon className="w-5 h-5 text-gold-500 group-hover:text-navy-900 transition-colors" />
                  </div>
                  <h4 className="text-xs font-semibold text-navy-900 leading-tight">
                    {reason.label}
                  </h4>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-semibold text-navy-900 mb-8">
              What Parents & Learners Say
            </h3>
            <div className="space-y-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                  className="bg-gray-50 rounded-2xl p-6 relative"
                >
                  <span className="absolute top-4 left-4 text-6xl text-gold-500/30 font-serif leading-none">"</span>
                  <p className="text-navy-600/80 text-sm leading-relaxed italic pl-6">
                    {t.quote}
                  </p>
                  <p className="text-right text-navy-900 font-semibold text-sm mt-4">
                    — {t.author}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-6">
              <span className="w-2 h-2 rounded-full bg-gold-500" />
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="w-2 h-2 rounded-full bg-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}