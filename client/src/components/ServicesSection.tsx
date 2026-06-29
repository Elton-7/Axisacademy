import { motion } from 'framer-motion'
import { Home, GraduationCap, Languages, Star, Trophy, HeartHandshake, ArrowRight } from 'lucide-react'
import { useScrollAnimation } from '../hooks'

const services = [
  {
    icon: Home,
    title: 'Homeschooling',
    description: 'Personalized homeschooling support for learners of all ages.',
    items: ['CBC', 'Cambridge', 'IGCSE', 'A Levels', 'International Programmes', 'Customized Learning Plans'],
  },
  {
    icon: GraduationCap,
    title: 'Academic Support',
    description: 'Subject tutoring and examination preparation.',
    items: ['Mathematics', 'Sciences', 'Languages', 'Humanities', 'Business Studies', 'Examination Preparation'],
  },
  {
    icon: Languages,
    title: 'Language Programmes',
    description: 'French, German, Arabic, Swahili, English Language Support',
    items: ['School Learners', 'University Students', 'Professionals', 'Travellers', 'Migrants', 'Personal Enrichment'],
  },
  {
    icon: Star,
    title: 'Enrichment Programmes',
    description: '',
    items: ['Chess', 'Public Speaking', 'Debate', 'Acting & Theatre', 'Creative Writing', 'Coding', 'Robotics', 'Entrepreneurship', 'Financial Literacy', 'Leadership Development', 'Study Skills', 'Career Guidance', 'Mentorship'],
  },
  {
    icon: Trophy,
    title: 'Sports & Recreation',
    description: '',
    items: ['Swimming', 'Skating', 'Football', 'Basketball', 'Athletics', 'Outdoor Activities'],
  },
  {
    icon: HeartHandshake,
    title: 'Special Learner Support',
    description: 'Support for learners with diverse educational needs.',
    items: ['Personalized learning pathways designed to help every learner succeed.'],
  },
]

export default function ServicesSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} id="services" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-label mb-4">Our Services</div>
        <h2 className="text-3xl font-semibold text-navy-900 text-center mb-16">
          Comprehensive Programmes for Every Learner
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-100 card-hover group"
            >
              <div className="w-14 h-14 rounded-xl bg-navy-900 flex items-center justify-center mb-6 group-hover:bg-gold-500 transition-colors duration-300">
                <service.icon className="w-7 h-7 text-gold-500 group-hover:text-navy-900 transition-colors duration-300" />
              </div>
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wide mb-3">
                {service.title}
              </h3>
              {service.description && (
                <p className="text-navy-600/70 text-sm mb-4">{service.description}</p>
              )}
              <ul className="space-y-2 mb-6">
                {service.items.map((item) => (
                  <li key={item} className="text-navy-600/70 text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a 
                href="/services" 
                className="inline-flex items-center gap-2 text-gold-600 text-sm font-semibold uppercase tracking-wide hover:text-gold-700 transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}