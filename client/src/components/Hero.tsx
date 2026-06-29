import { motion } from 'framer-motion'
import { Phone, GraduationCap, MessageCircle, User, Clock, Heart, Sparkles } from 'lucide-react'
import { useScrollAnimation } from '../hooks'

const features = [
  { icon: User, label: 'Personalized\nLearning' },
  { icon: GraduationCap, label: 'Qualified\nInstructors' },
  { icon: Clock, label: 'Flexible\nOptions' },
  { icon: Heart, label: 'Holistic\nDevelopment' },
]

const highlights = [
  { value: '1:1', label: 'Personalized guidance' },
  { value: '100%', label: 'Learner-centred support' },
  { value: '24/7', label: 'Flexible scheduling' },
]

export default function Hero() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="relative flex min-h-[760px] items-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.16),_transparent_32%),linear-gradient(135deg,_#06101f_0%,_#13223f_100%)] pt-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-10 top-20 h-96 w-96 rounded-full border border-gold-500" />
        <div className="absolute bottom-18 right-20 h-64 w-64 rounded-full border border-gold-500" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/10 px-4 py-2 text-sm text-gold-light backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Trusted by families seeking a calmer, stronger learning journey
            </div>

            <h1 className="mb-6 text-5xl font-light leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Education<br />
              Tailored To<br />
              <span className="font-serif text-gold-500 italic">The Learner.</span>
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/75">
              Personalized homeschooling, academic support, languages, and enrichment programmes
              designed around each learner’s goals, strengths, interests, and aspirations.
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              <a href="/contact" className="btn-primary">
                <MessageCircle className="h-4 w-4" />
                Enroll Now
              </a>
              <a href="/contact" className="btn-secondary">
                <GraduationCap className="h-4 w-4" />
                Book a Consultation
              </a>
              <a href="tel:0737003007" className="btn-navy bg-white/10 border border-white/20 hover:bg-white/20">
                <Phone className="h-4 w-4" />
                Call 0737 003 007
              </a>
            </div>

            <div className="mb-8 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-lg font-semibold text-gold-500">{item.value}</p>
                  <p className="text-sm text-white/70">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/40">
                    <feature.icon className="h-4 w-4 text-gold-500" />
                  </div>
                  <span className="text-sm whitespace-pre-line text-white/80">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto grid max-w-xl grid-cols-2 gap-3">
              <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full border-2 border-gold-500/30" />

              <div className="row-span-2 h-[420px] overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=600&fit=crop&q=80"
                  alt="Student learning"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />
              </div>
              <div className="h-[200px] overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop&q=80"
                  alt="Science student"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="h-[200px] overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&q=80"
                  alt="Student writing"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="col-span-2 h-[180px] overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1529390079861-591f1bfe7d1f?w=800&h=300&fit=crop&q=80"
                  alt="Activities"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}