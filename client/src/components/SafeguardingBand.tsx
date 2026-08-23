import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight } from 'lucide-react'

/**
 * The homepage answer to "but is it safe?".
 *
 * A parent reads what is offered and then asks who will be in the room with
 * their child. The controls behind that answer are the strongest part of this
 * build and were reachable only from the footer, which is nobody's route to
 * reassurance.
 *
 * The three points restate rules the API enforces. If any of them changes,
 * this has to change with it — see pages/Safeguarding.tsx, where each is
 * annotated with the rule behind it.
 */
const points = [
  'Vetting must be current before an educator can be assigned at all',
  'Home sessions need an arrival time, a departure time and a responsible adult',
  'Anyone can raise a concern, and only Axis staff can read it',
]

export default function SafeguardingBand() {
  return (
    <section className="bg-navy-900 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/30">
                <ShieldCheck className="h-5 w-5 text-gold-500" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
                Child safety
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Every educator is cleared before they meet your child
            </h2>

            <ul className="mt-6 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex gap-3 text-white/75">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/safeguarding"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-gold-500 px-6 py-3.5 font-semibold text-gold-500 transition-colors hover:bg-gold-500 hover:text-navy-surface lg:self-center"
          >
            How we keep your child safe
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
