import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Home, GraduationCap, Languages, Star, Activity, HeartHandshake, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const iconMap = {
  'Home': Home,
  'GraduationCap': GraduationCap,
  'Languages': Languages,
  'Star': Star,
  'Activity': Activity,
  'HeartHandshake': HeartHandshake,
}

export default function ServicesSection() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/services')
      .then(res => {
        setServices(res.data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback data if API fails
        setServices([
          {
            id: 1, title: 'Homeschooling', icon: 'Home',
            description: 'Personalized homeschooling support for learners of all ages.',
            items: ['CBC', 'Cambridge', 'IGCSE', 'A Levels', 'International Programmes', 'Customized Learning Plans']
          },
          {
            id: 2, title: 'Academic Support', icon: 'GraduationCap',
            description: 'Subject tutoring and examination preparation.',
            items: ['Mathematics', 'Sciences', 'Languages', 'Humanities', 'Business Studies', 'Examination Preparation']
          },
          {
            id: 3, title: 'Language Programmes', icon: 'Languages',
            description: 'French, German, Arabic, Swahili, English Language Support',
            items: ['School Learners', 'University Students', 'Professionals', 'Travellers', 'Migrants', 'Personal Enrichment']
          },
          {
            id: 4, title: 'Enrichment Programmes', icon: 'Star',
            description: 'Chess, Public Speaking, Debate, Acting & Theatre, Creative Writing, Coding, Robotics, Entrepreneurship, Financial Literacy, Leadership Development, Study Skills, Career Guidance, Mentorship',
            items: ['Chess', 'Public Speaking', 'Debate', 'Acting & Theatre', 'Creative Writing', 'Coding', 'Robotics', 'Entrepreneurship']
          },
          {
            id: 5, title: 'Sports & Recreational', icon: 'Activity',
            description: 'Physical activities and outdoor programmes.',
            items: ['Swimming', 'Skating', 'Football', 'Basketball', 'Athletics', 'Outdoor Activities']
          },
          {
            id: 6, title: 'Special Learner Support', icon: 'HeartHandshake',
            description: 'Support for learners with diverse educational needs.',
            items: ['Personalized learning pathways designed to help every learner succeed.']
          },
        ])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="py-20 text-center">Loading services...</div>

  return (
    <section id="services" className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="section-label">Our Services</div>
        <h3 className="text-2xl lg:text-3xl text-navy font-semibold text-center mb-12">
          Comprehensive Programmes for Every Learner
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {services.map((service, i) => {
            const IconComponent = iconMap[service.icon] || Star
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <IconComponent size={32} className="text-navy mb-4" />
                <h4 className="text-navy text-xs uppercase tracking-wider font-semibold mb-3">{service.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">{service.description}</p>
                <ul className="text-left list-disc pl-4 mb-4 space-y-1">
                  {service.items.slice(0, 6).map((item, j) => (
                    <li key={j} className="text-gray-500 text-[11px]">{item}</li>
                  ))}
                </ul>
                <Link to={`/services`} className="text-gold text-xs font-semibold uppercase flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More <ArrowRight size={12} />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
