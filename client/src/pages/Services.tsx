import { motion } from 'framer-motion'
import { Home, GraduationCap, Languages, Star, Trophy, HeartHandshake, ArrowRight, CheckCircle } from 'lucide-react'

const services = [
  {
    icon: Home,
    title: 'Homeschooling',
    description: 'Comprehensive homeschooling support tailored to each family's needs and educational goals.',
    features: ['CBC Curriculum', 'Cambridge International', 'IGCSE Preparation', 'A Levels Support', 'Custom Learning Plans', 'Progress Tracking'],
    color: 'bg-blue-50',
  },
  {
    icon: GraduationCap,
    title: 'Academic Support',
    description: 'Expert tutoring across all subjects with proven results in examination preparation.',
    features: ['Mathematics', 'Sciences', 'Languages', 'Humanities', 'Business Studies', 'Exam Prep'],
    color: 'bg-emerald-50',
  },
  {
    icon: Languages,
    title: 'Language Programmes',
    description: 'Master new languages with immersive, practical instruction for all proficiency levels.',
    features: ['French', 'German', 'Arabic', 'Swahili', 'English Support', 'Cultural Immersion'],
    color: 'bg-purple-50',
  },
  {
    icon: Star,
    title: 'Enrichment Programmes',
    description: 'Develop critical life skills beyond academics through engaging enrichment activities.',
    features: ['Chess & Strategy', 'Public Speaking', 'Creative Writing', 'Coding & Robotics', 'Entrepreneurship', 'Leadership'],
    color: 'bg-amber-50',
  },
  {
    icon: Trophy,
    title: 'Sports & Recreation',
    description: 'Build physical fitness, teamwork, and discipline through structured sports programmes.',
    features: ['Swimming', 'Football', 'Basketball', 'Athletics', 'Skating', 'Outdoor Adventures'],
    color: 'bg-rose-50',
  },
  {
    icon: HeartHandshake,
    title: 'Special Learner Support',
    description: 'Personalized pathways for learners with diverse educational needs and abilities.',
    features: ['Individual Assessment', 'Adaptive Curriculum', 'Specialist Instructors', 'Progress Monitoring', 'Family Support', 'Inclusive Environment'],
    color: 'bg-teal-50',
  },
]

export default function Services() {
  return (
    <div className="pt-20">
      <section className="bg-navy-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label mb-4">Our Services</div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">
              Comprehensive Programmes
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              From homeschooling to enrichment, we offer a full spectrum of educational services 
              designed to help every learner succeed.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover group"
              >
                <div className={`${service.color} p-8`}>
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                    <service.icon className="w-7 h-7 text-navy-900" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy-900 mb-2">{service.title}</h3>
                  <p className="text-navy-600/70 text-sm leading-relaxed">{service.description}</p>
                </div>
                <div className="p-8">
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-navy-700">
                        <CheckCircle className="w-4 h-4 text-gold-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="inline-flex items-center gap-2 text-gold-600 font-semibold text-sm uppercase tracking-wide hover:text-gold-700 transition-colors group/btn">
                    Enquire Now
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}