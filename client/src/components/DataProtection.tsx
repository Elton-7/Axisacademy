import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ShieldCheck, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'
import { safeguardingApi } from '../services/apiClient'
import { apiErrorMessage } from '../utils/apiError'
import type { RetentionReport } from '../types'

/**
 * The retention schedule, and the control that applies it.
 *
 * The privacy page tells families that Axis does not keep personal data
 * indefinitely. The periods existed and the endpoint to enforce them existed,
 * but nothing in the admin could run it — so in practice nothing was ever
 * deleted and the statement was aspirational.
 *
 * Reporting is deliberately separate from deleting: staff see exactly what
 * would go before anything goes, and only an administrator can apply it.
 */

const describeDays = (days: number) => {
  if (days % 365 === 0) {
    const years = days / 365
    return `${years} year${years === 1 ? '' : 's'}`
  }
  return `${days} days`
}

const ROWS = [
  {
    key: 'unconvertedEnquiries',
    policyKey: 'unconvertedEnquiryDays',
    label: 'Unconverted enquiries',
    detail: 'Enquiries that never became a learner. Enrolled and active learners are never touched.',
  },
  {
    key: 'contactMessages',
    policyKey: 'contactMessageDays',
    label: 'Contact messages',
    detail: 'General messages sent through the website contact form.',
  },
  {
    key: 'auditEntries',
    policyKey: 'auditLogDays',
    label: 'Audit entries',
    detail: 'Kept longest: they are the record of who looked at or changed a learner’s data.',
  },
] as const

export default function DataProtection() {
  const [report, setReport] = useState<RetentionReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setReport(await safeguardingApi.getRetention())
      setError(null)
    } catch (err) {
      setError(apiErrorMessage(err, 'The retention report is unavailable right now.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const apply = async () => {
    setApplying(true)
    try {
      const removed = await safeguardingApi.applyRetention()
      const total = removed.unconvertedEnquiries + removed.contactMessages
      toast.success(
        total === 0
          ? 'Nothing was past its retention period.'
          : `Erased ${removed.unconvertedEnquiries} enquiries and ${removed.contactMessages} messages.`
      )
      setConfirming(false)
      await load()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not apply the retention schedule.'))
    } finally {
      setApplying(false)
    }
  }

  const totalDue = report
    ? report.dueForDeletion.unconvertedEnquiries + report.dueForDeletion.contactMessages
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
            <ShieldCheck className="h-5 w-5 text-gold-500" aria-hidden="true" />
            Data retention
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            The privacy page tells families that personal data is not kept indefinitely. This is where
            that promise is actually kept.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-ink">{error}</div>
      )}

      {loading && !report && <p className="text-sm text-ink-muted">Loading the retention report…</p>}

      {report && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-surface-muted text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">What</th>
                  <th scope="col" className="px-4 py-3 font-medium">Kept for</th>
                  <th scope="col" className="px-4 py-3 font-medium">Past that period</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const due = report.dueForDeletion[row.key]
                  return (
                    <tr key={row.key} className="border-t border-line align-top">
                      <td className="px-4 py-3">
                        <span className="font-medium text-ink">{row.label}</span>
                        <span className="mt-1 block text-xs text-ink-muted">{row.detail}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink">
                        {describeDays(report.policy[row.policyKey])}
                      </td>
                      <td className="px-4 py-3">
                        <span className={due > 0 ? 'font-semibold text-ink' : 'text-ink-faint'}>
                          {due}
                        </span>
                        {row.key === 'auditEntries' && due > 0 && (
                          <span className="mt-1 block text-xs text-ink-muted">
                            Not removed by this control — audit history is deleted only deliberately.
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-ink-muted">{report.note}</p>

          <div className="rounded-2xl border border-line p-5">
            {!confirming ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">Apply the retention schedule</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {totalDue === 0
                      ? 'Nothing is currently past its retention period.'
                      : `${totalDue} record${totalDue === 1 ? '' : 's'} would be erased permanently.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  disabled={totalDue === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-critical px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Apply schedule
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-critical" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-ink">This cannot be undone</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {report.dueForDeletion.unconvertedEnquiries} enquiries and{' '}
                      {report.dueForDeletion.contactMessages} contact messages will be erased. Learners
                      who enrolled are not affected. Only an administrator can do this.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={apply}
                    disabled={applying}
                    className="rounded-xl bg-critical px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {applying ? 'Erasing…' : 'Yes, erase them'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={applying}
                    className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
