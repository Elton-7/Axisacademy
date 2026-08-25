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
    title: 'Make an Enquiry',
    text: 'Tell us about the learner, where you are, and what support you are looking for. Nothing is committed at this point.',
  },
  {
    title: 'Learner Discovery',
    text: 'A conversation to understand the learner’s current education, strengths, interests, needs, goals and circumstances.',
  },
  {
    title: 'Learning Pathway Recommendation',
    text: 'We recommend a programme, curriculum and learning arrangement — subjects, timetable, mode of learning and any enrichment.',
  },
  {
    title: 'Submit Essential Documents',
    /*
     * The Special Needs requirement is stated plainly because it is a
     * requirement, and a parent who learns of it only at step four of an
     * enrolment has been misled by everything before it. The reason is given
     * alongside it so that it reads as part of planning the right support
     * rather than as a hurdle — the review asks that this step not feel like a
     * frightening checklist.
     */
    text: 'Only what is relevant to the learner and programme: usually a photograph, a birth certificate or ID, and previous school reports where they exist. For Special Needs Education, hospital and assessment documents are required, so that the support we plan is built on what has already been established about the learner.',
  },
  {
    title: 'Programme & Fee Agreement',
    text: 'The arrangement, timetable, services and fees are set out and agreed with you.',
  },
  {
    title: 'Family Meeting & Matriculation',
    text: 'The learner and family meet the Axis team or educator, in person or online, to get ready to start.',
  },
  {
    title: 'Enrolment & Learning Begins',
    text: 'The learner is enrolled and begins — home-based, centre-based, online or blended.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-surface-sunk py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="section-label mb-4 text-left">How it works — Admission &amp; Enrolment</div>
          <h2 className="text-3xl font-semibold text-ink sm:text-4xl">
            What happens after you get in touch
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            You do not need to know which programme you want before contacting us. Most families
            start with a conversation.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
