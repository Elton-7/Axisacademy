import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AlertCircle, CheckCircle, Clock, Loader2, MessageCircle, Phone, Send } from 'lucide-react'
import { enrollmentsApi } from '../services/apiClient'
import { trackConversion } from '../services/analytics'
import { contact, telHref, whatsappHref, SITE_URL } from '../content/contact'
import type { CreateConsultationRequest } from '../types'
import { Link } from 'react-router-dom'

/**
 * Booking a consultation (brief §3.2, §13).
 *
 * Deliberately short. A parent should not have to know which programme,
 * curriculum or age band applies before asking for a conversation — working
 * that out is the point of the consultation. The full enquiry form at /enroll
 * exists for families who already know what they want.
 *
 * The request enters the same pipeline as an enquiry so it can be tracked, and
 * WhatsApp and phone sit alongside for anyone who would rather just talk now.
 */

const inputClass =
  'w-full rounded-lg border border-line px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'

type FormValues = CreateConsultationRequest

export default function Consultation() {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { contactConsent: false } })

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    try {
      await enrollmentsApi.requestConsultation({
        ...values,
        learnerAge: values.learnerAge ? Number(values.learnerAge) : undefined,
      })
      trackConversion('consultation_requested')
      setSubmitted(true)
      toast.success('Consultation requested')
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.errors?.[0]?.msg || error.response?.data?.error
        : null
      setSubmitError(message || 'We could not send your request. Please try again, or reach us on WhatsApp.')
    }
  }

  const canonical = `${SITE_URL}/consultation`

  return (
    <div className="pt-20">
      <Helmet>
        <title>Book a Consultation | Axis Learning</title>
        <meta
          name="description"
          content="Talk to an Axis Learning education consultant about your learner. Tell us when suits you and we will confirm a time by WhatsApp, phone or email."
        />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Book a Consultation | Axis Learning" />
        <meta property="og:description" content="Talk to an Axis Learning education consultant about your learner." />
        <meta property="og:url" content={canonical} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="section-label mb-4">Book a Consultation</div>
            <h1 className="mb-5 text-4xl font-semibold text-white md:text-5xl">
              Talk to an education consultant
            </h1>
            <p className="text-lg leading-relaxed text-white/70">
              You do not need to know which programme or curriculum you want. Tell us a little about
              your learner and when you are free, and we will take it from there.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Talk now, for anyone who would rather not fill in a form */}
      <section className="border-b border-line bg-surface py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-center">
          <p className="text-sm text-ink-muted">Would rather just talk?</p>
          <a
            href={whatsappHref('Hello Axis Learning, I would like to book a consultation about my learner.')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackConversion('whatsapp_opened')}
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp us
          </a>
          <a
            href={telHref}
            onClick={() => trackConversion('phone_clicked')}
            className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-gold-500"
          >
            <Phone className="h-4 w-4" /> {contact.phoneDisplay}
          </a>
        </div>
      </section>

      <section className="bg-surface-sunk px-4 py-16 sm:px-6 lg:px-8">
        {submitted ? (
          <div className="mx-auto max-w-2xl rounded-2xl bg-surface p-10 text-center shadow-sm">
            <CheckCircle className="mx-auto mb-5 h-14 w-14 text-positive" />
            <h2 className="text-2xl font-semibold text-ink">Thank you — we have your request</h2>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-muted">
              An Axis education consultant will contact you to confirm a time, normally within one
              working day. If it is urgent, message us on WhatsApp and we will pick it up sooner.
            </p>
            <a
              href={whatsappHref('Hello Axis Learning, I have just requested a consultation.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mx-auto max-w-2xl space-y-6 rounded-2xl bg-surface p-8 shadow-sm md:p-10"
          >
            {submitError && (
              <div role="alert" className="flex items-start gap-3 rounded-lg border border-line-critical bg-tint-critical px-4 py-3 text-sm text-critical">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="parentName" className="mb-2 block text-sm font-medium text-ink">
                  Your name *
                </label>
                <input id="parentName" autoComplete="name" {...register('parentName', { required: 'Please tell us your name' })} className={inputClass} />
                {errors.parentName && <p className="mt-1 text-xs text-critical">{errors.parentName.message}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-ink">
                  Phone or WhatsApp
                </label>
                <input id="phone" type="tel" autoComplete="tel" placeholder="07XX XXX XXX" {...register('phone')} className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
                Email *
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'We need an email to reply to',
                  pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Please check this email address' },
                })}
                className={inputClass}
              />
              {errors.email && <p className="mt-1 text-xs text-critical">{errors.email.message}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="studentName" className="mb-2 block text-sm font-medium text-ink">
                  Learner’s name <span className="font-normal text-ink-muted/60">(optional)</span>
                </label>
                <input id="studentName" {...register('studentName')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="learnerAge" className="mb-2 block text-sm font-medium text-ink">
                  Learner’s age <span className="font-normal text-ink-muted/60">(optional)</span>
                </label>
                <input id="learnerAge" type="number" min={1} max={100} {...register('learnerAge')} className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="mb-2 block text-sm font-medium text-ink">
                What is on your mind?
              </label>
              <textarea
                id="notes"
                rows={4}
                {...register('notes', { maxLength: { value: 2000, message: 'Please keep this under 2,000 characters' } })}
                className={`${inputClass} resize-none`}
                placeholder="In your own words — what is going well, what is not, or what you are hoping to change. There is no wrong answer here."
              />
              {errors.notes && <p className="mt-1 text-xs text-critical">{errors.notes.message}</p>}
            </div>

            <div className="rounded-xl bg-surface-sunk p-5">
              <p className="mb-4 flex items-center gap-2 text-sm font-medium text-ink">
                <Clock className="h-4 w-4 text-gold-600" /> When suits you?
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="preferredDays" className="mb-2 block text-sm text-ink-muted">
                    Preferred days
                  </label>
                  <input id="preferredDays" placeholder="e.g. Weekday mornings" {...register('preferredDays')} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="preferredTimes" className="mb-2 block text-sm text-ink-muted">
                    Preferred times
                  </label>
                  <input id="preferredTimes" placeholder="e.g. After 4pm" {...register('preferredTimes')} className={inputClass} />
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="preferredChannel" className="mb-2 block text-sm text-ink-muted">
                  How would you like us to reach you?
                </label>
                <select id="preferredChannel" {...register('preferredChannel')} className={inputClass}>
                  <option value="">No preference</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Phone call</option>
                  <option value="email">Email</option>
                  <option value="in-person">In person</option>
                </select>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-surface-sunk p-4 text-sm text-ink-muted">
              <input
                type="checkbox"
                {...register('contactConsent', { required: 'Please confirm that Axis may contact you' })}
                className="mt-0.5 h-4 w-4 rounded border-line-strong text-gold-600 focus:ring-gold-500"
              />
              <span>
                Axis Learning may contact me about this request. We will not share your details with
                anyone else — see our <Link to="/privacy" className="font-medium text-gold-700 underline">privacy and child safety</Link> page.
              </span>
            </label>
            {errors.contactConsent && <p className="text-xs text-critical">{errors.contactConsent.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSubmitting ? 'Sending...' : 'Request a consultation'}
            </button>

            <p className="text-center text-xs text-ink-faint">
              We normally confirm a time within one working day. Nothing is charged for a consultation.
            </p>
          </form>
        )}
      </section>
    </div>
  )
}
