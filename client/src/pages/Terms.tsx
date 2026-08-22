import { Link } from 'react-router-dom'
import {
  Building2, Compass, UserCog, MessageSquare, FileText,
  AlertCircle, Link2, Scale, RefreshCw,
} from 'lucide-react'
import { contact, mailtoHref, telHref } from '../content/contact'

/**
 * Terms for using this website — not an agreement for tutoring.
 *
 * The distinction is the whole point. No fee is quoted here, nothing is booked
 * or paid for here, and no programme is sold here: the site takes an enquiry
 * and a consultation follows. Writing cancellation windows, refund rules or
 * fee terms into this page would be inventing commercial terms nobody at Axis
 * has decided, and families would reasonably rely on them.
 *
 * So this covers the site itself and says plainly where it stops. Everything
 * stated below is something the site actually does.
 */
/** Bump this whenever the wording below changes. */
const LAST_UPDATED = '20 August 2026'

const sections = [
  {
    icon: Building2,
    title: 'Who these terms are with',
    text: 'This website is operated by Guraxis Limited, a company registered in Kenya, trading as Axis Learning. "We", "us" and "Axis" mean Guraxis Limited throughout. By using this website you accept these terms; if you do not accept them, please do not use the site.',
  },
  {
    icon: Compass,
    title: 'What this website is for',
    text: 'The site describes what Axis offers and lets you send an enquiry or ask for a consultation. Nothing is booked, sold or paid for here. No page on this site is an offer capable of acceptance, and sending an enquiry does not create an agreement between us — it starts a conversation.',
  },
  {
    icon: MessageSquare,
    title: 'Enquiries and consultations',
    text: 'When you send an enquiry you are asking us to contact you, and you confirm that we may. We will use what you send to understand the learner and to respond. Consultations are arranged directly by phone, WhatsApp or email. Any agreement for teaching is made separately, in writing, and is not governed by this page.',
  },
  {
    icon: UserCog,
    title: 'Accounts and portals',
    text: 'Parent, learner and educator accounts are created by Axis rather than by self-registration. Keep your password to yourself and tell us at once if you think someone else has it. You are responsible for what is done through your account. We may suspend an account where we believe it is being misused or where a child’s safety requires it.',
  },
  {
    icon: FileText,
    title: 'Using the site sensibly',
    text: 'Please do not attempt to reach data that is not yours, disrupt the service, copy the site for a competing service, or submit anything unlawful. Do not send medical records, diagnoses or other sensitive documents through public forms — bring those to a consultation instead.',
  },
  {
    icon: AlertCircle,
    title: 'Accuracy of what you read here',
    text: 'We keep this site current, but programmes, availability, educators and prices change. Nothing here is a guarantee that a particular programme, educator or location will be available to you. Where something matters to your decision, ask us and we will confirm it directly.',
  },
  {
    icon: Link2,
    title: 'Links to other sites',
    text: 'Where we link to another organisation, we do so for convenience. We do not control those sites and are not responsible for their content, their accuracy, or how they handle your information.',
  },
  {
    icon: Scale,
    title: 'Our responsibility, and its limits',
    text: 'We take reasonable care over this site but do not promise it will always be available or free of error. Nothing in these terms limits our liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited — and nothing here limits our safeguarding obligations towards a child.',
  },
  {
    icon: RefreshCw,
    title: 'Changes, and the law that applies',
    text: 'We may update these terms as the service changes; the date below shows when they last changed, and continuing to use the site means accepting the current version. These terms are governed by the laws of Kenya, and the courts of Kenya have jurisdiction over any dispute arising from them.',
  },
]

export default function Terms() {
  return (
    <div className="pt-20">
      <section className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="section-label text-gold-500 mb-4">Terms of Use</div>
          <h1 className="text-4xl font-semibold sm:text-5xl">Using this website</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">
            These terms cover the website. The agreement for teaching a learner is a separate
            document, agreed with you in writing before any teaching begins.
          </p>
        </div>
      </section>

      <section className="bg-surface-sunk py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 rounded-2xl border border-gold/30 bg-gold/10 p-6 text-sm leading-relaxed text-ink-muted">
            Axis should have these terms reviewed and approved by its own legal advisers before
            launch, alongside the service agreement families sign, its fee and cancellation terms,
            and its complaints procedure. None of those are set out here, because none of them are
            decided on this website.
          </div>

          <div className="space-y-5">
            {sections.map(({ icon: Icon, title, text }) => (
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
          <div className="rounded-2xl border border-line p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink">Questions about these terms</h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Ask us. If your question is about a child&rsquo;s safety, see{' '}
              <Link to="/safeguarding" className="font-semibold text-gold-700 hover:underline">
                how we keep your child safe
              </Link>
              , which explains how to raise a concern and what happens to it. For how we handle
              information about your family, see our{' '}
              <Link to="/privacy" className="font-semibold text-gold-700 hover:underline">
                privacy and child safety policy
              </Link>
              .
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={mailtoHref} className="btn-primary max-w-full break-all text-center">
                {contact.email}
              </a>
              <a
                href={telHref}
                className="inline-flex items-center rounded-xl border border-line px-5 py-3 font-medium text-ink transition-colors hover:bg-surface-muted"
              >
                {contact.phoneDisplay}
              </a>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-ink-muted">
            Last updated {LAST_UPDATED}
          </p>
          <p className="mt-1 text-center text-sm text-ink-muted">
            Guraxis Limited, trading as Axis Learning &middot; {contact.addressLine}
          </p>
        </div>
      </section>
    </div>
  )
}
