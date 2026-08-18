import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Clock, Network, Globe, Lightbulb, TrendingUp, Users, Heart, Leaf } from 'lucide-react'
import { useScrollAnimation } from '../hooks'
import { testimonialsApi } from '../services/apiClient'
import type { Testimonial } from '../types'
import { Link } from 'react-router-dom'

const reasons = [
  { icon: User, label: 'Personalized Learning' },
  { icon: Clock, label: 'Flexible Scheduling' },
  { icon: Network, label: 'A National Educator Network' },
  { icon: Globe, label: 'Local & International Curricula' },
  { icon: Lightbulb, label: 'Languages & Life Skills' },
  { icon: TrendingUp, label: 'Academic & Personal Development' },
  { icon: Users, label: 'Supportive Learning Community' },
  { icon: Heart, label: 'Special Learner Support' },
  { icon: Leaf, label: 'Holistic Education Approach' },
]

/**
 * Brief §21: "We should avoid generic fake-sounding testimonials. The objective
 * is credibility."
 *
 * Two invented quotes used to sit here, attributed to nothing more specific
 * than "Parent" and "Learner" — which is the exact failure the brief names.
 * Real testimonials come from the database once Axis has collected them with
 * permission, and until then the section says so plainly.
 */

export default function WhyTestimonials() {
  const { ref, isVisible } = useScrollAnimation()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    testimonialsApi
      .getAll()
      .then((items) => setTestimonials(items.filter((item) => item.isActive)))
      // A quiet failure is right here: the page is still useful without them.
      .catch(() => setTestimonials([]))
  }, [])

  return (
    <section ref={ref} className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="section-label mb-8 text-left">Why Choose Axis</h2>
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
                  <h3 className="text-xs font-semibold leading-tight text-navy">
                    {reason.label}
                  </h3>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-8 text-2xl font-semibold text-navy">
              What parents and learners say
            </h2>
            {testimonials.length === 0 ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8">
                <p className="text-sm leading-relaxed text-navy/70">
                  We would rather publish nothing here than invent it. Axis is collecting
                  testimonials from families and learners, and they will appear here once they
                  have been given with permission.
                </p>
                <Link
                  to="/consultation"
                  className="mt-5 inline-block text-sm font-semibold text-gold-700 hover:underline"
                >
                  Speak to a family already with Axis
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {testimonials.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.25 + i * 0.15 }}
                    className="relative rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm"
                  >
                    <span className="absolute left-4 top-4 font-serif text-6xl leading-none text-gold/30">"</span>
                    <p className="pl-6 text-sm leading-relaxed italic text-navy/70">{t.text}</p>
                    <p className="mt-4 text-right text-sm font-semibold text-navy">
                      — {t.author}
                      {t.role ? `, ${t.role}` : ''}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}