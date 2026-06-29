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
    <section ref={ref} id="services" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-label mb-4">Our Services</div>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-navy sm:text-4xl">
            Comprehensive programmes for every learner.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-navy/70">
            From academic support to enrichment and wellbeing, each programme is designed to build confidence, curiosity, and real progress.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm card-hover"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy transition-colors duration-300 group-hover:bg-gold">
                <service.icon className="h-7 w-7 text-gold transition-colors duration-300 group-hover:text-navy" />
              </div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy">
                {service.title}
              </h3>
              {service.description && (
                <p className="mb-4 text-sm leading-relaxed text-navy/70">{service.description}</p>
              )}
              <ul className="mb-6 space-y-2">
                {service.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-navy/70">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold transition-colors hover:text-gold-dark"
              >
                Learn More
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}