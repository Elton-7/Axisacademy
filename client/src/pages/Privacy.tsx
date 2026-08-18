import { ShieldCheck, LockKeyhole, UsersRound, Image, BadgeCheck, HomeIcon, Scale, Clock } from 'lucide-react'

const sections = [
  {
    icon: UsersRound,
    title: 'Information you choose to share',
    text: 'When you send an enquiry, we may collect contact details and information needed to understand the learner and recommend an appropriate pathway. Please do not submit medical records, diagnoses, or other highly sensitive documents through public forms.',
  },
  {
    icon: LockKeyhole,
    title: 'How enquiry information is used',
    text: 'Information submitted through this website is used to respond to your enquiry, arrange consultation, and support the learner-discovery process. Access is limited to authorised Axis team members who need the information for these purposes.',
  },
  {
    icon: Image,
    title: 'Photos, videos, and testimonials',
    text: 'Axis publishes learner media and testimonials only where the appropriate permission has been verified. The media system requires staff confirmation of consent before an item can appear in the public gallery.',
  },
  {
    icon: ShieldCheck,
    title: 'Accounts and portals',
    text: 'Parent, learner, educator and staff accounts use role-based access. A parent can reach only their own learners. An educator can reach only the learners they are currently assigned to, and that access ends the moment the assignment does.',
  },
  {
    icon: BadgeCheck,
    title: 'How educators are vetted',
    text: 'An educator cannot be assigned to a learner until vetting is complete and current: a Certificate of Good Conduct with its expiry recorded, identity verified, references checked, and TSC registration where it applies. Clearance is not permanent — when it lapses or is withdrawn, the educator is removed from every learner immediately.',
  },
  {
    icon: HomeIcon,
    title: 'Home-based sessions',
    text: 'Where an educator teaches at your home, the session cannot be recorded as attended without an arrival time, a departure time, and confirmation that a responsible adult was present. Any parent, learner or educator can raise a safeguarding concern directly with Axis; those go only to Axis staff and are never visible to educators.',
  },
  {
    icon: Scale,
    title: 'Your rights over your data',
    text: 'Guraxis Limited is the data controller for information held about your family. You may ask what we hold about your learner and receive a full copy, ask us to correct it, or ask us to erase it. Contact us and we will action the request. Where you are not satisfied, you may complain to the Office of the Data Protection Commissioner.',
  },
  {
    icon: Clock,
    title: 'How long we keep information',
    text: 'We do not keep personal data indefinitely. Enquiries that never become an enrolment, and general website messages, are deleted on a set schedule. Records of who accessed or changed a learner’s information are kept longer, because they are how we stay accountable for that access.',
  },
]

export default function Privacy() {
  return (
    <div className="pt-20">
      <section className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="section-label mb-4">Privacy & Child Safety</div>
          <h1 className="text-4xl font-semibold sm:text-5xl">Respecting families’ information</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">Axis Learning works with children and families. Privacy, consent, and appropriate access are essential parts of how this platform is designed.</p>
        </div>
      </section>

      <section className="bg-surface-sunk py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 rounded-2xl border border-gold/30 bg-gold/10 p-6 text-sm leading-relaxed text-ink-muted/80">
            This page explains the website’s current privacy approach. Before launch, Axis should have its final privacy policy, consent procedures, retention periods, and contact details reviewed and approved by its authorised leadership and legal advisers.
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {sections.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
                <Icon className="mb-4 h-6 w-6 text-gold" />
                <h2 className="text-lg font-semibold text-ink">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted/70">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-2xl bg-navy p-7 text-white">
            <h2 className="text-xl font-semibold">Questions about privacy?</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">Please contact Axis Learning through the official contact channels published on this website. Do not send sensitive learner documents through public contact forms.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
