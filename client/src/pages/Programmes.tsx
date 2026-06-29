import { motion } from 'framer-motion'
import { Calendar, Clock, Users, BookOpen, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const programmes = [
  {
    id: 'cbc',
    title: 'CBC Programme',
    category: 'Curriculum',
    duration: 'Full Academic Year',
    schedule: 'Flexible',
    students: '1-on-1 or Small Groups',
    description: 'Comprehensive Competency-Based Curriculum support aligned with the Kenyan education system.',
    highlights: ['Individual Learning Plans', 'Regular Assessments', 'Parent Progress Reports', 'Interactive Learning Materials'],
  },
  {
    id: 'cambridge',
    title: 'Cambridge International',
    category: 'International',
    duration: 'Full Academic Year',
    schedule: 'Flexible',
    students: '1-on-1 or Small Groups',
    description: 'World-class Cambridge curriculum delivered with personalized attention and expert guidance.',
    highlights: ['IGCSE Preparation', 'A-Level Support', 'Exam Registration Assistance', 'University Pathway Guidance'],
  },
  {
    id: 'language',
    title: 'Intensive Language Course',
    category: 'Languages',
    duration: '8-12 Weeks',
    schedule: '2-3 Sessions/Week',
    students: 'Small Groups (4-8)',
    description: 'Immersive language learning in French, German, Arabic, or Swahili with native-level instructors.',
    highlights: ['Conversational Focus', 'Cultural Context', 'Certification Prep', 'Real-world Practice'],
  },
  {
    id: 'enrichment',
    title: 'Summer Enrichment Camp',
    category: 'Enrichment',
    duration: '4-6 Weeks',
    schedule: 'Full Day',
    students: 'Groups (10-15)',
    description: 'A dynamic summer programme combining academics, sports, arts, and life skills development.',
    highlights: ['STEM Activities', 'Sports & Recreation', 'Arts & Crafts', 'Field Trips'],
  },
  {
    id: 'special',
    title: 'Special Needs Support',
    category: 'Special Support',
    duration: 'Ongoing',
    schedule: 'Customized',
    students: '1-on-1',
    description: 'Specialized educational support for learners with diverse needs, delivered with patience and expertise.',
    highlights: ['Individual Assessment', 'Adaptive Methods', 'Family Collaboration', 'Progress Tracking'],
  },
  {
    id: 'exam',
    title: 'Exam Preparation Bootcamp',
    category: 'Academic',
    duration: '4-8 Weeks',
    schedule: 'Intensive',
    students: 'Small Groups (5-10)',
    description: 'Targeted preparation for KCPE, KCSE, IGCSE, and other standardized examinations.',
    highlights: ['Mock Exams', 'Past Paper Practice', 'Study Techniques', 'Stress Management'],
  },
]

const categories = ['All', 'Curriculum', 'International', 'Languages', 'Enrichment', 'Special Support', 'Academic']

export default function Programmes() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All' 
    ? programmes 
    : programmes.filter(p => p.category === activeCategory)

  return (
    <div className="pt-20">
      <section className="bg-navy-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label mb-4">Programmes</div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">
              Our Learning Programmes
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Explore our diverse range of programmes designed to meet every learner's unique needs and goals.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-navy-900 text-white shadow-lg'
                    : 'bg-white text-navy-700 hover:bg-navy-50 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Programme Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((programme, i) => (
              <motion.div
                key={programme.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-3 py-1 rounded-full uppercase tracking-wide">
                      {programme.category}
                    </span>
                    <BookOpen className="w-5 h-5 text-navy-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-3">{programme.title}</h3>
                  <p className="text-navy-600/70 text-sm mb-6 leading-relaxed">{programme.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-navy-600/60">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {programme.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {programme.schedule}
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Users className="w-3.5 h-3.5" />
                      {programme.students}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {programme.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-3.5 h-3.5 text-gold-500" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <a href="/contact" className="btn-primary w-full text-center">
                    Apply Now
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}