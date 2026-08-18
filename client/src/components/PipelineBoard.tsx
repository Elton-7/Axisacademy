import { useEffect, useState } from 'react'
import { AlertCircle, Loader2, TrendingDown, TrendingUp, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { enrollmentsApi } from '../services/apiClient'
import { PIPELINE_STAGES } from '../types'
import type { Enrollment, PipelineStage, PipelineSummary } from '../types'

/**
 * Brief §31 — the client journey, and specifically where families stop moving
 * along it. The stage counts are the point: a bulge in one column is the
 * question Axis needs to answer.
 */

const ACTIVE_STAGES = PIPELINE_STAGES.filter((stage) => stage !== 'Lost')

const stageTone: Record<PipelineStage, string> = {
  'New Enquiry': 'bg-tint-blue text-info border-blue-200',
  Contacted: 'bg-tint-sky text-sky-800 border-sky-200',
  'Consultation Booked': 'bg-tint-indigo text-indigo-800 border-indigo-200',
  'Consultation Completed': 'bg-tint-violet text-violet-800 border-violet-200',
  'Proposal Sent': 'bg-tint-amber text-warning border-line-warning',
  'Awaiting Decision': 'bg-tint-orange text-orange-800 border-orange-200',
  Enrolled: 'bg-tint-emerald text-positive border-line-positive',
  'Active Learner': 'bg-tint-positive text-positive border-line-positive',
  Lost: 'bg-tint-rose text-critical border-line-critical',
}

function daysSince(iso?: string) {
  if (!iso) return null
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  return Number.isFinite(days) ? days : null
}

export default function PipelineBoard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [summary, setSummary] = useState<PipelineSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<number | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [list, pipelineSummary] = await Promise.all([
        enrollmentsApi.getAll({ page: 1, limit: 100 }),
        enrollmentsApi.getPipelineSummary(),
      ])
      setEnrollments(list.data)
      setSummary(pipelineSummary)
    } catch (err) {
      console.error('Failed to load the pipeline:', err)
      setError('The enquiry pipeline is unavailable right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const moveStage = async (enrollment: Enrollment, stage: PipelineStage) => {
    if (stage === enrollment.pipelineStage) return

    // The server requires a reason for a loss; ask for it here rather than
    // letting the request fail.
    let note: string | undefined
    if (stage === 'Lost') {
      const reason = window.prompt(
        `Why was the enquiry for ${enrollment.studentName || enrollment.parentName || 'this family'} lost?\n\nThis is what makes the pipeline worth keeping.`
      )
      if (reason === null) return
      if (!reason.trim()) {
        toast.error('A reason is needed before an enquiry can be marked lost')
        return
      }
      note = reason.trim()
    }

    const previous = enrollments
    // Optimistic: the board should feel immediate, and we roll back on failure.
    setEnrollments((prev) =>
      prev.map((item) =>
        item.id === enrollment.id
          ? { ...item, pipelineStage: stage, stageChangedAt: new Date().toISOString(), stageNote: note ?? item.stageNote }
          : item
      )
    )
    setSaving(enrollment.id)

    try {
      await enrollmentsApi.updateStage(enrollment.id, stage, note)
      setSummary(await enrollmentsApi.getPipelineSummary())
      toast.success(`${enrollment.studentName || enrollment.parentName || 'Enquiry'} moved to ${stage}`)
    } catch (err) {
      console.error('Failed to move the enquiry:', err)
      setEnrollments(previous)
      toast.error('Could not move this enquiry. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-line-critical bg-tint-critical p-6 text-sm text-critical">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Headline numbers */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <Users className="h-4 w-4" /> In the pipeline
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">{summary.totals.active}</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <TrendingUp className="h-4 w-4" /> Enrolled
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-positive">{summary.totals.enrolled}</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <TrendingDown className="h-4 w-4" /> Lost
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-critical">{summary.totals.lost}</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Conversion</div>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">
              {summary.totals.conversionRate === null ? '—' : `${summary.totals.conversionRate}%`}
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              {summary.totals.conversionRate === null
                ? 'No enquiry has reached an outcome yet'
                : 'Of enquiries that reached an outcome'}
            </p>
          </div>
        </div>
      )}

      {/* Stage distribution */}
      {summary && (
        <div className="rounded-xl border border-line bg-surface p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
            Where enquiries are sitting
          </h3>
          <div className="mt-4 space-y-2">
            {summary.stages.map(({ stage, count }) => {
              const max = Math.max(...summary.stages.map((entry) => entry.count), 1)
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-48 flex-shrink-0 text-sm text-ink-muted">{stage}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-surface-muted">
                    <div
                      className={`h-full ${stage === 'Lost' ? 'bg-rose-400' : 'bg-gold-500'}`}
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-semibold tabular-nums text-ink">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* The enquiries themselves */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="border-b border-line px-6 py-4">
          <h3 className="text-lg font-semibold text-ink">Enquiries</h3>
          <p className="text-sm text-ink-muted/60">
            Move an enquiry as the family progresses. Marking one lost asks why.
          </p>
        </div>

        {enrollments.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-ink-faint">No enquiries yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {enrollments.map((enrollment) => {
              const stalled = daysSince(enrollment.stageChangedAt || enrollment.createdAt)
              return (
                <div key={enrollment.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                  <div className="min-w-[12rem] flex-1">
                    <p className="flex items-center gap-2 font-medium text-ink">
                      {/* A consultation request may not name the learner yet. */}
                      {enrollment.studentName || enrollment.parentName || 'Unnamed enquiry'}
                      {enrollment.requestType === 'consultation' && (
                        <span className="rounded-full bg-gold-50 px-2 py-0.5 text-xs font-semibold text-gold-700">
                          Consultation
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-ink-muted/70">
                      {enrollment.programme || 'No programme named'}
                      {enrollment.parentName && enrollment.studentName ? ` · ${enrollment.parentName}` : ''}
                      {enrollment.preferredChannel ? ` · prefers ${enrollment.preferredChannel}` : ''}
                    </p>
                    {enrollment.stageNote && (
                      <p className="mt-1 text-xs italic text-ink-faint">{enrollment.stageNote}</p>
                    )}
                  </div>

                  {stalled !== null && (
                    <span
                      className={`text-xs tabular-nums ${
                        stalled >= 14 && enrollment.pipelineStage !== 'Active Learner' && enrollment.pipelineStage !== 'Lost'
                          ? 'font-semibold text-critical'
                          : 'text-ink-faint'
                      }`}
                    >
                      {stalled}d in stage
                    </span>
                  )}

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${stageTone[enrollment.pipelineStage]}`}
                  >
                    {enrollment.pipelineStage}
                  </span>

                  <select
                    value={enrollment.pipelineStage}
                    disabled={saving === enrollment.id}
                    onChange={(event) => moveStage(enrollment, event.target.value as PipelineStage)}
                    className="rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-gold-500 disabled:opacity-50"
                    aria-label={`Pipeline stage for ${enrollment.studentName || enrollment.parentName || `enquiry ${enrollment.id}`}`}
                  >
                    {ACTIVE_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
