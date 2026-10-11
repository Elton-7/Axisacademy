import { useEffect, useState } from 'react'
import { AnimatedBackground, TextReveal } from '../motion'
import { Link } from 'react-router-dom'
import { AlertTriangle, Banknote, CalendarRange, Phone, Printer, ScrollText } from 'lucide-react'
import {
  admissionFee,
  feeProgrammes,
  generalTerms,
  paymentDetails,
  paymentPlans,
  type FeeCell,
  type FeeTable,
} from '../content/fees'
import { contact, telHref } from '../content/contact'

/**
 * The published fee structure, 2026/2027.
 *
 * Every figure comes from content/fees.ts, transcribed from the authorised
 * documents. Nothing is calculated here — a page that derived a term fee from a
 * monthly one would eventually disagree with the signed document a family is
 * holding, and the document wins.
 *
 * Two decisions shape the layout.
 *
 * The monthly figure leads and the term sits beneath it, because that is how the
 * documents present it and how families think about affording it — but the term
 * is the real unit, so the page says that plainly rather than letting anyone
 * assume a month is the commitment.
 *
 * And it is built to be printed. A fee structure is a document families save,
 * forward to a spouse, and bring to a consultation. The print rules drop the
 * navigation and the decoration, keep every table intact, and stop rows being
 * split across a page break.
 */

const isCell = (value: FeeCell | string): value is FeeCell => typeof value === 'object'

function ProgrammeTable({ table }: { table: FeeTable }) {
  return (
    <section className="mt-10 first:mt-0">
      <h3 className="text-xl font-semibold text-ink">{table.heading}</h3>
      {table.intro && (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">{table.intro}</p>
      )}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr className="bg-navy-900 text-white">
              <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">
                Level
              </th>
              {table.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {table.rows.map((row) => (
              <tr key={`${row.label}-${row.detail ?? ''}`} className="align-top even:bg-surface-sunk/50">
                <th scope="row" className="px-5 py-4 text-left">
                  <span className="block text-sm font-semibold text-ink">{row.label}</span>
                  {row.detail && (
                    <span className="mt-0.5 block text-xs font-normal leading-relaxed text-ink-muted">
                      {row.detail}
                    </span>
                  )}
                </th>
                {row.cells.map((cell, index) => (
                  <td key={`${row.label}-${table.columns[index] ?? index}`} className="px-5 py-4">
                    {isCell(cell) ? (
                      <>
                        <span className="block text-base font-semibold tabular-nums text-ink">
                          KSh {cell.monthly}
                        </span>
                        <span className="block text-xs text-ink-muted">per month</span>
                        {cell.term && (
                          <span className="mt-1 block text-xs tabular-nums text-ink-muted">
                            KSh {cell.term} per 3-month term
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="block text-sm leading-relaxed text-ink">{cell}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.footnote && (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">{table.footnote}</p>
      )}
    </section>
  )
}

export default function Fees() {
  const [active, setActive] = useState(feeProgrammes[0].id)

  /**
   * Highlights whichever programme the reader is actually looking at.
   *
   * The top margin keeps the heading clear of the fixed header, so a section
   * becomes "current" as its title appears rather than after it has scrolled by.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length > 0) setActive(visible[0].target.id)
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
    )

    for (const programme of feeProgrammes) {
      const node = document.getElementById(programme.id)
      if (node) observer.observe(node)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div className="pt-20">

      <header className="relative overflow-hidden bg-navy-900 py-16 text-white sm:py-20">
        {/* Decorative only, and behind the text: the gradients are pure gold at
            very low opacity, so the contrast of white on navy is unchanged. */}
        <AnimatedBackground intensity="bold" grid />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="section-label mb-4 text-gold-500">Official fee structure</div>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            {/* Renders as plain text on the server and under reduced motion; it
                only splits into words once it knows it can animate them. */}
            <TextReveal text="Fees for 2026/2027" />
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">
            One institution, several learning pathways. Fees are set by pathway, level or intensity,
            and by how learning is delivered — online, at an Axis centre, or at your home. All figures
            are in Kenya Shillings, per learner.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-gold-500/40 bg-white/5 p-5">
              <ScrollText className="mb-3 h-5 w-5 text-gold-500" aria-hidden="true" />
              <p className="text-sm font-semibold text-white">Admission {admissionFee.amount}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/70">{admissionFee.detail}</p>
            </div>
            <div className="rounded-2xl border border-gold-500/40 bg-white/5 p-5">
              <CalendarRange className="mb-3 h-5 w-5 text-gold-500" aria-hidden="true" />
              <p className="text-sm font-semibold text-white">A term is three months</p>
              <p className="mt-1 text-xs leading-relaxed text-white/70">
                Monthly figures are shown for affordability and payment convenience. The academic
                programme itself remains structured around a three-month term.
              </p>
            </div>
            <div className="rounded-2xl border border-gold-500/40 bg-white/5 p-5">
              <Phone className="mb-3 h-5 w-5 text-gold-500" aria-hidden="true" />
              <p className="text-sm font-semibold text-white">Not sure which pathway?</p>
              <p className="mt-1 text-xs leading-relaxed text-white/70">
                Placement follows a consultation. Call{' '}
                <a href={telHref} className="font-semibold text-gold-500 underline underline-offset-2">
                  {contact.phoneDisplay}
                </a>{' '}
                and we will talk it through.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Programme navigation. Sticky, because this page is long and a parent
          comparing two pathways should not have to scroll back to the top. */}
      <nav
        aria-label="Fee structure sections"
        className="no-print sticky top-20 z-30 border-b border-line bg-surface/95 backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {feeProgrammes.map((programme) => (
            <a
              key={programme.id}
              href={`#${programme.id}`}
              aria-current={active === programme.id ? 'true' : undefined}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                active === programme.id
                  ? 'bg-navy-900 text-white'
                  : 'text-ink-muted hover:bg-surface-sunk hover:text-ink'
              }`}
            >
              {programme.title}
            </a>
          ))}
        </div>
      </nav>

      <div className="fee-sheet bg-surface-sunk py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {feeProgrammes.map((programme) => (
            <article
              key={programme.id}
              id={programme.id}
              className="fee-programme mb-16 scroll-mt-36 last:mb-0"
            >
              <div className="border-b-2 border-gold-500 pb-4">
                <h2 className="text-3xl font-semibold text-ink">{programme.title}</h2>
                <p className="mt-2 max-w-3xl leading-relaxed text-ink-muted">{programme.summary}</p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
                  {programme.admission
                    ? `Admission ${admissionFee.amount} applies`
                    : 'No standard admission fee'}
                </p>
              </div>

              {programme.tables.map((table) => (
                <ProgrammeTable key={`${programme.id}-${table.heading}`} table={table} />
              ))}

              {programme.notes && programme.notes.length > 0 && (
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {programme.notes.map((note) => (
                    <div
                      key={note.heading}
                      className="fee-block rounded-2xl border-l-4 border-gold-500 bg-gold-50 p-5"
                    >
                      <h4 className="text-sm font-semibold text-ink">{note.heading}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{note.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <section className="bg-surface py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-ink">How fees are paid</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {paymentPlans.map((plan) => (
              <div key={plan.name} className="fee-block rounded-2xl border border-line bg-surface p-6 shadow-sm">
                <h3 className="text-base font-semibold text-ink">{plan.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{plan.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="fee-block rounded-2xl border border-line bg-surface-sunk p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
                <Banknote className="h-5 w-5 text-gold-600" aria-hidden="true" /> Official payment details
              </h3>
              <dl className="mt-4 divide-y divide-line">
                {paymentDetails.rows.map((row) => (
                  <div key={row.label} className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-2.5">
                    <dt className="text-sm text-ink-muted">{row.label}</dt>
                    <dd className="text-sm font-semibold tabular-nums text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">{paymentDetails.reference}</p>

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-critical/30 bg-tint-critical p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-critical" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-ink">{paymentDetails.warning}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-ink">General terms</h3>
              <ol className="mt-4 space-y-3">
                {generalTerms.map((term, index) => (
                  <li key={term} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-100 text-[0.7rem] font-semibold text-gold-700">
                      {index + 1}
                    </span>
                    {term}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold">Talk to us before you decide</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-white/75">
            Fees follow the pathway, and the pathway follows the learner. A consultation is how we
            work out which programme, level and delivery actually suit your child — and what that
            will cost you.
          </p>
          <div className="no-print mt-7 flex flex-wrap gap-3">
            <Link to="/consultation" className="btn-primary">
              Book a consultation
            </Link>
            <a href={telHref} className="btn-secondary inline-flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden="true" /> {contact.phoneDisplay}
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              <Printer className="h-4 w-4" aria-hidden="true" /> Print this fee structure
            </button>
          </div>
          <p className="mt-6 text-xs text-white/50">
            Published by Guraxis Limited. Academic year 2026/2027. Fees in Kenya Shillings.
          </p>
        </div>
      </section>
    </div>
  )
}
