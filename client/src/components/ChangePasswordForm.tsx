import { useState } from 'react'
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/apiClient'
import { apiErrorMessage } from '../utils/apiError'

/**
 * Replacing a temporary password with one only its owner knows.
 *
 * An administrator creates an account and the site shows the temporary password
 * once. It then has to travel to the person somehow — a message, an email, a
 * note — and until this existed there was nothing they could do with it except
 * keep using it. `mustChangePassword` was set on the account, returned at
 * sign-in and shown to administrators as "temporary password not yet changed",
 * but nothing anywhere let the person change it. The password an administrator
 * typed into a chat stayed valid indefinitely.
 *
 * Shown in place of the dashboard when that flag is set, so it cannot be
 * skipped by navigating: the sign-in has succeeded and the token is real, but
 * this is what the person sees until the password is theirs.
 */
export default function ChangePasswordForm({
  currentPassword,
  onDone,
}: {
  /** Carried over from the sign-in, so nobody types the temporary one twice. */
  currentPassword: string
  onDone: () => void
}) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // The server requires ten characters and refuses a password identical to the
  // current one. Both are checked here too, so the answer is immediate and
  // nobody loses what they typed to a round trip.
  const tooShort = newPassword.length > 0 && newPassword.length < 10
  const mismatch = confirmation.length > 0 && confirmation !== newPassword
  const unchanged = newPassword.length > 0 && newPassword === currentPassword

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (newPassword.length < 10) return setError('Choose a password of at least 10 characters.')
    if (newPassword === currentPassword) return setError('Choose something different from the temporary password.')
    if (newPassword !== confirmation) return setError('The two passwords do not match.')

    setSaving(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      toast.success('Your password has been changed')
      onDone()
    } catch (requestError: unknown) {
      const message = apiErrorMessage(requestError, 'We could not change your password. Please try again.')
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-gold-500/40 bg-gold-500/5 p-4">
        <KeyRound className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" aria-hidden="true" />
        <p className="text-sm text-ink-muted">
          You signed in with a temporary password. Choose one of your own before you continue —
          only you will know it.
        </p>
      </div>

      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-ink">
          New password
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={show ? 'text' : 'password'}
            value={newPassword}
            // Clearing the submitted error on edit, so the live hints below can
            // be seen. Without this the first failure sticks: `error` wins over
            // every live check, and the message stays frozen on whatever went
            // wrong last time however much the person corrects it.
            onChange={(e) => {
              setNewPassword(e.target.value)
              setError(null)
            }}
            autoComplete="new-password"
            required
            aria-describedby="new-password-help"
            className="w-full rounded-lg border border-line px-4 py-2 pr-11 outline-none focus:border-gold-500"
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
        <p id="new-password-help" className="mt-1.5 text-xs text-ink-muted">
          At least 10 characters.
        </p>
      </div>

      <div>
        <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-ink">
          Type it again
        </label>
        <input
          id="confirm-password"
          type={show ? 'text' : 'password'}
          value={confirmation}
          onChange={(e) => {
            setConfirmation(e.target.value)
            setError(null)
          }}
          autoComplete="new-password"
          required
          className="w-full rounded-lg border border-line px-4 py-2 outline-none focus:border-gold-500"
        />
      </div>

      {/* Said as it is typed, rather than after a failed submission. */}
      {(tooShort || mismatch || unchanged || error) && (
        <p role="alert" className="text-sm text-critical">
          {error ||
            (unchanged && 'Choose something different from the temporary password.') ||
            (tooShort && 'At least 10 characters.') ||
            (mismatch && 'The two passwords do not match.')}
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
  )
}
