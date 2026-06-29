import { Link } from 'react-router-dom'
import { GraduationCap, Phone, MessageCircle } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="bg-gold py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center text-gold flex-shrink-0">
            <GraduationCap size={28} />
          </div>
          <div>
            <h3 className="text-navy text-xl lg:text-2xl font-semibold mb-2">Begin Your Learning Journey Today</h3>
            <p className="text-navy/80 text-sm leading-relaxed max-w-lg">
              Whether you are seeking homeschooling support, academic tutoring, language learning, enrichment programmes, or personalized educational guidance, Axis is ready to help.
            </p>
            <div className="flex items-center gap-2 text-navy font-semibold text-sm mt-3">
              <Phone size={16} /> Call 0737 003 007
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/contact" className="btn bg-navy text-white hover:bg-navy-light">Enroll Now</Link>
          <Link to="/contact" className="btn border border-navy text-navy hover:bg-navy hover:text-white">Book a Free Consultation</Link>
          <a href="https://wa.me/254737003007" target="_blank" rel="noopener noreferrer" className="btn bg-white text-navy hover:bg-gray-100">
            <MessageCircle size={16} /> WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  )
}
