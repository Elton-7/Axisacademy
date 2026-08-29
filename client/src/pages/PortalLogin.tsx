import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Eye, EyeOff, GraduationCap, Loader2, LogIn, ShieldCheck, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiErrorMessage } from '../utils/apiError'
import { authApi } from '../services/apiClient'
import ChangePasswordForm from '../components/ChangePasswordForm'

type PortalRole = 'student' | 'tutor'

const portalConfig = {
  student: {
    title: 'Student portal',
    eyebrow: 'Learner access',
    description: 'Access your learning journey, programme information, and academy updates.',
    icon: GraduationCap,
    accent: 'from-blue-600 to-indigo-700',
    dashboard: '/portal/student/dashboard',
  },
  tutor: {
    title: 'Tutor portal',
    eyebrow: 'Educator access',
    description: 'Manage your teaching workspace and support learners with confidence.',
    icon: Users,
    accent: 'from-emerald-600 to-teal-700',
    dashboard: '/portal/tutor/dashboard',
  },
} as const

export default function PortalLogin({ role }: { role: PortalRole }) {
  const navigate = useNavigate()
  const location = useLocation()
  const config = portalConfig[role]
  const Icon = config.icon
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  /**
   * Set when the account is still on the temporary password an administrator
   * issued. The sign-in has succeeded and the token is real; this is what the
   * person sees instead of the dashboard until the password is their own.
   */
  const [mustChangePassword, setMustChangePassword] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await authApi.login({ email: email.trim(), password })
      if (user.role !== role) {
        await authApi.logout()
        throw new Error(`This account is not a ${role} account.`)
      }
      if (user.mustChangePassword) {
        setMustChangePassword(true)
        return
      }
      toast.success(`Welcome to your ${role} portal`)
      navigate(config.dashboard, { replace: true })
    } catch (requestError: unknown) {
      // The wrong-portal message is raised locally and is more useful than
      // anything the API returns; everything else comes from the server, which
      // knows whether this was a bad password or the rate limiter.
      const message = requestError instanceof Error && requestError.message.startsWith('This account')
        ? requestError.message
        : apiErrorMessage(requestError, 'We could not sign you in. Check your email and password, then try again.')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const switchRole = role === 'student' ? 'tutor' : 'student'

  return (
    <div className="min-h-screen bg-surface-muted px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-surface shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className={`relative hidden overflow-hidden bg-gradient-to-br ${config.accent} p-10 lg:flex lg:flex-col lg:justify-between`}>
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/20" />
          <Link to="/" className="relative flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white font-serif text-2xl font-bold">A</div>
            <div><p className="text-lg font-semibold uppercase tracking-[0.18em]">Axis</p><p className="text-[0.55rem] uppercase tracking-[0.12em] text-white/70">Academy</p></div>
          </Link>
          <div className="relative">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-white/80">{config.eyebrow}</p>
            <h2 className="max-w-sm text-4xl font-light leading-tight text-white">Learn, grow, and thrive with Axis.</h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">{config.description}</p>
          </div>
          <div className="relative flex items-center gap-3 text-sm text-white/80"><ShieldCheck className="h-5 w-5" /> Secure portal access</div>
        </div>

        <div className="p-7 sm:p-10 lg:p-14">
          <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-gold-700"><ArrowLeft className="h-4 w-4" /> Back to website</Link>
          <div className="mb-8">
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.accent} text-white`}><Icon className="h-6 w-6" /></div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">{config.eyebrow}</p>
            <h1 className="text-3xl font-semibold text-ink">Sign in to your {role} account</h1>
            <p className="mt-2 text-sm text-ink-muted">{config.description}</p>
          </div>

          {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-line-critical bg-tint-critical px-3 py-3 text-sm text-critical"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

          {mustChangePassword ? (
            <ChangePasswordForm
              currentPassword={password}
              onDone={() => {
                toast.success(`Welcome to your ${role} portal`)
                navigate(config.dashboard, { replace: true })
              }}
            />
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label htmlFor={`${role}-email`} className="mb-2 block text-sm font-medium text-ink">Email address</label><input id={`${role}-email`} type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-line px-4 py-3.5 outline-none transition-all placeholder:text-ink-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" /></div>
            <div><div className="mb-2 flex items-center justify-between"><label htmlFor={`${role}-password`} className="block text-sm font-medium text-ink">Password</label><button type="button" onClick={() => setShowPassword(!showPassword)} className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-gold-700">{showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{showPassword ? 'Hide' : 'Show'}</button></div><input id={`${role}-password`} type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-line px-4 py-3.5 outline-none transition-all placeholder:text-ink-muted focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" /></div>
            <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3.5 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}{loading ? 'Signing in...' : `Sign in to ${role} portal`}</button>
          </form>
          )}

          <div className="mt-8 rounded-xl border border-line bg-surface-sunk p-4 text-sm text-ink-muted">
            <p>
              Accounts are created by Axis when a learner is enrolled — there is no sign-up here,
              because these pages hold information about children.
            </p>
            <p className="mt-2">
              If you have not been given one yet, or you have forgotten your password,{' '}
              <Link to="/contact" className="font-semibold text-gold-700 hover:text-gold-700">get in touch</Link>{' '}
              and we will sort it out.
            </p>
          </div>
          <div className="mt-8 border-t border-line pt-6 text-center"><p className="text-sm text-ink-muted">Need the {switchRole} portal?</p><Link to={`/portal/${switchRole}`} state={{ from: location.pathname }} className="mt-1 inline-block text-sm font-semibold text-gold-700 hover:text-gold-700">Go to {switchRole} sign in</Link></div>
        </div>
      </div>
    </div>
  )
}
