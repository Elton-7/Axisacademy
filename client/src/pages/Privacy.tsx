import { ShieldCheck, LockKeyhole, UsersRound, Image } from 'lucide-react'

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
    title: 'Future accounts and portals',
    text: 'Parent, learner, educator, and staff accounts will use role-based access. Families and educators should only be able to view the information relevant to their authorised role.',
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

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 rounded-2xl border border-gold/30 bg-gold/10 p-6 text-sm leading-relaxed text-navy/80">
            This page explains the website’s current privacy approach. Before launch, Axis should have its final privacy policy, consent procedures, retention periods, and contact details reviewed and approved by its authorised leadership and legal advisers.
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {sections.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <Icon className="mb-4 h-6 w-6 text-gold" />
                <h2 className="text-lg font-semibold text-navy">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-navy/70">{text}</p>
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
