import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle, Loader2, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { enrollmentsApi } from '../services/apiClient'
import { trackConversion } from '../services/analytics'
import type { CreateEnrollmentRequest } from '../types'

const inputClass = 'w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition-all focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'

export default function Enrollment() {
  const [searchParams] = useSearchParams()
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateEnrollmentRequest>({
    mode: 'onBlur',
    defaultValues: { programme: searchParams.get('programme') || '', contactConsent: false },
  })

  const onSubmit = async (formData: CreateEnrollmentRequest) => {
    setSubmitError(null)
    try {
      await enrollmentsApi.create({
        ...formData,
        studentName: formData.studentName.trim(),
        parentName: formData.parentName?.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim(),
        programme: formData.programme.trim(),
        location: formData.location?.trim(),
        currentSchool: formData.currentSchool?.trim(),
        curriculum: formData.curriculum?.trim(),
        gradeClass: formData.gradeClass?.trim(),
        subjects: formData.subjects?.trim(),
        learningNeeds: formData.learningNeeds?.trim(),
        preferredDays: formData.preferredDays?.trim(),
        preferredTimes: formData.preferredTimes?.trim(),
        notes: formData.notes?.trim(),
      })
      setSubmitted(true)
      reset()
      trackConversion('enquiry_submitted', { programme: formData.programme })
      toast.success('Application submitted successfully.')
    } catch (error: unknown) {
      const responseData = axios.isAxiosError(error)
        ? error.response?.data as { error?: string; errors?: Array<{ msg?: string }> } | undefined
        : undefined
      const message = responseData?.errors?.[0]?.msg || responseData?.error || 'We could not submit your application. Please try again later.'
      setSubmitError(message)
      toast.error(message)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 pt-32 pb-16">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white px-8 py-16 text-center shadow-sm">
          <CheckCircle className="mx-auto mb-5 h-16 w-16 text-green-500" />
          <h1 className="mb-3 text-3xl font-semibold text-navy-900">Application received</h1>
          <p className="mb-8 text-navy-600/70">Thank you. Our team will contact you within 24 hours to discuss the next steps.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setSubmitted(false)} className="btn-primary">Submit another application</button>
            <Link to="/" className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-navy-900 hover:bg-gray-50">Return home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20">
      <section className="bg-navy-900 py-20 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <div className="section-label mb-4">Admissions</div>
          <h1 className="mb-5 text-4xl font-semibold text-white md:text-5xl">Start a conversation about your learner</h1>
          <p className="text-lg text-white/70">Tell us what you need. An Axis education consultant will help you identify the right next step.</p>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto max-w-3xl space-y-6 rounded-2xl bg-white p-8 shadow-sm md:p-10">
          {submitError && <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><span>{submitError}</span></div>}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="studentName" className="mb-2 block text-sm font-medium text-navy-900">Learner's name *</label>
              <input id="studentName" {...register('studentName', { required: 'Learner name is required', validate: value => value.trim().length > 0 || 'Learner name is required', maxLength: { value: 100, message: 'Name must be 100 characters or fewer' } })} className={inputClass} />
              {errors.studentName && <p className="mt-1 text-xs text-red-500">{errors.studentName.message}</p>}
            </div>
            <div>
              <label htmlFor="parentName" className="mb-2 block text-sm font-medium text-navy-900">Parent/guardian name</label>
              <input id="parentName" {...register('parentName', { maxLength: { value: 100, message: 'Name must be 100 characters or fewer' } })} className={inputClass} />
              {errors.parentName && <p className="mt-1 text-xs text-red-500">{errors.parentName.message}</p>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="learnerAge" className="mb-2 block text-sm font-medium text-navy-900">Learner age</label>
              <input id="learnerAge" type="number" min="1" max="100" {...register('learnerAge', { valueAsNumber: true, min: { value: 1, message: 'Age must be at least 1' }, max: { value: 100, message: 'Enter a valid age' } })} className={inputClass} />
              {errors.learnerAge && <p className="mt-1 text-xs text-red-500">{errors.learnerAge.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-navy-900">Your location</label>
              <input id="location" autoComplete="address-level2" placeholder="e.g. Garden City, Nairobi" {...register('location', { maxLength: { value: 120, message: 'Location must be 120 characters or fewer' } })} className={inputClass} />
              {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-navy-900">Email *</label>
              <input id="email" type="email" autoComplete="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email address' }, maxLength: { value: 100, message: 'Email must be 100 characters or fewer' } })} className={inputClass} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-navy-900">Phone</label>
              <input id="phone" {...register('phone', { pattern: { value: /^[0-9+()\s-]{6,20}$/, message: 'Enter a valid phone number' }, maxLength: { value: 20, message: 'Phone must be 20 characters or fewer' } })} className={inputClass} />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="currentSchool" className="mb-2 block text-sm font-medium text-navy-900">Current school <span className="font-normal text-navy-600/60">(optional)</span></label>
              <input id="currentSchool" {...register('currentSchool', { maxLength: { value: 160, message: 'School name must be 160 characters or fewer' } })} className={inputClass} />
              {errors.currentSchool && <p className="mt-1 text-xs text-red-500">{errors.currentSchool.message}</p>}
            </div>
            <div>
              <label htmlFor="curriculum" className="mb-2 block text-sm font-medium text-navy-900">Current curriculum <span className="font-normal text-navy-600/60">(optional)</span></label>
              <select id="curriculum" {...register('curriculum')} className={`${inputClass} bg-white`}>
                <option value="">Not sure / prefer to discuss</option>
                <option value="CBC">CBC</option><option value="Montessori">Montessori</option><option value="Cambridge">Cambridge</option><option value="IGCSE">IGCSE</option><option value="A Levels">A Levels</option><option value="IB">IB</option><option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="gradeClass" className="mb-2 block text-sm font-medium text-navy-900">Grade or class <span className="font-normal text-navy-600/60">(optional)</span></label>
              <input id="gradeClass" placeholder="e.g. Grade 5 or Year 10" {...register('gradeClass', { maxLength: { value: 80, message: 'Grade or class must be 80 characters or fewer' } })} className={inputClass} />
              {errors.gradeClass && <p className="mt-1 text-xs text-red-500">{errors.gradeClass.message}</p>}
            </div>
            <div>
              <label htmlFor="subjects" className="mb-2 block text-sm font-medium text-navy-900">Subjects or interests <span className="font-normal text-navy-600/60">(optional)</span></label>
              <input id="subjects" placeholder="e.g. Maths, French, chess" {...register('subjects', { maxLength: { value: 500, message: 'Please keep this under 500 characters' } })} className={inputClass} />
              {errors.subjects && <p className="mt-1 text-xs text-red-500">{errors.subjects.message}</p>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="preferredLearningModel" className="mb-2 block text-sm font-medium text-navy-900">Preferred learning model</label>
              <select id="preferredLearningModel" {...register('preferredLearningModel')} className={`${inputClass} bg-white`}>
                <option value="">Not sure yet</option><option value="online">Online</option><option value="home-based">Educator comes home</option><option value="centre-based">Learner comes to Axis</option><option value="blended">Blended learning</option><option value="not-sure">Help me decide</option>
              </select>
            </div>
            <div>
              <label htmlFor="preferredDays" className="mb-2 block text-sm font-medium text-navy-900">Preferred days <span className="font-normal text-navy-600/60">(optional)</span></label>
              <input id="preferredDays" placeholder="e.g. Weekdays" {...register('preferredDays', { maxLength: { value: 120, message: 'Please keep this under 120 characters' } })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="preferredTimes" className="mb-2 block text-sm font-medium text-navy-900">Preferred times <span className="font-normal text-navy-600/60">(optional)</span></label>
              <input id="preferredTimes" placeholder="e.g. After 4pm" {...register('preferredTimes', { maxLength: { value: 120, message: 'Please keep this under 120 characters' } })} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="learningNeeds" className="mb-2 block text-sm font-medium text-navy-900">What support would help this learner? <span className="font-normal text-navy-600/60">(optional)</span></label>
            <textarea id="learningNeeds" rows={3} {...register('learningNeeds', { maxLength: { value: 2000, message: 'Please keep this under 2,000 characters' } })} className={`${inputClass} resize-none`} placeholder="Share learning goals, strengths, or challenges. Please do not include medical or diagnostic records here." />
            {errors.learningNeeds && <p className="mt-1 text-xs text-red-500">{errors.learningNeeds.message}</p>}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="programme" className="mb-2 block text-sm font-medium text-navy-900">Programme *</label>
              <select id="programme" {...register('programme', { required: 'Please select a programme' })} className={`${inputClass} bg-white`}>
                <option value="">Select a programme...</option>
                <option value="Academic Learning & Homeschooling">Academic Learning & Homeschooling</option>
                <option value="Academic Support & Tuition">Academic Support & Tuition</option>
                <option value="African & Foreign Languages">African & Foreign Languages</option>
                <option value="Talent & Creative Development">Talent & Creative Development</option>
                <option value="Games & Sports">Games & Sports</option>
                <option value="Individualised Learning Support">Individualised Learning Support</option>
                <option value="Holiday Tuition">Holiday Tuition</option>
                <option value="Examination Preparation">Examination Preparation</option>
                <option value="Learner Discovery & Consultancy">Learner Discovery & Consultancy</option>
                <option value="Other / not sure">Other / not sure</option>
              </select>
              {errors.programme && <p className="mt-1 text-xs text-red-500">{errors.programme.message}</p>}
            </div>
            <div>
              <label htmlFor="ageGroup" className="mb-2 block text-sm font-medium text-navy-900">Learner age group *</label>
              <select id="ageGroup" {...register('ageGroup', { required: 'Please select an age group' })} className={`${inputClass} bg-white`}>
                <option value="">Select age group...</option>
                <option value="child">Child</option>
                <option value="teenager">Teenager</option>
                <option value="adult">Adult</option>
              </select>
              {errors.ageGroup && <p className="mt-1 text-xs text-red-500">{errors.ageGroup.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-navy-900">Additional information</label>
            <textarea id="notes" rows={5} {...register('notes', { maxLength: { value: 2000, message: 'Notes must be 2,000 characters or fewer' } })} className={`${inputClass} resize-none`} placeholder="Tell us about learning goals, preferred schedule, or support needs..." />
            {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes.message}</p>}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm text-navy-600">
            <input type="checkbox" {...register('contactConsent', { required: 'Please confirm that Axis may contact you' })} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500" />
            <span>I confirm that I am the parent, guardian, or adult learner, and I agree that Axis Learning may contact me about this enquiry. Read our <Link to="/privacy" className="font-medium text-navy underline">privacy approach</Link>.</span>
          </label>
          {errors.contactConsent && <p className="text-xs text-red-500">{errors.contactConsent.message}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSubmitting ? 'Submitting...' : 'Submit application'}
          </button>
        </form>
      </section>
    </div>
  )
}
