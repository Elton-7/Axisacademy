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
    author: 'Parent',
  },
  {
    quote: 'The support I received from Axis tutors helped me improve my grades and discover new interests. Highly recommended!',
    author: 'Learner',
  },
]

export default function WhyTestimonials() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="section-label mb-8 text-left">Why Choose Axis</div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {reasons.map((reason, i) => (
                <motion.div
                  key={reason.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-center shadow-sm"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-white transition-all duration-300 group-hover:bg-gold group-hover:border-gold">
                    <reason.icon className="h-5 w-5 text-gold transition-colors group-hover:text-navy" />
                  </div>
                  <h4 className="text-xs font-semibold leading-tight text-navy">
                    {reason.label}
                  </h4>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-8 text-2xl font-semibold text-navy">
              What parents and learners say
            </h3>
            <div className="space-y-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.15 }}
                  className="relative rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm"
                >
                  <span className="absolute left-4 top-4 font-serif text-6xl leading-none text-gold/30">"</span>
                  <p className="pl-6 text-sm leading-relaxed italic text-navy/70">
                    {t.quote}
                  </p>
                  <p className="mt-4 text-right text-sm font-semibold text-navy">
                    — {t.author}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}