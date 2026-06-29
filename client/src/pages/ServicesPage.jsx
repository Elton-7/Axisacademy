import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Home, GraduationCap, Languages, Star, Activity, HeartHandshake, ArrowRight, Check } from 'lucide-react'
import api from '../services/api'

const iconMap = {
  'Home': Home, 'GraduationCap': GraduationCap, 'Languages': Languages,
  'Star': Star, 'Activity': Activity, 'HeartHandshake': HeartHandshake,
}

export default function ServicesPage() {
  const [services, setServices] = useState([])

  useEffect(() => {
    api.get('/services').then(res => setServices(res.data)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="section-label">Our Services</div>
        <h1 className="text-3xl lg:text-4xl text-navy font-semibold text-center mb-4">All Programmes</h1>
        <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
          Comprehensive educational solutions designed to meet every learner's unique needs and aspirations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] || Star
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white p-8 rounded-xl border border-gray-100 hover:shadow-xl transition-all"
              >
                <Icon size={36} className="text-navy mb-4" />
                <h3 className="text-lg text-navy font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-500 text-sm mb-6">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-600 text-sm">
                      <Check size={14} className="text-gold" /> {item}
                    </li>
                  ))}
                </ul>
                <button className="text-gold text-sm font-semibold uppercase flex items-center gap-1 hover:gap-2 transition-all">
                  Enquire Now <ArrowRight size={14} />
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
