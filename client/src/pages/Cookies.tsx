import { Cookie, KeyRound, Palette, BellOff, Type, EyeOff, Trash2, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * What this site stores on a visitor's device, and what it does not.
 *
 * Written against what the code actually does rather than from a template. Axis
 * sets no cookies at all: the API is stateless and carries its token in a
 * header, and nothing here counts visitors, follows them, or sells anything to
 * anyone. A page claiming otherwise — or a banner asking consent for tracking
 * that does not exist — would be worse than having none, because it would be a
 * promise about children's families that the code does not keep.
 *
 * Three things are stored in localStorage, all of them named here. The one
 * third party involved is Google Fonts, which sets no cookies but does see the
 * visitor's IP address, and that is said plainly rather than omitted.
 *
 * Under the Data Protection Act 2019, storage strictly necessary to deliver a
 * service the person asked for does not require prior consent; it requires
 * disclosure. That is what this page is.
 */

const stored = [
  {
    icon: KeyRound,
    name: 'axis_token',
    what: 'Your portal sign-in',
    text:
      'Written only when you sign in to a parent or educator portal, so you stay signed in while you move between pages. It is removed the moment you sign out, and it expires on its own. If you never sign in, it is never created.',
    kind: 'Strictly necessary',
  },
  {
    icon: Palette,
    name: 'axis_theme',
    what: 'Light or dark appearance',
    text:
      'Remembers whether you chose the light or dark theme, so the site does not flash the wrong one on your next visit. It holds one word and nothing else.',
    kind: 'Preference',
  },
  {
    icon: BellOff,
    name: 'axis_notice',
    what: 'That you have read this notice',
    text:
      'Records that the short notice at the bottom of the screen has been dismissed, so you are not shown it on every page. It holds a single value and nothing about you.',
    kind: 'Preference',
  },
]

const facts = [
  {
    icon: Cookie,
    title: 'This website sets no cookies',
    text:
      'Not one. Signing in uses a token held in your browser’s local storage and sent in a request header, so there is no session cookie, and nothing is transmitted to other sites as you browse.',
  },
  {
    icon: EyeOff,
    title: 'There is no analytics or advertising',
    text:
      'No Google Analytics, no advertising pixels, no visitor counting, no heatmaps, no profiling, and nothing shared with data brokers. We do not measure how you move around this site, and we do not sell or trade information about you.',
  },
  {
    icon: Type,
    title: 'One third party: Google Fonts',
    text:
      'The site’s typeface is served by Google Fonts. It sets no cookies, but the request does reveal your IP address to Google, as any request to any server does. We name it here rather than leave it unsaid.',
  },
  {
    icon: Trash2,
    title: 'Removing what is stored',
    text:
      'Signing out removes the sign-in token immediately. Everything else clears when you clear site data for this website in your browser’s settings, or when you browse in a private window. Nothing here is stored anywhere you cannot reach.',
  },
]

export default function Cookies() {
  return (
    <div className="pt-20">
      <section className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="section-label mb-4 text-gold-500">Cookies & Local Storage</div>
          <h1 className="text-4xl font-semibold sm:text-5xl">What this site keeps on your device</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">
            Axis Learning sets no cookies and does not track anyone. Three small items are stored in
            your browser so that signing in works and the site looks the way you left it. They are all
            listed below, by name.
          </p>
        </div>
      </section>

      <section className="bg-surface-sunk py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            {facts.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
                <Icon className="mb-4 h-6 w-6 text-gold" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-ink">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{text}</p>
              </article>
            ))}
          </div>

          <h2 className="mb-4 mt-12 text-2xl font-semibold text-ink">Everything that is stored, by name</h2>
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Name</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Purpose</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stored.map(({ icon: Icon, name, what, text, kind }) => (
                  <tr key={name}>
                    <td className="px-6 py-5 align-top">
                      <span className="flex items-center gap-2 font-mono text-xs text-ink">
                        <Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                        {name}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span className="block font-medium text-ink">{what}</span>
                      <span className="mt-1 block leading-relaxed text-ink-muted">{text}</span>
                    </td>
                    <td className="px-6 py-5 align-top whitespace-nowrap text-ink-muted">{kind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <article className="mt-10 rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <Scale className="mb-4 h-6 w-6 text-gold" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-ink">Why you are not asked to consent</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Under the Data Protection Act 2019, storage that is strictly necessary to provide a
              service you have asked for — such as keeping you signed in — requires disclosure rather
              than prior consent. The other two items hold a preference you set yourself. Because
              nothing here tracks you, advertises to you, or leaves this site, there is no consent to
              collect, and a banner demanding it would be theatre. Guraxis Limited is the data
              controller; if you are not satisfied with how your information is handled you may
              complain to the Office of the Data Protection Commissioner.
            </p>
          </article>

          <div className="mt-10 rounded-2xl bg-navy p-7 text-white">
            <h2 className="text-xl font-semibold">Questions about your data?</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Our{' '}
              <Link to="/privacy" className="font-semibold text-gold-500 underline underline-offset-4">
                privacy and child safety page
              </Link>{' '}
              covers what Axis holds about your family, how long it is kept, and how to ask for a copy
              or its removal. For anything not answered there, please use the contact details published
              on this website.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
