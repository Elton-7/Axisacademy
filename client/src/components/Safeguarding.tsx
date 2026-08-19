import { useEffect, useState } from 'react'
import { AlertTriangle, BadgeCheck, Loader2, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiErrorMessage } from '../utils/apiError'
import { safeguardingApi } from '../services/apiClient'
import type { ConcernStatus, SafeguardingConcern, VettingRow, VettingStatus } from '../types'

/**
 * Vetting and safeguarding (brief §38).
 *
 * Both live on one screen because they answer the same question — who is
 * allowed near a learner, and what happened when they were. The rules are
 * enforced by the API; this surfaces them and explains why an action was
 * refused rather than failing silently.
 */

const statusTone: Record<VettingStatus, string> = {
  'Not started': 'bg-surface-muted text-ink-muted',
  'In progress': 'bg-tint-amber text-warning',
  Cleared: 'bg-tint-positive text-positive',
  Rejected: 'bg-tint-critical text-critical',
  Suspended: 'bg-tint-critical text-critical',
}

const concernTone: Record<ConcernStatus, string> = {
  Open: 'bg-tint-critical text-critical',
  Acknowledged: 'bg-tint-amber text-warning',
  'Under review': 'bg-tint-blue text-info',
  Resolved: 'bg-tint-positive text-positive',
  Escalated: 'bg-tint-critical text-critical',
}

const blank = {
  status: 'Cleared' as VettingStatus,
  goodConductNumber: '',
  goodConductIssuedOn: '',
  goodConductExpiresOn: '',
  tscNumber: '',
  identityVerifiedOn: '',
  referencesCheckedOn: '',
  referencesNote: '',
}

export default function Safeguarding() {
  const [vetting, setVetting] = useState<VettingRow[]>([])
  const [concerns, setConcerns] = useState<SafeguardingConcern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState(blank)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [v, c] = await Promise.all([safeguardingApi.getVetting(), safeguardingApi.getConcerns()])
      setVetting(v)
      setConcerns(c)
    } catch (err) {
      console.error('Failed to load safeguarding data:', err)
      setError('Safeguarding records are unavailable right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async (educatorUserId: number) => {
    try {
      await safeguardingApi.updateVetting(educatorUserId, form)
      toast.success('Vetting updated')
      setEditing(null)
      setForm(blank)
      await load()
    } catch (err) {
      // The API refuses incomplete clearance for a reason; show that reason.
      toast.error(apiErrorMessage(err, 'Could not update vetting.'))
    }
  }

  const setStatus = async (educatorUserId: number, status: VettingStatus, name: string) => {
    if (status === 'Suspended' || status === 'Rejected') {
      if (!confirm(`Mark ${name} as ${status.toLowerCase()}? They will lose access to every learner they are assigned to, immediately.`)) return
    }
    try {
      await safeguardingApi.updateVetting(educatorUserId, { status })
      toast.success(`${name} marked ${status.toLowerCase()}`)
      await load()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not update vetting.'))
    }
  }

  const resolveConcern = async (concern: SafeguardingConcern) => {
    const outcome = window.prompt(`What was done about this concern?\n\n"${concern.detail.slice(0, 120)}"`)
    if (outcome === null) return
    if (!outcome.trim()) {
      toast.error('An outcome is required before a concern can be resolved')
      return
    }
    try {
      await safeguardingApi.updateConcern(concern.id, { status: 'Resolved', outcome: outcome.trim() })
      toast.success('Concern resolved')
      await load()
    } catch (err) {
      console.error('Failed to resolve concern:', err)
      toast.error('Could not update this concern.')
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
    return <div className="rounded-xl border border-line-critical bg-tint-critical p-6 text-sm text-critical">{error}</div>
  }

  const openConcerns = concerns.filter((c) => c.status !== 'Resolved')
  const uncleared = vetting.filter((v) => !v.cleared)

  return (
    <div className="space-y-6">
      {/* What needs attention */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Cleared to teach</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-positive">{vetting.filter((v) => v.cleared).length}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Cannot be assigned</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-critical">{uncleared.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Open concerns</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-critical">{openConcerns.length}</p>
        </div>
      </div>

      {/* Concerns first — they are the most time-sensitive thing here. */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="border-b border-line px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <ShieldAlert className="h-5 w-5 text-critical" /> Safeguarding concerns
          </h3>
          <p className="text-sm text-ink-muted">
            Raised by parents and educators. Visible only to Axis staff — never to educators.
          </p>
        </div>
        {concerns.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink-muted">No concerns have been raised.</p>
        ) : (
          <div className="divide-y divide-line">
            {concerns.map((c) => (
              <div key={c.id} className="px-6 py-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-[14rem] flex-1">
                    <p className="text-sm font-medium text-ink">
                      {c.category}
                      {c.learner ? ` · ${c.learner.name}` : ''}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">{c.detail}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Raised by {c.raisedBy?.name || 'unknown'} ({c.raisedByRole}) ·{' '}
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                    {c.outcome && <p className="mt-2 text-xs italic text-ink-muted">Outcome: {c.outcome}</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${concernTone[c.status]}`}>
                    {c.status}
                  </span>
                  {c.status !== 'Resolved' && (
                    <div className="flex gap-2">
                      {c.status === 'Open' && (
                        <button
                          onClick={() => safeguardingApi.updateConcern(c.id, { status: 'Acknowledged' }).then(load)}
                          className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted hover:border-gold-500"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => resolveConcern(c)}
                        className="rounded-lg bg-navy-surface px-3 py-1.5 text-xs text-white hover:bg-navy-light"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vetting */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="border-b border-line px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <BadgeCheck className="h-5 w-5 text-gold-700" /> Educator vetting
          </h3>
          <p className="text-sm text-ink-muted">
            An educator cannot be assigned to a learner until clearance is current.
          </p>
        </div>
        {vetting.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink-muted">No educator accounts yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {vetting.map((v) => (
              <div key={v.educatorUserId} className="px-6 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-[12rem] flex-1">
                    <p className="font-medium text-ink">{v.name}</p>
                    <p className="text-sm text-ink-muted">{v.email}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {v.goodConductNumber ? `Good conduct ${v.goodConductNumber}` : 'No certificate recorded'}
                      {v.goodConductExpiresOn ? ` · expires ${v.goodConductExpiresOn}` : ''}
                      {v.tscNumber ? ` · TSC ${v.tscNumber}` : ''}
                    </p>
                    {v.expired && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-critical">
                        <AlertTriangle className="h-3 w-3" /> Clearance has expired — cannot be assigned
                      </p>
                    )}
                    {v.expiringSoon && !v.expired && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-warning">
                        <AlertTriangle className="h-3 w-3" /> Expires within 60 days — renew now
                      </p>
                    )}
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[v.status]}`}>
                    {v.status}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(editing === v.educatorUserId ? null : v.educatorUserId)
                        setForm({
                          ...blank,
                          goodConductNumber: v.goodConductNumber || '',
                          goodConductExpiresOn: v.goodConductExpiresOn || '',
                          tscNumber: v.tscNumber || '',
                          identityVerifiedOn: v.identityVerifiedOn || '',
                          referencesCheckedOn: v.referencesCheckedOn || '',
                        })
                      }}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted hover:border-gold-500"
                    >
                      {editing === v.educatorUserId ? 'Close' : 'Record vetting'}
                    </button>
                    {v.cleared && (
                      <button
                        onClick={() => setStatus(v.educatorUserId, 'Suspended', v.name)}
                        className="rounded-lg border border-line-critical px-3 py-1.5 text-xs text-critical hover:bg-tint-critical"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>

                {editing === v.educatorUserId && (
                  <div className="mt-4 rounded-lg bg-surface-sunk p-4">
                    <p className="mb-3 text-xs text-ink-muted">
                      Clearing an educator requires a certificate number, an expiry date that has not
                      passed, and the date references were checked.
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-xs text-ink-muted">
                        Certificate of Good Conduct number
                        <input value={form.goodConductNumber} onChange={(e) => setForm({ ...form, goodConductNumber: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold-500" />
                      </label>
                      <label className="text-xs text-ink-muted">
                        Expires on
                        <input type="date" value={form.goodConductExpiresOn} onChange={(e) => setForm({ ...form, goodConductExpiresOn: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold-500" />
                      </label>
                      <label className="text-xs text-ink-muted">
                        References checked on
                        <input type="date" value={form.referencesCheckedOn} onChange={(e) => setForm({ ...form, referencesCheckedOn: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold-500" />
                      </label>
                      <label className="text-xs text-ink-muted">
                        Identity verified on
                        <input type="date" value={form.identityVerifiedOn} onChange={(e) => setForm({ ...form, identityVerifiedOn: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold-500" />
                      </label>
                      <label className="text-xs text-ink-muted">
                        TSC number <span className="text-ink-muted">(if a registered teacher)</span>
                        <input value={form.tscNumber} onChange={(e) => setForm({ ...form, tscNumber: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold-500" />
                      </label>
                      <label className="text-xs text-ink-muted">
                        Decision
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VettingStatus })}
                          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold-500">
                          <option value="In progress">In progress</option>
                          <option value="Cleared">Cleared</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </label>
                    </div>
                    <textarea placeholder="Notes on references or the decision" rows={2}
                      value={form.referencesNote} onChange={(e) => setForm({ ...form, referencesNote: e.target.value })}
                      className="mt-3 w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold-500" />
                    <button onClick={() => save(v.educatorUserId)}
                      className="mt-3 rounded-lg bg-gold-600 px-4 py-2 text-sm text-white hover:bg-gold-700">
                      Save vetting
                    </button>
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
