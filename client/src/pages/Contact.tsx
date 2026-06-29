import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../utils/api'

interface ContactForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  message: string
  programme: string
}

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>()

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true)
    try {
      await api.post('/contacts', data)
      setIsSuccess(true)
      toast.success('Message sent successfully! We will get back to you soon.')
      reset()
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-20">
      <section className="bg-navy-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label mb-4">Contact Us</div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">
              Get In Touch
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Ready to start your learning journey? Reach out and we'll help you find the perfect programme.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-navy-900 mb-6">Contact Information</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">Phone</p>
                      <p className="text-navy-600/70 text-sm">0737 003 007</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">Email</p>
                      <p className="text-navy-600/70 text-sm">info@axishomeschooling.org</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">Location</p>
                      <p className="text-navy-600/70 text-sm">Nairobi, Kenya</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">Hours</p>
                      <p className="text-navy-600/70 text-sm">Mon - Sat: 8:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-navy-900 rounded-2xl p-6">
                <h4 className="text-white font-semibold mb-3">Quick Response</h4>
                <p className="text-white/60 text-sm mb-4">
                  We typically respond within 24 hours during business days.
                </p>
                <a 
                  href="https://wa.me/254737003007" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold-500 text-sm font-medium hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-navy-900 mb-2">Message Sent!</h3>
                    <p className="text-navy-600/70">We'll get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-navy-900 mb-2">First Name *</label>
                        <input
                          {...register('firstName', { required: 'First name is required' })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="John"
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-900 mb-2">Last Name *</label>
                        <input
                          {...register('lastName', { required: 'Last name is required' })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="Doe"
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-navy-900 mb-2">Email *</label>
                        <input
                          type="email"
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                          })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-900 mb-2">Phone</label>
                        <input
                          {...register('phone')}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="0737 003 007"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-900 mb-2">Interested Programme</label>
                      <select
                        {...register('programme')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all bg-white"
                      >
                        <option value="">Select a programme...</option>
                        <option value="homeschooling">Homeschooling</option>
                        <option value="academic">Academic Support</option>
                        <option value="language">Language Programmes</option>
                        <option value="enrichment">Enrichment Programmes</option>
                        <option value="sports">Sports & Recreation</option>
                        <option value="special">Special Learner Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-900 mb-2">Subject *</label>
                      <input
                        {...register('subject', { required: 'Subject is required' })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                        placeholder="How can we help?"
                      />
                      {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-900 mb-2">Message *</label>
                      <textarea
                        {...register('message', { required: 'Message is required' })}
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all resize-none"
                        placeholder="Tell us about your learning goals..."
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}