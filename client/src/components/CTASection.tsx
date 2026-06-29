import { motion } from 'framer-motion'
import { GraduationCap, Phone, MessageCircle } from 'lucide-react'
import { useScrollAnimation } from '../hooks'

export default function CTASection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="py-16 bg-gold-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-8 h-8 text-gold-500" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-navy-900 mb-2">
                Begin Your Learning Journey Today
              </h3>
              <p className="text-navy-800/80 text-sm max-w-xl">
                Whether you are seeking homeschooling support, academic tutoring, language learning, 
                enrichment programmes, or personalized educational guidance, Axis is ready to help.
              </p>
              <a href="tel:0737003007" className="inline-flex items-center gap-2 text-navy-900 font-semibold mt-3 hover:underline">
                <Phone className="w-4 h-4" />
                Call 0737 003 007
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="/contact" className="btn-navy">Enroll Now</a>
            <a href="/contact" className="btn-secondary border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white">
              Book a Free Consultation
            </a>
            <a 
              href="https://wa.me/254737003007" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-900 font-semibold text-sm uppercase tracking-wide rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}