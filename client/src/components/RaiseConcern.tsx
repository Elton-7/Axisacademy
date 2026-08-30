import { useState } from 'react'
import { Loader2, Phone, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { contact, telHref } from '../content/contact'
import { portalApi } from '../services/apiClient'
import { apiErrorMessage } from '../utils/apiError'
import type { ConcernCategory } from '../types'

/**
 * Raising a safeguarding concern from the portal (brief §38).
 *
 * The API has accepted these from parents and educators since the portal was
 * built, and nothing in the client ever sent one — while the public
 * safeguarding page told people, in as many words, that "if you have a parent
 * or educator account you can raise a concern from your portal". So the site
 * published a child-protection commitment with nothing behind it, and staff
 * could only triage concerns that had no way of arriving.
 *
 * Three things this is careful about.
 *
 * It repeats the promise the public page makes rather than paraphrasing it:
 * concerns reach Axis staff only, and an educator can never see one, including
 * one raised about them. Someone deciding whether to report the person they are
 * worried about needs that in front of them at the moment they decide.
 *
 * It offers the phone first for anything urgent. A form that reaches an inbox
 * is the wrong instrument for a child in immediate danger, and saying so is
 * more use than any amount of reassurance about response times.
 *
 * And it promises nothing about what happens next that the portal can keep.
 * Whoever raises a concern cannot read it afterwards — reading is staff only —
 * so there is no reference number, no status, and no thread to return to. The
 * confirmation says it reached Axis, and stops there.
 */

const CATEGORIES: ConcernCategory[] = [
  'Learner wellbeing',
  'Conduct of an educator',
  'Safety of the setting',
  'Communication',
  'Other',
]

type Learner = { id: number; name: string }

export default function RaiseConcern({ learners }: { learners: Learner[] }) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState<ConcernCategory>('Learner wellbeing')
  const [learnerId, setLearnerId] = useState<string>(learners.length === 1 ? String(learners[0].id) : '')
  const [detail, setDetail] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!detail.trim()) return

    setSaving(true)
    try {
      await portalApi.raiseConcern({
        detail: detail.trim(),
        category,
        learnerId: learnerId ? Number(learnerId) : null,
      })
      // Cleared immediately: what was written is not left sitting on a screen
      // that may be shared, or in a form that could be resubmitted.
      setDetail('')
      setSent(true)
      setOpen(false)
      toast.success('Your concern has reached Axis')
    } catch (error) {
      console.error('Failed to raise the concern:', error)
      toast.error(apiErrorMessage(error, 'We could not send this. Please telephone Axis instead.'))
    } finally {
      setSaving(false)
    }
  }

  const field = 'w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-gold-500'

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        <ShieldAlert className="h-4 w-4" /> Safeguarding
      </h3>

      {sent && !open ? (
        <div className="mt-4 rounded-xl border border-positive/30 bg-tint-emerald p-4">
          <p className="text-sm font-medium text-ink">Your concern has reached Axis staff.</p>
          <p className="mt-1 text-sm text-ink-muted">
            It is being handled by the safeguarding team. You will not see it here — concerns are
            visible to Axis staff only — so if anything changes, or you need to add to it, please
            telephone.
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink-muted">
          You can raise a concern about a child’s safety at any time, without going through anyone
          else. Concerns reach Axis staff only, and an educator can never see one — including a
          concern raised about them.
        </p>
      )}

      {/* Offered before the form, not after it. */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-surface-muted p-4">
        <p className="text-sm text-ink-muted">
          If a child is in immediate danger, telephone rather than writing here.
        </p>
        <a
          href={telHref}
          className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          <Phone className="h-4 w-4" aria-hidden="true" /> {contact.phoneDisplay}
        </a>
      </div>

      {!open ? (
        <button
          onClick={() => { setSent(false); setOpen(true) }}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:border-gold-300 hover:text-gold-700"
        >
          <ShieldAlert className="h-4 w-4" /> {sent ? 'Raise another concern' : 'Raise a concern'}
        </button>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="concern-category" className="mb-1 block text-xs font-medium text-ink-muted">
                What is this about?
              </label>
              <select
                id="concern-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as ConcernCategory)}
                className={field}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {learners.length > 0 && (
              <div>
                <label htmlFor="concern-learner" className="mb-1 block text-xs font-medium text-ink-muted">
                  Which learner? (optional)
                </label>
                <select
                  id="concern-learner"
                  value={learnerId}
                  onChange={(event) => setLearnerId(event.target.value)}
                  className={field}
                >
                  <option value="">Not about a particular learner</option>
                  {learners.map((learner) => (
                    <option key={learner.id} value={learner.id}>{learner.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="concern-detail" className="mb-1 block text-xs font-medium text-ink-muted">
              What are you concerned about?
            </label>
            <textarea
              id="concern-detail"
              rows={5}
              required
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="What happened, when, and who was there. Write as much or as little as you can."
              className={field}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !detail.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gold-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gold-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Send to Axis
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
