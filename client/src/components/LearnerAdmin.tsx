import { useEffect, useState } from 'react'
import { CalendarPlus, Loader2, Plus, Search, UserPlus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiErrorMessage } from '../utils/apiError'
import { learnersApi, safeguardingApi } from '../services/apiClient'
import type { AdminLearner, AssignableUser } from '../types'

/**
 * Brief §30 — where Axis creates learner records, links them to a parent
 * account, assigns educators and schedules sessions. Without this the portals
 * only work for records created directly in the database.
 */

const emptyForm = {
  name: '',
  parentUserId: '',
  programme: '',
  curriculum: '',
  gradeClass: '',
  learningModel: '',
  supportNotes: '',
}

export default function LearnerAdmin() {
  const [learners, setLearners] = useState<AdminLearner[]>([])
  const [parents, setParents] = useState<AssignableUser[]>([])
  const [educators, setEducators] = useState<AssignableUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = async (searchTerm = '') => {
    try {
      setLoading(true)
      setError(null)
      const [list, parentUsers, educatorUsers] = await Promise.all([
        learnersApi.getAll(searchTerm ? { search: searchTerm } : undefined),
        learnersApi.getAssignableUsers('student'),
        learnersApi.getAssignableUsers('tutor'),
      ])
      setLearners(list)
      setParents(parentUsers)
      setEducators(educatorUsers)
    } catch (err) {
      console.error('Failed to load learners:', err)
      setError('Learner records are unavailable right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const createLearner = async () => {
    if (!form.name.trim() || !form.parentUserId) {
      toast.error('A learner needs a name and a parent account')
      return
    }
    try {
      setSaving(true)
      await learnersApi.create({
        name: form.name.trim(),
        parentUserId: Number(form.parentUserId),
        programme: form.programme || undefined,
        curriculum: form.curriculum || undefined,
        gradeClass: form.gradeClass || undefined,
        learningModel: form.learningModel || null,
        supportNotes: form.supportNotes || undefined,
      })
      toast.success('Learner created')
      setForm(emptyForm)
      setShowForm(false)
      await load(search)
    } catch (err) {
      console.error('Failed to create learner:', err)
      toast.error('Could not create this learner. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const assignEducator = async (learner: AdminLearner, educatorUserId: string, subject: string) => {
    if (!educatorUserId) return
    try {
      await learnersApi.assignEducator(learner.id, Number(educatorUserId), subject || undefined)
      toast.success('Educator assigned')
      await load(search)
    } catch (err) {
      console.error('Failed to assign educator:', err)
      toast.error('Could not assign this educator.')
    }
  }

  const endAssignment = async (learner: AdminLearner, assignmentId: number, educatorName: string) => {
    if (!confirm(`End ${educatorName}'s assignment? They will immediately lose access to ${learner.name}'s record.`)) return
    try {
      await learnersApi.endAssignment(learner.id, assignmentId)
      toast.success('Assignment ended')
      await load(search)
    } catch (err) {
      console.error('Failed to end assignment:', err)
      toast.error('Could not end this assignment.')
    }
  }

  const scheduleSession = async (learner: AdminLearner, subject: string, when: string, educatorUserId: string) => {
    if (!subject.trim() || !when) {
      toast.error('A session needs a subject and a date')
      return
    }
    try {
      await learnersApi.scheduleSession(learner.id, {
        subject: subject.trim(),
        scheduledFor: new Date(when).toISOString(),
        educatorUserId: educatorUserId ? Number(educatorUserId) : null,
      })
      toast.success('Session scheduled')
      await load(search)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not schedule this session.'))
    }
  }

  /** Brief §38 — a family's right to a copy of what is held about their child. */
  const exportLearner = async (learner: AdminLearner) => {
    try {
      const data = await safeguardingApi.exportLearner(learner.id)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `axis-learner-${learner.id}-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Subject access export downloaded')
    } catch (err) {
      console.error('Failed to export learner data:', err)
      toast.error('Could not produce the export.')
    }
  }

  /** Erasure. Irreversible, so the API also requires the name typed back. */
  const eraseLearner = async (learner: AdminLearner) => {
    const typed = window.prompt(
      `This permanently erases every record for ${learner.name} — sessions, results, messages and assignments. It cannot be undone.

Type the learner's name to confirm:`
    )
    if (typed === null) return
    try {
      await safeguardingApi.eraseLearner(learner.id, typed.trim())
      toast.success(`${learner.name} erased`)
      await load(search)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not erase this learner.'))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[14rem]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(search)}
            placeholder="Search learners by name..."
            className="w-full rounded-lg border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-gold-500"
          />
        </div>
        <button
          onClick={() => setShowForm((open) => !open)}
          className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm text-white hover:bg-navy-800"
        >
          <Plus className="h-4 w-4" /> Add learner
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-line-critical bg-tint-critical p-5 text-sm text-critical">{error}</div>
      )}

      {showForm && (
        <div className="rounded-xl border border-line bg-surface p-6">
          <h3 className="mb-4 text-lg font-semibold text-ink">New learner</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Learner name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-line px-4 py-2 text-sm outline-none focus:border-gold-500"
            />
            <select
              value={form.parentUserId}
              onChange={(e) => setForm({ ...form, parentUserId: e.target.value })}
              className="rounded-lg border border-line px-4 py-2 text-sm outline-none focus:border-gold-500"
            >
              <option value="">Parent account *</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name} ({parent.email})
                </option>
              ))}
            </select>
            <input
              placeholder="Programme"
              value={form.programme}
              onChange={(e) => setForm({ ...form, programme: e.target.value })}
              className="rounded-lg border border-line px-4 py-2 text-sm outline-none focus:border-gold-500"
            />
            <input
              placeholder="Curriculum"
              value={form.curriculum}
              onChange={(e) => setForm({ ...form, curriculum: e.target.value })}
              className="rounded-lg border border-line px-4 py-2 text-sm outline-none focus:border-gold-500"
            />
            <input
              placeholder="Grade or class"
              value={form.gradeClass}
              onChange={(e) => setForm({ ...form, gradeClass: e.target.value })}
              className="rounded-lg border border-line px-4 py-2 text-sm outline-none focus:border-gold-500"
            />
            <select
              value={form.learningModel}
              onChange={(e) => setForm({ ...form, learningModel: e.target.value })}
              className="rounded-lg border border-line px-4 py-2 text-sm outline-none focus:border-gold-500"
            >
              <option value="">Learning model</option>
              <option value="online">Online</option>
              <option value="home-based">Home-based</option>
              <option value="centre-based">Centre-based</option>
              <option value="blended">Blended</option>
            </select>
          </div>
          <textarea
            placeholder="Support notes — visible to the parent and to assigned educators only"
            rows={2}
            value={form.supportNotes}
            onChange={(e) => setForm({ ...form, supportNotes: e.target.value })}
            className="mt-4 w-full resize-none rounded-lg border border-line px-4 py-2 text-sm outline-none focus:border-gold-500"
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={createLearner}
              disabled={saving}
              className="rounded-lg bg-gold-600 px-4 py-2 text-sm text-white hover:bg-gold-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create learner'}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(emptyForm) }}
              className="rounded-lg bg-line px-4 py-2 text-sm text-ink-muted hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {learners.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-ink-muted">
            No learner records yet. Create one to give a family access to the parent portal.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {learners.map((learner) => (
              <div key={learner.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-[12rem] flex-1">
                    <p className="font-medium text-ink">{learner.name}</p>
                    <p className="text-sm text-ink-muted">
                      {[learner.programme, learner.curriculum, learner.gradeClass].filter(Boolean).join(' · ') || 'No programme set'}
                    </p>
                    <p className="text-xs text-ink-muted">
                      Parent: {learner.parent?.name || 'unknown'} ({learner.parent?.email})
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {learner.assignments?.length ? (
                      learner.assignments.map((assignment) => (
                        <span
                          key={assignment.id}
                          className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted"
                        >
                          {assignment.educator?.name}
                          {assignment.subject ? ` · ${assignment.subject}` : ''}
                          <button
                            onClick={() => endAssignment(learner, assignment.id, assignment.educator?.name || 'This educator')}
                            aria-label={`End ${assignment.educator?.name}'s assignment`}
                            className="text-navy-400 hover:text-critical"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-ink-muted">No educator assigned</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpanded(expanded === learner.id ? null : learner.id)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted hover:border-gold-500"
                    >
                      {expanded === learner.id ? 'Close' : 'Assign & schedule'}
                    </button>
                    <button
                      onClick={() => exportLearner(learner)}
                      title="Download everything held about this learner"
                      className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted hover:border-gold-500"
                    >
                      Export data
                    </button>
                    <button
                      onClick={() => eraseLearner(learner)}
                      title="Permanently erase this learner's records"
                      className="rounded-lg border border-line-critical px-3 py-1.5 text-xs text-critical hover:bg-tint-critical"
                    >
                      Erase
                    </button>
                  </div>
                </div>

                {expanded === learner.id && (
                  <div className="mt-4 grid gap-4 rounded-lg bg-surface-sunk p-4 md:grid-cols-2">
                    <AssignPanel educators={educators} onAssign={(id, subject) => assignEducator(learner, id, subject)} />
                    <SchedulePanel
                      educators={(learner.assignments || []).map((a) => a.educator).filter(Boolean) as AssignableUser[]}
                      onSchedule={(subject, when, educatorId) => scheduleSession(learner, subject, when, educatorId)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AssignPanel({
  educators,
  onAssign,
}: {
  educators: AssignableUser[]
  onAssign: (educatorUserId: string, subject: string) => void
}) {
  const [educatorUserId, setEducatorUserId] = useState('')
  const [subject, setSubject] = useState('')

  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        <UserPlus className="h-4 w-4" /> Assign an educator
      </h4>
      <div className="space-y-2">
        <select
          value={educatorUserId}
          onChange={(e) => setEducatorUserId(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold-500"
        >
          <option value="">Choose an educator</option>
          {educators.map((educator) => (
            <option key={educator.id} value={educator.id}>
              {educator.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold-500"
        />
        <button
          onClick={() => { onAssign(educatorUserId, subject); setEducatorUserId(''); setSubject('') }}
          className="w-full rounded-lg bg-navy-900 px-3 py-2 text-sm text-white hover:bg-navy-800"
        >
          Assign
        </button>
        <p className="text-xs text-ink-muted">
          Assigning gives this educator access to the learner’s record.
        </p>
      </div>
    </div>
  )
}

function SchedulePanel({
  educators,
  onSchedule,
}: {
  educators: AssignableUser[]
  onSchedule: (subject: string, when: string, educatorUserId: string) => void
}) {
  const [subject, setSubject] = useState('')
  const [when, setWhen] = useState('')
  const [educatorUserId, setEducatorUserId] = useState('')

  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        <CalendarPlus className="h-4 w-4" /> Schedule a session
      </h4>
      <div className="space-y-2">
        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold-500"
        />
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold-500"
        />
        <select
          value={educatorUserId}
          onChange={(e) => setEducatorUserId(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold-500"
        >
          <option value="">No educator yet</option>
          {educators.map((educator) => (
            <option key={educator.id} value={educator.id}>
              {educator.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => { onSchedule(subject, when, educatorUserId); setSubject(''); setWhen(''); setEducatorUserId('') }}
          className="w-full rounded-lg bg-navy-900 px-3 py-2 text-sm text-white hover:bg-navy-800"
        >
          Schedule
        </button>
        <p className="text-xs text-ink-muted">Only assigned educators can be given a session.</p>
      </div>
    </div>
  )
}
