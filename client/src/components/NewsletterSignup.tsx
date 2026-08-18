import { useState } from 'react'
import { AlertCircle, CheckCircle, Loader2, Mail, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { newsletterApi } from '../services/apiClient'

interface NewsletterForm {
  email: string
}

export default function NewsletterSignup() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NewsletterForm>({ mode: 'onBlur' })

  const onSubmit = async ({ email }: NewsletterForm) => {
    setMessage(null)
    try {
      await newsletterApi.subscribe({ email: email.trim().toLowerCase() })
      const successMessage = 'You are subscribed. Watch your inbox for academy updates.'
      setMessage({ type: 'success', text: successMessage })
      toast.success('Successfully subscribed')
      reset()
    } catch (error: unknown) {
      const responseData = axios.isAxiosError(error)
        ? error.response?.data as { error?: string; errors?: Array<{ msg?: string }> } | undefined
        : undefined
      const errorMessage = responseData?.errors?.[0]?.msg || responseData?.error || 'We could not subscribe you. Please try again later.'
      setMessage({ type: 'error', text: errorMessage })
      toast.error(errorMessage)
    }
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Stay Updated</h4>
      <p className="mb-4 text-sm leading-relaxed text-white/50">Get helpful learning updates and academy news in your inbox.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-500" />
          <input
            type="email"
            placeholder="Your email address"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email address' },
              maxLength: { value: 255, message: 'Email is too long' },
            })}
            className="w-full rounded-lg border border-white/10 bg-surface/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
          />
        </div>
        {errors.email && <p className="text-xs text-red-300">{errors.email.message}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <div role="status" className={`mt-3 flex items-start gap-2 text-xs ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
          {message.type === 'success' ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  )
}
