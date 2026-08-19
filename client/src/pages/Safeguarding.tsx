import { Link } from 'react-router-dom'
import {
  BadgeCheck, CalendarClock, HomeIcon, ShieldAlert,
  EyeOff, Image as ImageIcon, FileSearch, Phone,
} from 'lucide-react'
import { contact, telHref, mailtoHref, whatsappHref } from '../content/contact'

/**
 * Safeguarding, written for a parent rather than a regulator.
 *
 * The privacy page already covers this ground, but as policy — the document you
 * read after you have decided, not while deciding. A parent choosing who comes
 * into their home is asking a different question, and every answer here is one
 * the system enforces rather than one Axis merely intends.
 *
 * Nothing on this page should be edited to say more than the code does. Each
 * commitment below has a matching rule in the API, noted beside it.
 */
const commitments = [
  {
    icon: BadgeCheck,
    title: 'No educator meets your child before they are cleared',
    // routes/learners.js — assignment returns 422 unless isCurrentlyCleared()
    text:
      'Vetting is not a step that can be skipped or completed later. Until an educator’s record shows a valid Certificate of Good Conduct, verified identity, checked references, and TSC registration where it applies, the system refuses to assign them to a learner at all. It is not a reminder for staff to act on — the assignment simply cannot be made.',
  },
  {
    icon: CalendarClock,
    title: 'Clearance expires, and we act on it',
    // EducatorVetting.isCurrentlyCleared() requires a non-expired expiry date
    text:
      'A Certificate of Good Conduct is recorded with its expiry date, and clearance is checked against that date rather than against the fact that a certificate was once seen. When clearance lapses, is withdrawn or is suspended, every assignment that educator holds ends immediately and their access to those learners’ records and messages ends with it.',
  },
  {
    icon: HomeIcon,
    title: 'Home sessions are recorded as they happen',
    // routes/portal.js — Attended + home-based requires checkIn, checkOut, adultPresent
    text:
      'An educator alone with a child in a private home is the highest-risk part of this service, so it carries the strictest rule. A home-based session cannot be marked attended without an arrival time, a departure time, and confirmation that a responsible adult was present. The record is made at the time rather than reconstructed afterwards, and a session missing any of it stands out rather than passing quietly.',
  },
  {
    icon: ShieldAlert,
    title: 'You can raise a concern directly, at any time',
    // routes/portal.js — POST /concerns open to parents and educators; GET is staff-only
    text:
      'Any parent, learner or educator can raise a safeguarding concern without going through anyone else. Concerns reach Axis staff only. An educator can never see a concern — including one raised about them — so nothing you report puts you in the position of having complained to the person you are worried about.',
  },
  {
    icon: EyeOff,
    title: 'Only you can see your child’s record',
    // routes/portal.js — resolveLearnerIds() is the single scoping authority
    text:
      'A parent reaches their own learners and no one else’s. An educator reaches only the learners currently assigned to them. This is decided when the information is fetched, not hidden afterwards in the page — so there is no version of the request that returns another family’s child.',
  },
  {
    icon: ImageIcon,
    title: 'No photograph of your child without your written consent',
    // routes/gallery.js — requires consentConfirmed === true AND a consentReference
    text:
      'Media cannot be published by confirming consent alone. The signed release it refers to must be named on the record, so every published image can be traced back to the permission that allowed it. A tick with nothing behind it is rejected.',
  },
  {
    icon: FileSearch,
    title: 'You can see everything we hold, and ask us to delete it',
    // routes/dataprotection.js — /learners/:id/export and DELETE /learners/:id
    text:
      'Ask, and you receive a full copy of everything held about your learner — including the record of who has viewed or changed it. Ask us to erase it and we will. Access to a child’s record is logged, because being able to say who looked at it is part of protecting it.',
  },
]

export default function Safeguarding() {
  return (
    <div className="pt-20">
      <section className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="section-label mb-4">Child Safety</div>
          <h1 className="text-4xl font-semibold sm:text-5xl">How we keep your child safe</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">
            Choosing who teaches your child — and who comes into your home — deserves more than a
            promise that everyone is vetted. Below is what Axis does, and how each of these is
            enforced rather than intended.
          </p>
        </div>
      </section>

      <section className="bg-surface-sunk py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-5">
            {commitments.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
                <div className="flex gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tint-amber">
                    <Icon className="h-6 w-6 text-gold-700" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-ink">{title}</h2>
                    <p className="mt-2 leading-relaxed text-ink-muted">{text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-line-critical bg-tint-critical p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink">If you are worried about a child</h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Tell us. You do not need to be certain, and you do not need to raise it with the
              educator first. If you have a parent or educator account you can raise a concern from
              your portal, where it goes to Axis staff and is never visible to educators. Otherwise
              contact us directly and say that it concerns a child’s safety.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={telHref} className="btn-primary inline-flex items-center gap-2">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {contact.phoneDisplay}
              </a>
              <a
                href={whatsappHref('Hello Axis Learning, I would like to raise a concern about a child’s safety.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 font-medium text-ink transition-colors hover:bg-surface-muted"
              >
                WhatsApp
              </a>
              <a
                href={mailtoHref}
                className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 font-medium text-ink transition-colors hover:bg-surface-muted"
              >
                {contact.email}
              </a>
            </div>
            <p className="mt-5 text-sm text-ink-muted/80">
              If a child is in immediate danger, contact the police or the Kenya Childline on 116
              before contacting us.
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-ink-muted/80">
            For how information is collected, used and retained, see our{' '}
            <Link to="/privacy" className="font-semibold text-gold-700 hover:underline">
              privacy and child safety policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
