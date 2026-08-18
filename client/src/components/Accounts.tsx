import { useEffect, useState } from 'react'
import { KeyRound, Loader2, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { accountsApi } from '../services/apiClient'
import type { Account, AccountRole } from '../types'

/**
 * Account administration (brief §28–§30).
 *
 * Nothing in the portals works until these exist: a parent account has to
 * precede a learner, and an educator account has to precede vetting and
 * assignment.
 *
 * Temporary passwords are shown once, in a panel that has to be dismissed
 * deliberately. There is no way to retrieve one afterwards — that is the point,
 * so the screen says so rather than letting it be closed by accident.
 */

const roleLabel: Record<AccountRole, string> = {
  admin: 'Administrator',
  staff: 'Axis staff',
  tutor: 'Educator',
  student: 'Parent or learner',
}

const roleTone: Record<AccountRole, string> = {
  admin: 'bg-tint-critical text-critical',
  staff: 'bg-tint-blue text-info',
  tutor: 'bg-tint-purple text-ink',
  student: 'bg-tint-positive text-positive',
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'student' as AccountRole })
  const [saving, setSaving] = useState(false)
  const [issued, setIssued] = useState<{ name: string; email: string; password: string } | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      setAccounts(await accountsApi.getAll())
    } catch (err) {
      console.error('Failed to load accounts:', err)
      setError('Accounts are unavailable right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  /** Surface the API's own refusal rather than a generic failure. */
  const fail = (err: unknown, fallback: string) => {
    const data = (err as { response?: { data?: { error?: string; errors?: { msg: string }[] } } })?.response?.data
    toast.error(data?.error || data?.errors?.[0]?.msg || fallback)
  }

  const create = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('A name and email are required')
      return
    }
    try {
      setSaving(true)
      const created = await accountsApi.create({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      })
      setIssued({ name: created.name, email: created.email, password: created.temporaryPassword })
      setForm({ name: '', email: '', role: 'student' })
      setShowForm(false)
      await load()
    } catch (err) {
      fail(err, 'Could not create this account.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (account: Account) => {
    const disabling = account.isActive
    if (disabling) {
      const warning =
        account.role === 'tutor'
          ? `Disable ${account.name}? They will lose access to every learner they are assigned to, immediately.`
          : `Disable ${account.name}? They will no longer be able to sign in.`
      if (!confirm(warning)) return
    }
    try {
      const result = await accountsApi.update(account.id, { isActive: !account.isActive })
      const ended = result.assignmentsEnded
        ? `, ${result.assignmentsEnded} assignment(s) ended`
        : ''
      toast.success(disabling ? `${account.name} disabled${ended}` : `${account.name} re-enabled`)
      await load()
    } catch (err) {
      fail(err, 'Could not update this account.')
    }
  }

  const resetPassword = async (account: Account) => {
    if (!confirm(`Issue a new temporary password for ${account.name}? Their current one stops working immediately.`)) return
    try {
      const { temporaryPassword } = await accountsApi.resetPassword(account.id)
      setIssued({ name: account.name, email: account.email, password: temporaryPassword })
      await load()
    } catch (err) {
      fail(err, 'Could not reset the password.')
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
      {issued && (
        <div className="rounded-xl border-2 border-gold-500 bg-gold-50 p-6">
          <h3 className="text-lg font-semibold text-ink">Temporary password for {issued.name}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Pass this to {issued.email} securely. It cannot be shown again — if it is lost, issue
            another. They will be asked to change it when they sign in.
          </p>
          <p className="mt-4 select-all rounded-lg bg-surface px-4 py-3 font-mono text-lg tracking-wide text-ink">
            {issued.password}
          </p>
          <button
            onClick={() => setIssued(null)}
            className="mt-4 rounded-lg bg-navy-surface px-4 py-2 text-sm text-white hover:bg-navy-light"
          >
            I have copied it
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">Accounts</h3>
          <p className="text-sm text-ink-muted">
            A parent account must exist before a learner can be linked to it, and an educator
            account before they can be vetted.
          </p>
        </div>
        <button
          onClick={() => setShowForm((open) => !open)}
          className="inline-flex items-center gap-2 rounded-lg bg-navy-surface px-4 py-2 text-sm text-white hover:bg-navy-light"
        >
          <UserPlus className="h-4 w-4" /> New account
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-line-critical bg-tint-critical p-5 text-sm text-critical">
          {error}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-line bg-surface p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-gold-500"
            />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-gold-500"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AccountRole })}
              className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-gold-500"
            >
              <option value="student">Parent or learner</option>
              <option value="tutor">Educator</option>
              <option value="staff">Axis staff</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={create}
              disabled={saving}
              className="rounded-lg bg-gold-600 px-4 py-2 text-sm text-white hover:bg-gold-700 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create account'}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setForm({ name: '', email: '', role: 'student' })
              }}
              className="rounded-lg bg-surface-muted px-4 py-2 text-sm text-ink-muted hover:bg-line"
            >
              Cancel
            </button>
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            A temporary password is generated and shown once. Axis never stores it in readable form.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {accounts.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-ink-faint">No accounts yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {accounts.map((account) => (
              <div key={account.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                <div className="min-w-[12rem] flex-1">
                  <p className={account.isActive ? 'font-medium text-ink' : 'font-medium text-ink-faint line-through'}>
                    {account.name}
                  </p>
                  <p className="text-sm text-ink-muted">{account.email}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {account.lastLoginAt
                      ? `Last signed in ${new Date(account.lastLoginAt).toLocaleDateString()}`
                      : 'Never signed in'}
                    {account.mustChangePassword ? ' · temporary password not yet changed' : ''}
                  </p>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleTone[account.role]}`}>
                  {roleLabel[account.role]}
                </span>
                {!account.isActive && (
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-ink-faint">
                    Disabled
                  </span>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => resetPassword(account)}
                    title="Issue a new temporary password"
                    className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted hover:border-gold-500"
                  >
                    <KeyRound className="h-3 w-3" /> Reset password
                  </button>
                  <button
                    onClick={() => toggleActive(account)}
                    className={
                      account.isActive
                        ? 'rounded-lg border border-line-critical px-3 py-1.5 text-xs text-critical hover:bg-tint-critical'
                        : 'rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted hover:border-gold-500'
                    }
                  >
                    {account.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
