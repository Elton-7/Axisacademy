import { useEffect, useState } from 'react'
import { AlertTriangle, ClipboardCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import MessageThread from './MessageThread'
import { portalApi } from '../services/apiClient'
import type { PortalLearnerRecord, PortalSession, SessionStatus } from '../types'

/**
 * One learner's timetable, attendance and academic record (brief §28), plus the
 * educator's marking controls (§29). The same component serves both portals:
 * what an educator may do is decided by the API, and reflected here.
 */

const statusTone: Record<SessionStatus, string> = {
  Scheduled: 'bg-slate-100 text-slate-700',
  Attended: 'bg-emerald-50 text-emerald-700',
  Missed: 'bg-rose-50 text-rose-700',
  Cancelled: 'bg-amber-50 text-amber-700',
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

function SessionRow({
  session,
  canMark,
  onMark,
}: {
  session: PortalSession
  canMark: boolean
  onMark: (id: number, status: SessionStatus) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 py-3 last:border-b-0">
      <div className="min-w-[10rem] flex-1">
        <p className="text-sm font-medium text-navy-900">{session.subject}</p>
        <p className="text-xs text-navy-600/70">
          {formatDateTime(session.scheduledFor)} · {session.durationMinutes} min
          {session.deliveryMode ? ` · ${session.deliveryMode}` : ''}
        </p>
        {session.topicsCovered && (
          <p className="mt-1 text-xs text-navy-600">Covered: {session.topicsCovered}</p>
        )}
        {session.lessonNotes && (
          <p className="mt-1 text-xs italic text-navy-500">{session.lessonNotes}</p>
        )}
        {session.concernFlagged && (
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-600">
            <AlertTriangle className="h-3 w-3" /> Concern raised with Axis
          </p>
        )}
      </div>

      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[session.status]}`}>
        {session.status}
      </span>

      {canMark && (
        <select
          value={session.status}
          onChange={(event) => onMark(session.id, event.target.value as SessionStatus)}
          className="rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-gold-500"
          aria-label={`Attendance for ${session.subject} on ${formatDateTime(session.scheduledFor)}`}
        >
          {(['Scheduled', 'Attended', 'Missed', 'Cancelled'] as SessionStatus[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export default function LearnerRecord({
  learnerId,
  canMark,
}: {
  learnerId: number
  canMark: boolean
}) {
  const [record, setRecord] = useState<PortalLearnerRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      setRecord(await portalApi.getLearner(learnerId))
    } catch (err) {
      console.error('Failed to load learner record:', err)
      setError('This record is unavailable right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnerId])

  const markSession = async (id: number, status: SessionStatus) => {
    try {
      await portalApi.updateSession(id, { status })
      toast.success(`Marked ${status.toLowerCase()}`)
      await load()
    } catch (err) {
      console.error('Failed to mark the session:', err)
      toast.error('Could not save. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gold-500" />
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error || 'This record is unavailable.'}
      </div>
    )
  }

  const { learner, attendance, sessions, assessments } = record

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h3 className="text-lg font-semibold text-navy-900">{learner.name}</h3>
        <p className="text-sm text-navy-600/70">
          {[learner.programme, learner.curriculum, learner.gradeClass].filter(Boolean).join(' · ') ||
            'Programme to be confirmed'}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Attendance', value: attendance.percentage === null ? '—' : `${attendance.percentage}%` },
            { label: 'Attended', value: attendance.attended },
            { label: 'Missed', value: attendance.missed },
            { label: 'Upcoming', value: attendance.scheduled },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-navy-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {attendance.percentage === null && (
          <p className="mt-3 text-xs text-navy-500">
            No sessions have been marked yet, so there is no attendance figure to show.
          </p>
        )}

        {learner.supportNotes && (
          <div className="mt-5 rounded-xl border-l-4 border-gold-500 bg-gold-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-600">Support notes</p>
            <p className="mt-1 text-sm text-navy-700">{learner.supportNotes}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-navy-500">
          Timetable &amp; attendance
        </h4>
        {sessions.length === 0 ? (
          <p className="py-6 text-sm text-navy-500">No sessions scheduled yet.</p>
        ) : (
          sessions.map((session) => (
            <SessionRow key={session.id} session={session} canMark={canMark} onMark={markSession} />
          ))
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-navy-500">
          <ClipboardCheck className="h-4 w-4" /> Academic record
        </h4>
        {assessments.length === 0 ? (
          <p className="py-6 text-sm text-navy-500">No results recorded yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="flex flex-wrap items-start gap-3 py-3">
                <div className="min-w-[10rem] flex-1">
                  <p className="text-sm font-medium text-navy-900">
                    {assessment.title}
                    {!assessment.isReleased && (
                      <span className="ml-2 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Draft
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-navy-600/70">
                    {assessment.subject} · {assessment.type} · {assessment.assessedOn}
                  </p>
                  {assessment.comment && (
                    <p className="mt-1 text-xs italic text-navy-600">{assessment.comment}</p>
                  )}
                </div>
                {assessment.score !== null && assessment.score !== undefined && (
                  <span className="text-sm font-semibold tabular-nums text-navy-900">
                    {assessment.score}
                    {assessment.maxScore ? ` / ${assessment.maxScore}` : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <MessageThread learnerId={learnerId} />
    </div>
  )
}
