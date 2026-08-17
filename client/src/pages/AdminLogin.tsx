import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LockKeyhole, Loader2, LogIn, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/apiClient'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await authApi.login({ email: email.trim(), password })
      toast.success('Welcome back')
      navigate('/admin', { replace: true })
    } catch (requestError: unknown) {
      const message = 'Invalid email or password. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-navy-900 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-gold-500/20" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-gold-500/10" />
          <Link to="/" className="relative flex items-center gap-3 text-gold-500">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-gold-500 font-serif text-2xl font-bold">A</div>
            <div>
              <p className="text-lg font-semibold uppercase tracking-[0.18em]">Axis</p>
              <p className="text-[0.55rem] uppercase tracking-[0.12em] text-gold-500/70">Academy</p>
            </div>
          </Link>
          <div className="relative">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-gold-500">Staff portal</p>
            <h2 className="max-w-sm text-4xl font-light leading-tight text-white">Manage every learner journey with confidence.</h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">Access enquiries, applications, subscribers, and academy insights from one secure workspace.</p>
          </div>
          <div className="relative flex items-center gap-3 text-sm text-white/60"><ShieldCheck className="h-5 w-5 text-gold-500" /> Secure staff access</div>
        </div>

        <div className="p-7 sm:p-10 lg:p-14">
          <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-navy-600/60 transition-colors hover:text-gold-600 lg:hidden"><ArrowLeft className="h-4 w-4" /> Back to website</Link>
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 text-gold-600"><LockKeyhole className="h-6 w-6" /></div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Welcome back</p>
            <h1 className="text-3xl font-semibold text-navy-900">Sign in to your account</h1>
            <p className="mt-2 text-sm text-navy-600/70">Use your staff credentials to continue to the dashboard.</p>
          </div>

        {error && (
          <div role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-navy-900">Work email</label>
            <input id="admin-email" type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@axisacademy.org" className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all placeholder:text-gray-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between"><label htmlFor="admin-password" className="block text-sm font-medium text-navy-900">Password</label><button type="button" onClick={() => setShowPassword(!showPassword)} className="inline-flex items-center gap-1 text-xs text-navy-600/60 hover:text-gold-600">{showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{showPassword ? 'Hide' : 'Show'}</button></div>
            <input id="admin-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all placeholder:text-gray-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-navy-600/70"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500" /> Keep me signed in</label>
          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3.5 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-8 text-center text-xs leading-relaxed text-navy-600/50">Authorized personnel only. Your activity may be monitored for security.</p>
        <Link to="/" className="mt-5 block text-center text-sm text-navy-600/70 hover:text-gold-600">Return to website</Link>
        </div>
      </div>
    </div>
  )
}
