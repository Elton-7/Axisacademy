import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Clock, GraduationCap, Globe, Lightbulb, TrendingUp, Users, Heart, Leaf } from 'lucide-react'
import api from '../services/api'

const whyItems = [
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

export default function WhyTestimonialsSection() {
  const [testimonials, setTestimonials] = useState([])
  const [activeDot, setActiveDot] = useState(0)

  useEffect(() => {
    api.get('/testimonials')
      .then(res => setTestimonials(res.data))
      .catch(() => setTestimonials([
        { id: 1, text: 'Axis has been a blessing for our family. The personalized attention and flexibility have helped our child excel academically and build confidence.', author: 'Parent' },
        { id: 2, text: 'The support I received from Axis tutors helped me improve my grades and discover new interests. Highly recommended!', author: 'Learner' },
        { id: 3, text: 'Professional, caring, and results-driven. Axis transformed my daughter\'s academic journey completely.', author: 'Parent' },
      ]))
  }, [])

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Why Choose */}
        <div className="lg:col-span-3">
          <div className="section-label text-left">Why Choose Axis</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-6">
            {whyItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="text-center"
              >
                <div className="w-12 h-12 border border-gold rounded-full flex items-center justify-center mx-auto mb-3 text-gold">
                  <item.icon size={18} />
                </div>
                <h5 className="text-navy text-xs font-semibold leading-tight">{item.label}</h5>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="lg:col-span-2">
          <h3 className="text-xl text-navy font-semibold mb-6">What Parents & Learners Say</h3>
          <div className="space-y-5">
            {testimonials.slice(0, 2).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="bg-gray-50 p-6 rounded-xl relative"
              >
                <span className="text-gold text-5xl font-serif absolute top-2 left-4">"</span>
                <p className="text-gray-500 text-sm leading-relaxed pl-8 italic">{t.text}</p>
                <p className="text-right text-navy text-xs font-semibold mt-4">— {t.author}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map(i => (
              <button
                key={i}
                onClick={() => setActiveDot(i)}
                className={`w-2 h-2 rounded-full transition-colors ${activeDot === i ? 'bg-gold' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
