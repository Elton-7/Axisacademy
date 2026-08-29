import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/apiClient'
import { apiErrorMessage } from '../utils/apiError'

/**
 * Where an emailed reset link lands.
 *
 * Lives under /portal so the server answers it with the application rather than
 * a 404: only /admin and /portal/* are served as pages, and everything else is
 * deliberately not-found. A reset link that resolved to a 404 would look broken
 * to the one person who most needs it to work.
 *
 * The token stays in the address bar and is never stored. It is single use and
 * expires; once spent, this page is the only thing that held it.
 */
export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const tooShort = password.length > 0 && password.length < 10
  const mismatch = confirmation.length > 0 && confirmation !== password

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password.length < 10) return setError('Choose a password of at least 10 characters.')
    if (password !== confirmation) return setError('The two passwords do not match.')

    setSaving(true)
    try {
      await authApi.resetPassword({ token, newPassword: password })
      setDone(true)
      toast.success('Your password has been set')
    } catch (requestError: unknown) {
      // The server says whether the link expired or was already used, which is
      // the difference between "try again" and "ask for a new one".
      setError(apiErrorMessage(requestError, 'We could not set your password. Please ask for a new link.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-muted px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-3xl bg-surface p-8 shadow-2xl sm:p-10">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-gold-700">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Link>

        {/* No token at all: someone opened the page directly. */}
        {!token && !done && (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-ink">This link is incomplete</h1>
            <p className="text-sm text-ink-muted">
              Open the link from your email exactly as it was sent. If it has stopped working, you
              can ask for a new one from the sign-in page.
            </p>
            <Link
              to="/portal/student"
              className="inline-block rounded-lg bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gold-700"
            >
              Go to sign in
            </Link>
          </div>
        )}

        {done && (
          <div className="space-y-4">
            <CheckCircle2 className="h-10 w-10 text-positive" aria-hidden="true" />
            <h1 className="text-2xl font-semibold text-ink">Your password is set</h1>
            <p className="text-sm text-ink-muted">You can sign in with it now.</p>
            <button
              onClick={() => navigate('/portal/student')}
              className="inline-block rounded-lg bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gold-700"
            >
              Go to sign in
            </button>
          </div>
        )}

        {token && !done && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-start gap-3">
              <KeyRound className="mt-1 h-6 w-6 flex-shrink-0 text-gold-600" aria-hidden="true" />
              <div>
                <h1 className="text-2xl font-semibold text-ink">Choose a new password</h1>
                <p className="mt-1 text-sm text-ink-muted">Only you will know it.</p>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-line px-4 py-2.5 pr-11 outline-none focus:border-gold-500"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-ink-muted">At least 10 characters.</p>
            </div>

            <div>
              <label htmlFor="confirmation" className="mb-1.5 block text-sm font-medium text-ink">
                Type it again
              </label>
              <input
                id="confirmation"
                type={show ? 'text' : 'password'}
                value={confirmation}
                onChange={(e) => {
                  setConfirmation(e.target.value)
                  setError(null)
                }}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-line px-4 py-2.5 outline-none focus:border-gold-500"
              />
            </div>

            {(tooShort || mismatch || error) && (
              <p role="alert" className="text-sm text-critical">
                {error || (tooShort && 'At least 10 characters.') || (mismatch && 'The two passwords do not match.')}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {saving ? 'Saving' : 'Set my password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
