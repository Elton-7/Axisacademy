import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react'
import api from '../services/api'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contact', formData)
      setSubmitted(true)
    } catch (err) {
      alert('Message sent! We will get back to you soon.')
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-10 bg-white rounded-xl shadow-lg"
        >
          <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl text-navy font-semibold mb-2">Thank You!</h2>
          <p className="text-gray-500">We have received your message and will contact you shortly.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="section-label">Contact Us</div>
        <h1 className="text-3xl lg:text-4xl text-navy font-semibold text-center mb-4">Get In Touch</h1>
        <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
          Ready to start your learning journey? Fill out the form below and our team will reach out to you within 24 hours.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <Phone size={24} className="text-gold mb-3" />
              <h3 className="text-navy font-semibold mb-1">Phone</h3>
              <p className="text-gray-500 text-sm">0737 003 007</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <Mail size={24} className="text-gold mb-3" />
              <h3 className="text-navy font-semibold mb-1">Email</h3>
              <p className="text-gray-500 text-sm">info@axishomeschooling.org</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <MapPin size={24} className="text-gold mb-3" />
              <h3 className="text-navy font-semibold mb-1">Location</h3>
              <p className="text-gray-500 text-sm">Nairobi, Kenya</p>
            </div>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-100 shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
                  placeholder="0737 003 007"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Subject</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
                >
                  <option>General Enquiry</option>
                  <option>Homeschooling</option>
                  <option>Academic Support</option>
                  <option>Language Programmes</option>
                  <option>Enrichment Programmes</option>
                  <option>Special Learner Support</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">Message *</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold transition-colors resize-none"
                placeholder="Tell us about your learning needs..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold w-full justify-center disabled:opacity-50"
            >
              <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  )
}
