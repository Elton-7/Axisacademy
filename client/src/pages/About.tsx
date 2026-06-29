import { motion } from 'framer-motion'
import { Target, Eye, Award, Users, BookOpen, Heart } from 'lucide-react'
import { useScrollAnimation } from '../hooks'

const stats = [
  { icon: Users, value: '500+', label: 'Students Enrolled' },
  { icon: Award, value: '50+', label: 'Qualified Instructors' },
  { icon: BookOpen, value: '25+', label: 'Programmes Offered' },
  { icon: Heart, value: '98%', label: 'Satisfaction Rate' },
]

const values = [
  { title: 'Excellence', desc: 'We strive for the highest standards in education and personal development.' },
  { title: 'Innovation', desc: 'We embrace modern teaching methods and technologies to enhance learning.' },
  { title: 'Inclusivity', desc: 'We welcome learners of all backgrounds, abilities, and aspirations.' },
  { title: 'Integrity', desc: 'We operate with honesty, transparency, and ethical responsibility.' },
]

export default function About() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-navy-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label mb-4">About Us</div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">
              Who We Are
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              A learner-centred educational institution dedicated to providing personalized 
              learning solutions for children, teenagers, and adults.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-navy-900 mx-auto mb-3" />
                <div className="text-3xl font-bold text-navy-900 mb-1">{stat.value}</div>
                <div className="text-navy-800/80 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section ref={ref} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 rounded-2xl p-10"
            >
              <Target className="w-12 h-12 text-gold-500 mb-6" />
              <h2 className="text-2xl font-semibold text-navy-900 mb-4">Our Mission</h2>
              <p className="text-navy-600/80 leading-relaxed">
                To develop learners whom the world needs more than they need the world. We achieve this 
                by providing personalized, high-quality education that nurtures critical thinking, creativity, 
                and character development.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-50 rounded-2xl p-10"
            >
              <Eye className="w-12 h-12 text-gold-500 mb-6" />
              <h2 className="text-2xl font-semibold text-navy-900 mb-4">Our Vision</h2>
              <p className="text-navy-600/80 leading-relaxed">
                To build a world where learners are creators of opportunity, not merely seekers of it. 
                We envision an educational ecosystem that empowers every individual to discover their 
                unique potential and contribute meaningfully to society.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-label mb-4">Our Values</div>
          <h2 className="text-3xl font-semibold text-navy-900 text-center mb-16">
            What Drives Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 border border-gray-100 card-hover"
              >
                <h3 className="text-lg font-semibold text-navy-900 mb-3">{value.title}</h3>
                <p className="text-navy-600/70 text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}