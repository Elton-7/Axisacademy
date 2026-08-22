import { useEffect, useState } from 'react'
import { AlertTriangle, ClipboardCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import MessageThread from './MessageThread'
import { portalApi } from '../services/apiClient'
import { apiErrorMessage } from '../utils/apiError'
import type { PortalLearnerRecord, PortalSession, SessionStatus } from '../types'

/** What a home visit has to record before it counts as attended. */
type HomeVisitRecord = { checkInAt: string; checkOutAt: string; adultPresent: boolean }

/**
 * One learner's timetable, attendance and academic record (brief §28), plus the
 * educator's marking controls (§29). The same component serves both portals:
 * what an educator may do is decided by the API, and reflected here.
 */

const statusTone: Record<SessionStatus, string> = {
  Scheduled: 'bg-surface-muted text-ink-muted',
  Attended: 'bg-tint-emerald text-positive',
  Missed: 'bg-tint-rose text-critical',
  Cancelled: 'bg-tint-amber text-warning',
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
  onMark: (id: number, status: SessionStatus, extra?: HomeVisitRecord) => void
}) {
  /**
   * A home-based session cannot be marked attended without an arrival time, a
   * departure time and confirmation that a responsible adult was present. The
   * API has always enforced that; this panel is how an educator satisfies it.
   *
   * Until it existed the dropdown sent a status on its own, the API refused it,
   * and the educator saw "Could not save" — so no home visit could ever be
   * recorded as attended, which is the one session type the rule exists for.
   */
  const [visit, setVisit] = useState<HomeVisitRecord>({ checkInAt: '', checkOutAt: '', adultPresent: false })
  const [openPanel, setOpenPanel] = useState(false)
  const needsVisitRecord = session.deliveryMode === 'home-based'

  const choose = (status: SessionStatus) => {
    if (status === 'Attended' && needsVisitRecord) {
      setOpenPanel(true)
      return
    }
    onMark(session.id, status)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-b-0">
      <div className="min-w-[10rem] flex-1">
        <p className="text-sm font-medium text-ink">{session.subject}</p>
        <p className="text-xs text-ink-muted">
          {formatDateTime(session.scheduledFor)} · {session.durationMinutes} min
          {session.deliveryMode ? ` · ${session.deliveryMode}` : ''}
        </p>
        {session.topicsCovered && (
          <p className="mt-1 text-xs text-ink-muted">Covered: {session.topicsCovered}</p>
        )}
        {session.lessonNotes && (
          <p className="mt-1 text-xs italic text-ink-muted">{session.lessonNotes}</p>
        )}
        {session.concernFlagged && (
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-critical">
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
          onChange={(event) => choose(event.target.value as SessionStatus)}
          className="rounded-lg border border-line px-2 py-1 text-xs outline-none focus:border-gold-500"
          aria-label={`Attendance for ${session.subject} on ${formatDateTime(session.scheduledFor)}`}
        >
          {(['Scheduled', 'Attended', 'Missed', 'Cancelled'] as SessionStatus[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {openPanel && (
        <div className="w-full rounded-xl border border-line bg-surface-sunk p-4">
          <p className="text-xs font-semibold text-ink">Recording a home visit</p>
          <p className="mt-1 text-xs text-ink-muted">
            Axis records these at the time of the visit. A session cannot be marked attended without them.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-ink-muted">
              Arrival time
              <input
                type="datetime-local"
                value={visit.checkInAt}
                onChange={(e) => setVisit({ ...visit, checkInAt: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line px-2 py-1 text-xs outline-none focus:border-gold-500"
              />
            </label>
            <label className="text-xs text-ink-muted">
              Departure time
              <input
                type="datetime-local"
                value={visit.checkOutAt}
                onChange={(e) => setVisit({ ...visit, checkOutAt: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line px-2 py-1 text-xs outline-none focus:border-gold-500"
              />
            </label>
          </div>
          <label className="mt-3 flex items-start gap-2 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={visit.adultPresent}
              onChange={(e) => setVisit({ ...visit, adultPresent: e.target.checked })}
              className="mt-0.5 h-3.5 w-3.5 rounded border-line-strong text-gold-500 focus:ring-gold-500"
            />
            <span>A responsible adult was present for this session.</span>
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { onMark(session.id, 'Attended', visit); setOpenPanel(false) }}
              className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-gold-500"
            >
              Mark attended
            </button>
            <button
              type="button"
              onClick={() => setOpenPanel(false)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink"
            >
              Cancel
            </button>
            <span className="self-center text-xs text-ink-muted">
              If a responsible adult was not present, raise a concern with Axis instead.
            </span>
          </div>
        </div>
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

  const markSession = async (id: number, status: SessionStatus, visit?: HomeVisitRecord) => {
    try {
      await portalApi.updateSession(id, {
        status,
        // Only sent for a home visit; the API leaves the fields alone otherwise.
        ...(visit
          ? {
              checkInAt: visit.checkInAt ? new Date(visit.checkInAt).toISOString() : null,
              checkOutAt: visit.checkOutAt ? new Date(visit.checkOutAt).toISOString() : null,
              adultPresent: visit.adultPresent,
            }
          : {}),
      })
      toast.success(`Marked ${status.toLowerCase()}`)
      await load()
    } catch (err) {
      console.error('Failed to mark the session:', err)
      // The API's refusals here are specific and actionable — which time is
      // missing, whether an adult was confirmed. A generic message threw all
      // of that away and left the educator with nothing to act on.
      toast.error(apiErrorMessage(err, 'Could not save. Please try again.'))
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
      <div className="rounded-xl border border-line-critical bg-tint-critical p-5 text-sm text-critical">
        {error || 'This record is unavailable.'}
      </div>
    )
  }

  const { learner, attendance, sessions, assessments } = record

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="text-lg font-semibold text-ink">{learner.name}</h3>
        <p className="text-sm text-ink-muted">
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
            <div key={stat.label} className="rounded-xl bg-surface-sunk p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        {attendance.percentage === null && (
          <p className="mt-3 text-xs text-ink-muted">
            No sessions have been marked yet, so there is no attendance figure to show.
          </p>
        )}

        {learner.supportNotes && (
          <div className="mt-5 rounded-xl border-l-4 border-gold-500 bg-gold-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Support notes</p>
            <p className="mt-1 text-sm text-ink-muted">{learner.supportNotes}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Timetable &amp; attendance
        </h4>
        {sessions.length === 0 ? (
          <p className="py-6 text-sm text-ink-muted">No sessions scheduled yet.</p>
        ) : (
          sessions.map((session) => (
            <SessionRow key={session.id} session={session} canMark={canMark} onMark={markSession} />
          ))
        )}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          <ClipboardCheck className="h-4 w-4" /> Academic record
        </h4>
        {assessments.length === 0 ? (
          <p className="py-6 text-sm text-ink-muted">No results recorded yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="flex flex-wrap items-start gap-3 py-3">
                <div className="min-w-[10rem] flex-1">
                  <p className="text-sm font-medium text-ink">
                    {assessment.title}
                    {!assessment.isReleased && (
                      <span className="ml-2 rounded bg-tint-amber px-2 py-0.5 text-xs font-semibold text-warning">
                        Draft
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {assessment.subject} · {assessment.type} · {assessment.assessedOn}
                  </p>
                  {assessment.comment && (
                    <p className="mt-1 text-xs italic text-ink-muted">{assessment.comment}</p>
                  )}
                </div>
                {assessment.score !== null && assessment.score !== undefined && (
                  <span className="text-sm font-semibold tabular-nums text-ink">
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
