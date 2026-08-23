import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * What happens after a parent gets in touch.
 *
 * The homepage described what Axis offers four times over — the hero list, the
 * services grid, the learning options, the reasons to choose — and never once
 * said what follows an enquiry. A parent deciding whether to make contact is
 * asking what they are committing to, and the answer existed only inside a
 * single FAQ answer.
 *
 * The wording is Axis's own, from that answer, unchanged in substance. Step
 * four matters most: it says plainly that a price comes after a conversation,
 * which turns "costs vary, contact us" from an evasion into a stage.
 */
const steps = [
  {
    title: 'Initial enquiry',
    text: 'You tell us about the learner and what you are looking for. Nothing is committed at this point.',
  },
  {
    title: 'Learner discovery',
    text: 'We take time to understand the learner’s profile, strengths and requirements before recommending anything.',
  },
  {
    title: 'Pathway recommendation',
    text: 'We recommend a programme and curriculum that suit that particular learner.',
  },
  {
    title: 'Fee discussion',
    text: 'We set out what it costs, once we know what is actually being proposed.',
  },
  {
    title: 'Enrolment',
    text: 'The learner joins the programme and begins.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-surface-sunk py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="section-label mb-4 text-left">How it works</div>
          <h2 className="text-3xl font-semibold text-ink sm:text-4xl">
            What happens after you get in touch
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            You do not need to know which programme you want before contacting us. Most families
            start with a conversation.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-line bg-surface p-6 shadow-sm"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 font-semibold text-gold-500"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link to="/enroll" className="btn-primary inline-flex items-center gap-2">
            Start with an enquiry
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-sm text-ink-muted">
            We aim to respond within 24 hours.
          </p>
        </div>
      </div>
    </section>
  )
}
