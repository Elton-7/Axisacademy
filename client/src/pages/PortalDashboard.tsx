import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, CalendarDays, HelpCircle, LogOut, MessageSquare, ShieldCheck, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import LearnerRecord from '../components/LearnerRecord'
import { authApi, portalApi } from '../services/apiClient'
import type { PortalOverview, User } from '../types'

type PortalRole = 'student' | 'tutor'

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export default function PortalDashboard({ role }: { role: PortalRole }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [overview, setOverview] = useState<PortalOverview | null>(null)
  const [selectedLearner, setSelectedLearner] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const isParent = role === 'student'

  useEffect(() => {
    setError(null)
    authApi
      .getCurrentUser()
      .then((currentUser) => {
        if (currentUser.role !== role) throw new Error('Invalid portal role')
        setUser(currentUser)
        return portalApi.getOverview()
      })
      .then((data) => {
        if (data.role !== role) throw new Error('Invalid portal role')
        setOverview(data)
        // Open straight into the learner when there is only one — which is the
        // common case for a family.
        if (data.learners.length === 1) setSelectedLearner(data.learners[0].id)
      })
      .catch((requestError) => {
        if (requestError instanceof Error && requestError.message === 'Invalid portal role') {
          navigate(`/portal/${role}`, { replace: true })
          return
        }
        setError('We could not load your workspace. Please refresh and try again.')
      })
      .finally(() => setLoading(false))
  }, [navigate, role])

  const handleLogout = async () => {
    await authApi.logout()
    toast.success('You have been signed out')
    navigate(`/portal/${role}`, { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-20">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Axis Learning</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy-900">
              {isParent ? 'Parent portal' : 'Educator portal'}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl bg-navy-900 p-8 text-white">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-6 w-6 flex-shrink-0 text-gold-500" />
            <div>
              <h2 className="text-2xl font-semibold">Welcome, {user?.name || role}</h2>
              <p className="mt-2 max-w-2xl text-white/65">
                {isParent
                  ? 'Your learner’s timetable, attendance and academic record, updated by their educators.'
                  : 'The learners assigned to you, their sessions, and the records you keep for Axis.'}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-sm text-navy-600">Loading your workspace...</div>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <>
            {/* Learner selector */}
            <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-navy-500">
                <Users className="h-4 w-4" />
                {isParent ? 'My learners' : 'Assigned learners'}
              </h3>

              {overview?.learners.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {overview.learners.map((learner) => (
                    <button
                      key={learner.id}
                      onClick={() => setSelectedLearner(learner.id)}
                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                        selectedLearner === learner.id
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-gray-200 hover:border-gold-300'
                      }`}
                    >
                      <span className="block text-sm font-medium text-navy-900">{learner.name}</span>
                      <span className="block text-xs text-navy-600/70">
                        {learner.programme || 'Programme to be confirmed'}
                        {learner.attendance.percentage !== null && ` · ${learner.attendance.percentage}% attendance`}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-navy-600/65">
                  {isParent
                    ? 'No learner record has been set up yet. Axis will create one once enrolment is complete.'
                    : 'No learners are assigned to you yet.'}
                </p>
              )}
            </div>

            {selectedLearner !== null && (
              <div className="mb-6">
                <LearnerRecord learnerId={selectedLearner} canMark={!isParent} />
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-3">
              {isParent && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <BookOpen className="mb-5 h-7 w-7 text-gold-500" />
                  <h3 className="text-lg font-semibold text-navy-900">My enquiries</h3>
                  {overview?.programmes.length ? (
                    <ul className="mt-4 space-y-3">
                      {overview.programmes.map((item) => (
                        <li key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-navy-700">{item.name}</span>
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-xs capitalize text-amber-700">
                            {item.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-navy-600/65">No enquiries on record.</p>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <CalendarDays className="mb-5 h-7 w-7 text-gold-500" />
                <h3 className="text-lg font-semibold text-navy-900">Upcoming sessions</h3>
                {overview?.upcomingSessions.length ? (
                  <ul className="mt-4 space-y-3">
                    {overview.upcomingSessions.map((item) => (
                      <li key={item.id} className="text-sm text-navy-700">
                        {item.subject}
                        <span className="block text-xs text-navy-600/60">{formatDateTime(item.scheduledFor)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-navy-600/65">No sessions scheduled yet.</p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <MessageSquare className="mb-5 h-7 w-7 text-gold-500" />
                <h3 className="text-lg font-semibold text-navy-900">Messages</h3>
                {overview?.messages.length ? (
                  <ul className="mt-4 space-y-3">
                    {overview.messages.map((item) => (
                      <li key={item.id} className="text-sm text-navy-700">
                        <p className="font-medium">{item.subject}</p>
                        <p className="text-xs text-navy-600/60">{item.preview}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-navy-600/65">You have no new messages.</p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-50/60 p-5">
          <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
          <div>
            <h3 className="text-sm font-semibold text-navy-900">Need help?</h3>
            <p className="mt-1 text-sm text-navy-600/70">
              Contact the Axis team if you need help accessing your account or learning workspace.
            </p>
            <Link to="/contact" className="mt-3 inline-block text-sm font-semibold text-gold-700 hover:underline">
              Contact support
            </Link>
          </div>
        </div>

        <Link to="/" className="mt-8 inline-block text-sm text-navy-600/60 hover:text-gold-600">
          Return to main website
        </Link>
      </main>
    </div>
  )
}
