import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2, AlertCircle, MessageCircle } from 'lucide-react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { contactsApi } from '../services/apiClient'
import { trackConversion } from '../services/analytics'
import type { CreateContactRequest } from '../types'
import { sanitizeContactPayload } from '../utils/sanitize'
import { contact, telHref, mailtoHref, whatsappHref } from '../content/contact'

interface ContactForm extends CreateContactRequest {
  firstName: string
  lastName: string
}

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({ mode: 'onBlur' })

  const onSubmit = async (formData: ContactForm) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      // Combine first and last name into single name field
      const raw = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      }

      const payload = sanitizeContactPayload({ ...raw, programme: formData.programme })
      await contactsApi.submit(payload)
      setIsSuccess(true)
      trackConversion('consultation_requested')
      toast.success('Message sent successfully! We will get back to you soon.')
      reset()
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error: unknown) {
      console.error('Contact form error:', error)
      let message = 'We could not send your message. Please try again later.'
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { error?: string; errors?: Array<{ msg?: string }> } | undefined
        const validationMessage = responseData?.errors?.[0]?.msg
        if (validationMessage) {
          message = validationMessage
        } else if (error.response?.status === 429) {
          message = 'Too many messages were sent recently. Please wait a few minutes and try again.'
        } else if (error.code === 'ECONNABORTED' || !error.response) {
          message = 'We could not reach the server. Please check your connection and try again.'
        } else if (responseData?.error) {
          message = responseData.error
        }
      }
      setSubmitError(message)
      toast.error(message)
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

      <section className="py-24 bg-surface-sunk">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-ink mb-6">Contact Information</h3>
                <div className="space-y-5">
                  {/*
                    Consultations are booked by phone, WhatsApp or email rather
                    than on the site, so each channel is a real link — most
                    visitors arrive on a phone and should be one tap away.
                  */}
                  <a href={telHref} onClick={() => trackConversion('phone_clicked')} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Phone</p>
                      <p className="text-ink-muted/70 text-sm group-hover:text-gold-700">{contact.phoneDisplay}</p>
                    </div>
                  </a>
                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackConversion('whatsapp_opened')}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">WhatsApp</p>
                      <p className="text-ink-muted/70 text-sm group-hover:text-gold-700">
                        Message us to book a consultation
                      </p>
                    </div>
                  </a>
                  <a href={mailtoHref} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Email</p>
                      <p className="text-ink-muted/70 text-sm group-hover:text-gold-700">{contact.email}</p>
                    </div>
                  </a>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Location</p>
                      <p className="text-ink-muted/70 text-sm">Nairobi, Kenya</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Hours</p>
                      <p className="text-ink-muted/70 text-sm">Mon - Sat: 8:00 AM - 6:00 PM</p>
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
                  href={whatsappHref()} 
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
              <div className="bg-surface rounded-2xl p-8 md:p-10 border border-line shadow-sm">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 text-positive mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-ink mb-2">Message Sent!</h3>
                    <p className="text-ink-muted/70">We'll get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                    {submitError && (
                      <div role="alert" className="flex items-start gap-3 rounded-lg border border-line-critical bg-tint-critical px-4 py-3 text-sm text-critical">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>{submitError}</p>
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-ink mb-2">First Name *</label>
                        <input
                          {...register('firstName', { required: 'First name is required', validate: value => value.trim().length > 0 || 'First name is required', maxLength: { value: 50, message: 'First name must be 50 characters or fewer' } })}
                          className="w-full px-4 py-3 rounded-lg border border-line focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="John"
                        />
                        {errors.firstName && <p className="text-critical text-xs mt-1">{errors.firstName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink mb-2">Last Name *</label>
                        <input
                          {...register('lastName', { required: 'Last name is required', validate: value => value.trim().length > 0 || 'Last name is required', maxLength: { value: 50, message: 'Last name must be 50 characters or fewer' } })}
                          className="w-full px-4 py-3 rounded-lg border border-line focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="Doe"
                        />
                        {errors.lastName && <p className="text-critical text-xs mt-1">{errors.lastName.message}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-ink mb-2">Email *</label>
                        <input
                          type="email"
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                            maxLength: { value: 100, message: 'Email must be 100 characters or fewer' }
                          })}
                          className="w-full px-4 py-3 rounded-lg border border-line focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-critical text-xs mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink mb-2">Phone</label>
                        <input
                          {...register('phone', { pattern: { value: /^[0-9+()\s-]{6,20}$/, message: 'Enter a valid phone number' }, maxLength: { value: 20, message: 'Phone must be 20 characters or fewer' } })}
                          className="w-full px-4 py-3 rounded-lg border border-line focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="{contact.phoneDisplay}"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">Interested Programme</label>
                      <select
                        {...register('programme')}
                        className="w-full px-4 py-3 rounded-lg border border-line focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all bg-surface"
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
                      <label className="block text-sm font-medium text-ink mb-2">Subject *</label>
                      <input
                        {...register('subject', { required: 'Subject is required', validate: value => value.trim().length > 0 || 'Subject is required', maxLength: { value: 100, message: 'Subject must be 100 characters or fewer' } })}
                        maxLength={100}
                        className="w-full px-4 py-3 rounded-lg border border-line focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                        placeholder="How can we help?"
                      />
                      {errors.subject && <p className="text-critical text-xs mt-1">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">Message *</label>
                      <textarea
                        {...register('message', { required: 'Message is required', validate: value => value.trim().length > 0 || 'Message is required', maxLength: { value: 2000, message: 'Message must be 2,000 characters or fewer' } })}
                        maxLength={2000}
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-line focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all resize-none"
                        placeholder="Tell us about your learning goals..."
                      />
                      {errors.message && <p className="text-critical text-xs mt-1">{errors.message.message}</p>}
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