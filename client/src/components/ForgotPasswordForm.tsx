import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { authApi } from '../services/apiClient'
import { apiErrorMessage } from '../utils/apiError'

/**
 * Asking for a reset link, shown in place of the sign-in form.
 *
 * The confirmation deliberately does not say whether the address had an
 * account. The API answers the same way either way, so that this cannot be
 * used to ask the site which of a list of email addresses belongs to an Axis
 * family, and the wording here has to match — a message that said "we could
 * not find that address" would give away exactly what the API refuses to.
 */
export default function ForgotPasswordForm({ onCancel }: { onCancel: () => void }) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSending(true)
    try {
      await authApi.requestPasswordReset(email.trim())
      setSent(true)
    } catch (requestError: unknown) {
      // Reaches here only if the request itself failed — a network problem, or
      // the rate limiter. The API does not fail for an unknown address.
      setError(apiErrorMessage(requestError, 'We could not send that just now. Please try again shortly.'))
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-gold-500/40 bg-gold-500/5 p-4">
          <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" aria-hidden="true" />
          <div className="text-sm text-ink-muted">
            <p className="font-medium text-ink">Check your email</p>
            <p className="mt-1">
              If that address has an account, a link to choose a new password is on its way. It
              works once, and stops working after an hour.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="mb-4 text-sm text-ink-muted">
          Enter the address you use for Axis and we will send you a link to choose a new password.
        </p>
        <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-ink">
          Email address
        </label>
        <input
          id="reset-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-line px-4 py-2.5 outline-none focus:border-gold-500"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-critical">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-700 disabled:opacity-60"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {sending ? 'Sending' : 'Email me a link'}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="w-full text-center text-sm text-ink-muted hover:text-ink"
      >
        Back to sign in
      </button>
    </form>
  )
}
